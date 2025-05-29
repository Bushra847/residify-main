from django.contrib import admin
from .models import Home

@admin.register(Home)
class HomeAdmin(admin.ModelAdmin):
    list_display = ('block', 'floor', 'number', 'status', 'rent', 'bedrooms', 'bathrooms', 'area')
    list_filter = ('block', 'status', 'bedrooms', 'bathrooms')
    search_fields = ('block', 'number')
    ordering = ('block', 'floor', 'number')
    list_per_page = 20
