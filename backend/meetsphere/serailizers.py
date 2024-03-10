from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import CustomUser, Contact, Calendar, Meeting


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['email'] = validated_data['email'].lower()
        validated_data['password'] = make_password(validated_data.get('password'))
        return super(UserRegistrationSerializer, self).create(validated_data)


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        data['email'] = data['email'].lower()
        user = authenticate(email=data.get('email'), password=data.get('password'))
        if user is None or not user.is_active:
            raise serializers.ValidationError("Invalid login credentials.")
        return user


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'password']
        read_only_fields = ['id']


class AddContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'profile_image']

    def validate(self, data):
        data['email'] = data['email'].lower()
        return data


class AddCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = ['start_date', 'end_date', 'availability']

    def create(self, validated_data):
        return Calendar.objects.create(**validated_data)


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = ['id', 'created_at', 'updated_at', 'start_date', 'end_date', 'availability']