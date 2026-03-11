from django.contrib import admin

from .models import ActivityLog, Company, Contact, Organization, User

admin.site.register(Organization)
admin.site.register(User)
admin.site.register(Company)
admin.site.register(Contact)
admin.site.register(ActivityLog)
