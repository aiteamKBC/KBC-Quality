from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import KBCTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/token/', KBCTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App APIs
    path('api/users/', include('users.urls')),
    path('api/learners/', include('learners.urls')),
    path('api/employers/', include('employers.urls')),
    path('api/evidence/', include('evidence.urls')),
    path('api/actions/', include('actions.urls')),
    path('api/safeguarding/', include('safeguarding.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
