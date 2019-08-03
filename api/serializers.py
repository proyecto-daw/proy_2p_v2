from django.contrib.auth.models import Group
from .models import *
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', "courses", "friends", "career", "blocked", "saved_events"]


class RouteSerializer(serializers.HyperlinkedModelSerializer):
    def to_representation(self, value):
        return {"target_name": value.target.name, "target_pk": value.target.pk, "distance": value.distance}


class WaypointSerializer(serializers.HyperlinkedModelSerializer):
    neighbor_waypoints = RouteSerializer(source="source", many=True)

    class Meta:
        model = Waypoint
        fields = '__all__'


class AreaSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Area
        fields = '__all__'


class SubjectSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class CourseSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class SessionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Session
        fields = "__all__"


class EventSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"


class TrackingRequestSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = TrackingRequest
        fields = "__all__"
