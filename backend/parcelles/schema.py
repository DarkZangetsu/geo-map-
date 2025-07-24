import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import authenticate
from graphql_jwt.decorators import login_required
from graphql_jwt.shortcuts import create_refresh_token, get_token
from graphql_jwt.mutations import ObtainJSONWebToken, Refresh, Verify
from graphene_file_upload.scalars import Upload
from .models import User, Parcelle, ParcelleImage, Siege, SiegeImage, Pepiniere, PepiniereImage
import csv
import io
import json
from datetime import datetime
from decimal import Decimal

class UserType(DjangoObjectType):
    firstName = graphene.String(source='first_name')
    lastName = graphene.String(source='last_name')
    abreviation = graphene.String()
    nomInstitution = graphene.String(source='nom_institution')
    nomProjet = graphene.String(source='nom_projet')
    logo = graphene.String()

    class Meta:
        model = User
        fields = "__all__"

    def resolve_logo(self, info):
        if self.logo:
            try:
                request = info.context
                # Si build_absolute_uri existe (cas normal)
                if hasattr(request, "build_absolute_uri"):
                    return request.build_absolute_uri(self.logo.url)
                # Fallback : BASE_URL ou localhost
                import os
                base_url = os.environ.get("BASE_URL") or "http://localhost:8000"
                return f"{base_url}/media/{self.logo.name}"
            except Exception:
                return str(self.logo)
        return ""

class ParcelleImageType(DjangoObjectType):
    class Meta:
        model = ParcelleImage
        fields = "__all__"

class ParcelleType(DjangoObjectType):
    images = graphene.List(ParcelleImageType)
    
    class Meta:
        model = Parcelle
        fields = "__all__"
    
    def resolve_images(self, info):
        return self.images.all()

class SiegeImageType(DjangoObjectType):
    class Meta:
        model = SiegeImage
        fields = "__all__"

class SiegeType(DjangoObjectType):
    photos_batiment = graphene.List(SiegeImageType)
    
    class Meta:
        model = Siege
        fields = "__all__"
    
    def resolve_photos_batiment(self, info):
        return self.photos_batiment.all()

class PepiniereImageType(DjangoObjectType):
    class Meta:
        model = PepiniereImage
        fields = "__all__"

class PepiniereType(DjangoObjectType):
    photos = graphene.List(PepiniereImageType)
    nom_projet = graphene.String()
    
    class Meta:
        model = Pepiniere
        exclude = ("capacite",)
    
    def resolve_photos(self, info):
        return self.photos.all()

class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        first_name = graphene.String()
        last_name = graphene.String()
        role = graphene.String()
        logo = Upload()
        abreviation = graphene.String()
        nom_institution = graphene.String()
        nom_projet = graphene.String()

    def mutate(self, info, email, password, first_name="", last_name="", role="membre", logo=None, abreviation="", nom_institution="", nom_projet=""):
        try:
            if User.objects.filter(email=email).exists():
                return CreateUser(success=False, message="Email déjà utilisé")
            user = User.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=role,
                abreviation=abreviation,
                nom_institution=nom_institution,
                nom_projet=nom_projet
            )
            if logo:
                user.logo = logo
                user.save()
            return CreateUser(user=user, success=True, message="Utilisateur créé avec succès")
        except Exception as e:
            return CreateUser(success=False, message=str(e))

class LoginUser(graphene.Mutation):
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()

    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    def mutate(self, info, email, password):
        try:
            user = authenticate(email=email, password=password)
            if user:
                if not user.is_active:
                    return LoginUser(
                        success=False,
                        message="Compte désactivé, contactez l'administrateur."
                    )
                token = get_token(user)
                return LoginUser(
                    user=user,
                    success=True,
                    message="Connexion réussie",
                    token=token
                )
            else:
                return LoginUser(
                    success=False,
                    message="Identifiants incorrects"
                )
        except Exception as e:
            return LoginUser(
                success=False,
                message=f"Erreur de connexion: {str(e)}"
            )

