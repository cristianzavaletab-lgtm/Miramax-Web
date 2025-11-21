from rest_framework import serializers
from .models import (
    Department, Province, District, Caserio, Client, Zone,
    Sede, Visit, Auditoria
)

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class ProvinceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = '__all__'

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = '__all__'

class CaserioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caserio
        fields = '__all__'

class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = '__all__'

class ClientSerializer(serializers.ModelSerializer):
    caserio_name = serializers.ReadOnlyField(source='caserio.name')
    zone_name = serializers.ReadOnlyField(source='zone.name')
    active_services = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = '__all__'

    def get_active_services(self, obj):
        return [service.name for service in obj.services.all()]


class SedeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sede
        fields = '__all__'


class VisitSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.ReadOnlyField(source='cliente.name')
    cobrador_nombre = serializers.ReadOnlyField(source='cobrador.username')
    
    class Meta:
        model = Visit
        fields = '__all__'


class AuditoriaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.username')
    accion_display = serializers.ReadOnlyField(source='get_accion_display')
    
    class Meta:
        model = Auditoria
        fields = '__all__'
        read_only_fields = ('tabla', 'registro_id', 'usuario', 'accion', 'detalle', 'fecha')
