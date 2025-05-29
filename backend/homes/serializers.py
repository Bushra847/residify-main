from rest_framework import serializers
from .models import Home

class HomeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    property_type = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    monthly_rent = serializers.SerializerMethodField()
    size_sqft = serializers.SerializerMethodField()

    class Meta:
        model = Home
        fields = ('id', 'name', 'address', 'property_type', 'description', 'status', 'monthly_rent', 'size_sqft', 'created_at', 'updated_at')

    def get_name(self, obj):
        return f'{obj.block}-{obj.floor}-{obj.number}'

    def get_address(self, obj):
        return f'Block {obj.block}, Floor {obj.floor}, Unit {obj.number}'

    def get_property_type(self, obj):
        return f'{obj.bedrooms} BHK'

    def get_description(self, obj):
        return f'{obj.bedrooms} BHK, {obj.bathrooms} Bath, {obj.area} sqft'

    def get_monthly_rent(self, obj):
        return obj.rent

    def get_size_sqft(self, obj):
        return obj.area
