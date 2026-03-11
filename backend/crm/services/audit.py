from django.contrib.auth.models import AnonymousUser

from crm.models import ActivityLog


def log_model_action(*, user, action_type: str, instance, metadata: dict | None = None) -> ActivityLog:
    """
    Persist a structured audit record for model mutations.
    """
    actor = None if isinstance(user, AnonymousUser) else user
    return ActivityLog.objects.create(
        organization=instance.organization,
        user=actor,
        action_type=action_type,
        model_name=instance.__class__.__name__,
        object_id=str(instance.pk),
        metadata=metadata or {},
    )
