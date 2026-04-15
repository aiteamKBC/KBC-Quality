from django.contrib import admin
from .models import Employer


@admin.register(Employer)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ['name', 'sector', 'contact_name', 'engagement_score', 'rag_status', 'last_contact']
    list_filter = ['rag_status', 'sector']
    search_fields = ['name', 'contact_name', 'contact_email']
