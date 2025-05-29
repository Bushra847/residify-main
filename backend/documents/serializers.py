from rest_framework import serializers
from .models import Document
from residents.serializers import ResidentSerializer
from authentication.serializers import UserSerializer

class DocumentSerializer(serializers.ModelSerializer):
    resident = ResidentSerializer(read_only=True)
    verified_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('is_verified', 'verified_by', 'verified_at')

class DocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('is_verified', 'verified_by', 'verified_at')
