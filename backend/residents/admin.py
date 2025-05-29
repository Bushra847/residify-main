from django.contrib import admin
from .models import Resident

@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):
    list_display = ('username', 'full_name', 'email', 'home', 'lease_start_date', 'lease_end_date', 'union_leader')
    list_filter = ('home', 'lease_start_date', 'lease_end_date', 'union_leader')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'home__name', 'union_leader__username', 'union_leader__email')
    raw_id_fields = ('home', 'union_leader')
    fields = (
        'user',
        'union_leader',
        ('lease_start_date', 'lease_end_date'),
        'home',
        'unit_number',
        ('contact_number', 'emergency_contact_phone'),
        'emergency_contact_name'
    )
    
    def username(self, obj):
        return obj.user.username
    username.admin_order_field = 'user__username'
    
    def full_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'
    full_name.admin_order_field = 'user__first_name'
    
    def email(self, obj):
        return obj.user.email
    email.admin_order_field = 'user__email'

# Register your models here.
