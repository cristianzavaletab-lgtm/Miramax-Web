from django.db.models.signals import post_save
from django.dispatch import receiver
from core.models import Client
from .models import Payment
from reportlab.pdfgen import canvas
from django.conf import settings
import os

@receiver(post_save, sender=Client)
def generate_client_code(sender, instance, created, **kwargs):
    if created and not instance.code:
        instance.code = f"MIR-{instance.id:06d}"
        instance.save()

@receiver(post_save, sender=Payment)
def generate_comprobante(sender, instance, created, **kwargs):
    if created and not instance.comprobante_url:
        # Create directory if not exists
        media_root = settings.MEDIA_ROOT
        comprobantes_dir = os.path.join(media_root, 'comprobantes')
        os.makedirs(comprobantes_dir, exist_ok=True)

        filename = f"COMPROBANTE_{instance.id}.pdf"
        filepath = os.path.join(comprobantes_dir, filename)
        
        # Generate PDF
        c = canvas.Canvas(filepath)
        c.drawString(100, 800, "MIRAMAX - COMPROBANTE DE PAGO")
        c.drawString(100, 780, f"Recibo Nro: {instance.id}")
        c.drawString(100, 760, f"Fecha: {instance.date.strftime('%Y-%m-%d %H:%M')}")
        c.drawString(100, 740, f"Cliente: {instance.client.name}")
        c.drawString(100, 720, f"Código: {instance.client.code}")
        c.drawString(100, 700, f"Monto: S/ {instance.amount}")
        c.drawString(100, 680, f"Método: {instance.get_method_display()}")
        if instance.reference_number:
            c.drawString(100, 660, f"Referencia: {instance.reference_number}")
        
        c.save()

        # Save URL
        instance.comprobante_url = f"/media/comprobantes/{filename}"
        instance.save()
