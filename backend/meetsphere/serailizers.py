from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework.serializers import ListSerializer

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
        fields = ['id', 'name', 'email', 'password', 'profile_image']
        read_only_fields = ['id']
        extra_kwargs = {'password': {'write_only': True}}


class AddContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'profile_image']

    def validate(self, data):
        if 'email' in data:
            data['email'] = data.get('email').lower()
        return data


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'


class AddCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = ['start_date', 'end_date', 'timezone', 'start_hour', 'end_hour']
        # All fields are required
        extra_kwargs = {
            'start_date': {'required': True},
            'end_date': {'required': True},
            'timezone': {'required': True},
            'start_hour': {'required': True},
            'end_hour': {'required': True},
        }

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        start_hour = attrs.get('start_hour')
        end_hour = attrs.get('end_hour')

        if end_date <= start_date:
            raise serializers.ValidationError("End date must be after start date.")

        if end_hour <= start_hour:
            raise serializers.ValidationError("End hour must be after start hour.")

        return attrs

    def create(self, validated_data):
        return Calendar.objects.create(**validated_data, time_slots=[])


class CustomCalendarListSerializer(ListSerializer):
    def update(self, instance, validated_data):
        # Maps each calendar instance to its primary key for efficient lookup
        calendar_mapping = {calendar.pk: calendar for calendar in instance}

        # Loop through each item in the validated data
        for item in validated_data:
            # Extract the primary key of the calendar from the data
            calendar_id = item.get('id', None)
            if calendar_id is None:
                # If the ID is missing, skip this item
                continue

            # Check if a calendar with this ID exists in the current instance
            if calendar_id in calendar_mapping:
                # If it exists, update the instance with the validated data
                calendar = calendar_mapping[calendar_id]
                self.child.update(calendar, item)
            else:
                # If it doesn't exist, create a new instance
                instance.append(self.child.create(item))

        return instance


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = '__all__'
        list_serializer_class = CustomCalendarListSerializer


class AddMeetingSerializer(serializers.ModelSerializer):
    invitee = serializers.PrimaryKeyRelatedField(queryset=Contact.objects.all())
    calendar = serializers.PrimaryKeyRelatedField(queryset=Calendar.objects.all())

    class Meta:
        model = Meeting
        fields = ['title', 'description', 'location', 'regularity',
                  'is_virtual', 'invitee', 'time', 'duration', 'calendar']


class ConfirmMeetingSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(required=True)

    class Meta:
        model = Meeting
        fields = ['time']


class MeetingSerializer(serializers.ModelSerializer):
    invitee = ContactSerializer(read_only=True)
    calendar = CalendarSerializer(read_only=True)
    creator = CustomUserSerializer(read_only=True)

    class Meta:
        model = Meeting
        fields = '__all__'
