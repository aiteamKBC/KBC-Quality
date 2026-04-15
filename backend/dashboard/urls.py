from django.urls import path
from .views import DashboardLearnersAtRiskView, DashboardOverviewView, DashboardSummaryView

urlpatterns = [
    path('overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('at-risk/', DashboardLearnersAtRiskView.as_view(), name='dashboard-at-risk'),
]
