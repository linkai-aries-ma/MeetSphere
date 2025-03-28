from django.conf import settings
from django.contrib.auth import logout
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from ics import Calendar as ics
from django.core.files.storage import default_storage

from .serailizers import *


@api_view(['POST'])
def user_register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def user_login(request: Request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        return Response({'token': access_token})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def user_logout(request: Request):
    logout(request)
    return Response({"detail": "Logout successful"}, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_info(request: Request):
    user: CustomUser = request.user
    if request.method == 'GET':
        ser = CustomUserSerializer(user)
        return Response(ser.data)

    if request.method == 'POST':
        ser = CustomUserSerializer(user, data=request.data, partial=True)
        if ser.is_valid():
            if 'password' in ser.validated_data:
                user.set_password(ser.validated_data.pop('password'))
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_profile_image(request: Request):
    user: CustomUser = request.user
    if 'file' not in request.data:
        return Response({"error": "file is required"}, status=status.HTTP_400_BAD_REQUEST)
    user.profile_image = request.data['file']
    user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def contact_pfp(request: Request):
    if 'file' not in request.data:
        return Response({"error": "file is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Contact should be in the request parameters, not the data
    contact_id = request.data.get('contact')
    if not contact_id:
        return Response({"error": "contact is required"}, status=status.HTTP_400_BAD_REQUEST)

    contact = Contact.objects.filter(id=contact_id, owner=request.user).first()
    if not contact:
        return Response(status=status.HTTP_404_NOT_FOUND)

    contact.profile_image = request.data['file']
    contact.save()

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST', 'DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def contacts_api(request: Request):
    if request.method == 'GET':
        contacts = Contact.objects.filter(owner=request.user)
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        serializer = AddContactSerializer(data=request.data)
        if serializer.is_valid():
            # Check if already exists
            if Contact.objects.filter(email=serializer.validated_data['email'], owner=request.user).exists():
                return Response({"error": "Contact already exists"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Delete and patch requires an id and a valid contact
    pk = request.data.get('id')
    if not pk:
        return Response({"error": "Primary key is required"}, status=status.HTTP_400_BAD_REQUEST)

    contact = Contact.objects.filter(id=pk, owner=request.user).first()
    if not contact:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == 'PATCH':
        serializer = AddContactSerializer(contact, data=request.data, partial=True)
        if serializer.is_valid():
            conflicting_contact = Contact.objects.filter(email=serializer.validated_data['email'], owner=request.user).first()
            if conflicting_contact and conflicting_contact.id != contact.id:
                return Response({"error": "Contact already exists"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST', 'PATCH', 'DELETE', 'PUT'])
@permission_classes([IsAuthenticated])
def calendar_api(request):
    if request.method == 'GET':
        calendars = Calendar.objects.filter(owner=request.user)
        serializer = CalendarSerializer(calendars, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        serializer = AddCalendarSerializer(data=request.data)
        if serializer.is_valid():
            calendar = serializer.save(owner=request.user)
            return Response({'id': calendar.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Delete and patch requires an id and a valid calendar
    pk = request.data.get('id')
    if pk is None:
        return Response({'error': 'Calendar id is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Retrieve the specific calendar associated with the user
    calendar = Calendar.objects.filter(id=pk, owner=request.user).first()
    if not calendar:
        return Response(status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'DELETE':
        calendar.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == 'PATCH':
        # Use the retrieved calendar instance for serialization
        serializer = CalendarSerializer(calendar, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'PUT':
        # Expect a file in the 'file' field of the request
        file = request.FILES.get('file')
        if file is None or pk is None:
            return Response({'error': 'File and Calendar id are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the specific calendar associated with the user
        calendar = Calendar.objects.filter(id=pk, owner=request.user).first()
        if not calendar:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Save the file temporarily
        file_name = default_storage.save('tmp.ics', file)
        file_path = default_storage.path(file_name)

        # Parse the .ics file
        with open(file_path, 'r') as f:
            c = ics(f.read())

        # Convert the events to the required JSON format
        time_slots = calendar.time_slots
        for event in c.events:
            # Filter events based on the calendar's start_date and end_date
            if calendar.start_date <= event.begin.date() <= calendar.end_date:
                time_slots.append({
                    'start': event.begin.isoformat(),
                    'end': event.end.isoformat(),
                    'preference': 1
                })

        # Update the calendar's time_slots field
        calendar.time_slots = time_slots
        calendar.save()

        return Response({'message': 'Calendar updated successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
def test_email(request: Request):
    # Send out a test email
    send_mail(
        "Subject here",
        "Here is the message.",
        settings.EMAIL_HOST_USER,
        ["azalea@hydev.org"],
        fail_silently=False,
    )
    return Response(status=status.HTTP_200_OK)
