from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .serailizers import *


@api_view(['GET', 'POST', 'DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def meetings_api(request: Request):
    if request.method == 'GET':
        meetings = Meeting.objects.filter(creator=request.user)
        serializer = MeetingSerializer(meetings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        serializer = AddMeetingSerializer(data=request.data)
        if serializer.is_valid():
            # Check if request.user owns the calendar and contact
            if serializer.validated_data['calendar'].owner != request.user:
                return Response({"error": "Invalid calendar"}, status=status.HTTP_400_BAD_REQUEST)
            if serializer.validated_data['invitee'].owner != request.user:
                return Response({"error": "Invalid contact"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save(creator=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Delete and patch requires an id and a valid meeting
    pk = request.data.get('id')
    if not pk:
        return Response({"error": "Primary key is required"}, status=status.HTTP_400_BAD_REQUEST)

    meeting = Meeting.objects.filter(pk=pk, creator=request.user).first()
    if not meeting:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        meeting.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == 'PATCH':
        serializer = AddMeetingSerializer(meeting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_invite(request: Request, pk: str):
    meeting = Meeting.objects.filter(pk=pk, creator=request.user).first()
    if not meeting:
        return Response(status=status.HTTP_404_NOT_FOUND)

    send_mail(
        f"Meeting Invite: {meeting.title}",
        f"Hello, {meeting.invitee.name}. You have been invited to a meeting by {meeting.creator.name}. "
        f"Please confirm the meeting by clicking the link below: \n\n"
        f"http://localhost:3000/confirm-meeting/{meeting.id}",
        settings.EMAIL_HOST_USER,
        [meeting.invitee.email],
        fail_silently=False,
    )
    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_remind(request: Request, pk: str):
    meeting = Meeting.objects.filter(pk=pk, creator=request.user).first()
    if not meeting:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Three cases:
    # 1. The meeting is confirmed, reminding the invitee that the meeting is coming up on that time
    # 2. The meeting is not confirmed, reminding the invitee that the meeting is pending
    # 3. Invalid (e.g. the meeting is already passed)

    if meeting.time:
        # Check case 3
        if meeting.time < timezone.now():
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Case 1
        send_mail(
            f"Meeting Reminder: {meeting.title}",
            f"Hello, {meeting.invitee.name}. You have a meeting with {meeting.creator.name} coming up at {meeting.time}.",
            settings.EMAIL_HOST_USER,
            [meeting.invitee.email],
            fail_silently=False,
        )

    else:
        # Case 2
        send_mail(
            f"Meeting Reminder: {meeting.title}",
            f"Hello, {meeting.invitee.name}. You have a meeting with {meeting.creator.name} pending. "
            f"Please confirm the meeting as soon as possible by clicking the link below: \n\n"
            f"http://localhost:3000/confirm-meeting/{meeting.id}",
            settings.EMAIL_HOST_USER,
            [meeting.invitee.email],
            fail_silently=False,
        )

    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])  # Intentionally unauthenticated
def accept_meeting(request: Request, pk: str):
    meeting = Meeting.objects.filter(pk=pk).first()
    if not meeting:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = ConfirmMeetingSerializer(meeting, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])  # Intentionally unauthenticated
def get_meeting(request: Request, pk: str):
    meeting = Meeting.objects.filter(pk=pk).first()
    if not meeting:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = MeetingSerializer(meeting)
    return Response(serializer.data)
