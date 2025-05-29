from django.db import models
from django.conf import settings
from core.models import TimeStampedModel
from residents.models import Resident

class Complaint(TimeStampedModel):
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='complaints')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=[
        ('maintenance', 'Maintenance'),
        ('noise', 'Noise'),
        ('security', 'Security'),
        ('cleanliness', 'Cleanliness'),
        ('other', 'Other')
    ])
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='medium')
    status = models.CharField(max_length=20, choices=[
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed')
    ], default='open')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    
    def __str__(self):
        return f'{self.resident.user.get_full_name()} - {self.title}'

class ComplaintUpdate(TimeStampedModel):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='updates')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField()
    new_status = models.CharField(max_length=20, choices=Complaint.status.field.choices)
    
    def __str__(self):
        return f'{self.complaint.title} - {self.new_status} - {self.updated_by.get_full_name()}'

# Create your models here.
