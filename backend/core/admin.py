from django.contrib import admin
from .models import (
    Sede, Department, Province, District, Caserio,
    Zone, Client, Visit, Auditoria
)

@admin.register(Sede)
class SedeAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'direccion', 'telefono', 'activo', 'created_at')
    list_filter = ('activo',)
    search_fields = ('nombre', 'direccion')

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'department')
    list_filter = ('department',)
    search_fields = ('name', 'code')

@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'province')
    list_filter = ('province__department',)
    search_fields = ('name', 'code')

@admin.register(Caserio)
class CaserioAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'district')
    list_filter = ('district__province__department',)
    search_fields = ('name', 'code')

@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'dni', 'phone', 'sede', 'cobrador_asignado', 'created_at')
    list_filter = ('sede', 'cobrador_asignado', 'caserio__district__province__department')
    search_fields = ('code', 'name', 'dni', 'phone')
    readonly_fields = ('code', 'created_at', 'updated_at')

@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'cobrador', 'estado', 'fecha')
    list_filter = ('estado', 'fecha')
    search_fields = ('cliente__name', 'cliente__code', 'cobrador__username')
    readonly_fields = ('fecha',)

@admin.register(Auditoria)
class AuditoriaAdmin(admin.ModelAdmin):
    list_display = ('tabla', 'registro_id', 'usuario', 'accion', 'fecha')
    list_filter = ('tabla', 'accion', 'fecha')
    search_fields = ('tabla', 'usuario__username')
    readonly_fields = ('tabla', 'registro_id', 'usuario', 'accion', 'detalle', 'fecha')
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
