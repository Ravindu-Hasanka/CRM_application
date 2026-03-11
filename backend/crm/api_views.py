from django.contrib.auth import get_user_model
from django.db.models import Q
from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .mixins import OrganizationScopedQuerysetMixin
from .models import ActivityLog, Company, Contact, Organization, User
from .permissions import CompanyRBACPermission, ContactRBACPermission, IsAdminOrManagerRole, IsSystemAdminRole
from .serializers import (
    ActivityLogSerializer,
    CompanySerializer,
    ContactSerializer,
    CRMTokenObtainPairSerializer,
    OrganizationCreateSerializer,
    UserCreateSerializer,
    UserMeSerializer,
)

UserModel = get_user_model()


def _create_activity_log(*, request, action_type: str, instance, metadata: dict | None = None):
    user = request.user
    ActivityLog.objects.create(
        organization=instance.organization,
        user=user if user.is_authenticated else None,
        action_type=action_type,
        model_name=instance.__class__.__name__,
        object_id=str(instance.pk),
        metadata=metadata or {},
    )


class LoginView(TokenObtainPairView):
    serializer_class = CRMTokenObtainPairSerializer
    @extend_schema(
        tags=['Auth'],
        summary='Login and get JWT tokens',
        examples=[
            OpenApiExample(
                'Login request',
                value={'email': 'admin@acme.com', 'password': 'AdminPass123!'},
                request_only=True,
            ),
            OpenApiExample(
                'Login response',
                value={
                    'refresh': '<refresh_token>',
                    'access': '<access_token>',
                },
                response_only=True,
            ),
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class PublicOrganizationRegistrationView(generics.CreateAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationCreateSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Auth'],
        summary='Public organization registration',
        request=OrganizationCreateSerializer,
        responses={201: OrganizationCreateSerializer},
        examples=[
            OpenApiExample(
                'Organization signup request',
                value={
                    'name': 'Acme Ltd',
                    'subscription_plan': 'Pro',
                    'admin_email': 'admin@acme.com',
                    'admin_password': 'StrongPass123!',
                    'admin_username': 'acme-admin',
                },
                request_only=True,
            )
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Auth'],
        summary='Get current authenticated user',
        responses={200: UserMeSerializer},
    )
    def get(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data)


class UserCreateView(generics.CreateAPIView):
    queryset = UserModel.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManagerRole]
    @extend_schema(
        tags=['Users'],
        summary='Create user (role-based)',
        request=UserCreateSerializer,
        responses={201: UserCreateSerializer},
        examples=[
            OpenApiExample(
                'Create staff user',
                value={
                    'email': 'staff1@acme.com',
                    'username': 'staff1',
                    'password': 'StrongPass123!',
                    'organization': 1,
                    'role': 'Staff',
                    'is_active': True,
                },
                request_only=True,
            )
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        actor = self.request.user
        if actor.role == User.Role.MANAGER:
            serializer.save(organization=actor.organization)
            return
        if actor.role == User.Role.ADMIN:
            serializer.save(organization=actor.organization)
            return
        serializer.save()


class UserListView(OrganizationScopedQuerysetMixin, generics.ListAPIView):
    queryset = UserModel.objects.all().order_by('-created_at')
    serializer_class = UserMeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManagerRole]
    @extend_schema(tags=['Users'], summary='List users (scoped by organization)')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class OrganizationCreateView(generics.CreateAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationCreateSerializer
    permission_classes = [IsAuthenticated, IsSystemAdminRole]
    @extend_schema(
        tags=['Platform'],
        summary='Create organization with its first Admin',
        request=OrganizationCreateSerializer,
        responses={201: OrganizationCreateSerializer},
        examples=[
            OpenApiExample(
                'Organization onboarding',
                value={
                    'name': 'Acme Ltd',
                    'subscription_plan': 'Pro',
                    'admin_email': 'org.admin@acme.com',
                    'admin_password': 'StrongPass123!',
                    'admin_username': 'acme-admin',
                },
                request_only=True,
            )
        ],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class ActivityLogListView(OrganizationScopedQuerysetMixin, generics.ListAPIView):
    queryset = ActivityLog.objects.select_related('user').order_by('-timestamp')
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManagerRole]
    organization_field = 'organization'

    def get_queryset(self):
        queryset = super().get_queryset()
        action_type = self.request.query_params.get('action_type')
        model_name = self.request.query_params.get('model_name')
        user_id = self.request.query_params.get('user_id')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        search = self.request.query_params.get('search')

        if action_type:
            queryset = queryset.filter(action_type=action_type)
        if model_name:
            queryset = queryset.filter(model_name__iexact=model_name)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if date_from:
            queryset = queryset.filter(timestamp__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(timestamp__date__lte=date_to)
        if search:
            queryset = queryset.filter(
                Q(model_name__icontains=search)
                | Q(object_id__icontains=search)
                | Q(action_type__icontains=search)
            )

        return queryset
    @extend_schema(tags=['Activity Logs'], summary='List activity logs (scoped by organization)')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class CompanyViewSet(OrganizationScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Company.objects.filter(is_deleted=False).order_by('-created_at')
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, CompanyRBACPermission]
    organization_field = 'organization'

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        industry = self.request.query_params.get('industry')
        country = self.request.query_params.get('country')

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(industry__icontains=search) | Q(country__icontains=search)
            )
        if industry:
            queryset = queryset.filter(industry__iexact=industry)
        if country:
            queryset = queryset.filter(country__iexact=country)

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        instance = serializer.save()
        _create_activity_log(request=self.request, action_type=ActivityLog.ActionType.CREATE, instance=instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        _create_activity_log(
            request=self.request,
            action_type=ActivityLog.ActionType.UPDATE,
            instance=instance,
            metadata={'updated_fields': list(serializer.validated_data.keys())},
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted', 'updated_at'])
        _create_activity_log(request=request, action_type=ActivityLog.ActionType.DELETE, instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ContactViewSet(OrganizationScopedQuerysetMixin, viewsets.ModelViewSet):
    queryset = Contact.objects.filter(is_deleted=False).select_related('company').order_by('-created_at')
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated, ContactRBACPermission]
    organization_field = 'organization'

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        company_id = self.request.query_params.get('company_id')
        role = self.request.query_params.get('role')

        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
                | Q(role__icontains=search)
            )
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if role:
            queryset = queryset.filter(role__iexact=role)

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        instance = serializer.save()
        _create_activity_log(request=self.request, action_type=ActivityLog.ActionType.CREATE, instance=instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        _create_activity_log(
            request=self.request,
            action_type=ActivityLog.ActionType.UPDATE,
            instance=instance,
            metadata={'updated_fields': list(serializer.validated_data.keys())},
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted', 'updated_at'])
        _create_activity_log(request=request, action_type=ActivityLog.ActionType.DELETE, instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
