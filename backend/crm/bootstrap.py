import os

from django.contrib.auth import get_user_model
from django.db import OperationalError, ProgrammingError

from .models import User


def ensure_system_admin() -> None:
    email = os.getenv('SYSTEM_ADMIN_EMAIL')
    password = os.getenv('SYSTEM_ADMIN_PASSWORD')
    if not email or not password:
        return

    user_model = get_user_model()
    if user_model.objects.filter(email=email).exists():
        return

    user_model.objects.create_superuser(
        email=email,
        password=password,
        role=User.Role.SYSTEM_ADMIN,
        organization=None,
    )


def ensure_system_admin_safe() -> None:
    try:
        ensure_system_admin()
    except (OperationalError, ProgrammingError):
        # DB may not be migrated/available yet during startup.
        return
