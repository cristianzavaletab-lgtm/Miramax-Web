from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import Client
from payments.models import MonthlyFee, Service
import datetime

class Command(BaseCommand):
    help = 'Genera las deudas mensuales para todos los clientes con servicios activos'

    def add_arguments(self, parser):
        parser.add_argument('--month', type=int, help='Mes (1-12)', default=timezone.now().month)
        parser.add_argument('--year', type=int, help='Año (ej: 2024)', default=timezone.now().year)

    def handle(self, *args, **options):
        month = options['month']
        year = options['year']
        
        # Primer día del mes
        month_date = datetime.date(year, month, 1)
        
        # Fecha de vencimiento (ej: día 15 del mes)
        due_date = month_date + datetime.timedelta(days=14)
        
        self.stdout.write(f"🔄 Generando deudas para: {month_date.strftime('%B %Y')}")
        
        # Obtener todos los servicios activos
        active_services = Service.objects.filter(is_active=True)
        
        created_count = 0
        skipped_count = 0
        errors_count = 0
        
        for service in active_services:
            try:
                client = service.client
                
                # Verificar si ya existe deuda para este mes/servicio
                if MonthlyFee.objects.filter(client=client, service=service, month_date=month_date).exists():
                    skipped_count += 1
                    continue
                
                # Calcular precio
                price = client.get_service_price(service.service_type)
                
                # Si no hay precio de zona, usar el precio base del servicio
                if price is None:
                    price = service.price
                
                # Crear deuda
                MonthlyFee.objects.create(
                    client=client,
                    service=service,
                    month_date=month_date,
                    due_date=due_date,
                    amount=price,
                    status='pending'
                )
                created_count += 1
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error con cliente {client}: {str(e)}"))
                errors_count += 1
        
        self.stdout.write(self.style.SUCCESS(f"\n✅ Proceso completado"))
        self.stdout.write(f"   - Generadas: {created_count}")
        self.stdout.write(f"   - Saltadas (ya existían): {skipped_count}")
        self.stdout.write(f"   - Errores: {errors_count}")
