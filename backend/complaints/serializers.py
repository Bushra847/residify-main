from rest_framework import serializers
from .models import Complaint, ComplaintUpdate
from residents.serializers import ResidentSerializer
from authentication.serializers import UserSerializer

class ComplaintUpdateSerializer(serializers.ModelSerializer):
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ComplaintUpdate
        fields = '__all__'
        read_only_fields = ('updated_by',)

class ComplaintSerializer(serializers.ModelSerializer):
    resident = ResidentSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    updates = ComplaintUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('status',)

class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        exclude = ('resident',)

class ComplaintUpdateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintUpdate
        fields = '__all__'
        read_only_fields = ('updated_by',)
    
    def create(self, validated_data):
        validated_data['updated_by'] = self.context['request'].user
        complaint = validated_data['complaint']
        complaint.status = validated_data['new_status']
        complaint.save()
        return super().create(validated_data)
