from django.contrib.auth import get_user_model
from django.db.models import Q
from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import generics, status, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
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
    OrganizationMeSerializer,
    UserCreateSerializer,
    UserMeSerializer,
)
from .services.audit import log_model_action

UserModel = get_user_model()


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
        serializer = UserMeSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class OrganizationMeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @extend_schema(
        tags=['Organization'],
        summary='Get current user organization',
        responses={200: OrganizationMeSerializer},
    )
    def get(self, request):
        if not request.user.organization:
            return Response({'detail': 'No organization associated with this user.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = OrganizationMeSerializer(request.user.organization, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        tags=['Organization'],
        summary='Update current user organization logo',
        request=OrganizationMeSerializer,
        responses={200: OrganizationMeSerializer},
    )
    def patch(self, request):
        if not request.user.organization:
            return Response({'detail': 'No organization associated with this user.'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user.role not in {User.Role.ADMIN, User.Role.SYSTEM_ADMIN}:
            return Response({'detail': 'You do not have permission to update organization logo.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = OrganizationMeSerializer(
            request.user.organization,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
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


class ActivityLogViewSet(OrganizationScopedQuerysetMixin, viewsets.ReadOnlyModelViewSet):
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
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(tags=['Activity Logs'], summary='Get audit log entry detail')
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


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
        log_model_action(user=self.request.user, action_type=ActivityLog.ActionType.CREATE, instance=instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        log_model_action(
            user=self.request.user,
            action_type=ActivityLog.ActionType.UPDATE,
            instance=instance,
            metadata={'updated_fields': list(serializer.validated_data.keys())},
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted', 'updated_at'])
        log_model_action(user=request.user, action_type=ActivityLog.ActionType.DELETE, instance=instance)
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
        log_model_action(user=self.request.user, action_type=ActivityLog.ActionType.CREATE, instance=instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        log_model_action(
            user=self.request.user,
            action_type=ActivityLog.ActionType.UPDATE,
            instance=instance,
            metadata={'updated_fields': list(serializer.validated_data.keys())},
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        instance.is_deleted = True
        instance.save(update_fields=['is_deleted', 'updated_at'])
        log_model_action(user=request.user, action_type=ActivityLog.ActionType.DELETE, instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
