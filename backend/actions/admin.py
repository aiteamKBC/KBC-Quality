from django.contrib import admin
from .models import Action, ActionComment


@admin.register(Action)
class ActionAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'priority', 'status', 'owner', 'due_date']
    list_filter = ['status', 'priority', 'category']
    search_fields = ['title', 'description']


@admin.register(ActionComment)
class ActionCommentAdmin(admin.ModelAdmin):
    list_display = ['action', 'author', 'created_at']
