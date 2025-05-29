from django.urls import path
from . import views

urlpatterns = [
    path('api/dashboard/admin/', views.admin_dashboard, name='admin_dashboard'),
    path('api/dashboard/resident/', views.resident_dashboard, name='resident_dashboard'),
]
