from django.db import models
from django.conf import settings


class Action(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Escalated', 'Escalated'),
    ]
    CATEGORY_CHOICES = [
        ('Attendance', 'Attendance'),
        ('OTJH', 'OTJH'),
        ('Progress', 'Progress'),
        ('Safeguarding', 'Safeguarding'),
        ('Employer Engagement', 'Employer Engagement'),
        ('Quality', 'Quality'),
        ('Compliance', 'Compliance'),
        ('Other', 'Other'),
    ]

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='owned_actions'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='created_actions'
    )
    linked_learner_id = models.CharField(max_length=100, blank=True)
    linked_employer = models.ForeignKey(
        'employers.Employer', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='actions'
    )
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ActionComment(models.Model):
    action = models.ForeignKey(Action, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment on {self.action.title} by {self.author}"
