import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Staff, Schedule, Expense, StaffRole
from .serializers import (StaffSerializer, StaffCreateSerializer, StaffUpdateSerializer,
    ScheduleSerializer, ScheduleCreateSerializer, ExpenseSerializer, ExpenseCreateSerializer, StaffRoleSerializer)

logger = logging.getLogger(__name__)

class StaffRoleViewSet(viewsets.ModelViewSet):
    queryset = StaffRole.objects.all()
    serializer_class = StaffRoleSerializer
    permission_classes = [permissions.IsAuthenticated]

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StaffCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StaffUpdateSerializer
        return StaffSerializer
    
    def create(self, request, *args, **kwargs):
        logger.info(f'Received create staff request. Data: {request.data}')
        try:
            print(request.data)
            serializer = self.get_serializer(data=request.data)
            logger.info(f'Using serializer: {serializer.__class__.__name__}')
            
            if not serializer.is_valid():
                logger.error(f'Validation failed. Errors: {serializer.errors}')
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            logger.info('Data validation successful')
            staff = serializer.save()
            logger.info(f'Staff created successfully: {staff}')
            
            response_serializer = StaffSerializer(staff)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f'Error creating staff: {str(e)}')
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ScheduleCreateSerializer
        return ScheduleSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_staff(self, request):
        staff_id = request.query_params.get('staff_id')
        if not staff_id:
            return Response({'error': 'staff_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        schedules = self.get_queryset().filter(staff_id=staff_id)
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        staff_id = self.request.query_params.get('staff_id')
        expense_type = self.request.query_params.get('expense_type')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        is_paid = self.request.query_params.get('is_paid')
        
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        if expense_type:
            queryset = queryset.filter(expense_type=expense_type)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        if is_paid is not None:
            queryset = queryset.filter(is_paid=is_paid.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        expense = self.get_object()
        expense.is_paid = True
        expense.paid_date = request.data.get('paid_date') or timezone.now().date()
        expense.save()
        
        serializer = self.get_serializer(expense)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        staff_id = request.query_params.get('staff_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.get_queryset()
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        total_expenses = queryset.aggregate(
            total=Sum('amount'),
            paid=Sum('amount', filter=Q(is_paid=True)),
            unpaid=Sum('amount', filter=Q(is_paid=False))
        )
        
        by_type = queryset.values('expense_type').annotate(
            total=Sum('amount'),
            count=Count('id')
        )
        
        return Response({
            'totals': total_expenses,
            'by_type': by_type
        })
