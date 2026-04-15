from django.contrib import admin
from .models import Evidence


@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'review_status', 'uploaded_by', 'created_at']
    list_filter = ['review_status', 'category', 'ofsted_theme']
    search_fields = ['title', 'category', 'tags']
