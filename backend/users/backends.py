from django.contrib.auth import get_user_model

User = get_user_model()


class EmailAuthBackend:
    """
    Authenticate using email address.
    The KBC login page submits an email field; Django's default backend expects username.
    This backend tries email first, then falls back to username lookup.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None

        # Try email lookup first
        try:
            user = User.objects.get(email__iexact=username)
        except User.DoesNotExist:
            # Fall back to plain username lookup
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return None

        if user.check_password(password) and user.is_active:
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
