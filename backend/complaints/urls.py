from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplaintViewSet, ComplaintUpdateViewSet

router = DefaultRouter()
router.register('complaints', ComplaintViewSet)
router.register('updates', ComplaintUpdateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
