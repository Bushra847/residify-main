from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('resident', 'title', 'document_type', 'is_verified', 'verified_by', 'verified_at', 'expiry_date')
    list_filter = ('document_type', 'is_verified')
    search_fields = ('resident__user__username', 'title', 'description')
    raw_id_fields = ('resident', 'verified_by')

# Register your models here.
