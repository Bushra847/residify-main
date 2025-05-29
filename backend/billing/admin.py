from django.contrib import admin
from .models import Bill, Payment

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('resident', 'amount', 'due_date', 'bill_type', 'status')
    list_filter = ('bill_type', 'status')
    search_fields = ('resident__user__username', 'description')
    raw_id_fields = ('resident',)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('bill', 'amount', 'payment_date', 'payment_method', 'transaction_id')
    list_filter = ('payment_method', 'payment_date')
    search_fields = ('bill__resident__user__username', 'transaction_id')
    raw_id_fields = ('bill',)

# Register your models here.
