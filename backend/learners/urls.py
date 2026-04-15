from django.urls import path
from .views import LearnerListView, LearnerDetailView

urlpatterns = [
    path('', LearnerListView.as_view(), name='learners-list'),
    path('<str:learner_id>/', LearnerDetailView.as_view(), name='learners-detail'),
]
