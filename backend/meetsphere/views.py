from django.conf import settings
from django.contrib.auth import logout
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import AnonymousUser


from .models import *
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


@api_view(['GET', 'POST', 'DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def contacts(request: Request):
    if request.method == 'GET':
        contacts = Contact.objects.filter(owner=request.user)
        serializer = AddContactSerializer(contacts, many=True)
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

    if request.method == 'DELETE':
        pk = request.data.get('pk')
        if not pk:
            return Response({"error": "Primary key is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            contact = Contact.objects.get(pk=pk, owner=request.user)
        except Contact.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == 'PATCH':
        pk = request.data.get('pk')
        if not pk:
            return Response({"error": "Primary key is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            contact = Contact.objects.get(pk=pk, owner=request.user)
        except Contact.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = AddContactSerializer(contact, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def add_calendar(request: Request):
    if request.method == 'POST':
        serializer = AddCalendarSerializer(data=request.data)
        if serializer.is_valid():
            calendar = serializer.save(owner=request.user)
            return Response({'id': calendar.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'PUT', 'POST'])
def calendar(request):
    if request.method == 'GET':
        if isinstance(request.user, AnonymousUser):
            return Response({'error': 'User is not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            calendar = Calendar.objects.get(owner=request.user.pk)  # Use user's primary key
            serializer = CalendarSerializer(calendar)
            return Response(serializer.data)
        except Calendar.DoesNotExist:
            return Response({'error': 'Calendar not found'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method in ['PUT', 'POST']:
        if isinstance(request.user, AnonymousUser):
            return Response({'error': 'User is not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            calendar = Calendar.objects.get(owner=request.user.pk)
        except Calendar.DoesNotExist:
            return Response({'error': 'Calendar not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CalendarSerializer(calendar, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

@api_view(['GET', 'POST', 'DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def meetings(request: Request):
    if request.method == 'GET':
        meetings = Meeting.objects.filter(creator=request.user)
        serializer = MeetingSerializer(meetings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        serializer = AddMeetingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(creator=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        pk = request.data.get('pk')
        if not pk:
            return Response({"error": "Primary key is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            meeting = Meeting.objects.get(pk=pk, creator=request.user)
        except Meeting.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        meeting.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    if request.method == 'PATCH':
        pk = request.data.get('pk')
        if not pk:
            return Response({"error": "Primary key is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            meeting = Meeting.objects.get(pk=pk, creator=request.user)
        except Meeting.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = AddMeetingSerializer(meeting, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
