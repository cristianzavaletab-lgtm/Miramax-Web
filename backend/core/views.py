from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Department, Province, District, Caserio, Client, Zone, Sede, Visit, Auditoria
from payments.models import Payment, MonthlyFee
from django.db import models
from django.utils import timezone
from .serializers import (
    DepartmentSerializer, ProvinceSerializer, DistrictSerializer, 
    CaserioSerializer, ClientSerializer, ZoneSerializer,
    SedeSerializer, VisitSerializer, AuditoriaSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

class ProvinceViewSet(viewsets.ModelViewSet):
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Province.objects.all()
        dept_id = self.request.query_params.get('department', None)
        if dept_id is not None:
            queryset = queryset.filter(department_id=dept_id)
        return queryset

class DistrictViewSet(viewsets.ModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = District.objects.all()
        prov_id = self.request.query_params.get('province', None)
        if prov_id is not None:
            queryset = queryset.filter(province_id=prov_id)
        return queryset

class CaserioViewSet(viewsets.ModelViewSet):
    queryset = Caserio.objects.all()
    serializer_class = CaserioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Caserio.objects.all()
        dist_id = self.request.query_params.get('district', None)
        if dist_id is not None:
            queryset = queryset.filter(district_id=dist_id)
        return queryset

class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
    permission_classes = [IsAuthenticated]

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Client.objects.all()
        user = self.request.user
        
        # Si no es admin, filtrar por sede asignada
        if user.role != 'admin' and user.sede:
            queryset = queryset.filter(sede=user.sede)
        
        # Si es cobrador, ADEMÁS solo ver sus clientes asignados
        if user.role == 'cobrador':
            queryset = queryset.filter(cobrador_asignado=user)
        
        # Filtros opcionales
        sede_id = self.request.query_params.get('sede', None)
        if sede_id:
            queryset = queryset.filter(sede_id=sede_id)
            
        return queryset


class SedeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar sedes.
    Solo Admin puede crear/editar/eliminar.
    """
    queryset = Sede.objects.all()
    serializer_class = SedeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Sede.objects.filter(activo=True)
        return queryset


class VisitViewSet(viewsets.ModelViewSet):
    """
    ViewSet para registrar visitas de cobradores.
    """
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Visit.objects.all()
        user = self.request.user
        
        # Cobradores solo ven sus propias visitas
        if user.role == 'cobrador':
            queryset = queryset.filter(cobrador=user)
        
        # Filtro por cliente
        cliente_id = self.request.query_params.get('cliente', None)
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
            
        return queryset
    
    def perform_create(self, serializer):
        # Asignar automáticamente el cobrador actual
        serializer.save(cobrador=self.request.user)


class AuditoriaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet de solo lectura para auditoría.
    Solo Admin puede ver.
    """
    queryset = Auditoria.objects.all()
    serializer_class = AuditoriaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Solo admin puede ver auditoría
        if user.role != 'admin':
            return Auditoria.objects.none()
        
        queryset = Auditoria.objects.all()
        
        # Filtros
        tabla = self.request.query_params.get('tabla', None)
        if tabla:
            queryset = queryset.filter(tabla=tabla)
            
        accion = self.request.query_params.get('accion', None)
        if accion:
            queryset = queryset.filter(accion=accion)
            
        usuario_id = self.request.query_params.get('usuario', None)
        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id)
            
        return queryset
class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        
        # Filtros base
        clients = Client.objects.all()
        payments = Payment.objects.all()
        monthly_fees = MonthlyFee.objects.all()
        
        # Filtrar por Sede (si no es Admin)
        if user.role != 'admin' and user.sede:
            clients = clients.filter(sede=user.sede)
            payments = payments.filter(client__sede=user.sede)
            monthly_fees = monthly_fees.filter(client__sede=user.sede)
            
        # Filtrar por Cobrador
        if user.role == 'cobrador':
            clients = clients.filter(cobrador_asignado=user)
            payments = payments.filter(client__cobrador_asignado=user)
            monthly_fees = monthly_fees.filter(client__cobrador_asignado=user)
            
        # Filtro explícito por Sede (para Admin)
        sede_id = request.query_params.get('sede', None)
        if sede_id:
            clients = clients.filter(sede_id=sede_id)
            payments = payments.filter(client__sede_id=sede_id)
            monthly_fees = monthly_fees.filter(client__sede_id=sede_id)

        # Métricas
        total_clients = clients.count()
        active_clients = clients.filter(status='active').count()
        
        # Deuda Total (Pendiente + Vencida)
        total_debt = monthly_fees.filter(status__in=['pending', 'expired']).aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        # Recaudación del Mes Actual
        current_month = timezone.now().replace(day=1)
        monthly_revenue = payments.filter(
            date__gte=current_month,
            validation_status='validated'
        ).aggregate(total=models.Sum('amount'))['total'] or 0
        
        # Pagos Pendientes de Validación
        pending_payments = payments.filter(validation_status='pending').count()

        return Response({
            'total_clients': total_clients,
            'active_clients': active_clients,
            'total_debt': total_debt,
            'monthly_revenue': monthly_revenue,
            'pending_payments': pending_payments
        })
