from rest_framework import permissions
from rest_framework.permissions import SAFE_METHODS


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
