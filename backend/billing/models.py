from django.db import models
from django.conf import settings
from decimal import Decimal
from core.models import TimeStampedModel
from residents.models import Resident

class SharedBill(TimeStampedModel):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    bill_type = models.CharField(max_length=20, choices=[
        ('rent', 'Rent'),
        ('utilities', 'Utilities'),
        ('maintenance', 'Maintenance'),
        ('salaries', 'Salaries'),
        ('marketing', 'Marketing'),
        ('insurance', 'Insurance'),
        ('taxes', 'Taxes'),
        ('other', 'Other'),
        ('shared_expense', 'Shared Expense'),
    ])
    description = models.TextField(blank=True)
    distributed = models.BooleanField(default=False)
    union_leader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='shared_bills', help_text='The union leader/admin responsible for this bill')
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Only distribute if it's a new shared bill and hasn't been distributed yet
        if is_new and not self.distributed:
            residents = Resident.objects.filter(is_active=True, union_leader=self.union_leader)
            resident_count = residents.count()
            if resident_count > 0:
                amount_per_resident = Decimal(self.amount) / Decimal(resident_count)
                for resident in residents:
                    Bill.objects.create(
                        resident=resident,
                        shared_bill=self,
                        amount=amount_per_resident,
                        due_date=self.due_date,
                        bill_type=self.bill_type,
                        description=self.description,
                        union_leader=self.union_leader
                    )
                self.distributed = True
                self.save(update_fields=['distributed'])
    
    def __str__(self):
        return f'{self.bill_type} - {self.amount} - {self.due_date}'

class Bill(TimeStampedModel):
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='bills')
    shared_bill = models.ForeignKey(SharedBill, on_delete=models.CASCADE, related_name='resident_bills', null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    bill_type = models.CharField(max_length=20, choices=[
        ('rent', 'Rent'),
        ('utilities', 'Utilities'),
        ('maintenance', 'Maintenance'),
        ('salaries', 'Salaries'),
        ('marketing', 'Marketing'),
        ('insurance', 'Insurance'),
        ('taxes', 'Taxes'),
        ('other', 'Other'),
        ('shared_expense', 'Shared Expense'),
    ])
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue')
    ], default='pending')
    description = models.TextField(blank=True)
    screenshot = models.ImageField(upload_to='bill_screenshots/', blank=True, null=True)
    payment_screenshot = models.ImageField(upload_to='payment_screenshots/', blank=True, null=True)
    payment_date = models.DateField(null=True, blank=True)
    payment_notes = models.TextField(blank=True)
    union_leader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='bills', help_text='The union leader/admin responsible for this bill')
    penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return f'{self.resident.user.get_full_name()} - {self.bill_type} - {self.amount}'

class Payment(TimeStampedModel):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=[
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('other', 'Other')
    ])
    transaction_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    screenshot = models.ImageField(upload_to='payment_screenshots/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='pending')
    
    def __str__(self):
        return f'{self.bill.resident.user.get_full_name()} - {self.amount} - {self.payment_date}'

class Expense(TimeStampedModel):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    is_shared = models.BooleanField(default=True, help_text='If true, this expense will be shared among all active residents')
    share_distributed = models.BooleanField(default=False, help_text='Indicates if the expense has been distributed among residents')
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='expenses', null=True)
    category = models.CharField(max_length=20, choices=[
        ('utilities', 'Utilities'),
        ('maintenance', 'Maintenance'),
        ('salaries', 'Salaries'),
        ('marketing', 'Marketing'),
        ('insurance', 'Insurance'),
        ('taxes', 'Taxes'),
        ('other', 'Other')
    ])
    description = models.TextField(blank=True)
    receipt = models.FileField(upload_to='expense_receipts/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='pending')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_expenses')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_expenses')
    union_leader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses', help_text='The union leader/admin responsible for this expense')

    def distribute_shares(self):
        if self.share_distributed:
            return
        residents = Resident.objects.filter(is_active=True, union_leader=self.created_by)
        resident_count = residents.count()
        if resident_count > 0:
            amount_per_resident = Decimal(self.amount) / Decimal(resident_count)
            for resident in residents:
                bill = Bill.objects.create(
                    resident=resident,
                    amount=amount_per_resident,
                    due_date=self.date,  # or set a due date as needed
                    bill_type=self.category,  # Use the expense category as the bill type
                    description=f'Shared expense: {self.category} - {self.description}',
                    union_leader=self.created_by
                )
                ResidentExpenseShare.objects.create(
                    expense=self,
                    resident=resident,
                    share_amount=amount_per_resident,
                    bill=bill
                )
            self.share_distributed = True
            self.save(update_fields=['share_distributed'])

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        # Remove bill creation logic from here
        # Always set union_leader to created_by if not set
        if not self.union_leader:
            self.union_leader = self.created_by
            super().save(update_fields=['union_leader'])

    def __str__(self):
        if self.is_shared:
            return f'Shared: {self.category} - {self.amount} - {self.date}'
        return f'{self.resident.user.get_full_name() if self.resident else "No Resident"} - {self.category} - {self.amount} - {self.date}'

class ResidentExpenseShare(TimeStampedModel):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='resident_shares')
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='expense_shares')
    share_amount = models.DecimalField(max_digits=10, decimal_places=2)
    bill = models.OneToOneField('Bill', on_delete=models.SET_NULL, null=True, blank=True, related_name='expense_share', help_text='The bill for this resident expense share')
    
    def __str__(self):
        return f'{self.resident.user.get_full_name()} - {self.expense.category} - {self.share_amount}'
    
    class Meta:
        unique_together = ('expense', 'resident')

    def __str__(self):
        return f'{self.resident.user.get_full_name()} - {self.expense.category} - {self.share_amount}'
    
    def __str__(self):
        return f'{self.category} - {self.amount} - {self.date}'
