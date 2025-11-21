

class ConfigPreciosZonaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para configurar precios por zona.
    Solo Admin puede modificar.
    """
    queryset = ConfigPreciosZona.objects.all()
    serializer_class = ConfigPreciosZonaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = ConfigPreciosZona.objects.filter(activo=True)
        
        # Filtros
        zona_id = self.request.query_params.get('zona', None)
        if zona_id:
            queryset = queryset.filter(zona_id=zona_id)
            
        tipo_servicio = self.request.query_params.get('tipo_servicio', None)
        if tipo_servicio:
            queryset = queryset.filter(tipo_servicio=tipo_servicio)
            
        return queryset


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Payment.objects.all()
        user = self.request.user
        
        # Si no es admin, filtrar por sede asignada
        if user.role != 'admin' and user.sede:
            queryset = queryset.filter(client__sede=user.sede)
            
        """
        Validar o rechazar un pago.
        Solo Oficina puede validar.
        """
        payment = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in ['validated', 'rejected']:
            payment.validation_status = new_status
            payment.validated_by = request.user
            
            if new_status == 'rejected':
                payment.rejection_reason = request.data.get('reason', '')
            
            payment.save()
            
            # Registrar en auditoría
            from core.models import Auditoria
            Auditoria.objects.create(
                tabla='Payment',
                registro_id=payment.id,
                usuario=request.user,
                accion='VALIDATE' if new_status == 'validated' else 'REJECT',
                detalle={
                    'payment_id': payment.id,
                    'client': payment.client.name,
                    'amount': str(payment.amount),
                    'status': new_status,
                    'reason': payment.rejection_reason if new_status == 'rejected' else ''
                }
            )
            
            return Response({'status': 'Payment status updated'})
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        """
        Anular un pago.
        Solo Oficina puede anular.
        Solo pagos no-efectivo pueden ser anulados.
        """
        payment = self.get_object()
        user = request.user
        
        # Verificar permisos
        if user.role != 'oficina' and user.role != 'admin':
            return Response(
                {'error': 'Solo Oficina puede anular pagos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que no sea efectivo
        if payment.method == 'cash':
            return Response(
                {'error': 'Los pagos en efectivo no pueden ser anulados desde el sistema'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que no esté ya anulado
        if payment.fecha_anulacion:
            return Response(
                {'error': 'Este pago ya fue anulado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Anular el pago
        motivo = request.data.get('motivo', '')
        if not motivo:
            return Response(
                {'error': 'Debe proporcionar un motivo de anulación'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.motivo_anulacion = motivo
        payment.anulado_por = user
        payment.fecha_anulacion = timezone.now()
        payment.validation_status = 'rejected'  # Marcar como rechazado
        payment.save()
        
        # Registrar en auditoría
        from core.models import Auditoria
        Auditoria.objects.create(
            tabla='Payment',
            registro_id=payment.id,
            usuario=user,
            accion='CANCEL',
            detalle={
                'payment_id': payment.id,
                'client': payment.client.name,
                'amount': str(payment.amount),
                'method': payment.method,
                'motivo': motivo
            }
        )
        
        return Response({'status': 'Pago anulado exitosamente'})


class MonthlyFeeViewSet(viewsets.ModelViewSet):
    queryset = MonthlyFee.objects.all()
    serializer_class = MonthlyFeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = MonthlyFee.objects.all()
        user = self.request.user
        
        # Cobradores solo ven deudas de sus clientes asignados
        if user.role == 'cobrador':
            queryset = queryset.filter(client__cobrador_asignado=user)
        
        # Filtros
        client_id = self.request.query_params.get('client', None)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
            
        month = self.request.query_params.get('month', None)
        if month:
            # month format: YYYY-MM
            queryset = queryset.filter(month_date__startswith=month)
            
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Endpoint para disparar la generación manual de deudas.
        Solo Admin/Oficina.
        """
        if request.user.role not in ['admin', 'oficina']:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
            
        from django.core.management import call_command
        try:
            # Llamar al comando de gestión
            call_command('generate_monthly_fees')
            return Response({'status': 'Proceso de generación iniciado'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
