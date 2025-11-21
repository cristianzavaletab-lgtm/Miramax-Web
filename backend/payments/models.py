from django.db import models
from core.models import Client, Caserio
from django.conf import settings

class Service(models.Model):
    SERVICE_TYPES = (
        ('internet', 'Internet'),
        ('cable', 'Cable'),
    )
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='services')
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    install_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.name} - {self.service_type}"


class ConfigPreciosZona(models.Model):
    """
    Configuración de precios base por zona y tipo de servicio.
    """
    zona = models.ForeignKey(Caserio, on_delete=models.CASCADE, related_name='precios')
    tipo_servicio = models.CharField(
        max_length=20,
        choices=[('internet', 'Internet'), ('cable', 'Cable')]
    )
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    vigencia_desde = models.DateField()
    vigencia_hasta = models.DateField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Configuración de Precio por Zona'
        verbose_name_plural = 'Configuraciones de Precios por Zona'
        ordering = ['-vigencia_desde']
    
    def __str__(self):
        return f"{self.zona.name} - {self.tipo_servicio} - S/.{self.precio_base}"

class MonthlyFee(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendiente'),
        ('paid', 'Pagado'),
        ('partial', 'Parcial'),
        ('expired', 'Vencido'),
    )
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='fees')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='fees', null=True, blank=True)
    month_date = models.DateField()  # Primer día del mes
    due_date = models.DateField(null=True, blank=True)  # Fecha de vencimiento
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment = models.ForeignKey('Payment', on_delete=models.SET_NULL, null=True, blank=True, related_name='covered_fees')
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-month_date', 'client__name']
        unique_together = ['client', 'service', 'month_date']

    def __str__(self):
        return f"{self.client} - {self.month_date} - {self.status}"

class Payment(models.Model):
    PAYMENT_METHODS = (
        ('cash', 'Efectivo'),
        ('yape', 'Yape'),
        ('plin', 'Plin'),
        ('transfer', 'Transferencia'),
    )
    VALIDATION_STATUS = (
        ('pending', 'Pendiente de Validación'),
        ('validated', 'Validado'),
        ('rejected', 'Rechazado'),
    )

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    reference_number = models.CharField(max_length=100, blank=True)
    proof_image = models.ImageField(upload_to='payments/', blank=True, null=True)
    
    registered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='registered_payments')
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_payments')
    validation_status = models.CharField(max_length=20, choices=VALIDATION_STATUS, default='pending')
    rejection_reason = models.TextField(blank=True)
    
    # Anulación fields
    motivo_anulacion = models.TextField(blank=True)
    anulado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pagos_anulados'
    )
    fecha_anulacion = models.DateTimeField(null=True, blank=True)
    
    comprobante_url = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.client} - {self.amount} - {self.validation_status}"
