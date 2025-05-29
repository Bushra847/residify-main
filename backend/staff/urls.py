from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StaffViewSet, ScheduleViewSet, ExpenseViewSet, StaffRoleViewSet

router = DefaultRouter()
router.register('staff', StaffViewSet)
router.register('schedules', ScheduleViewSet)
router.register('expenses', ExpenseViewSet)
router.register('role', StaffRoleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
