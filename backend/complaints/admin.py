from django.contrib import admin
from .models import Complaint, ComplaintUpdate

class ComplaintUpdateInline(admin.TabularInline):
    model = ComplaintUpdate
    extra = 0
    raw_id_fields = ('updated_by',)
    readonly_fields = ('created_at',)

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('title', 'resident', 'category', 'priority', 'status', 'assigned_to', 'created_at')
    list_filter = ('category', 'priority', 'status', 'assigned_to')
    search_fields = ('title', 'description', 'resident__user__first_name', 'resident__user__last_name', 'resident__user__username')
    raw_id_fields = ('resident', 'assigned_to')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ComplaintUpdateInline]
    list_per_page = 20
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

@admin.register(ComplaintUpdate)
class ComplaintUpdateAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'updated_by', 'new_status', 'created_at')
    list_filter = ('new_status', 'updated_by')
    search_fields = ('complaint__title', 'comment', 'updated_by__first_name', 'updated_by__last_name', 'updated_by__username')
    raw_id_fields = ('complaint', 'updated_by')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 20
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
