from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('membre', 'Membre'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='membre')
    logo = models.ImageField(upload_to='logos/', null=True, blank=True, help_text="Logo du membre")
    abreviation = models.CharField(max_length=20, blank=True, help_text="Abréviation du membre")
    
    # Nouveaux champs pour remplacer nom et prenom
    nom_institution = models.CharField(max_length=200, blank=True, help_text="Nom de l'institution")
    nom_projet = models.CharField(max_length=200, blank=True, help_text="Nom du projet")
    
    def __str__(self):
        return f"{self.username} ({self.role})" 

class Parcelle(models.Model):
    # Informations de base
    nom = models.CharField(max_length=100)
    culture = models.CharField(max_length=100)
    proprietaire = models.CharField(max_length=100)
    
    # Nouveaux champs pour personne référente
    nom_personne_referente = models.CharField(max_length=100, blank=True, help_text="Nom de la personne référente")
    poste = models.CharField(max_length=100, blank=True, help_text="Poste de la personne référente")
    telephone = models.CharField(max_length=20, blank=True, help_text="Téléphone de la personne référente")
    email = models.EmailField(blank=True, help_text="Email de la personne référente")
    
    # Informations agricoles
    superficie = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Superficie en hectares")
    variete = models.CharField(max_length=100, null=True, blank=True, help_text="Variété de la culture")
    date_semis = models.DateField(null=True, blank=True, help_text="Date de semis")
    date_recolte_prevue = models.DateField(null=True, blank=True, help_text="Date de récolte prévue")
    
    # Informations techniques
    type_sol = models.CharField(max_length=50, null=True, blank=True, help_text="Type de sol")
    irrigation = models.BooleanField(default=False, help_text="Parcelle irriguée")
    type_irrigation = models.CharField(max_length=50, null=True, blank=True, help_text="Type d'irrigation")
    
    # Informations économiques
    rendement_prevue = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Rendement prévu en tonnes/ha")
    cout_production = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Coût de production en euros/ha")
    
    # Informations environnementales
    certification_bio = models.BooleanField(default=False, help_text="Certification biologique")
    certification_hve = models.BooleanField(default=False, help_text="Certification Haute Valeur Environnementale")
    
    # Notes et observations
    notes = models.TextField(null=True, blank=True, help_text="Notes et observations")
    
    # Données géospatiales (GeoJSON converti depuis les fichiers .shp, .kml, etc.)
    geojson = models.JSONField(help_text="Données GeoJSON converties depuis les fichiers uploadés")
    
    # Relations et métadonnées
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parcelles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.nom} - {self.proprietaire}"
    
    class Meta:
        ordering = ['-created_at']

class ParcelleImage(models.Model):
    parcelle = models.ForeignKey(Parcelle, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='parcelles/', help_text="Image de la parcelle")
    titre = models.CharField(max_length=200, null=True, blank=True, help_text="Titre de l'image")
    description = models.TextField(null=True, blank=True, help_text="Description de l'image")
    ordre = models.IntegerField(default=0, help_text="Ordre d'affichage")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['ordre', 'created_at']
    
    def __str__(self):
        return f"Image {self.ordre} - {self.parcelle.nom}"

class Siege(models.Model):
    CATEGORIE_CHOICES = (
        ('national', 'National'),
        ('régional', 'Régional'),
        ('bureau', 'Bureau'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sieges')
    nom = models.CharField(max_length=100)
    
    # Nouveaux champs
    categorie = models.CharField(max_length=20, choices=CATEGORIE_CHOICES, default='bureau', help_text="Catégorie du siège")
    nom_point_contact = models.CharField(max_length=100, blank=True, help_text="Nom du point de contact")
    poste = models.CharField(max_length=100, blank=True, help_text="Poste du point de contact")
    telephone = models.CharField(max_length=20, blank=True, help_text="Téléphone du point de contact")
    email = models.EmailField(blank=True, help_text="Email du point de contact")
    
    # Horaires fixes
    horaire_matin = models.CharField(max_length=100, blank=True, help_text="Horaires du matin")
    horaire_apres_midi = models.CharField(max_length=100, blank=True, help_text="Horaires de l'après-midi")
    
    adresse = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} - {self.user.username}"

class SiegeImage(models.Model):
    siege = models.ForeignKey(Siege, on_delete=models.CASCADE, related_name='photos_batiment')
    image = models.ImageField(upload_to='sieges/', help_text="Photo du bâtiment")
    titre = models.CharField(max_length=200, null=True, blank=True, help_text="Titre de l'image")
    description = models.TextField(null=True, blank=True, help_text="Description de l'image")
    ordre = models.IntegerField(default=0, help_text="Ordre d'affichage")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['ordre', 'created_at']
    
    def __str__(self):
        return f"Photo {self.ordre} - {self.siege.nom}"

class Pepiniere(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pepinieres')
    nom = models.CharField(max_length=100)
    adresse = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    description = models.TextField(null=True, blank=True)
    
    # Champs spécifiques à la pépinière
    nom_gestionnaire = models.CharField(max_length=100, blank=True, help_text="Nom du gestionnaire")
    poste_gestionnaire = models.CharField(max_length=100, blank=True, help_text="Poste du gestionnaire")
    telephone_gestionnaire = models.CharField(max_length=20, blank=True, help_text="Téléphone du gestionnaire")
    email_gestionnaire = models.EmailField(blank=True, help_text="Email du gestionnaire")
    especes_produites = models.TextField(blank=True, help_text="Espèces produites")
    capacite = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Capacité de production")
    quantite_production_generale = models.TextField(blank=True, help_text="Quantité de production générale")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} - {self.user.username}"

class PepiniereImage(models.Model):
    pepiniere = models.ForeignKey(Pepiniere, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='pepinieres/', help_text="Photo de la pépinière")
    titre = models.CharField(max_length=200, null=True, blank=True, help_text="Titre de l'image")
    description = models.TextField(null=True, blank=True, help_text="Description de l'image")
    ordre = models.IntegerField(default=0, help_text="Ordre d'affichage")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['ordre', 'created_at']
    
    def __str__(self):
        return f"Photo {self.ordre} - {self.pepiniere.nom}"
