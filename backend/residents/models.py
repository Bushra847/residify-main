from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from core.models import TimeStampedModel
from django.core.validators import MinValueValidator
from homes.models import Home

class Resident(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    home = models.ForeignKey(Home, on_delete=models.SET_NULL, null=True, related_name='residents')
    unit_number = models.CharField(max_length=10, blank=True, null=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    lease_start_date = models.DateField()
    lease_end_date = models.DateField()
    emergency_contact_name = models.CharField(max_length=255)
    emergency_contact_phone = models.CharField(max_length=15)
    is_active = models.BooleanField(default=True)
    
    is_owner = models.BooleanField(default=False)
    union_leader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='union_residents', help_text='The union leader/admin responsible for this resident')

    def __str__(self):
        return f'{self.user.get_full_name()} - {str(self.home) if self.home else "No Home"} (Unit {self.unit_number})'

class Expense(TimeStampedModel):
    EXPENSE_TYPES = [
        ('rent', 'Rent'),
        ('utilities', 'Utilities'),
        ('security', 'Security'),
        ('maintenance', 'Maintenance'),
        ('other', 'Other')
    ]
    
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='expenses', null=True)
    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()
    description = models.TextField(blank=True)
    is_shared = models.BooleanField(default=True, help_text='If true, expense is divided among residents')
    
    def __str__(self):
        return f'{self.expense_type} - {str(self.home)} ({self.month.strftime("%B %Y")})'
