from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from users.views import UserViewSet, PasswordResetRequestView
from core.views import (
    DepartmentViewSet, ProvinceViewSet, DistrictViewSet, 
    CaserioViewSet, ClientViewSet, ZoneViewSet,
    SedeViewSet, VisitViewSet, AuditoriaViewSet,
    DashboardViewSet
)
from payments.views import (
    PaymentViewSet, MonthlyFeeViewSet, ServiceViewSet,
    ConfigPreciosZonaViewSet
)
from reports.views import ReportsViewSet

router = DefaultRouter()
# Users
router.register(r'users', UserViewSet)

# Hierarchical zones
router.register(r'departments', DepartmentViewSet)
router.register(r'provinces', ProvinceViewSet)
router.register(r'districts', DistrictViewSet)
router.register(r'caserios', CaserioViewSet)

# Legacy zones
router.register(r'zones', ZoneViewSet)

# Core models
router.register(r'clients', ClientViewSet)
router.register(r'sedes', SedeViewSet)
router.register(r'visitas', VisitViewSet)
router.register(r'auditoria', AuditoriaViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

# Payments
router.register(r'services', ServiceViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'monthly-fees', MonthlyFeeViewSet)
router.register(r'precios-zona', ConfigPreciosZonaViewSet)
router.register(r'reports', ReportsViewSet, basename='reports')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
