from django.db.models import Q
from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets

from django.contrib.auth.models import Group

from api.permissions import *
from .models import *
from api.serializers import *
from rest_framework import permissions


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class WaypointViewSet(viewsets.ModelViewSet):
    queryset = Waypoint.objects.all()
    serializer_class = WaypointSerializer
    permission_classes = [IsAdminUserOrReadOnly]


class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [IsAdminUserOrReadOnly]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAdminUserOrReadOnly]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdminUserOrReadOnly]


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAdminUserOrReadOnly]


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAdminUserOrReadOnly]


class TrackingRequestViewSet(viewsets.ModelViewSet):
    queryset = TrackingRequest.objects.all()
    serializer_class = TrackingRequestSerializer
    permission_classes = [IsInvolvedOnTrackingRequest]

    def get_queryset(self):
        if self.request.user.is_anonymous:
            return []
        return self.queryset.filter(Q(source=self.request.user) | Q(target=self.request.user))
