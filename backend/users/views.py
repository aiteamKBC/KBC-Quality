from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model

from .models import LoginAudit
from .serializers import (
    KBCTokenObtainPairSerializer,
    UserSerializer,
    UserCreateSerializer,
    MeSerializer,
    LoginAuditSerializer,
)

User = get_user_model()


class KBCTokenObtainPairView(TokenObtainPairView):
    """
    Login endpoint. Uses our custom serializer which:
    - Accepts email or username
    - Records every attempt in LoginAudit (Neon DB)
    - Returns user profile alongside the tokens
    """
    serializer_class = KBCTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)


class LogoutView(APIView):
    """
    Blacklists the refresh token in Neon PostgreSQL so it cannot be reused.
    The short-lived access token (8 h) expires naturally.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            pass  # Already blacklisted — treat as successful logout
        return Response({'detail': 'Logged out.'}, status=status.HTTP_205_RESET_CONTENT)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('first_name', 'last_name')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.IsAdminUser]


class LoginAuditView(generics.ListAPIView):
    serializer_class = LoginAuditSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return LoginAudit.objects.select_related('user').order_by('-timestamp')[:100]
