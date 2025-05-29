from django.db import models
from django.conf import settings
from core.models import TimeStampedModel
from residents.models import Resident

class Document(TimeStampedModel):
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=[
        ('lease', 'Lease Agreement'),
        ('id', 'ID Proof'),
        ('income', 'Income Proof'),
        ('insurance', 'Insurance'),
        ('other', 'Other')
    ])
    file = models.FileField(upload_to='documents/')
    description = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')
    verified_at = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f'{self.resident.user.get_full_name()} - {self.title}'

# Create your models here.
