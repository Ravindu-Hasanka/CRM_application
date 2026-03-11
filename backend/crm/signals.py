from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .bootstrap import ensure_system_admin


@receiver(post_migrate)
def ensure_system_admin_post_migrate(sender, **kwargs):
    if sender.name != 'crm':
        return

    ensure_system_admin()
