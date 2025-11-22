from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrador'),
        ('cobrador', 'Cobrador'),
        ('oficina', 'Oficina'),
        ('gerencia', 'Gerencia'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cobrador')
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Sede assignment (using string reference to avoid circular import)
    sede = models.ForeignKey(
        'core.Sede',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios'
    )
    # sede_id_temp = models.IntegerField(null=True, blank=True)
    
    # Password reset fields
    reset_token = models.CharField(max_length=100, blank=True)
    reset_token_expiry = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
