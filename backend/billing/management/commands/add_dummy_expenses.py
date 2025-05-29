from django.core.management.base import BaseCommand
from billing.models import Expense
from django.contrib.auth import get_user_model
from django.utils import timezone
import random
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Add dummy expenses'

    def handle(self, *args, **kwargs):
        # Get admin and staff users for creating and approving expenses
        admin_users = User.objects.filter(role='admin')
        if not admin_users.exists():
            self.stdout.write(self.style.ERROR('No admin users found'))
            return

        # Categories and descriptions
        categories = [
            'utilities',
            'maintenance',
            'salaries',
            'supplies',
            'repairs',
            'cleaning',
            'security',
            'insurance',
            'taxes',
            'other'
        ]

        descriptions = {
            'utilities': ['Electricity bill', 'Water bill', 'Gas bill', 'Internet bill'],
            'maintenance': ['HVAC maintenance', 'Plumbing repairs', 'Electrical maintenance', 'General maintenance'],
            'salaries': ['Staff salaries', 'Security guard wages', 'Cleaning staff wages', 'Management fees'],
            'supplies': ['Office supplies', 'Cleaning supplies', 'Maintenance supplies', 'Safety equipment'],
            'repairs': ['Building repairs', 'Equipment repairs', 'Furniture repairs', 'Appliance repairs'],
            'cleaning': ['Common area cleaning', 'Window cleaning', 'Carpet cleaning', 'Waste management'],
            'security': ['Security equipment', 'CCTV maintenance', 'Access control system', 'Security upgrades'],
            'insurance': ['Property insurance', 'Liability insurance', 'Workers compensation', 'Equipment insurance'],
            'taxes': ['Property tax', 'Municipal tax', 'Service tax', 'Other taxes'],
            'other': ['Miscellaneous expenses', 'Emergency repairs', 'Pest control', 'Landscaping']
        }

        # Create 50 dummy expenses
        expenses = []
        end_date = timezone.now()
        start_date = end_date - timedelta(days=90)  # Last 3 months

        for _ in range(50):
            category = random.choice(categories)
            expense = Expense(
                amount=random.uniform(100, 5000),
                date=(start_date + timedelta(days=random.randint(0, 90))).date(),
                category=category,
                description=random.choice(descriptions[category]),
                status=random.choice(['pending', 'approved', 'rejected']),
                created_by=random.choice(admin_users)
            )

            # If expense is approved or rejected, set the approved_by
            if expense.status in ['approved', 'rejected']:
                expense.approved_by = random.choice(admin_users)

            expenses.append(expense)

        # Bulk create expenses
        Expense.objects.bulk_create(expenses)
        self.stdout.write(self.style.SUCCESS(f'Created {len(expenses)} expenses'))
