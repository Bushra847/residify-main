from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResidentViewSet, ExpenseViewSet

router = DefaultRouter()

router.register('', ResidentViewSet)
router.register('expenses', ExpenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
