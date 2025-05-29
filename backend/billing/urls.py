from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, PaymentViewSet, SharedBillViewSet, ExpenseViewSet

router = DefaultRouter()
router.register('shared-bills', SharedBillViewSet)
router.register('bills', BillViewSet)
router.register('payments', PaymentViewSet)
router.register('expenses', ExpenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
