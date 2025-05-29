from rest_framework import viewsets, permissions, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q, Sum
from .models import Bill, Payment, SharedBill, Expense
from .serializers import (
    BillSerializer, BillCreateSerializer,
    PaymentSerializer, PaymentCreateSerializer,
    SharedBillSerializer, SharedBillCreateSerializer,
    ExpenseSerializer, ExpenseCreateSerializer
)
from decimal import Decimal

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class SharedBillViewSet(viewsets.ModelViewSet):
    queryset = SharedBill.objects.all()
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['bill_type', 'description']
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SharedBillCreateSerializer
        return SharedBillSerializer

    @action(detail=False, methods=['post'])
    def generate_monthly_bills(self, request):
        from residents.models import Resident
        from homes.models import Home
        from datetime import datetime, timedelta
        # Calculate next month's due date (1st of next month)
        today = timezone.now()
        next_month = today.replace(day=1) + timedelta(days=32)
        due_date = next_month.replace(day=1).date()
        force = request.data.get('force', False)
        bills_created = []
        # Get all active residents for this union leader
        residents = Resident.objects.filter(is_active=True, union_leader=request.user, home__isnull=False)
        for resident in residents:
            home = resident.home
            if home and home.rent > 0:
                # Optionally delete existing rent bill for this resident and due_date if force is set
                if force:
                    Bill.objects.filter(
                        resident=resident,
                        bill_type='rent',
                        due_date=due_date
                    ).delete()
                # Check if a rent bill already exists for this resident and due_date
                if not Bill.objects.filter(resident=resident, bill_type='rent', due_date=due_date).exists():
                    bill = Bill.objects.create(
                        resident=resident,
                        amount=home.rent,
                        due_date=due_date,
                        bill_type='rent',
                        description=f'Monthly rent for {home} - {due_date.strftime("%B %Y")}',
                        union_leader=request.user
                    )
                    bills_created.append(bill)
        if not bills_created:
            return Response({
                'detail': 'No new bills were generated. Bills may already exist for next month.'
            }, status=status.HTTP_200_OK)
        return Response({
            'detail': f'{len(bills_created)} monthly rent bills were generated successfully.',
            'bills': BillSerializer(bills_created, many=True).data
        }, status=status.HTTP_201_CREATED)

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['bill_type', 'status', 'description']
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BillCreateSerializer
        return BillSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset().order_by('-created_at')  # Add default ordering
        # Apply penalty to overdue, unpaid bills
        from datetime import date
        overdue_bills = queryset.filter(status='pending', due_date__lt=date.today(), penalty_amount=0)
        for bill in overdue_bills:
            penalty = bill.amount * Decimal('0.10')
            bill.penalty_amount = penalty
            bill.amount += penalty
            bill.save(update_fields=['penalty_amount', 'amount'])
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        bill_type = self.request.query_params.get('type')
        status = self.request.query_params.get('status')
        bill_status = self.request.query_params.get('bill_status')
        
        if start_date:
            queryset = queryset.filter(due_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(due_date__lte=end_date)
        if bill_type:
            queryset = queryset.filter(bill_type=bill_type)
        if status:
            queryset = queryset.filter(status=status)
        if bill_status:
            queryset = queryset.filter(status=bill_status)
        
        # Filter by user role
        if not self.request.user.is_staff:
            queryset = queryset.filter(resident__user=self.request.user)
        else:
            queryset = queryset.filter(union_leader=self.request.user)
        
        return queryset.distinct()
    
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        bill = self.get_object()
        if bill.status == 'paid':
            return Response(
                {'error': 'Bill is already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bill.status = 'paid'
        bill.save()
        return Response(BillSerializer(bill).data)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['payment_method', 'transaction_id', 'notes']
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        payment_method = self.request.query_params.get('payment_method')
        bill_id = self.request.query_params.get('bill_id')
        payment_status = self.request.query_params.get('status')
        
        if start_date:
            queryset = queryset.filter(payment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(payment_date__lte=end_date)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        if bill_id:
            queryset = queryset.filter(bill_id=bill_id)
        if payment_status:
            queryset = queryset.filter(status=payment_status)
        
        # Filter by user role
        if not self.request.user.is_staff:
            return queryset.filter(bill__resident__user=self.request.user)
        
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            print('Payment Data:', request.data)
            print('Payment Files:', request.FILES)
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                print('Validation Errors:', serializer.errors)
                return Response(
                    {'error': 'Validation failed', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            payment = serializer.save()
            return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print('Exception:', str(e))
            return Response(
                {'error': 'Failed to create payment', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
    @action(detail=True, methods=['post'])
    def approve_payment(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'approved'
        payment.save()
        
        # Update bill status
        bill = payment.bill
        approved_payments = bill.payments.filter(status='approved')
        total_approved = approved_payments.aggregate(total=Sum('amount'))['total'] or 0
        
        if total_approved >= bill.amount:
            bill.status = 'paid'
        elif total_approved > 0:
            bill.status = 'partially_paid'
        bill.save()
        
        return Response(PaymentSerializer(payment).data)
    
    @action(detail=True, methods=['post'])
    def reject_payment(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'rejected'
        payment.save()
        return Response(PaymentSerializer(payment).data)
    
    @action(detail=False, methods=['get'])
    def by_bill(self, request):
        bill_id = request.query_params.get('bill_id')
        if not bill_id:
            return Response(
                {'error': 'bill_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payments = self.get_queryset().filter(bill_id=bill_id).order_by('-payment_date')
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['category', 'description']
    ordering_fields = ['date', 'amount', 'category', 'status']
    ordering = ['-date']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # If user is not admin, only show:
        # 1. Their personal expenses
        # 2. Their share of shared expenses
        if not user.is_staff:
            from residents.models import Resident
            try:
                resident = Resident.objects.get(user=user)
                # Get personal expenses
                personal_expenses = queryset.filter(resident=resident, is_shared=False)
                # Get shared expenses through ResidentExpenseShare
                shared_expense_ids = resident.expense_shares.values_list('expense_id', flat=True)
                shared_expenses = queryset.filter(id__in=shared_expense_ids)
                # Combine both querysets
                queryset = personal_expenses | shared_expenses
            except Resident.DoesNotExist:
                return queryset.none()
        else:
            queryset = queryset.filter(union_leader=user)

        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        category = self.request.query_params.get('category')
        status = self.request.query_params.get('status')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        if category:
            queryset = queryset.filter(category=category)
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset

    @action(detail=False)
    def my_shares(self, request):
        """Get the resident's shares of shared expenses"""
        user = request.user
        if not user.is_staff:
            from residents.models import Resident
            try:
                resident = Resident.objects.get(user=user)
                shares = resident.expense_shares.select_related('expense').all()
                serializer = ResidentExpenseShareSerializer(shares, many=True)
                return Response(serializer.data)
            except Resident.DoesNotExist:
                return Response({'error': 'User is not associated with any resident'}, status=400)
        return Response({'error': 'This endpoint is only for residents'}, status=400)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        expense = self.get_object()
        expense.status = 'approved'
        expense.approved_by = request.user
        expense.save()
        expense.distribute_shares()  # Explicitly create bills for shared expense
        return Response(ExpenseSerializer(expense).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        expense = self.get_object()
        expense.status = 'rejected'
        expense.save()
        return Response(ExpenseSerializer(expense).data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        from django.db.models import Sum
        from django.db.models.functions import ExtractMonth, ExtractYear
        
        # Get query parameters
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month')
        
        # Base queryset - use get_queryset() to respect permissions
        queryset = self.get_queryset().filter(status='approved')
        
        # Apply year filter
        queryset = queryset.filter(date__year=year)
        
        # Apply month filter if provided
        if month:
            queryset = queryset.filter(date__month=month)
        
        # Get total by category
        category_totals = queryset.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        # Get monthly totals
        monthly_totals = queryset.annotate(
            month=ExtractMonth('date'),
            year=ExtractYear('date')
        ).values('month', 'year').annotate(
            total=Sum('amount')
        ).order_by('year', 'month')
        
        # Calculate total amount
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'category_totals': category_totals,
            'monthly_totals': monthly_totals,
            'total_amount': total_amount,
            'total': queryset.aggregate(total=Sum('amount'))['total'] or 0
        })
