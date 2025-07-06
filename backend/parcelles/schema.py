import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import authenticate
from graphql_jwt.decorators import login_required
from graphql_jwt.shortcuts import create_refresh_token, get_token
from graphql_jwt.mutations import ObtainJSONWebToken, Refresh, Verify
from graphene_file_upload.scalars import Upload
from .models import User, Parcelle, ParcelleImage

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

class Query(graphene.ObjectType):
    all_parcelles = graphene.List(ParcelleType)
    my_parcelles = graphene.List(ParcelleType)
    parcelle = graphene.Field(ParcelleType, id=graphene.ID(required=True))
    all_users = graphene.List(UserType)
    me = graphene.Field(UserType)

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

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    login_user = LoginUser.Field()
    create_parcelle = CreateParcelle.Field()
    update_parcelle = UpdateParcelle.Field()
    delete_parcelle = DeleteParcelle.Field()
    
    # JWT mutations
    token_auth = ObtainJSONWebToken.Field()
    token_auth_with_user = TokenAuthWithUser.Field()
    refresh_token = Refresh.Field()
    verify_token = Verify.Field()

schema = graphene.Schema(query=Query, mutation=Mutation) 