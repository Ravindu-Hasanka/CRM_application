from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.db.models import Q


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Organization(models.Model):
    class SubscriptionPlan(models.TextChoices):
        BASIC = 'Basic', 'Basic'
        PRO = 'Pro', 'Pro'

    name = models.CharField(max_length=255)
    subscription_plan = models.CharField(
        max_length=20,
        choices=SubscriptionPlan.choices,
        default=SubscriptionPlan.BASIC,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class UserManager(BaseUserManager):
    def create_user(self, email: str, password: str | None = None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set.')
        email = self.normalize_email(email)
        role = extra_fields.get('role', User.Role.STAFF)
        organization = extra_fields.get('organization')
        if role == User.Role.SYSTEM_ADMIN and organization is not None:
            raise ValueError('System admin cannot be attached to an organization.')
        if role != User.Role.SYSTEM_ADMIN and organization is None:
            raise ValueError('Non-system users must belong to an organization.')
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.SYSTEM_ADMIN)
        extra_fields.setdefault('organization', None)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        SYSTEM_ADMIN = 'SystemAdmin', 'SystemAdmin'
        ADMIN = 'Admin', 'Admin'
        MANAGER = 'Manager', 'Manager'
        STAFF = 'Staff', 'Staff'

    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True,
    )
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STAFF)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    (Q(role='SystemAdmin') & Q(organization__isnull=True))
                    | (~Q(role='SystemAdmin') & Q(organization__isnull=False))
                ),
                name='crm_user_org_required_by_role',
            )
        ]

    def __str__(self) -> str:
        return self.email


class Company(TimeStampedModel):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name='companies',
    )
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=120)
    country = models.CharField(max_length=120)
    logo = models.FileField(upload_to='company_logos/', blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.name


class Contact(TimeStampedModel):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name='contacts',
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name='contacts',
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    role = models.CharField(max_length=120)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'email'],
                name='unique_contact_email_per_company',
            )
        ]

    def __str__(self) -> str:
        return f'{self.full_name} ({self.company.name})'


class ActivityLog(models.Model):
    class ActionType(models.TextChoices):
        CREATE = 'CREATE', 'CREATE'
        UPDATE = 'UPDATE', 'UPDATE'
        DELETE = 'DELETE', 'DELETE'

    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name='activity_logs',
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='activity_logs',
        null=True,
        blank=True,
    )
    action_type = models.CharField(max_length=10, choices=ActionType.choices)
    model_name = models.CharField(max_length=120)
    object_id = models.CharField(max_length=64)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self) -> str:
        return f'{self.action_type} {self.model_name}#{self.object_id}'
