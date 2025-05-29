from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime
from django.db.models import Q
from .models import Resident, Expense
from .serializers import (
    ResidentSerializer, ResidentCreateSerializer,
    ResidentUpdateSerializer, ExpenseSerializer, ExpenseCreateSerializer,
    ResidentExpenseSerializer
)

class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'unit_number', 'contact_number']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ResidentCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            return ResidentUpdateSerializer
        elif self.action == 'expenses':
            return ResidentExpenseSerializer
        return ResidentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            return queryset.filter(user=self.request.user)
        # Only show residents for this union leader
        return queryset.filter(union_leader=self.request.user)

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = ResidentCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def expenses(self, request, pk=None):
        resident = self.get_object()
        month_str = request.query_params.get('month', None)
        
        try:
            if month_str:
                month = datetime.strptime(month_str, '%Y-%m').date().replace(day=1)
            else:
                month = timezone.now().date().replace(day=1)
        except ValueError:
            return Response(
                {'error': 'Invalid month format. Use YYYY-MM'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(resident, context={'month': month})
        return Response(serializer.data)

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['expense_type', 'description']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        month = self.request.query_params.get('month', None)
        expense_type = self.request.query_params.get('type', None)
        home_id = self.request.query_params.get('home', None)
        
        if month:
            try:
                date = datetime.strptime(month, '%Y-%m').date()
                queryset = queryset.filter(month__year=date.year, month__month=date.month)
            except ValueError:
                pass
        
        if expense_type:
            queryset = queryset.filter(expense_type=expense_type)
            
        if home_id:
            queryset = queryset.filter(home_id=home_id)
            
        if not self.request.user.is_staff:
            resident = Resident.objects.filter(user=self.request.user).first()
            if resident:
                queryset = queryset.filter(property=resident.property)
            else:
                queryset = queryset.none()
                
        return queryset
