from rest_framework.routers import DefaultRouter
from .views import HomeViewSet

router = DefaultRouter()
router.register(r'homes', HomeViewSet)

urlpatterns = router.urls
