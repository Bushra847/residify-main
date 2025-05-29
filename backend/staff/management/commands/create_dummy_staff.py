from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from staff.models import Staff, StaffRole, Schedule, Expense
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates dummy staff data'

    def handle(self, *args, **kwargs):
        # Create staff roles
        roles = [
            {'name': 'Manager', 'description': 'Manages overall operations'},
            {'name': 'Maintenance', 'description': 'Handles repairs and maintenance'},
            {'name': 'Security', 'description': 'Ensures property security'},
            {'name': 'Cleaner', 'description': 'Maintains cleanliness'},
            {'name': 'Receptionist', 'description': 'Handles front desk operations'}
        ]

        for role_data in roles:
            role, created = StaffRole.objects.get_or_create(name=role_data['name'], defaults=role_data)
            if created:
                self.stdout.write(f'Created role: {role.name}')

        # Create staff members with users
        staff_data = [
            {
                'user': {'first_name': 'John', 'last_name': 'Smith', 'email': 'john@example.com', 'role': 'staff'},
                'role_name': 'Manager',
                'contact_number': '1234567890',
                'emergency_contact': '0987654321'
            },
            {
                'user': {'first_name': 'Sarah', 'last_name': 'Johnson', 'email': 'sarah@example.com', 'role': 'staff'},
                'role_name': 'Maintenance',
                'contact_number': '2345678901',
                'emergency_contact': '9876543210'
            },
            {
                'user': {'first_name': 'Michael', 'last_name': 'Brown', 'email': 'michael@example.com', 'role': 'staff'},
                'role_name': 'Security',
                'contact_number': '3456789012',
                'emergency_contact': '8765432109'
            },
            {
                'user': {'first_name': 'Emily', 'last_name': 'Davis', 'email': 'emily@example.com', 'role': 'staff'},
                'role_name': 'Cleaner',
                'contact_number': '4567890123',
                'emergency_contact': '7654321098'
            },
            {
                'user': {'first_name': 'David', 'last_name': 'Wilson', 'email': 'david@example.com', 'role': 'staff'},
                'role_name': 'Receptionist',
                'contact_number': '5678901234',
                'emergency_contact': '6543210987'
            }
        ]

        for data in staff_data:
            user_data = data['user']
            user_data['username'] = user_data['email']
            user_data['password'] = 'password123'  # Set a default password
            
            # Create or get user
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults=user_data
            )
            if created:
                user.set_password(user_data['password'])
                user.save()

            # Create or get staff
            role = StaffRole.objects.filter(name=data['role_name']).first()
            if not role:
                self.stdout.write(f'Role not found: {data["role_name"]}')
                continue
            staff, created = Staff.objects.get_or_create(
                user=user,
                defaults={
                    'role': role,
                    'contact_number': data['contact_number'],
                    'emergency_contact': data['emergency_contact']
                }
            )
            if created:
                self.stdout.write(f'Created staff: {staff.user.get_full_name()}')

                # Create schedules for this staff member
                today = datetime.now().date()
                for i in range(7):  # Create schedules for next 7 days
                    schedule_date = today + timedelta(days=i)
                    Schedule.objects.create(
                        staff=staff,
                        date=schedule_date,
                        start_time='09:00',
                        end_time='17:00',
                        notes=f'Regular shift for {staff.user.get_full_name()}'
                    )

                # Create some expenses for this staff member
                expense_types = ['salary', 'bonus', 'advance', 'other']
                for _ in range(3):  # Create 3 random expenses
                    expense_date = today - timedelta(days=random.randint(1, 30))
                    Expense.objects.create(
                        staff=staff,
                        amount=random.randint(100, 1000),
                        date=expense_date,
                        expense_type=random.choice(expense_types),
                        description=f'Sample expense for {staff.user.get_full_name()}',
                        is_paid=random.choice([True, False])
                    )

        self.stdout.write(self.style.SUCCESS('Successfully created dummy staff data'))
