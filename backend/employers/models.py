from django.db import models


class Employer(models.Model):
    RAG_CHOICES = [('Green', 'Green'), ('Amber', 'Amber'), ('Red', 'Red')]

    name = models.CharField(max_length=200)
    contact_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    sector = models.CharField(max_length=100, blank=True)
    engagement_score = models.IntegerField(default=0)
    rag_status = models.CharField(max_length=10, choices=RAG_CHOICES, default='Green')
    last_contact = models.DateField(null=True, blank=True)
    concerns = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
