from django.urls import path
from .views import ActionListCreateView, ActionDetailView, ActionCommentCreateView

urlpatterns = [
    path('', ActionListCreateView.as_view(), name='actions-list'),
    path('<int:pk>/', ActionDetailView.as_view(), name='actions-detail'),
    path('<int:pk>/comments/', ActionCommentCreateView.as_view(), name='actions-comments'),
]
