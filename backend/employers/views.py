from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .data import get_employer_by_id, list_employers


class EmployerListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(list_employers())


class EmployerDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, employer_id: str):
        employer = get_employer_by_id(employer_id)
        if employer is None:
            return Response({"detail": "Employer not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(employer)
