from django.urls import path
from .views import SafeguardingCaseListCreateView, SafeguardingCaseDetailView

urlpatterns = [
    path('', SafeguardingCaseListCreateView.as_view(), name='safeguarding-list'),
    path('<int:pk>/', SafeguardingCaseDetailView.as_view(), name='safeguarding-detail'),
]
