from django.urls import path
from .views import EmployerListCreateView, EmployerDetailView

urlpatterns = [
    path('', EmployerListCreateView.as_view(), name='employers-list'),
    path('<str:employer_id>/', EmployerDetailView.as_view(), name='employers-detail'),
]
