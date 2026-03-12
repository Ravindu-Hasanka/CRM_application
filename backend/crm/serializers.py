from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import ActivityLog, Company, Contact, Organization, User

UserModel = get_user_model()


class CRMTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['organization_id'] = user.organization_id
        return token


class UserMeSerializer(serializers.ModelSerializer):
    organization_name = serializers.SerializerMethodField()
    organization_logo = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = (
            'id',
            'email',
            'username',
            'organization_id',
            'organization_name',
            'organization_logo',
            'role',
            'is_active',
            'created_at',
        )

    def get_organization_name(self, obj):
        return obj.organization.name if obj.organization else None

    def get_organization_logo(self, obj):
        if not obj.organization or not obj.organization.logo:
            return None
        request = self.context.get('request')
        url = obj.organization.logo.url
        return request.build_absolute_uri(url) if request else url


class OrganizationMeSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ('id', 'name', 'subscription_plan', 'logo', 'logo_url', 'created_at')
        read_only_fields = ('id', 'created_at', 'subscription_plan')

    def get_logo_url(self, obj):
        if not obj.logo:
            return None
        request = self.context.get('request')
        url = obj.logo.url
        return request.build_absolute_uri(url) if request else url


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = UserModel
        fields = ('id', 'email', 'username', 'password', 'organization', 'role', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        request = self.context['request']
        actor = request.user
        target_role = attrs.get('role', User.Role.STAFF)
        target_org = attrs.get('organization')

        # For organization-scoped actors, default to their own org when omitted.
        if actor.role in {User.Role.ADMIN, User.Role.MANAGER} and target_org is None:
            attrs['organization'] = actor.organization
            target_org = actor.organization

        if actor.role != User.Role.SYSTEM_ADMIN and target_role == User.Role.SYSTEM_ADMIN:
            raise serializers.ValidationError('Only system admin can create system admins.')

        if actor.role == User.Role.MANAGER:
            if target_role != User.Role.STAFF:
                raise serializers.ValidationError('Managers can create only staff users.')
            if target_org != actor.organization:
                raise serializers.ValidationError('Managers can create users only in their own organization.')

        if actor.role == User.Role.ADMIN:
            if target_role not in {User.Role.MANAGER, User.Role.STAFF}:
                raise serializers.ValidationError('Organization admins can create manager/staff users only.')
            if target_org != actor.organization:
                raise serializers.ValidationError('Organization admins can create users only in their own organization.')

        if target_role == User.Role.SYSTEM_ADMIN and target_org is not None:
            raise serializers.ValidationError('System admin cannot be assigned to an organization.')

        if target_role != User.Role.SYSTEM_ADMIN and target_org is None:
            raise serializers.ValidationError('Organization is required for non-system users.')

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = UserModel.objects.create_user(password=password, **validated_data)
        return user


class OrganizationCreateSerializer(serializers.ModelSerializer):
    admin_email = serializers.EmailField(write_only=True)
    admin_password = serializers.CharField(write_only=True, min_length=8)
    admin_username = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Organization
        fields = ('id', 'name', 'subscription_plan', 'created_at', 'admin_email', 'admin_password', 'admin_username')
        read_only_fields = ('id', 'created_at')

    def create(self, validated_data):
        admin_email = validated_data.pop('admin_email')
        admin_password = validated_data.pop('admin_password')
        admin_username = validated_data.pop('admin_username', '') or None

        organization = self.Meta.model.objects.create(**validated_data)
        UserModel.objects.create_user(
            email=admin_email,
            username=admin_username,
            password=admin_password,
            organization=organization,
            role=User.Role.ADMIN,
            is_active=True,
        )
        return organization


class CompanySerializer(serializers.ModelSerializer):
    organization_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Company
        fields = (
            'id',
            'organization',
            'organization_id',
            'name',
            'industry',
            'country',
            'logo',
            'is_deleted',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'is_deleted', 'created_at', 'updated_at', 'organization_id')
        extra_kwargs = {
            'organization': {'required': False},
        }

    def validate(self, attrs):
        request = self.context['request']
        actor = request.user
        organization = attrs.get('organization')

        if actor.role != User.Role.SYSTEM_ADMIN:
            if organization and organization != actor.organization:
                raise serializers.ValidationError('You can only manage companies in your own organization.')
            attrs['organization'] = actor.organization
        elif not organization and self.instance is None:
            raise serializers.ValidationError('Organization is required for system admin company creation.')

        return attrs


class ContactSerializer(serializers.ModelSerializer):
    organization_id = serializers.IntegerField(read_only=True)
    phone = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = Contact
        fields = (
            'id',
            'organization',
            'organization_id',
            'company',
            'company_id',
            'full_name',
            'email',
            'phone',
            'role',
            'is_deleted',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'is_deleted', 'created_at', 'updated_at', 'organization_id', 'company_id')
        extra_kwargs = {
            'organization': {'required': False},
        }

    def validate(self, attrs):
        request = self.context['request']
        actor = request.user
        company = attrs.get('company') or getattr(self.instance, 'company', None)
        organization = attrs.get('organization')

        if not company:
            raise serializers.ValidationError('Company is required.')

        if actor.role != User.Role.SYSTEM_ADMIN:
            if company.organization_id != actor.organization_id:
                raise serializers.ValidationError('You can only manage contacts in your own organization.')
            if organization and organization != actor.organization:
                raise serializers.ValidationError('Organization must match your organization.')
            attrs['organization'] = actor.organization
        else:
            if not organization and self.instance is None:
                attrs['organization'] = company.organization

        if attrs.get('organization') != company.organization:
            raise serializers.ValidationError('Contact organization must match company organization.')

        return attrs

    def validate_phone(self, value):
        if value == '':
            return value
        if not value.isdigit() or not 8 <= len(value) <= 15:
            raise serializers.ValidationError('Phone must contain 8-15 digits.')
        return value


class ActivityLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = (
            'id',
            'organization_id',
            'user_id',
            'user_email',
            'action_type',
            'model_name',
            'object_id',
            'timestamp',
            'metadata',
        )

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
