from django.contrib.auth import authenticate, logout
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from backend.meetsphere.models import Contact
from backend.meetsphere.serailizers import UserRegistrationSerializer, UserLoginSerializer, AddContactSerializer


@api_view(['POST'])
def user_register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def user_login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        return Response({'token': access_token})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def user_logout(request):
    logout(request)
    return Response({"detail": "Logout successful"}, status=status.HTTP_200_OK)


@api_view(['POST'])
def add_contact(request):
    serializer = AddContactSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(owner=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_contact(request):
    pk = request.data.get('pk')
    if not pk:
        return Response({"error": "Primary key is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        contact = Contact.objects.get(pk=pk, owner=request.user)
    except Contact.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    contact.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def list_contacts(request):
    contacts = Contact.objects.filter(owner=request.user)
    serializer = AddContactSerializer(contacts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)