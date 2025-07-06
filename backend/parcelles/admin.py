from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Parcelle, ParcelleImage

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
