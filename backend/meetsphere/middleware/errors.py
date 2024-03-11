from django.core.exceptions import ValidationError
from django.http import JsonResponse
from rest_framework import status

class ErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        if isinstance(exception, ValidationError):
            return JsonResponse({'detail': exception.message}, status=status.HTTP_400_BAD_REQUEST)
        return None
