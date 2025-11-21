from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .serializers import UserSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            # In a real app, generate a token and send email
            # For this MVP, we'll just return a success message
            # or maybe a "simulated" token if we want to test the flow
            return Response({"message": "Si el correo existe, se ha enviado un enlace de recuperación."}, status=status.HTTP_200_OK)
        # Security: Don't reveal if user exists
        return Response({"message": "Si el correo existe, se ha enviado un enlace de recuperación."}, status=status.HTTP_200_OK)
