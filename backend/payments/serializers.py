from rest_framework import serializers
from .models import Payment, Service, MonthlyFee, ConfigPreciosZona

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class ConfigPreciosZonaSerializer(serializers.ModelSerializer):
    zona_nombre = serializers.ReadOnlyField(source='zona.name')
    
    class Meta:
        model = ConfigPreciosZona
        fields = '__all__'


class MonthlyFeeSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')
    service_type = serializers.ReadOnlyField(source='service.service_type')
    
    class Meta:
        model = MonthlyFee
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')
    
    class Meta:
        model = Payment
        fields = '__all__'
