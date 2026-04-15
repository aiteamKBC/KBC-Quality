from django.contrib import admin
from .models import SafeguardingCase


@admin.register(SafeguardingCase)
class SafeguardingCaseAdmin(admin.ModelAdmin):
    list_display = ['learner_name', 'category', 'severity', 'status', 'assigned_to', 'created_at']
    list_filter = ['status', 'severity', 'category']
    search_fields = ['learner_name', 'learner_id', 'category', 'description']
