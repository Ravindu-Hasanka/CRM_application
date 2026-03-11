from rest_framework.permissions import BasePermission

from .models import User


class TenantObjectPermissionMixin:
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == User.Role.SYSTEM_ADMIN:
            return True
        return getattr(obj, 'organization_id', None) == user.organization_id


class IsSystemAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.SYSTEM_ADMIN
        )


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class IsManagerRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.MANAGER)


class IsStaffRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.STAFF)


class IsAdminOrManagerRole(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in {User.Role.SYSTEM_ADMIN, User.Role.ADMIN, User.Role.MANAGER}


class CompanyRBACPermission(TenantObjectPermissionMixin, BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        if request.method in ('PUT', 'PATCH', 'POST'):
            return user.role in {User.Role.SYSTEM_ADMIN, User.Role.ADMIN, User.Role.MANAGER}

        if request.method == 'DELETE':
            return user.role in {User.Role.SYSTEM_ADMIN, User.Role.ADMIN}

        return False


class ContactRBACPermission(TenantObjectPermissionMixin, BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        if request.method in ('PUT', 'PATCH', 'POST'):
            return user.role in {
                User.Role.SYSTEM_ADMIN,
                User.Role.ADMIN,
                User.Role.MANAGER,
                User.Role.STAFF,
            }

        if request.method == 'DELETE':
            return user.role in {User.Role.SYSTEM_ADMIN, User.Role.ADMIN}

        return False
