from rest_framework import serializers
from django.db.models import Sum
from django.utils import timezone
from datetime import datetime
from django.contrib.auth import get_user_model
from .models import Resident, Expense
from homes.models import Home
from homes.serializers import HomeSerializer
from authentication.serializers import UserSerializer

User = get_user_model()

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class ResidentExpenseSerializer(serializers.ModelSerializer):
    total_expenses = serializers.SerializerMethodField()
    expense_breakdown = serializers.SerializerMethodField()

    class Meta:
        model = Resident
        fields = ('id', 'unit_number', 'total_expenses', 'expense_breakdown')

    def get_total_expenses(self, obj):
        month = self.context.get('month', timezone.now().date().replace(day=1))
        expenses = Expense.objects.filter(
            home=obj.home,
            month__year=month.year,
            month__month=month.month,
            is_shared=True
        )
        total = expenses.aggregate(total=Sum('amount'))['total'] or 0
        # Calculate resident's share based on unit size ratio
        if obj.home:
            total_size = obj.home.size_sqft
            return float(total) * (obj.home.size_sqft / total_size) if total_size > 0 else 0
        return 0

    def get_expense_breakdown(self, obj):
        month = self.context.get('month', timezone.now().date().replace(day=1))
        expenses = Expense.objects.filter(
            home=obj.home,
            month__year=month.year,
            month__month=month.month
        ).values('expense_type').annotate(total=Sum('amount'))
        return expenses

class ResidentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    home = HomeSerializer()
    union_leader = UserSerializer()
    
    class Meta:
        model = Resident
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        
class ResidentCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    home = serializers.PrimaryKeyRelatedField(queryset=Home.objects.all(), required=True)
    unit_number = serializers.CharField(required=True)
    is_owner = serializers.BooleanField(default=False)
    union_leader = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_staff=True), required=False, allow_null=True)
    
    class Meta:
        model = Resident
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'phone', 
                 'address', 'home', 'unit_number', 'is_owner', 'emergency_contact_name',
                 'emergency_contact_phone', 'union_leader')
    
    def create(self, validated_data):
        user_data = {
            'username': validated_data.pop('username'),
            'password': validated_data.pop('password'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'role': 'resident'
        }
        
        # Create user
        user = User.objects.create_user(**user_data)
        
        # Set union_leader to request user if not provided
        union_leader = validated_data.get('union_leader', None)
        if not union_leader and 'request' in self.context:
            union_leader = self.context['request'].user
        
        home = validated_data['home']
        # Set home status to 'occupied'
        if home:
            home.status = 'occupied'
            home.save(update_fields=['status'])
        
        # Create resident
        resident = Resident.objects.create(
            user=user,
            home=home,
            unit_number=validated_data['unit_number'],
            contact_number=validated_data.get('phone', ''),
            lease_start_date=timezone.now().date(),
            lease_end_date=timezone.now().date(),
            emergency_contact_name=validated_data.get('emergency_contact_name', 'TBD'),
            emergency_contact_phone=validated_data.get('emergency_contact_phone', 'TBD'),
            is_owner=validated_data.get('is_owner', False),
            union_leader=union_leader
        )
        return resident

class ResidentUpdateSerializer(serializers.ModelSerializer):
    home = serializers.PrimaryKeyRelatedField(queryset=Home.objects.all(), required=False, allow_null=True)
    user = UserSerializer(read_only=True)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    union_leader = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_staff=True), required=False, allow_null=True)
    
    class Meta:
        model = Resident
        fields = (
            'id', 'user', 'home', 'unit_number', 'lease_start_date', 'lease_end_date',
            'emergency_contact_name', 'emergency_contact_phone', 'is_active', 'is_owner',
            'first_name', 'last_name', 'email', 'phone', 'union_leader'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
        
    def update(self, instance, validated_data):
        # Update user fields if provided
        user_fields = {'first_name', 'last_name', 'email', 'phone'}
        user_data = {}
        for field in user_fields:
            if field in validated_data:
                user_data[field] = validated_data.pop(field)
        
        if user_data:
            user = instance.user
            for field, value in user_data.items():
                setattr(user, field, value)
            user.save()
        
        # Update resident fields
        updated_instance = super().update(instance, validated_data)
        # If home is changed or resident is activated/deactivated, update home status
        home = updated_instance.home
        if home:
            # If there is at least one active resident, set to occupied
            if home.residents.filter(is_active=True).exists():
                home.status = 'occupied'
            else:
                home.status = 'vacant'
            home.save(update_fields=['status'])
        return updated_instance

class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
