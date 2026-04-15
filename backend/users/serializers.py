from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from .models import User, LoginAudit

# ── Helpers ──────────────────────────────────────────────────────────────────

def compute_initials(user) -> str:
    parts = user.get_full_name().strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    if parts:
        return parts[0][0].upper()
    return (user.username[0] if user.username else '?').upper()


def get_client_ip(request) -> str | None:
    if request is None:
        return None
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


# ── JWT token serializer ──────────────────────────────────────────────────────

class KBCTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends SimplJWT's default serializer to:
    1. Write a LoginAudit record (success or failure) to Neon PostgreSQL
    2. Embed the user profile in the token response so the frontend
       gets everything in one request (no extra /users/me/ call on login)
    """

    def validate(self, attrs):
        email_attempted = attrs.get(self.username_field, '')
        request = self.context.get('request')
        ip = get_client_ip(request)
        ua = request.META.get('HTTP_USER_AGENT', '') if request else ''

        try:
            data = super().validate(attrs)
        except Exception:
            # Record failed attempt — password is NEVER stored, only the email
            LoginAudit.objects.create(
                user=None,
                email_attempted=email_attempted,
                success=False,
                ip_address=ip,
                user_agent=ua,
            )
            raise

        # Record successful login
        LoginAudit.objects.create(
            user=self.user,
            email_attempted=email_attempted,
            success=True,
            ip_address=ip,
            user_agent=ua,
        )

        # Embed user profile so the frontend doesn't need a separate /me/ call
        data['user'] = {
            'id': self.user.pk,
            'username': self.user.username,
            'email': self.user.email,
            'full_name': self.user.get_full_name() or self.user.username,
            'initials': compute_initials(self.user),
            'role': self.user.role,
            'avatar_url': self.user.avatar_url,
        }
        return data


# ── User serializers ──────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'full_name', 'initials', 'role', 'avatar_url']
        read_only_fields = ['id']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_initials(self, obj):
        return compute_initials(obj)


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'role']

    def create(self, validated_data):
        # Django's create_user hashes the password automatically (PBKDF2-SHA256)
        return User.objects.create_user(**validated_data)


class MeSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'full_name', 'initials', 'role', 'avatar_url']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_initials(self, obj):
        return compute_initials(obj)


class LoginAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginAudit
        fields = ['id', 'email_attempted', 'success', 'ip_address', 'timestamp']
