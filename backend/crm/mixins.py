class OrganizationScopedQuerysetMixin:
    organization_field = 'organization'

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.role == user.Role.SYSTEM_ADMIN:
            return queryset

        filter_kwargs = {self.organization_field: user.organization}
        return queryset.filter(**filter_kwargs)
