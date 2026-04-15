from django.db import models
from django.conf import settings


class Evidence(models.Model):
    REVIEW_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=300)
    category = models.CharField(max_length=100)
    tags = models.JSONField(default=list, blank=True)
    file_url = models.URLField(blank=True)
    file = models.FileField(upload_to='evidence/', null=True, blank=True)
    linked_learner_id = models.CharField(max_length=100, blank=True)
    linked_employer = models.ForeignKey(
        'employers.Employer', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='evidence_items'
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='uploaded_evidence'
    )
    review_status = models.CharField(max_length=20, choices=REVIEW_STATUS_CHOICES, default='pending')
    ofsted_theme = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
