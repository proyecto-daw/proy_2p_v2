from django.contrib import admin

# Register your models here.
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm

from api.models import *


class MyUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User


class MyUserAdmin(UserAdmin):
    form = MyUserChangeForm

    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('name', 'career', 'courses', 'friends', 'blocked', 'saved_events',)}),
    )


admin.site.register(User, MyUserAdmin)


class RouteInlineAdmin(admin.TabularInline):
    model = Route
    fk_name = "source"
    extra = 1


@admin.register(Waypoint)
class WaypointAdmin(admin.ModelAdmin):
    inlines = [RouteInlineAdmin]


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    pass


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    pass


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    pass


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    pass


@admin.register(TrackingRequest)
class TrackingRequestAdmin(admin.ModelAdmin):
    pass


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    pass


class MembershipInlineAdmin(admin.TabularInline):
    model = Membership
    extra = 1


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    inlines = [MembershipInlineAdmin]

