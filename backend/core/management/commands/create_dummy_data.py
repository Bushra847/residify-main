from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.files.base import ContentFile
from residents.models import Resident
from billing.models import SharedBill, Bill, Payment
from complaints.models import Complaint, ComplaintUpdate
from documents.models import Document
from staff.models import Staff, StaffRole
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates dummy data for testing'

    def handle(self, *args, **kwargs):
        # Create admin user
        admin_user, _ = User.objects.get_or_create(
            email='admin@example.com',
            defaults={
                'username': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'first_name': 'Admin',
                'last_name': 'User'
            }
        )
        admin_user.set_password('rao')
        admin_user.save()
        self.stdout.write(self.style.SUCCESS('Created admin user'))

        # Create regular users and residents
        names = [
            ('john', 'john@example.com', 'John', 'Doe'),
            ('jane', 'jane@example.com', 'Jane', 'Smith'),
            ('bob', 'bob@example.com', 'Bob', 'Johnson'),
            ('alice', 'alice@example.com', 'Alice', 'Brown'),
            ('charlie', 'charlie@example.com', 'Charlie', 'Wilson')
        ]

        residents = []
        for username, email, first_name, last_name in names:
            # Create user
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_staff': False,
                    'is_superuser': False
                }
            )
            user.set_password('rao')
            user.save()

            # Create resident
            resident, _ = Resident.objects.get_or_create(
                user=user,
                contact_number=f'+1555{random.randint(1000000, 9999999)}',
                unit_number=f'{random.randint(1, 5)}0{random.randint(1, 9)}',
                is_active=True,
                lease_start_date=timezone.now(),
                lease_end_date=timezone.now() + timedelta(days=365),
                emergency_contact_name='Emergency Contact',
                emergency_contact_phone=f'+1555{random.randint(1000000, 9999999)}'
            )
            residents.append(resident)
            self.stdout.write(self.style.SUCCESS(f'Created resident {resident.user.get_full_name()}'))

        # Create staff roles
        roles = [
            ('Maintenance', 'Handles property maintenance and repairs'),
            ('Security', 'Manages property security'),
            ('Cleaning', 'Responsible for property cleanliness'),
            ('Management', 'Property management staff')
        ]
        
        for role_name, description in roles:
            role, _ = StaffRole.objects.get_or_create(
                name=role_name,
                defaults={'description': description}
            )
            self.stdout.write(self.style.SUCCESS(f'Created staff role {role.name}'))
        
        # Create staff members
        staff_members = [
            ('maintenance', 'Maintenance Staff', 'Maintenance'),
            ('security', 'Security Staff', 'Security'),
            ('cleaning', 'Cleaning Staff', 'Cleaning'),
            ('manager', 'Property Manager', 'Management')
        ]
        
        for username, name, role_name in staff_members:
            user, _ = User.objects.get_or_create(
                email=f'{username}@example.com',
                defaults={
                    'username': username,
                    'first_name': name.split()[0],
                    'last_name': name.split()[1],
                    'is_staff': True
                }
            )
            user.set_password('rao')
            user.save()
            
            staff, _ = Staff.objects.get_or_create(
                user=user,
                defaults={
                    'role': StaffRole.objects.get(name=role_name),
                    'contact_number': f'+1555{random.randint(1000000, 9999999)}'
                }
            )
            self.stdout.write(self.style.SUCCESS(f'Created staff member {staff.user.get_full_name()}'))

        # Create complaints
        complaint_categories = ['maintenance', 'noise', 'security', 'cleanliness', 'other']
        statuses = ['open', 'in_progress', 'resolved', 'closed']
        priorities = ['low', 'medium', 'high', 'urgent']
        
        for resident in residents:
            for _ in range(random.randint(1, 3)):
                category = random.choice(complaint_categories)
                status = random.choice(statuses)
                staff = random.choice(Staff.objects.all())
                complaint = Complaint.objects.create(
                    resident=resident,
                    category=category,
                    title=f'{category.title()} Issue',
                    description=f'Sample {category} complaint by {resident.user.get_full_name()}',
                    status=status,
                    priority=random.choice(priorities),
                    assigned_to=staff.user
                )
                
                # Add updates to complaints
                for _ in range(random.randint(1, 3)):
                    ComplaintUpdate.objects.create(
                        complaint=complaint,
                        updated_by=staff.user,
                        comment=f'Update on {category} complaint',
                        new_status=random.choice(statuses)
                    )
                self.stdout.write(self.style.SUCCESS(f'Created complaint for {resident.user.get_full_name()}'))

        # Create documents
        document_types = ['lease', 'id_proof', 'agreement', 'notice']
        
        for resident in residents:
            for doc_type in document_types:
                document = Document.objects.create(
                    resident=resident,
                    title=f'{doc_type.title()} Document',
                    document_type=doc_type,
                    description=f'Sample {doc_type} document for {resident.user.get_full_name()}'
                )
                # Create a dummy file content
                content = f'Sample content for {doc_type} document'
                document.file.save(f'{doc_type}.txt', ContentFile(content.encode()))
                self.stdout.write(self.style.SUCCESS(f'Created {doc_type} document for {resident.user.get_full_name()}'))

        # Create shared bills
        bill_types = ['rent', 'utility', 'maintenance']
        for i in range(10):
            amount = random.randint(500, 2000)
            due_date = timezone.now() + timedelta(days=random.randint(-30, 30))
            bill_type = random.choice(bill_types)
            
            shared_bill = SharedBill.objects.create(
                amount=amount,
                due_date=due_date,
                bill_type=bill_type,
                description=f'Sample {bill_type} bill #{i+1}'
            )
            self.stdout.write(self.style.SUCCESS(f'Created shared bill {shared_bill}'))

            # Some residents might have made payments
            for bill in shared_bill.resident_bills.all():
                if random.random() > 0.5:  # 50% chance of payment
                    payment_amount = bill.amount if random.random() > 0.3 else bill.amount / 2
                    Payment.objects.create(
                        bill=bill,
                        amount=payment_amount,
                        payment_date=timezone.now(),
                        payment_method=random.choice(['cash', 'card', 'bank_transfer']),
                        transaction_id=f'TXN{random.randint(100000, 999999)}',
                        notes=f'Payment for {bill.bill_type}'
                    )
                    self.stdout.write(self.style.SUCCESS(f'Created payment for {bill.resident.user.get_full_name()}'))

        self.stdout.write(self.style.SUCCESS('Successfully created dummy data'))
