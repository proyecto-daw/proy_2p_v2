from rest_framework import permissions
from rest_framework.permissions import SAFE_METHODS

from api.models import Membership


class IsAdminUserOrReadOnly(permissions.IsAdminUser):
    def has_permission(self, request, view):
        is_admin = super(
            IsAdminUserOrReadOnly,
            self).has_permission(request, view)
        # Python3: is_admin = super().has_permission(request, view)
        return request.method in SAFE_METHODS or is_admin


class IsInvolvedOnTrackingRequest(permissions.BasePermission):
    """
    Custom permission to only allow people involved in a TrackingRequest to view it.
    """

    def has_object_permission(self, request, view, obj):
        return request.user in (obj.source, obj.target)


class IsManagerOfGroup(permissions.BasePermission):
    """
        Custom permission to only allow managers of a Group to edit it.
        """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return Membership.objects.get(user=request.user, group=obj).is_group_manager
