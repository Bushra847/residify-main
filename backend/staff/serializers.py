from rest_framework import serializers
from .models import Staff, Schedule, Expense, StaffRole
class StaffRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffRole
        fields = '__all__'

class StaffSerializer(serializers.ModelSerializer):
    role = StaffRoleSerializer()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Staff
        fields = '__all__'
    
    def get_full_name(self, obj):
        return obj.get_full_name()

import logging
logger = logging.getLogger(__name__)

class StaffCreateSerializer(serializers.ModelSerializer):
    role = serializers.IntegerField(required=True)
    
    class Meta:
        model = Staff
        fields = ['first_name', 'last_name', 'email', 'role', 'salary', 'contact_number',
                 'emergency_contact', 'is_active', 'address', 'national_id']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'salary': {'required': True},
            'contact_number': {'required': True},
            'emergency_contact': {'required': True},
            'is_active': {'default': True, 'required': False}
        }
    
    def validate(self, attrs):
        logger.info(f'Received data for validation: {attrs}')
        
        if not attrs.get('first_name'):
            raise serializers.ValidationError({'first_name': 'First name is required.'})
        if not attrs.get('last_name'):
            raise serializers.ValidationError({'last_name': 'Last name is required.'})
        if not attrs.get('email'):
            raise serializers.ValidationError({'email': 'Email is required.'})
            
        # Validate role
        role = attrs.get('role')
        if not role:
            raise serializers.ValidationError({'role': 'Role is required.'})
        # Check if role exists
        if not StaffRole.objects.filter(id=role).exists():
            raise serializers.ValidationError({'role': f'Invalid role ID: {role}'})
            
        # Validate other fields
        salary = attrs.get('salary')
        if not salary:
            raise serializers.ValidationError({'salary': 'Salary is required.'})
        try:
            float(salary)
        except (ValueError, TypeError):
            raise serializers.ValidationError({'salary': 'Salary must be a valid number.'})
            
        if not attrs.get('emergency_contact'):
            raise serializers.ValidationError({'emergency_contact': 'Emergency contact is required.'})
            
        logger.info(f'Validation successful for data: {attrs}')
        return attrs
    
    def create(self, validated_data):
        logger.info(f'Creating staff with validated data: {validated_data}')
        try:
            role_id = validated_data.pop('role')
            role = StaffRole.objects.get(id=role_id)
            staff = Staff.objects.create(role=role, **validated_data)
            logger.info(f'Successfully created staff: {staff}')
            return staff
        except StaffRole.DoesNotExist:
            raise serializers.ValidationError({'role': f'Role with ID {role_id} does not exist'})
        except Exception as e:
            logger.error(f'Error in staff creation: {str(e)}')
            raise serializers.ValidationError({'error': str(e)})

class StaffUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ['first_name', 'last_name', 'email', 'role', 'salary', 'contact_number',
                 'emergency_contact', 'is_active', 'address', 'national_id']

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ScheduleSerializer(serializers.ModelSerializer):
    staff = StaffSerializer(read_only=True)
    
    class Meta:
        model = Schedule
        fields = '__all__'

class ScheduleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    staff = StaffSerializer(read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'

class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
