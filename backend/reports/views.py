from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from payments.models import Payment, MonthlyFee
from core.models import Client
from users.models import User

class ReportsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def debtors(self, request):
        """
        Reporte de Morosos: Clientes con deudas pendientes o vencidas.
        """
        user = request.user
        queryset = MonthlyFee.objects.filter(status__in=['pending', 'expired'])

        # Filtros de seguridad
        if user.role != 'admin' and user.sede:
            queryset = queryset.filter(client__sede=user.sede)
        if user.role == 'cobrador':
            queryset = queryset.filter(client__cobrador_asignado=user)

        # Filtros opcionales
        sede_id = request.query_params.get('sede')
        if sede_id:
            queryset = queryset.filter(client__sede_id=sede_id)

        # Agrupar por cliente
        debtors = queryset.values(
            'client__id', 'client__name', 'client__code', 'client__phone',
            'client__caserio__name', 'client__address'
        ).annotate(
            total_debt=Sum('amount'),
            months_owed=Count('id')
        ).order_by('-total_debt')

        return Response(debtors)

    @action(detail=False, methods=['get'])
    def revenue(self, request):
        """
        Reporte de Ingresos: Pagos validados.
        """
        user = request.user
        queryset = Payment.objects.filter(validation_status='validated')

        # Filtros de seguridad
        if user.role != 'admin' and user.sede:
            queryset = queryset.filter(client__sede=user.sede)
        if user.role == 'cobrador':
            queryset = queryset.filter(client__cobrador_asignado=user)

        # Filtros opcionales
        sede_id = request.query_params.get('sede')
        if sede_id:
            queryset = queryset.filter(client__sede_id=sede_id)
            
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        # Agrupar por día (o mes si se prefiere, aquí devolvemos lista plana para procesar en front)
        payments = queryset.values(
            'date', 'amount', 'method', 'client__name', 'client__code'
        ).order_by('-date')
        
        total_revenue = queryset.aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'transactions': payments,
            'total_revenue': total_revenue
        })

    @action(detail=False, methods=['get'])
    def collectors(self, request):
        """
        Efectividad de Cobradores: Recaudación por cobrador.
        """
        user = request.user
        # Solo admin y oficina deberían ver esto globalmente
        if user.role not in ['admin', 'oficina']:
            return Response({"error": "No autorizado"}, status=403)

        queryset = Payment.objects.filter(validation_status='validated')
        
        sede_id = request.query_params.get('sede')
        if sede_id:
            queryset = queryset.filter(client__sede_id=sede_id)
            
        # Agrupar por cobrador asignado al cliente (o quien registró el pago si tuviéramos ese campo explícito)
        # Asumimos que el cobrador asignado es el responsable
        collectors_stats = queryset.values(
            'client__cobrador_asignado__username',
            'client__cobrador_asignado__first_name',
            'client__cobrador_asignado__last_name'
        ).annotate(
            total_collected=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('-total_collected')

        return Response(collectors_stats)
