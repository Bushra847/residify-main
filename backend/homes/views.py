from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Home
from .serializers import HomeSerializer

class HomeViewSet(viewsets.ModelViewSet):
    queryset = Home.objects.all()  # Keep the default queryset for DRF
    serializer_class = HomeSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'block', 'floor', 'bedrooms', 'bathrooms']
    ordering_fields = ['rent', 'area', 'created_at', 'updated_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        vacant = self.request.query_params.get('vacant', None)
        
        if vacant == 'true':
            # Get homes that don't have any active residents
            queryset = queryset.exclude(
                id__in=Home.objects.filter(residents__is_active=True).values('id')
            )
        
        return queryset.distinct()
