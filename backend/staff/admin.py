from django.contrib import admin
from .models import Staff, Schedule, StaffRole

@admin.register(StaffRole)
class StaffRoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'role', 'contact_number', 'is_active', 'joining_date', 'salary')
    list_filter = ('role', 'is_active')
    search_fields = ('first_name', 'last_name', 'email', 'contact_number')
    raw_id_fields = ('role',)

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('staff', 'date', 'start_time', 'end_time')
    list_filter = ('date',)
    search_fields = ('staff__first_name', 'staff__last_name', 'notes')
    raw_id_fields = ('staff',)
