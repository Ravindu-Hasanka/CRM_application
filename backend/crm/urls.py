from django.urls import re_path
from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .api_views import (
    ActivityLogViewSet,
    CompanyViewSet,
    ContactViewSet,
    LoginView,
    MeView,
    OrganizationCreateView,
    OrganizationMeView,
    PublicOrganizationRegistrationView,
    UserCreateView,
    UserListView,
)

router = SimpleRouter(trailing_slash='/?')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')

urlpatterns = [
    re_path(r'^auth/login/?$', LoginView.as_view(), name='auth-login'),
    re_path(r'^auth/refresh/?$', TokenRefreshView.as_view(), name='auth-refresh'),
    re_path(r'^auth/me/?$', MeView.as_view(), name='auth-me'),
    re_path(r'^organization/me/?$', OrganizationMeView.as_view(), name='organization-me'),
    re_path(r'^auth/register-organization/?$', PublicOrganizationRegistrationView.as_view(), name='auth-register-organization'),
    re_path(r'^platform/organizations/?$', OrganizationCreateView.as_view(), name='organization-create'),
    re_path(r'^users/?$', UserCreateView.as_view(), name='user-create'),
    re_path(r'^users/list/?$', UserListView.as_view(), name='user-list'),
]

urlpatterns += router.urls
