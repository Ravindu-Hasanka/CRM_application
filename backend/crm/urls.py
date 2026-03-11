from django.urls import re_path
from rest_framework_simplejwt.views import TokenRefreshView

from .api_views import (
    ActivityLogListView,
    CompanyListView,
    ContactListView,
    LoginView,
    MeView,
    OrganizationCreateView,
    PublicOrganizationRegistrationView,
    UserCreateView,
    UserListView,
)

urlpatterns = [
    re_path(r'^auth/login/?$', LoginView.as_view(), name='auth-login'),
    re_path(r'^auth/refresh/?$', TokenRefreshView.as_view(), name='auth-refresh'),
    re_path(r'^auth/me/?$', MeView.as_view(), name='auth-me'),
    re_path(r'^auth/register-organization/?$', PublicOrganizationRegistrationView.as_view(), name='auth-register-organization'),
    re_path(r'^platform/organizations/?$', OrganizationCreateView.as_view(), name='organization-create'),
    re_path(r'^users/?$', UserCreateView.as_view(), name='user-create'),
    re_path(r'^users/list/?$', UserListView.as_view(), name='user-list'),
    re_path(r'^companies/?$', CompanyListView.as_view(), name='company-list'),
    re_path(r'^contacts/?$', ContactListView.as_view(), name='contact-list'),
    re_path(r'^activity-logs/?$', ActivityLogListView.as_view(), name='activity-log-list'),
]