class CreateParcelle(graphene.Mutation):
    parcelle = graphene.Field(ParcelleType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        nom = graphene.String(required=True)
        proprietaire = graphene.String(required=True)
        geojson = graphene.JSONString(required=True)
        superficie = graphene.Decimal()
        pratique = graphene.String()
        nom_projet = graphene.String()
        description = graphene.String()
        images = graphene.List(Upload)
        # Champs personne référente
        nom_personne_referente = graphene.String()
        poste = graphene.String()
        telephone = graphene.String()
        email = graphene.String()

    @login_required
    def mutate(self, info, nom, proprietaire, geojson, **kwargs):
        import json
        try:
            user = info.context.user
            # Extraire les images du kwargs
            images = kwargs.pop('images', [])
            # Désérialiser le geojson si c'est une chaîne
            if isinstance(geojson, str):
                try:
                    geojson = json.loads(geojson)
                except Exception:
                    pass
            parcelle = Parcelle.objects.create(
                nom=nom,
                proprietaire=proprietaire,
                geojson=geojson,
                user=user,
                **kwargs
            )
            # Créer les images associées
            for i, image_file in enumerate(images):
                if image_file:
                    ParcelleImage.objects.create(
                        parcelle=parcelle,
                        image=image_file,
                        ordre=i
                    )
            return CreateParcelle(parcelle=parcelle, success=True, message="Parcelle créée avec succès")
        except Exception as e:
            return CreateParcelle(success=False, message=str(e))

class UpdateParcelle(graphene.Mutation):
    parcelle = graphene.Field(ParcelleType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        id = graphene.ID(required=True)
        nom = graphene.String()
        proprietaire = graphene.String()
        geojson = graphene.JSONString()
        superficie = graphene.Decimal()
        pratique = graphene.String()
        nom_projet = graphene.String()
        description = graphene.String()
        images = graphene.List(Upload)
        # Champs personne référente
        nom_personne_referente = graphene.String()
        poste = graphene.String()
        telephone = graphene.String()
        email = graphene.String()

    @login_required
    def mutate(self, info, id, **kwargs):
        import json
        try:
            user = info.context.user
            parcelle = Parcelle.objects.get(id=id)
            if parcelle.user != user and user.role != 'admin':
                return UpdateParcelle(success=False, message="Non autorisé")
            # Extraire les images du kwargs
            images = kwargs.pop('images', None)
            # Désérialiser le geojson si c'est une chaîne
            if 'geojson' in kwargs and isinstance(kwargs['geojson'], str):
                try:
                    kwargs['geojson'] = json.loads(kwargs['geojson'])
                except Exception:
                    pass
            # Mettre à jour les champs
            for field, value in kwargs.items():
                if value is not None:
                    setattr(parcelle, field, value)
            parcelle.save()
            # Ajouter les nouvelles images si fournies
            if images:
                for i, image_file in enumerate(images):
                    if image_file:
                        ParcelleImage.objects.create(
                            parcelle=parcelle,
                            image=image_file,
                            ordre=i
                        )
            return UpdateParcelle(parcelle=parcelle, success=True, message="Parcelle mise à jour avec succès")
        except Parcelle.DoesNotExist:
            return UpdateParcelle(success=False, message="Parcelle non trouvée")
        except Exception as e:
            return UpdateParcelle(success=False, message=str(e))

class DeleteParcelle(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        id = graphene.ID(required=True)

    @login_required
    def mutate(self, info, id):
        try:
            user = info.context.user
            parcelle = Parcelle.objects.get(id=id)
            
            if parcelle.user != user and user.role != 'admin':
                return DeleteParcelle(success=False, message="Non autorisé")
            
            parcelle.delete()
            return DeleteParcelle(success=True, message="Parcelle supprimée")
        except Parcelle.DoesNotExist:
            return DeleteParcelle(success=False, message="Parcelle non trouvée")
        except Exception as e:
            return DeleteParcelle(success=False, message=str(e))

class CreateSiege(graphene.Mutation):
    siege = graphene.Field(SiegeType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        nom = graphene.String(required=True)
        adresse = graphene.String(required=True)
        latitude = graphene.Decimal(required=True)
        longitude = graphene.Decimal(required=True)
        description = graphene.String()
        # Nouveaux champs
        categorie = graphene.String()
        nom_point_contact = graphene.String()
        poste = graphene.String()
        telephone = graphene.String()
        email = graphene.String()
        horaire_matin = graphene.String()
        horaire_apres_midi = graphene.String()
        photos_batiment = graphene.List(Upload)

    @login_required
    def mutate(self, info, nom, adresse, latitude, longitude, description=None, categorie='social', nom_point_contact="", poste="", telephone="", email="", horaire_matin="", horaire_apres_midi="", photos_batiment=None):
        try:
            user = info.context.user
            siege = Siege.objects.create(
                user=user,
                nom=nom,
                adresse=adresse,
                latitude=latitude,
                longitude=longitude,
                description=description,
                categorie=categorie,
                nom_point_contact=nom_point_contact,
                poste=poste,
                telephone=telephone,
                email=email,
                horaire_matin=horaire_matin,
                horaire_apres_midi=horaire_apres_midi
            )
            
            # Créer les photos associées
            if photos_batiment:
                for i, photo_file in enumerate(photos_batiment):
                    if photo_file:
                        SiegeImage.objects.create(
                            siege=siege,
                            image=photo_file,
                            ordre=i
                        )
                        
            return CreateSiege(siege=siege, success=True, message="Siège créé avec succès")
        except Exception as e:
            return CreateSiege(success=False, message=str(e))

class UpdateSiege(graphene.Mutation):
    siege = graphene.Field(SiegeType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        id = graphene.ID(required=True)
        nom = graphene.String()
        adresse = graphene.String()
        latitude = graphene.Decimal()
        longitude = graphene.Decimal()
        description = graphene.String()
        # Nouveaux champs
        categorie = graphene.String()
        nom_point_contact = graphene.String()
        poste = graphene.String()
        telephone = graphene.String()
        email = graphene.String()
        horaire_matin = graphene.String()
        horaire_apres_midi = graphene.String()
        photos_batiment = graphene.List(Upload)

    @login_required
    def mutate(self, info, id, **kwargs):
        try:
            user = info.context.user
            siege = Siege.objects.get(id=id)
            if siege.user != user and user.role != 'admin':
                return UpdateSiege(success=False, message="Non autorisé")
            
            # Extraire les photos du kwargs
            photos_batiment = kwargs.pop('photos_batiment', None)
            
            for field, value in kwargs.items():
                if value is not None:
                    setattr(siege, field, value)
            siege.save()
            
            # Mettre à jour les photos si fournies
            if photos_batiment is not None:
                siege.photos_batiment.all().delete()
                for i, photo_file in enumerate(photos_batiment):
                    if photo_file:
                        SiegeImage.objects.create(
                            siege=siege,
                            image=photo_file,
                            ordre=i
                        )
                        
            return UpdateSiege(siege=siege, success=True, message="Siège mis à jour")
        except Siege.DoesNotExist:
            return UpdateSiege(success=False, message="Siège non trouvé")
        except Exception as e:
            return UpdateSiege(success=False, message=str(e))

class DeleteSiege(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        id = graphene.ID(required=True)

    @login_required
    def mutate(self, info, id):
        user = info.context.user
        try:
            siege = Siege.objects.get(id=id)
            if siege.user != user and user.role != 'admin':
                return DeleteSiege(success=False, message="Non autorisé")
            siege.delete()
            return DeleteSiege(success=True, message="Siège supprimé")
        except Exception as e:
            return DeleteSiege(success=False, message=str(e))

class TokenAuthWithUser(graphene.Mutation):
    token = graphene.String()
    refreshToken = graphene.String()
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    def mutate(self, info, email, password):
        try:
            user = authenticate(email=email, password=password)
            if user and user.is_active:
                token = get_token(user)
                refresh_token = create_refresh_token(user)
                return TokenAuthWithUser(
                    token=token,
                    refreshToken=refresh_token,
                    user=user,
                    success=True,
                    message="Connexion réussie"
                )
            else:
                return TokenAuthWithUser(
                    success=False,
                    message="Identifiants incorrects ou compte inactif"
                )
        except Exception as e:
            return TokenAuthWithUser(
                success=False,
                message=f"Erreur de connexion: {str(e)}"
            )

class ExportParcellesCSV(graphene.Mutation):
    csv_data = graphene.String()
    success = graphene.Boolean()
    message = graphene.String()

    @login_required
    def mutate(self, info):
        try:
            user = info.context.user
            if user.role != 'admin':
                parcelles = Parcelle.objects.filter(user=user)
            else:
                parcelles = Parcelle.objects.all()
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # En-têtes avec nouveaux champs
            headers = [
                'ID', 'Nom', 'Propriétaire', 'Superficie', 
                'Pratique', 'Nom projet', 'Description', 'Nom Personne Référente',
                'Poste', 'Téléphone', 'Email', 'Utilisateur', 
                'Date Création', 'Date Modification'
            ]
            writer.writerow(headers)
            for parcelle in parcelles:
                row = [
                    parcelle.id,
                    parcelle.nom,
                    parcelle.proprietaire,
                    str(parcelle.superficie) if parcelle.superficie else '',
                    parcelle.get_pratique_display() if parcelle.pratique else '',
                    parcelle.nom_projet or '',
                    parcelle.description or '',
                    parcelle.nom_personne_referente or '',
                    parcelle.poste or '',
                    parcelle.telephone or '',
                    parcelle.email or '',
                    parcelle.user.email,
                    parcelle.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    parcelle.updated_at.strftime('%Y-%m-%d %H:%M:%S')
                ]
                writer.writerow(row)
            csv_content = output.getvalue()
            output.close()
            return ExportParcellesCSV(
                csv_data=csv_content,
                success=True,
                message=f"Export CSV réussi - {parcelles.count()} parcelles exportées"
            )
        except Exception as e:
            return ExportParcellesCSV(
                success=False,
                message=f"Erreur lors de l'export: {str(e)}"
            )

class ImportParcellesCSV(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    imported_count = graphene.Int()
    errors = graphene.List(graphene.String)

    class Arguments:
        csv_file = Upload(required=True)

    @login_required
    def mutate(self, info, csv_file):
        try:
            user = info.context.user
            imported_count = 0
            errors = []
            csv_content = csv_file.read().decode('utf-8')
            csv_reader = csv.DictReader(io.StringIO(csv_content))
            for row_num, row in enumerate(csv_reader, start=2):
                try:
                    if not row.get('Nom') or not row.get('Propriétaire'):
                        errors.append(f"Ligne {row_num}: Nom et Propriétaire sont requis")
                        continue
                    superficie = None
                    if row.get('Superficie'):
                        try:
                            superficie = Decimal(row['Superficie'].replace(',', '.'))
                        except:
                            errors.append(f"Ligne {row_num}: Superficie invalide")
                            continue
                    date_semis = None
                    if row.get('Date Semis'):
                        try:
                            date_semis = datetime.strptime(row['Date Semis'], '%Y-%m-%d').date()
                        except:
                            errors.append(f"Ligne {row_num}: Date de semis invalide (format: YYYY-MM-DD)")
                            continue
                    date_recolte_prevue = None
                    if row.get('Date Récolte Prévue'):
                        try:
                            date_recolte_prevue = datetime.strptime(row['Date Récolte Prévue'], '%Y-%m-%d').date()
                        except:
                            errors.append(f"Ligne {row_num}: Date de récolte prévue invalide (format: YYYY-MM-DD)")
                            continue
                    def parse_bool(val):
                        return str(val).strip().lower() in ['1', 'oui', 'yes', 'true', 'vrai']
                    irrigation = parse_bool(row.get('Irrigation', '0'))
                    certification_bio = parse_bool(row.get('Certification Bio', '0'))
                    certification_hve = parse_bool(row.get('Certification HVE', '0'))
                    rendement_prevue = None
                    if row.get('Rendement Prévu'):
                        try:
                            rendement_prevue = Decimal(row['Rendement Prévu'].replace(',', '.'))
                        except:
                            errors.append(f"Ligne {row_num}: Rendement prévu invalide")
                            continue
                    cout_production = None
                    if row.get('Coût Production'):
                        try:
                            cout_production = Decimal(row['Coût Production'].replace(',', '.'))
                        except:
                            errors.append(f"Ligne {row_num}: Coût de production invalide")
                            continue
                    # Gestion de la géométrie
                    geojson = None
                    geometrie_str = row.get('geometrie', '').strip()
                    if geometrie_str:
                        import json
                        try:
                            # Si c'est un vrai GeoJSON
                            geojson_candidate = json.loads(geometrie_str)
                            if isinstance(geojson_candidate, dict) and 'type' in geojson_candidate and 'coordinates' in geojson_candidate:
                                geojson = {
                                    "type": "Feature",
                                    "geometry": geojson_candidate,
                                    "properties": {}
                                }
                        except Exception:
                            # Sinon, on suppose que c'est une liste de points
                            try:
                                import re
                                points = re.findall(r'\[([\d\.-]+),([\d\.-]+)\]', geometrie_str)
                                coords = [[float(lon), float(lat)] for lon, lat in points]
                                if len(coords) >= 4 and coords[0] == coords[-1]:
                                    pass
                                elif len(coords) >= 3:
                                    coords.append(coords[0])
                                geojson = {
                                    "type": "Feature",
                                    "geometry": {
                                        "type": "Polygon",
                                        "coordinates": [coords]
                                    },
                                    "properties": {}
                                }
                            except Exception:
                                errors.append(f"Ligne {row_num}: Format de géométrie invalide")
                                geojson = None
                    if not geojson:
                        geojson = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [[[0, 0], [0, 0.001], [0.001, 0.001], [0.001, 0], [0, 0]]]
                        },
                        "properties": {}
                    }
                    parcelle = Parcelle.objects.create(
                        user=user,
                        nom=row['Nom'],
                        proprietaire=row['Propriétaire'],
                        nom_personne_referente=row.get('Nom Personne Référente', ''),
                        poste=row.get('Poste', ''),
                        telephone=row.get('Téléphone', ''),
                        email=row.get('Email', ''),
                        superficie=superficie,
                        pratique=row.get('Pratique', ''),
                        nom_projet=row.get('Nom projet', ''),
                        description=row.get('Description', ''),
                        geojson=geojson
                    )
                    imported_count += 1
                except Exception as e:
                    errors.append(f"Ligne {row_num}: {str(e)}")
                    continue
            message = f"Import terminé: {imported_count} parcelles importées"
            if errors:
                message += f", {len(errors)} erreurs"
            return ImportParcellesCSV(
                success=True,
                message=message,
                imported_count=imported_count,
                errors=errors
            )
        except Exception as e:
            return ImportParcellesCSV(
                success=False,
                message=f"Erreur lors de l'import: {str(e)}",
                imported_count=0,
                errors=[str(e)]
            )

class ExportSiegesCSV(graphene.Mutation):
    csv_data = graphene.String()
    success = graphene.Boolean()
    message = graphene.String()

    @login_required
    def mutate(self, info):
        try:
            user = info.context.user
            if user.role != 'admin':
                sieges = Siege.objects.filter(user=user)
            else:
                sieges = Siege.objects.all()
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # En-têtes avec nouveaux champs
            headers = [
                'ID', 'Nom', 'Adresse', 'Latitude', 'Longitude', 'Description',
                'Catégorie', 'Nom Point Contact', 'Poste', 'Téléphone', 'Email',
                'Horaire Matin', 'Horaire Après-midi', 'Utilisateur',
                'Date Création', 'Date Modification'
            ]
            writer.writerow(headers)
            
            for siege in sieges:
                row = [
                    siege.id,
                    siege.nom,
                    siege.adresse,
                    str(siege.latitude),
                    str(siege.longitude),
                    siege.description or '',
                    siege.categorie,
                    siege.nom_point_contact or '',
                    siege.poste or '',
                    siege.telephone or '',
                    siege.email or '',
                    siege.horaire_matin or '',
                    siege.horaire_apres_midi or '',
                    siege.user.username,
                    siege.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    siege.updated_at.strftime('%Y-%m-%d %H:%M:%S')
                ]
                writer.writerow(row)
            csv_content = output.getvalue()
            output.close()
            return ExportSiegesCSV(
                csv_data=csv_content,
                success=True,
                message=f"Export CSV réussi - {sieges.count()} sièges exportés"
            )
        except Exception as e:
            return ExportSiegesCSV(success=False, message=f"Erreur lors de l'export: {str(e)}")

class ImportSiegesCSV(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    imported_count = graphene.Int()
    errors = graphene.List(graphene.String)

    class Arguments:
        csv_file = Upload(required=True)

    @login_required
    def mutate(self, info, csv_file):
        try:
            user = info.context.user
            imported_count = 0
            errors = []
            csv_content = csv_file.read().decode('utf-8')
            csv_reader = csv.DictReader(io.StringIO(csv_content))
            for row_num, row in enumerate(csv_reader, start=2):
                try:
                    if not row.get('Nom') or not row.get('Adresse') or not row.get('Latitude') or not row.get('Longitude'):
                        errors.append(f"Ligne {row_num}: Nom, Adresse, Latitude et Longitude sont requis")
                        continue
                    try:
                        latitude = float(row['Latitude'].replace(',', '.'))
                        longitude = float(row['Longitude'].replace(',', '.'))
                    except:
                        errors.append(f"Ligne {row_num}: latitude ou longitude invalide")
                        continue
                    siege = Siege.objects.create(
                        user=user,
                        nom=row['Nom'],
                        adresse=row['Adresse'],
                        latitude=latitude,
                        longitude=longitude,
                        description=row.get('Description', ''),
                        categorie=row.get('Catégorie', 'social'),
                        nom_point_contact=row.get('Nom Point Contact', ''),
                        poste=row.get('Poste', ''),
                        telephone=row.get('Téléphone', ''),
                        email=row.get('Email', ''),
                        horaire_matin=row.get('Horaire Matin', ''),
                        horaire_apres_midi=row.get('Horaire Après-midi', '')
                    )
                    imported_count += 1
                except Exception as e:
                    errors.append(f"Ligne {row_num}: {str(e)}")
                    continue
            message = f"Import terminé: {imported_count} sièges importés"
            if errors:
                message += f", {len(errors)} erreurs"
            return ImportSiegesCSV(
                success=True,
                message=message,
                imported_count=imported_count,
                errors=errors
            )
        except Exception as e:
            return ImportSiegesCSV(
                success=False,
                message=f"Erreur lors de l'import: {str(e)}",
                imported_count=0,
                errors=[str(e)]
            )

class CreatePepiniere(graphene.Mutation):
    pepiniere = graphene.Field(PepiniereType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        nom = graphene.String(required=True)
        adresse = graphene.String(required=True)
        latitude = graphene.Decimal(required=True)
        longitude = graphene.Decimal(required=True)
        description = graphene.String()
        # Champs spécifiques à la pépinière
        nom_gestionnaire = graphene.String()
        poste_gestionnaire = graphene.String()
        telephone_gestionnaire = graphene.String()
        email_gestionnaire = graphene.String()
        especes_produites = graphene.String()
        nom_projet = graphene.String()
        quantite_production_generale = graphene.String()
        photos = graphene.List(Upload)

    @login_required
    def mutate(self, info, nom, adresse, latitude, longitude, description=None, nom_gestionnaire="", poste_gestionnaire="", telephone_gestionnaire="", email_gestionnaire="", especes_produites="", nom_projet="", quantite_production_generale="", photos=None):
        try:
            user = info.context.user
            pepiniere = Pepiniere.objects.create(
                user=user,
                nom=nom,
                adresse=adresse,
                latitude=latitude,
                longitude=longitude,
                description=description,
                nom_gestionnaire=nom_gestionnaire,
                poste_gestionnaire=poste_gestionnaire,
                telephone_gestionnaire=telephone_gestionnaire,
                email_gestionnaire=email_gestionnaire,
                especes_produites=especes_produites,
                nom_projet=nom_projet,
                quantite_production_generale=quantite_production_generale
            )
            
            # Créer les photos associées
            if photos:
                for i, photo_file in enumerate(photos):
                    if photo_file:
                        PepiniereImage.objects.create(
                            pepiniere=pepiniere,
                            image=photo_file,
                            ordre=i
                        )
                        
            return CreatePepiniere(pepiniere=pepiniere, success=True, message="Pépinière créée avec succès")
        except Exception as e:
            return CreatePepiniere(success=False, message=str(e))

class UpdatePepiniere(graphene.Mutation):
    pepiniere = graphene.Field(PepiniereType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        id = graphene.ID(required=True)
        nom = graphene.String()
        adresse = graphene.String()
        latitude = graphene.Decimal()
        longitude = graphene.Decimal()
        description = graphene.String()
        nom_gestionnaire = graphene.String()
        poste_gestionnaire = graphene.String()
        telephone_gestionnaire = graphene.String()
        email_gestionnaire = graphene.String()
        especes_produites = graphene.String()
        nom_projet = graphene.String()
        quantite_production_generale = graphene.String()
        photos = graphene.List(Upload)

    @login_required
    def mutate(self, info, id, **kwargs):
        try:
            user = info.context.user
            pepiniere = Pepiniere.objects.get(id=id)
            if pepiniere.user != user and user.role != 'admin':
                return UpdatePepiniere(success=False, message="Non autorisé")
            
            # Extraire les photos du kwargs
            photos = kwargs.pop('photos', None)
            
            for field, value in kwargs.items():
                if value is not None:
                    if field != "capacite":
                        setattr(pepiniere, field, value)
            pepiniere.save()
            
            # Mettre à jour les photos si fournies
            if photos is not None:
                pepiniere.photos.all().delete()
                for i, photo_file in enumerate(photos):
                    if photo_file:
                        PepiniereImage.objects.create(
                            pepiniere=pepiniere,
                            image=photo_file,
                            ordre=i
                        )
                        
            return UpdatePepiniere(pepiniere=pepiniere, success=True, message="Pépinière mise à jour")
        except Pepiniere.DoesNotExist:
            return UpdatePepiniere(success=False, message="Pépinière non trouvée")
        except Exception as e:
            return UpdatePepiniere(success=False, message=str(e))

class DeletePepiniere(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        id = graphene.ID(required=True)

    @login_required
    def mutate(self, info, id):
        try:
            user = info.context.user
            pepiniere = Pepiniere.objects.get(id=id)
            if pepiniere.user != user and user.role != 'admin':
                return DeletePepiniere(success=False, message="Non autorisé")
            pepiniere.delete()
            return DeletePepiniere(success=True, message="Pépinière supprimée")
        except Pepiniere.DoesNotExist:
            return DeletePepiniere(success=False, message="Pépinière non trouvée")
        except Exception as e:
            return DeletePepiniere(success=False, message=str(e))

class ExportPepinieresCSV(graphene.Mutation):
    csv_data = graphene.String()
    success = graphene.Boolean()
    message = graphene.String()

    @login_required
    def mutate(self, info):
        try:
            user = info.context.user
            if user.role != 'admin':
                pepinieres = Pepiniere.objects.filter(user=user)
            else:
                pepinieres = Pepiniere.objects.all()
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # En-têtes
            headers = [
                'ID', 'Nom', 'Adresse', 'Latitude', 'Longitude', 'Description',
                'Catégorie', 'Nom Gestionnaire', 'Poste Gestionnaire', 
                'Téléphone Gestionnaire', 'Email Gestionnaire',
                'Espèces Produites', 'Quantité Production Générale',
                'Nom projet',
                'Utilisateur', 'Date Création', 'Date Modification'
            ]
            writer.writerow(headers)
            
            # Données
            for pepiniere in pepinieres:
                writer.writerow([
                    pepiniere.id, pepiniere.nom, pepiniere.adresse,
                    pepiniere.latitude, pepiniere.longitude, pepiniere.description,
                    pepiniere.categorie, pepiniere.nom_gestionnaire,
                    pepiniere.poste_gestionnaire, pepiniere.telephone_gestionnaire,
                    pepiniere.email_gestionnaire, pepiniere.especes_produites,
                    pepiniere.quantite_production_generale,
                    pepiniere.nom_projet,
                    pepiniere.user.username, pepiniere.created_at, pepiniere.updated_at
                ])
            
            return ExportPepinieresCSV(
                csv_data=output.getvalue(),
                success=True,
                message="Export CSV réussi"
            )
        except Exception as e:
            return ExportPepinieresCSV(
                success=False,
                message=f"Erreur lors de l'export: {str(e)}"
            )

class ImportPepinieresCSV(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()
    imported_count = graphene.Int()
    errors = graphene.List(graphene.String)

    class Arguments:
        csv_file = Upload(required=True)

    @login_required
    def mutate(self, info, csv_file):
        try:
            user = info.context.user
            content = csv_file.read().decode('utf-8')
            csv_data = csv.DictReader(io.StringIO(content))
            
            imported_count = 0
            errors = []
            
            for row in csv_data:
                try:
                    # Validation des champs requis
                    if not row.get('Nom') or not row.get('Adresse'):
                        errors.append(f"Ligne {imported_count + 1}: Nom et Adresse sont requis")
                        continue
                    
                    # Conversion des coordonnées
                    try:
                        latitude = Decimal(row.get('Latitude', '0'))
                        longitude = Decimal(row.get('Longitude', '0'))
                    except (ValueError, TypeError):
                        latitude = Decimal('0')
                        longitude = Decimal('0')
                    
                    pepiniere = Pepiniere.objects.create(
                        user=user,
                        nom=row.get('Nom', ''),
                        adresse=row.get('Adresse', ''),
                        latitude=latitude,
                        longitude=longitude,
                        description=row.get('Description', ''),
                        categorie=row.get('Catégorie', 'social'),
                        nom_gestionnaire=row.get('Nom Gestionnaire', ''),
                        poste_gestionnaire=row.get('Poste Gestionnaire', ''),
                        telephone_gestionnaire=row.get('Téléphone Gestionnaire', ''),
                        email_gestionnaire=row.get('Email Gestionnaire', ''),
                        especes_produites=row.get('Espèces Produites', ''),
                        quantite_production_generale=row.get('Quantité Production Générale', ''),
                        nom_projet=row.get('Nom projet', ''),
                    )
                    
                    imported_count += 1
                    
                except Exception as e:
                    errors.append(f"Ligne {imported_count + 1}: {str(e)}")
            
            return ImportPepinieresCSV(
                success=True,
                message=f"{imported_count} pépinières importées avec succès",
                imported_count=imported_count,
                errors=errors
            )
            
        except Exception as e:
            return ImportPepinieresCSV(
                success=False,
                message=f"Erreur lors de l'import: {str(e)}",
                imported_count=0,
                errors=[str(e)]
            )

class UpdateUserActiveStatus(graphene.Mutation):
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        user_id = graphene.ID(required=True)
        is_active = graphene.Boolean(required=True)

    @login_required
    def mutate(self, info, user_id, is_active):
        user = info.context.user
        if not user.is_superuser and user.role != 'admin':
            return UpdateUserActiveStatus(success=False, message="Permission refusée")
        try:
            target_user = User.objects.get(id=user_id)
            target_user.is_active = is_active
            target_user.save()
            return UpdateUserActiveStatus(user=target_user, success=True, message="Statut mis à jour")
        except User.DoesNotExist:
            return UpdateUserActiveStatus(success=False, message="Utilisateur introuvable")

class UpdateUserAbreviation(graphene.Mutation):
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        user_id = graphene.ID(required=True)
        abreviation = graphene.String(required=True)

    @login_required
    def mutate(self, info, user_id, abreviation):
        user = info.context.user
        # Permettre à l'utilisateur de modifier sa propre abréviation ou aux admins de modifier n'importe quelle abréviation
        if str(user.id) != str(user_id) and not user.is_superuser and user.role != 'admin':
            return UpdateUserAbreviation(success=False, message="Permission refusée")
        try:
            target_user = User.objects.get(id=user_id)
            target_user.abreviation = abreviation
            target_user.save()
            return UpdateUserAbreviation(user=target_user, success=True, message="Abréviation mise à jour")
        except User.DoesNotExist:
            return UpdateUserAbreviation(success=False, message="Utilisateur introuvable")

class UpdateUserLogo(graphene.Mutation):
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        logo = Upload(required=True)

    @login_required
    def mutate(self, info, logo):
        user = info.context.user
        try:
            user.logo = logo
            user.save()
            return UpdateUserLogo(user=user, success=True, message="Logo mis à jour")
        except Exception as e:
            return UpdateUserLogo(success=False, message=str(e))

class UpdateUserProfile(graphene.Mutation):
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        first_name = graphene.String()
        last_name = graphene.String()
        email = graphene.String()

    @login_required
    def mutate(self, info, first_name=None, last_name=None, email=None):
        user = info.context.user
        try:
            if first_name is not None:
                user.first_name = first_name
            if last_name is not None:
                user.last_name = last_name
            if email is not None:
                # Vérifier unicité email
                if User.objects.filter(email=email).exclude(id=user.id).exists():
                    return UpdateUserProfile(success=False, message="Cet email est déjà utilisé")
                user.email = email
            user.save()
            return UpdateUserProfile(user=user, success=True, message="Profil mis à jour")
        except Exception as e:
            return UpdateUserProfile(success=False, message=str(e))

class ChangePassword(graphene.Mutation):
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        old_password = graphene.String(required=True)
        new_password = graphene.String(required=True)

    @login_required
    def mutate(self, info, old_password, new_password):
        user = info.context.user
        if not user.check_password(old_password):
            return ChangePassword(success=False, message="Ancien mot de passe incorrect")
        if len(new_password) < 6:
            return ChangePassword(success=False, message="Le nouveau mot de passe doit contenir au moins 6 caractères")
        user.set_password(new_password)
        user.save()
        return ChangePassword(success=True, message="Mot de passe modifié avec succès")

class Query(graphene.ObjectType):
    all_parcelles = graphene.List(ParcelleType)
    my_parcelles = graphene.List(ParcelleType)
    parcelle = graphene.Field(ParcelleType, id=graphene.ID(required=True))
    all_users = graphene.List(UserType)
    me = graphene.Field(UserType)
    all_sieges = graphene.List(SiegeType)
    my_sieges = graphene.List(SiegeType)
    siege = graphene.Field(SiegeType, id=graphene.ID(required=True))
    # Nouvelles queries pour Pépinière
    all_pepinieres = graphene.List(PepiniereType)
    my_pepinieres = graphene.List(PepiniereType)
    pepiniere = graphene.Field(PepiniereType, id=graphene.ID(required=True))

    # ENLEVER @login_required pour rendre public
    def resolve_all_parcelles(self, info):
        return Parcelle.objects.all()

    @login_required
    def resolve_my_parcelles(self, info):
        user = info.context.user
        return Parcelle.objects.filter(user=user)

    @login_required
    def resolve_parcelle(self, info, id):
        return Parcelle.objects.get(pk=id)

    def resolve_all_users(self, info):
        return User.objects.all()

    @login_required
    def resolve_me(self, info):
        user = info.context.user
        return user

    # ENLEVER @login_required pour rendre public
    def resolve_all_sieges(self, info):
        return Siege.objects.all()

    @login_required
    def resolve_my_sieges(self, info):
        user = info.context.user
        return Siege.objects.filter(user=user)

    @login_required
    def resolve_siege(self, info, id):
        return Siege.objects.get(pk=id)

    # ENLEVER @login_required pour rendre public
    def resolve_all_pepinieres(self, info):
        return Pepiniere.objects.all()

    @login_required
    def resolve_my_pepinieres(self, info):
        user = info.context.user
        return Pepiniere.objects.filter(user=user)

    @login_required
    def resolve_pepiniere(self, info, id):
        return Pepiniere.objects.get(pk=id)

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    login_user = LoginUser.Field()
    create_parcelle = CreateParcelle.Field()
    update_parcelle = UpdateParcelle.Field()
    delete_parcelle = DeleteParcelle.Field()
    create_siege = CreateSiege.Field()
    update_siege = UpdateSiege.Field()
    delete_siege = DeleteSiege.Field()
    # Nouvelles mutations pour Pépinière
    create_pepiniere = CreatePepiniere.Field()
    update_pepiniere = UpdatePepiniere.Field()
    delete_pepiniere = DeletePepiniere.Field()
    
    # JWT mutations
    token_auth = ObtainJSONWebToken.Field()
    token_auth_with_user = TokenAuthWithUser.Field()
    refresh_token = Refresh.Field()
    verify_token = Verify.Field()
    export_parcelles_csv = ExportParcellesCSV.Field()
    import_parcelles_csv = ImportParcellesCSV.Field()
    export_sieges_csv = ExportSiegesCSV.Field()
    import_sieges_csv = ImportSiegesCSV.Field()
    # Nouvelles mutations CSV pour Pépinière
    export_pepinieres_csv = ExportPepinieresCSV.Field()
    import_pepinieres_csv = ImportPepinieresCSV.Field()
    update_user_active_status = UpdateUserActiveStatus.Field()
    update_user_abreviation = UpdateUserAbreviation.Field()
    update_user_logo = UpdateUserLogo.Field()
    update_user_profile = UpdateUserProfile.Field()
    change_password = ChangePassword.Field()

schema = graphene.Schema(query=Query, mutation=Mutation) 