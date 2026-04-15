from django.urls import path
from .views import EvidenceListCreateView, EvidenceDetailView

urlpatterns = [
    path('', EvidenceListCreateView.as_view(), name='evidence-list'),
    path('<int:pk>/', EvidenceDetailView.as_view(), name='evidence-detail'),
]
