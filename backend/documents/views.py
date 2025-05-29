from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Document
from .serializers import DocumentSerializer, DocumentCreateSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentCreateSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'resident':
            return queryset.filter(resident__user=user)
        return queryset
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Only admin and staff can verify documents'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        document = self.get_object()
        document.is_verified = True
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)

# Create your views here.
