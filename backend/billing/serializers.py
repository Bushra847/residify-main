from rest_framework import serializers
from django.utils import timezone
from .models import Bill, Payment, SharedBill, Expense, ResidentExpenseShare
from django.contrib.auth import get_user_model

User = get_user_model()
from residents.serializers import ResidentSerializer

class SharedBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedBill
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class BillSerializer(serializers.ModelSerializer):
    resident = ResidentSerializer(read_only=True)
    shared_bill = SharedBillSerializer(read_only=True)
    total_paid = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    screenshot = serializers.ImageField(required=False, allow_null=True)
    payment_screenshot = serializers.ImageField(required=False, allow_null=True)
    original_amount = serializers.SerializerMethodField()
    penalty_amount = serializers.SerializerMethodField()
    total_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Bill
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_total_paid(self, obj):
        return sum(payment.amount for payment in obj.payments.all())
    
    def get_remaining_amount(self, obj):
        total_paid = self.get_total_paid(obj)
        return float(obj.amount) - float(total_paid)
    
    def get_original_amount(self, obj):
        # The original amount is the current amount minus the penalty (if any)
        return float(obj.amount) - float(obj.penalty_amount or 0)
    
    def get_penalty_amount(self, obj):
        return float(obj.penalty_amount or 0)
    
    def get_total_due(self, obj):
        return float(obj.amount)

class BillCreateSerializer(serializers.ModelSerializer):
    screenshot = serializers.ImageField(required=False, allow_null=True)
    payment_screenshot = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Bill
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'status')
        
    def validate_payment_screenshot(self, value):
        if value and not self.initial_data.get('payment_date'):
            raise serializers.ValidationError('Payment date is required when uploading a payment screenshot')
        return value

class SharedBillCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharedBill
        fields = ['amount', 'due_date', 'bill_type', 'description']
        read_only_fields = ('created_at', 'updated_at')

class PaymentSerializer(serializers.ModelSerializer):
    bill = BillSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class PaymentCreateSerializer(serializers.ModelSerializer):
    screenshot = serializers.ImageField(required=False, allow_null=True)
    payment_date = serializers.DateField(required=False)
    transaction_id = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Payment
        fields = ('bill', 'amount', 'payment_date', 'payment_method', 'transaction_id', 'notes', 'screenshot')
        read_only_fields = ('created_at', 'updated_at', 'status')

    def validate_bill(self, value):
        """Validate that the bill exists and belongs to the user"""
        user = self.context['request'].user
        if not user.is_staff and value.resident.user != user:
            raise serializers.ValidationError('You can only make payments for your own bills')
        return value

    def validate_amount(self, value):
        """Validate that the amount is positive"""
        if value <= 0:
            raise serializers.ValidationError('Payment amount must be greater than 0')
        return value

    def validate_payment_method(self, value):
        """Validate that payment_method is one of the allowed choices"""
        valid_methods = ['cash', 'card', 'bank_transfer', 'other']
        if value not in valid_methods:
            raise serializers.ValidationError(f'Payment method must be one of: {", ".join(valid_methods)}')
        return value
    
    def create(self, validated_data):
        # Set status to pending by default
        validated_data['status'] = 'pending'
        payment = super().create(validated_data)
        bill = payment.bill
        
        # Update bill status based on payments
        total_paid = sum(payment.amount for payment in bill.payments.all())
        if total_paid >= bill.amount:
            bill.status = 'paid'
        elif total_paid > 0:
            bill.status = 'pending'
        bill.save()
        
        return payment
    
    def validate(self, attrs):
        bill = attrs.get('bill')
        amount = attrs.get('amount')
        payment_date = attrs.get('payment_date')
        payment_method = attrs.get('payment_method')
        
        if not bill:
            raise serializers.ValidationError({'bill': 'Bill is required'})
        
        if not amount:
            raise serializers.ValidationError({'amount': 'Amount is required'})
        
        if not payment_method:
            raise serializers.ValidationError({'payment_method': 'Payment method is required'})
        
        if not payment_date:
            attrs['payment_date'] = timezone.now().date()
        
        if bill and amount:
            total_paid = sum(payment.amount for payment in bill.payments.all())
            remaining = bill.amount - total_paid
            
            if amount > remaining:
                raise serializers.ValidationError({
                    'amount': f'Payment amount ({amount}) exceeds remaining balance ({remaining})'
                })
        
        return attrs

class ResidentExpenseShareSerializer(serializers.ModelSerializer):
    resident_name = serializers.SerializerMethodField()
    expense_category = serializers.SerializerMethodField()
    expense_date = serializers.SerializerMethodField()
    expense_description = serializers.SerializerMethodField()
    expense_status = serializers.SerializerMethodField()

    class Meta:
        model = ResidentExpenseShare
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_resident_name(self, obj):
        return obj.resident.user.get_full_name()

    def get_expense_category(self, obj):
        return obj.expense.category

    def get_expense_date(self, obj):
        return obj.expense.date

    def get_expense_description(self, obj):
        return obj.expense.description

    def get_expense_status(self, obj):
        return obj.expense.status

class ExpenseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    resident_name = serializers.SerializerMethodField()
    resident_shares = ResidentExpenseShareSerializer(many=True, read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'approved_by', 'share_distributed')
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None
    
    def get_approved_by_name(self, obj):
        return obj.approved_by.get_full_name() if obj.approved_by else None
    
    def get_resident_name(self, obj):
        return obj.resident.user.get_full_name() if obj.resident else None

class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ('amount', 'date', 'category', 'description', 'receipt', 'resident', 'is_shared')
        read_only_fields = ('created_at', 'updated_at', 'status', 'approved_by', 'created_by', 'share_distributed')

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        validated_data['status'] = 'pending'

        # If it's a shared expense, don't set a specific resident
        if validated_data.get('is_shared'):
            validated_data.pop('resident', None)
            return super().create(validated_data)

        # If user is not admin and no resident is specified, set resident to the user's resident
        if not user.is_staff and 'resident' not in validated_data:
            from residents.models import Resident
            try:
                resident = Resident.objects.get(user=user)
                validated_data['resident'] = resident
            except Resident.DoesNotExist:
                raise serializers.ValidationError('User is not associated with any resident')

        return super().create(validated_data)

    def validate(self, attrs):
        user = self.context['request'].user
        resident = attrs.get('resident')
        is_shared = attrs.get('is_shared', False)

        # If it's a shared expense, only admins can create it
        if is_shared and not user.is_staff:
            raise serializers.ValidationError('Only administrators can create shared expenses')

        # If it's not a shared expense and user is not admin, they can only create expenses for themselves
        if not is_shared and not user.is_staff:
            from residents.models import Resident
            try:
                user_resident = Resident.objects.get(user=user)
                if resident and resident != user_resident:
                    raise serializers.ValidationError('You can only create expenses for yourself')
            except Resident.DoesNotExist:
                raise serializers.ValidationError('User is not associated with any resident')

        return attrs
