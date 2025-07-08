import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import authenticate
from graphql_jwt.decorators import login_required
from graphql_jwt.shortcuts import create_refresh_token, get_token
from graphql_jwt.mutations import ObtainJSONWebToken, Refresh, Verify
from graphene_file_upload.scalars import Upload
from .models import User, Parcelle, ParcelleImage, Siege
import csv
import io
import json
from datetime import datetime
from decimal import Decimal

class UserType(DjangoObjectType):
    firstName = graphene.String(source='first_name')
    lastName = graphene.String(source='last_name')
    
    class Meta:
        model = User
        fields = "__all__"

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

class SiegeType(DjangoObjectType):
    class Meta:
        model = Siege
        fields = "__all__"

class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)
    success = graphene.Boolean()
    message = graphene.String()

    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        first_name = graphene.String()
        last_name = graphene.String()
        role = graphene.String()
        logo = Upload()

    def mutate(self, info, username, email, password, first_name="", last_name="", role="membre", logo=None):
        try:
            if User.objects.filter(username=username).exists():
                return CreateUser(success=False, message="Nom d'utilisateur déjà pris")
            
            if User.objects.filter(email=email).exists():
                return CreateUser(success=False, message="Email déjà utilisé")
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=role
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
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    def mutate(self, info, username, password):
        try:
            user = authenticate(username=username, password=password)
            if user:
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
        culture = graphene.String(required=True)
        proprietaire = graphene.String(required=True)
        geojson = graphene.JSONString(required=True)
        superficie = graphene.Decimal()
        variete = graphene.String()
        date_semis = graphene.Date()
        date_recolte_prevue = graphene.Date()
        type_sol = graphene.String()
        irrigation = graphene.Boolean()
        type_irrigation = graphene.String()
        rendement_prevue = graphene.Decimal()
        cout_production = graphene.Decimal()
        certification_bio = graphene.Boolean()
        certification_hve = graphene.Boolean()
        notes = graphene.String()
        images = graphene.List(Upload)

    @login_required
    def mutate(self, info, nom, culture, proprietaire, geojson, **kwargs):
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
                culture=culture,
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
        culture = graphene.String()
        proprietaire = graphene.String()
        geojson = graphene.JSONString()
        superficie = graphene.Decimal()
        variete = graphene.String()
        date_semis = graphene.Date()
        date_recolte_prevue = graphene.Date()
        type_sol = graphene.String()
        irrigation = graphene.Boolean()
        type_irrigation = graphene.String()
        rendement_prevue = graphene.Decimal()
        cout_production = graphene.Decimal()
        certification_bio = graphene.Boolean()
        certification_hve = graphene.Boolean()
        notes = graphene.String()
        images = graphene.List(Upload)

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
            for field, value in kwargs.items():
                if value is not None:
                    setattr(parcelle, field, value)
            parcelle.save()
            # Mettre à jour les images si fournies
            if images is not None:
                parcelle.images.all().delete()
                for i, image_file in enumerate(images):
                    if image_file:
                        ParcelleImage.objects.create(
                            parcelle=parcelle,
                            image=image_file,
                            ordre=i
                        )
            return UpdateParcelle(parcelle=parcelle, success=True, message="Parcelle mise à jour")
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

    @login_required
    def mutate(self, info, nom, adresse, latitude, longitude, description=None):
        user = info.context.user
        try:
            siege = Siege.objects.create(
                user=user,
                nom=nom,
                adresse=adresse,
                latitude=latitude,
                longitude=longitude,
                description=description
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

    @login_required
    def mutate(self, info, id, **kwargs):
        user = info.context.user
        try:
            siege = Siege.objects.get(id=id)
            if siege.user != user and user.role != 'admin':
                return UpdateSiege(success=False, message="Non autorisé")
            for key, value in kwargs.items():
                if value is not None:
                    setattr(siege, key, value)
            siege.save()
            return UpdateSiege(siege=siege, success=True, message="Siège modifié avec succès")
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
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    def mutate(self, info, username, password):
        try:
            # Authentifier l'utilisateur
            user = authenticate(username=username, password=password)
            
            if user and user.is_active:
                # Créer le token JWT
                token = get_token(user)
                
                # Créer le refresh token
                refresh_token = create_refresh_token(user)
                
                print(f"Token créé pour l'utilisateur {username}")
                
                return TokenAuthWithUser(
                    token=token,
                    refreshToken=refresh_token,
                    user=user,
                    success=True,
                    message="Connexion réussie"
                )
            else:
                print(f"Échec d'authentification pour {username}")
                return TokenAuthWithUser(
                    success=False,
                    message="Identifiants incorrects ou compte inactif"
                )
                
        except Exception as e:
            print(f"Erreur dans TokenAuthWithUser: {str(e)}")
            import traceback
            traceback.print_exc()
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
            parcelles = Parcelle.objects.filter(user=user)
            output = io.StringIO()
            writer = csv.writer(output)
            headers = [
                'nom', 'culture', 'proprietaire', 'superficie', 'variete',
                'date_semis', 'date_recolte_prevue', 'type_sol', 'irrigation',
                'type_irrigation', 'rendement_prevue', 'cout_production',
                'certification_bio', 'certification_hve', 'notes', 'geometrie'
            ]
            writer.writerow(headers)
            for parcelle in parcelles:
                # Exporter la géométrie comme liste de points (lon,lat)
                coords = ''
                if parcelle.geojson and 'geometry' in parcelle.geojson and 'coordinates' in parcelle.geojson['geometry']:
                    points = parcelle.geojson['geometry']['coordinates'][0] if parcelle.geojson['geometry']['type'] == 'Polygon' else []
                    coords = ','.join(f"[{p[0]},{p[1]}]" for p in points)
                row = [
                    parcelle.nom,
                    parcelle.culture,
                    parcelle.proprietaire,
                    str(parcelle.superficie) if parcelle.superficie else '',
                    parcelle.variete or '',
                    parcelle.date_semis.strftime('%Y-%m-%d') if parcelle.date_semis else '',
                    parcelle.date_recolte_prevue.strftime('%Y-%m-%d') if parcelle.date_recolte_prevue else '',
                    parcelle.type_sol or '',
                    'Oui' if parcelle.irrigation else 'Non',
                    parcelle.type_irrigation or '',
                    str(parcelle.rendement_prevue) if parcelle.rendement_prevue else '',
                    str(parcelle.cout_production) if parcelle.cout_production else '',
                    'Oui' if parcelle.certification_bio else 'Non',
                    'Oui' if parcelle.certification_hve else 'Non',
                    parcelle.notes or '',
                    coords
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
                    if not row.get('nom') or not row.get('culture') or not row.get('proprietaire'):
                        errors.append(f"Ligne {row_num}: Nom, culture et propriétaire sont requis")
                        continue
                    superficie = None
                    if row.get('superficie'):
                        try:
                            superficie = Decimal(row['superficie'].replace(',', '.'))
                        except:
                            errors.append(f"Ligne {row_num}: Superficie invalide")
                            continue
                    date_semis = None
                    if row.get('date_semis'):
                        try:
                            date_semis = datetime.strptime(row['date_semis'], '%Y-%m-%d').date()
                        except:
                            errors.append(f"Ligne {row_num}: Date de semis invalide (format: YYYY-MM-DD)")
                            continue
                    date_recolte_prevue = None
                    if row.get('date_recolte_prevue'):
                        try:
                            date_recolte_prevue = datetime.strptime(row['date_recolte_prevue'], '%Y-%m-%d').date()
                        except:
                            errors.append(f"Ligne {row_num}: Date de récolte prévue invalide (format: YYYY-MM-DD)")
                            continue
                    def parse_bool(val):
                        return str(val).strip().lower() in ['1', 'oui', 'yes', 'true', 'vrai']
                    irrigation = parse_bool(row.get('irrigation', '0'))
                    certification_bio = parse_bool(row.get('certification_bio', '0'))
                    certification_hve = parse_bool(row.get('certification_hve', '0'))
                    rendement_prevue = None
                    if row.get('rendement_prevue'):
                        try:
                            rendement_prevue = Decimal(row['rendement_prevue'].replace(',', '.'))
                        except:
                            errors.append(f"Ligne {row_num}: Rendement prévu invalide")
                            continue
                    cout_production = None
                    if row.get('cout_production'):
                        try:
                            cout_production = Decimal(row['cout_production'].replace(',', '.'))
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
                        nom=row['nom'],
                        culture=row['culture'],
                        proprietaire=row['proprietaire'],
                        superficie=superficie,
                        variete=row.get('variete', ''),
                        date_semis=date_semis,
                        date_recolte_prevue=date_recolte_prevue,
                        type_sol=row.get('type_sol', ''),
                        irrigation=irrigation,
                        type_irrigation=row.get('type_irrigation', ''),
                        rendement_prevue=rendement_prevue,
                        cout_production=cout_production,
                        certification_bio=certification_bio,
                        certification_hve=certification_hve,
                        notes=row.get('notes', ''),
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
            sieges = Siege.objects.filter(user=user)
            output = io.StringIO()
            writer = csv.writer(output)
            headers = [
                'nom', 'adresse', 'latitude', 'longitude', 'description'
            ]
            writer.writerow(headers)
            for siege in sieges:
                row = [
                    siege.nom,
                    siege.adresse,
                    str(siege.latitude),
                    str(siege.longitude),
                    siege.description or ''
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
                    if not row.get('nom') or not row.get('adresse') or not row.get('latitude') or not row.get('longitude'):
                        errors.append(f"Ligne {row_num}: nom, adresse, latitude et longitude sont requis")
                        continue
                    try:
                        latitude = float(row['latitude'].replace(',', '.'))
                        longitude = float(row['longitude'].replace(',', '.'))
                    except:
                        errors.append(f"Ligne {row_num}: latitude ou longitude invalide")
                        continue
                    siege = Siege.objects.create(
                        user=user,
                        nom=row['nom'],
                        adresse=row['adresse'],
                        latitude=latitude,
                        longitude=longitude,
                        description=row.get('description', '')
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

class Query(graphene.ObjectType):
    all_parcelles = graphene.List(ParcelleType)
    my_parcelles = graphene.List(ParcelleType)
    parcelle = graphene.Field(ParcelleType, id=graphene.ID(required=True))
    all_users = graphene.List(UserType)
    me = graphene.Field(UserType)
    all_sieges = graphene.List(SiegeType)
    my_sieges = graphene.List(SiegeType)
    siege = graphene.Field(SiegeType, id=graphene.ID(required=True))

    @login_required
    def resolve_all_parcelles(self, info):
        return Parcelle.objects.all()

    @login_required
    def resolve_my_parcelles(self, info):
        user = info.context.user
        return Parcelle.objects.filter(user=user)

    @login_required
    def resolve_parcelle(self, info, id):
        user = info.context.user
        try:
            parcelle = Parcelle.objects.get(id=id)
            if parcelle.user == user or user.role == 'admin':
                return parcelle
            return None
        except Parcelle.DoesNotExist:
            return None

    @login_required
    def resolve_all_users(self, info):
        user = info.context.user
        if user.role == 'admin':
            return User.objects.all()
        return User.objects.none()

    @login_required
    def resolve_me(self, info):
        return info.context.user

    @login_required
    def resolve_all_sieges(self, info):
        user = info.context.user
        if user.role == 'admin':
            return Siege.objects.all()
        return Siege.objects.filter(user=user)

    @login_required
    def resolve_my_sieges(self, info):
        user = info.context.user
        return Siege.objects.filter(user=user)

    @login_required
    def resolve_siege(self, info, id):
        user = info.context.user
        try:
            siege = Siege.objects.get(id=id)
            if siege.user != user and user.role != 'admin':
                return None
            return siege
        except Siege.DoesNotExist:
            return None

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    login_user = LoginUser.Field()
    create_parcelle = CreateParcelle.Field()
    update_parcelle = UpdateParcelle.Field()
    delete_parcelle = DeleteParcelle.Field()
    create_siege = CreateSiege.Field()
    update_siege = UpdateSiege.Field()
    delete_siege = DeleteSiege.Field()
    
    # JWT mutations
    token_auth = ObtainJSONWebToken.Field()
    token_auth_with_user = TokenAuthWithUser.Field()
    refresh_token = Refresh.Field()
    verify_token = Verify.Field()
    export_parcelles_csv = ExportParcellesCSV.Field()
    import_parcelles_csv = ImportParcellesCSV.Field()
    export_sieges_csv = ExportSiegesCSV.Field()
    import_sieges_csv = ImportSiegesCSV.Field()

schema = graphene.Schema(query=Query, mutation=Mutation) 