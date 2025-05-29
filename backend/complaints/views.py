from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Complaint, ComplaintUpdate
from .serializers import ComplaintSerializer, ComplaintCreateSerializer, ComplaintUpdateSerializer, ComplaintUpdateCreateSerializer

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ComplaintCreateSerializer
        return ComplaintSerializer
    
    def perform_create(self, serializer):
        # Set the resident based on the authenticated user
        if self.request.user.role == 'resident':
            resident = self.request.user.resident
            serializer.save(resident=resident)
        else:
            serializer.save()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == 'admin':
            # Only show complaints for residents of this union leader
            return queryset.filter(resident__union_leader=user)
        elif user.role == 'resident':
            return queryset.filter(resident__user=user)
        elif user.role == 'staff':
            return queryset.filter(assigned_to=user)
        return queryset
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        complaint = self.get_object()
        staff_id = request.data.get('staff_id')
        
        if not staff_id:
            return Response({'error': 'staff_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        complaint.assigned_to_id = staff_id
        complaint.save()
        
        serializer = self.get_serializer(complaint)
        return Response(serializer.data)

class ComplaintUpdateViewSet(viewsets.ModelViewSet):
    queryset = ComplaintUpdate.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ComplaintUpdateCreateSerializer
        return ComplaintUpdateSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'resident':
            return queryset.filter(complaint__resident__user=user)
        elif user.role == 'staff':
            return queryset.filter(complaint__assigned_to=user)
        return queryset

# Create your views here.
