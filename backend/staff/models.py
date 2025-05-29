from django.db import models
from django.conf import settings
from core.models import TimeStampedModel

class StaffRole(TimeStampedModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Staff(TimeStampedModel):
    first_name = models.CharField(max_length=100, default='FirstName')
    last_name = models.CharField(max_length=100, default='LastName')
    role = models.ForeignKey(StaffRole, on_delete=models.PROTECT, null=True)
    contact_number = models.CharField(max_length=15, default='0000000000')
    is_active = models.BooleanField(default=True)
    joining_date = models.DateField(auto_now_add=True)
    emergency_contact = models.CharField(max_length=15, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=1000)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    national_id = models.CharField(max_length=50, blank=True)
    
    class Meta:
        verbose_name_plural = 'Staff'
    
    def __str__(self):
        return f'{self.first_name} {self.last_name} - {self.role.name if self.role else "No Role"}'
    
    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'

class Schedule(TimeStampedModel):
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='schedules')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f'{self.staff.get_full_name()} - {self.date}'

class Expense(TimeStampedModel):
    EXPENSE_TYPES = [
        ('salary', 'Salary'),
        ('bonus', 'Bonus'),
        ('advance', 'Advance'),
        ('other', 'Other')
    ]

    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPES)
    description = models.TextField(blank=True)
    is_paid = models.BooleanField(default=False)
    paid_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f'{self.staff.get_full_name()} - {self.expense_type} - {self.amount}'

# Create your models here.
