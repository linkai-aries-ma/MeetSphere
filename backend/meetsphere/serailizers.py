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
        fields = ['id', 'name', 'email', 'profile_image']

    def validate(self, data):
        data['email'] = data['email'].lower()
        return data


class AddCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = ['start_date', 'end_date', 'timezone']

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError("End date must be after start date.")

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
        fields = ['id', 'created', 'modified', 'start_date', 'end_date', 'time_slots', 'timezone']
        list_serializer_class = CustomCalendarListSerializer


class AddMeetingSerializer(serializers.ModelSerializer):
    invitee = serializers.PrimaryKeyRelatedField(queryset=Contact.objects.all())
    calendar = serializers.PrimaryKeyRelatedField(queryset=Calendar.objects.all())

    class Meta:
        model = Meeting
        fields = ['title', 'description', 'location',
                  'is_virtual', 'invitee', 'time', 'duration', 'calendar']


class ConfirmMeetingSerializer(serializers.ModelSerializer):
    start_time = serializers.DateTimeField(required=True)

    class Meta:
        model = Meeting
        fields = ['start_time']


class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['id', 'title', 'description', 'location', 'is_virtual', 'created_at', 'updated_at', 'calendar',
                  'creator', 'invitee', 'time', 'duration']
