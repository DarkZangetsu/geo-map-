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
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class Parcelle(models.Model):
    # Informations de base
    nom = models.CharField(max_length=100)
    culture = models.CharField(max_length=100)
    proprietaire = models.CharField(max_length=100)
    
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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sieges')
    nom = models.CharField(max_length=100)
    adresse = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} - {self.user.username}"
