from django.contrib.auth.models import Group
from .models import *
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', "pk", 'username', 'email', "courses", "friends", "career", "blocked", "saved_events", "is_staff", "name"]


class RouteSerializer(serializers.HyperlinkedModelSerializer):
    def to_representation(self, value):
        return {"target_name": value.target.name, "target_pk": value.target.pk, "distance": value.distance}


class WaypointSerializer(serializers.HyperlinkedModelSerializer):
    neighbor_waypoints = RouteSerializer(source="source", many=True, read_only=True)

    class Meta:
        model = Waypoint
        fields = ('url', 'pk', 'neighbor_waypoints', 'latitude', 'longitude', 'name', 'description')


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
    closest_waypoint_pk = serializers.ReadOnlyField(source="closest_waypoint.pk")
    closest_waypoint = serializers.PrimaryKeyRelatedField(write_only=True, queryset=Waypoint.objects.all(), required=True)

    class Meta:
        model = Event
        fields = ("url", "pk", "name", "place", "start_datetime", "closest_waypoint_pk", "closest_waypoint")


class TrackingRequestSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = TrackingRequest
        fields = "__all__"
