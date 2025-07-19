from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Parcelle, ParcelleImage, Siege, SiegeImage, Pepiniere, PepiniereImage

class ParcelleImageInline(admin.TabularInline):
    model = ParcelleImage
    extra = 1
    fields = ('image', 'titre', 'description', 'ordre')

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informations supplémentaires', {
            'fields': ('role', 'logo')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informations supplémentaires', {
            'fields': ('role', 'logo')
        }),
    )

@admin.register(Parcelle)
class ParcelleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'culture', 'proprietaire', 'user', 'superficie', 'created_at')
    list_filter = ('culture', 'type_sol', 'irrigation', 'certification_bio', 'certification_hve', 'created_at')
    search_fields = ('nom', 'proprietaire', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Informations de base', {
            'fields': ('nom', 'culture', 'proprietaire', 'user')
        }),
        ('Informations agricoles', {
            'fields': ('superficie', 'variete', 'date_semis', 'date_recolte_prevue', 'type_sol')
        }),
        ('Irrigation', {
            'fields': ('irrigation', 'type_irrigation')
        }),
        ('Informations économiques', {
            'fields': ('rendement_prevue', 'cout_production')
        }),
        ('Certifications', {
            'fields': ('certification_bio', 'certification_hve')
        }),
        ('Données géospatiales', {
            'fields': ('geojson',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ParcelleImageInline]

@admin.register(ParcelleImage)
class ParcelleImageAdmin(admin.ModelAdmin):
    list_display = ('parcelle', 'titre', 'ordre', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('parcelle__nom', 'titre', 'description')
    ordering = ('parcelle', 'ordre', 'created_at')
    
    fieldsets = (
        ('Image', {
            'fields': ('parcelle', 'image')
        }),
        ('Informations', {
            'fields': ('titre', 'description', 'ordre')
        }),
        ('Métadonnées', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at',)

class SiegeImageInline(admin.TabularInline):
    model = SiegeImage
    extra = 1
    fields = ('image', 'titre', 'description', 'ordre')

@admin.register(Siege)
class SiegeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'categorie', 'user', 'adresse', 'latitude', 'longitude', 'created_at')
    list_filter = ('categorie', 'created_at')
    search_fields = ('nom', 'user__username', 'adresse')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    fieldsets = (
        ('Informations de base', {
            'fields': ('nom', 'categorie', 'user', 'adresse', 'latitude', 'longitude')
        }),
        ('Point de contact', {
            'fields': ('nom_point_contact', 'poste', 'telephone', 'email')
        }),
        ('Horaires', {
            'fields': ('horaire_matin', 'horaire_apres_midi')
        }),
        ('Description', {
            'fields': ('description',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [SiegeImageInline]

@admin.register(SiegeImage)
class SiegeImageAdmin(admin.ModelAdmin):
    list_display = ('siege', 'titre', 'ordre', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('siege__nom', 'titre', 'description')
    ordering = ('siege', 'ordre', 'created_at')
    fieldsets = (
        ('Image', {
            'fields': ('siege', 'image')
        }),
        ('Informations', {
            'fields': ('titre', 'description', 'ordre')
        }),
        ('Métadonnées', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at',)

class PepiniereImageInline(admin.TabularInline):
    model = PepiniereImage
    extra = 1
    fields = ('image', 'titre', 'description', 'ordre')

@admin.register(Pepiniere)
class PepiniereAdmin(admin.ModelAdmin):
    list_display = ('nom', 'user', 'adresse', 'latitude', 'longitude', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('nom', 'user__username', 'adresse')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    fieldsets = (
        ('Informations de base', {
            'fields': ('nom', 'user', 'adresse', 'latitude', 'longitude')
        }),
        ('Gestionnaire', {
            'fields': ('nom_gestionnaire', 'poste_gestionnaire', 'telephone_gestionnaire', 'email_gestionnaire')
        }),
        ('Production', {
            'fields': ('especes_produites', 'capacite', 'quantite_production_generale')
        }),
        ('Description', {
            'fields': ('description',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    inlines = [PepiniereImageInline]

@admin.register(PepiniereImage)
class PepiniereImageAdmin(admin.ModelAdmin):
    list_display = ('pepiniere', 'titre', 'ordre', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('pepiniere__nom', 'titre', 'description')
    ordering = ('pepiniere', 'ordre', 'created_at')
    fieldsets = (
        ('Image', {
            'fields': ('pepiniere', 'image')
        }),
        ('Informations', {
            'fields': ('titre', 'description', 'ordre')
        }),
        ('Métadonnées', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at',)
