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
    class Meta:
        model = UserModel
        fields = ('id', 'email', 'username', 'organization_id', 'role', 'is_active', 'created_at')


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
    class Meta:
        model = Company
        fields = (
            'id',
            'organization_id',
            'name',
            'industry',
            'country',
            'logo',
            'is_deleted',
            'created_at',
            'updated_at',
        )


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = (
            'id',
            'organization_id',
            'company_id',
            'full_name',
            'email',
            'phone',
            'role',
            'is_deleted',
            'created_at',
            'updated_at',
        )


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = (
            'id',
            'organization_id',
            'user_id',
            'action_type',
            'model_name',
            'object_id',
            'timestamp',
            'metadata',
        )
