from django.db import models

class Sede(models.Model):
    """
    Modelo para gestionar múltiples sedes de la empresa.
    """
    nombre = models.CharField(max_length=100, unique=True)
    direccion = models.TextField()
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Sede'
        verbose_name_plural = 'Sedes'
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre


class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    
    def __str__(self):
        return self.name


class Province(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='provinces')
    
    def __str__(self):
        return f"{self.name} ({self.department.name})"


class District(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='districts')
    
    def __str__(self):
        return f"{self.name} ({self.province.name})"


class Caserio(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='caserios')
    
    class Meta:
        verbose_name = 'Caserío'
        verbose_name_plural = 'Caseríos'
    
    def __str__(self):
        return f"{self.name} ({self.district.name})"


class Zone(models.Model):
    """Legacy model - deprecated in favor of hierarchical zones"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name


class Client(models.Model):
    code = models.CharField(max_length=20, unique=True, editable=False)
    dni = models.CharField(max_length=8, unique=True)
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField()
    
    # Hierarchical zone
    caserio = models.ForeignKey(Caserio, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Sede assignment
    sede = models.ForeignKey(Sede, on_delete=models.CASCADE, null=True, blank=True)
    
    # Cobrador assignment
    cobrador_asignado = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='clientes_asignados',
        limit_choices_to={'role': 'cobrador'}
    )
    
    # Legacy zone field
    zone = models.ForeignKey(Zone, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"

    def get_service_price(self, service_type):
        """
        Obtiene el precio aplicable para un tipo de servicio.
        Prioridad:
        1. Precio personalizado (si existiera campo en futuro)
        2. Precio por Zona (ConfigPreciosZona)
        3. Precio base del servicio (si existiera default)
        
        Por ahora, buscamos en ConfigPreciosZona usando el caserío del cliente.
        """
        from payments.models import ConfigPreciosZona
        from django.utils import timezone
        
        # 1. Buscar precio por zona (Caserío)
        if self.caserio:
            config_zona = ConfigPreciosZona.objects.filter(
                zona=self.caserio,
                tipo_servicio=service_type,
                activo=True,
                vigencia_desde__lte=timezone.now().date()
            ).order_by('-vigencia_desde').first()
            
            if config_zona:
                return config_zona.precio_base
                
        # 2. Si no hay precio de zona, retornar None (o un default global si existiera)
        return None


class Visit(models.Model):
    """
    Registro de visitas del cobrador a clientes.
    """
    ESTADO_CHOICES = [
        ('pago', 'Pagó'),
        ('no_estaba', 'No estaba'),
        ('se_mudo', 'Se mudó'),
        ('no_responde', 'No responde'),
    ]
    
    cliente = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='visitas')
    cobrador = models.ForeignKey('users.User', on_delete=models.CASCADE)
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES)
    notas = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Visita'
        verbose_name_plural = 'Visitas'
        ordering = ['-fecha']
    
    def __str__(self):
        return f"{self.cliente.code} - {self.get_estado_display()} ({self.fecha.strftime('%Y-%m-%d')})"


class Auditoria(models.Model):
    """
    Registro de auditoría para todas las acciones importantes del sistema.
    """
    ACCION_CHOICES = [
        ('CREATE', 'Crear'),
        ('UPDATE', 'Actualizar'),
        ('DELETE', 'Eliminar'),
        ('VALIDATE', 'Validar'),
        ('REJECT', 'Rechazar'),
        ('CANCEL', 'Anular'),
    ]
    
    tabla = models.CharField(max_length=50)
    registro_id = models.IntegerField()
    usuario = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    accion = models.CharField(max_length=20, choices=ACCION_CHOICES)
    detalle = models.JSONField()
    fecha = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Auditoría'
        verbose_name_plural = 'Auditorías'
        ordering = ['-fecha']
    
    def __str__(self):
        return f"{self.get_accion_display()} - {self.tabla} #{self.registro_id}"
