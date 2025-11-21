from django.contrib import admin
from .models import Service, MonthlyFee, Payment, ConfigPreciosZona

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('client', 'service_type', 'price', 'is_active', 'install_date')
    list_filter = ('service_type', 'is_active')
    search_fields = ('client__name', 'client__code')

@admin.register(ConfigPreciosZona)
class ConfigPreciosZonaAdmin(admin.ModelAdmin):
    list_display = ('zona', 'tipo_servicio', 'precio_base', 'vigencia_desde', 'vigencia_hasta', 'activo')
    list_filter = ('tipo_servicio', 'activo', 'vigencia_desde')
    search_fields = ('zona__name',)

@admin.register(MonthlyFee)
class MonthlyFeeAdmin(admin.ModelAdmin):
    list_display = ('client', 'service', 'month_date', 'amount', 'paid_amount', 'status')
    list_filter = ('status', 'month_date')
    search_fields = ('client__name', 'client__code')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('client', 'amount', 'method', 'validation_status', 'date', 'registered_by')
    list_filter = ('method', 'validation_status', 'date')
    search_fields = ('client__name', 'client__code', 'reference_number')
    readonly_fields = ('date', 'comprobante_url')
