from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('director', 'Director'),
        ('quality_lead', 'Quality Lead'),
        ('compliance_lead', 'Compliance Lead'),
        ('programme_lead', 'Programme Lead'),
        ('coach', 'Coach'),
        ('iqa', 'IQA'),
        ('safeguarding_lead', 'Safeguarding Lead'),
        ('employer_engagement', 'Employer Engagement Officer'),
        ('admin', 'Admin'),
        ('inspector', 'Read-Only Inspector'),
    ]

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='admin')
    avatar_url = models.URLField(blank=True)

    class Meta:
        db_table = 'users_user'

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"


class LoginAudit(models.Model):
    """
    Audit log of every login attempt.
    Passwords are NEVER stored — Django stores only the hashed password
    on the User model. This table only logs login events.
    """
    user = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='login_audits'
    )
    email_attempted = models.EmailField()
    success = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users_login_audit'
        ordering = ['-timestamp']

    def __str__(self):
        status = 'OK' if self.success else 'FAIL'
        return f"[{status}] {self.email_attempted} at {self.timestamp}"
