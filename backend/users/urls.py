from django.urls import path
from .views import MeView, LogoutView, UserListView, UserDetailView, UserCreateView, LoginAuditView

urlpatterns = [
    path('me/', MeView.as_view(), name='users-me'),
    path('logout/', LogoutView.as_view(), name='users-logout'),
    path('', UserListView.as_view(), name='users-list'),
    path('create/', UserCreateView.as_view(), name='users-create'),
    path('<int:pk>/', UserDetailView.as_view(), name='users-detail'),
    path('audit/logins/', LoginAuditView.as_view(), name='users-login-audit'),
]
