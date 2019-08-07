from datetime import timedelta, datetime

from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
from django.utils import timezone


class Waypoint(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    neighbor_waypoints = models.ManyToManyField("self", through="Route", symmetrical=False, blank=True)

    def __str__(self):
        return f"WP {self.name}"

    def to_dict(self):
        return [self.latitude, self.longitude, self.name,
                [[r.target.id, r.distance] for r in Route.objects.filter(source=self)]]


class Route(models.Model):
    source = models.ForeignKey(Waypoint, related_name="source", on_delete=models.CASCADE)
    target = models.ForeignKey(Waypoint, related_name="target", on_delete=models.CASCADE)
    distance = models.FloatField()


class Area(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius = models.FloatField()
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"Area {self.name}"

    def to_dict(self):
        return [self.latitude, self.longitude, self.name]


class Subject(models.Model):
    name = models.TextField(max_length=100)

    def __str__(self):
        return self.name


class Course(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    number = models.PositiveIntegerField()

    def to_dict(self):
        return {"NOMBRE": self.subject.name, "PARALELO": self.number}

    def __str__(self):
        return f"{self.subject.name}#{self.number}"


class Session(models.Model):
    classroom = models.CharField(max_length=100)
    closest_waypoint = models.ForeignKey(Waypoint, on_delete=models.PROTECT)
    day = models.PositiveIntegerField()
    start_time = models.TimeField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def to_dict(self):
        return {"NOMBRE": self.course.subject.name,
                "PARALELO": self.course.number,
                "AULA": self.classroom,
                "BLOQUE": self.closest_waypoint.id,
                "HORA": f"{self.start_time.hour}:{self.start_time.minute:02}"
                }

    def __str__(self):
        return f"Session of {self.course} on day #{self.day} at {self.start_time}"


class User(AbstractUser):
    name = models.CharField(max_length=200)
    career = models.CharField(max_length=100)
    courses = models.ManyToManyField(Course, blank=True)
    friends = models.ManyToManyField('self', blank=True)
    blocked = models.BooleanField(default=False)
    saved_events = models.ManyToManyField('Event', blank=True)

    def to_dict(self):
        response_dict = {"NAMES": self.name, "LASTNAMES": "", "USERNAME": self.username, "EMAIL": self.email,
                         "PASSWORD": self.password, "CAREER": self.career,
                         "MATERIAS": [course.to_dict() for course in self.courses.all()]}
        if self.is_staff:
            response_dict["ADMIN"] = "true"
        return response_dict

    def to_friend_dict(self):
        return {"NAMES": self.name, "LASTNAMES": "", "CAREER": self.career, "EMAIL": self.email}

    def to_admin_dict(self):
        return {"NAMES": self.name, "LASTNAMES": "", "USERNAME": self.username, "EMAIL": self.email,
                "CAREER": self.career, "BLOCKED": self.blocked, "ADMIN": self.is_staff, "ID": self.id}

    def to_search_dict(self):
        return {"NAMES": self.name, "LASTNAMES": "", "EMAIL": self.email, "ID": self.id}

    def __str__(self):
        return self.email


class TrackingRequest(models.Model):
    REQUEST_CREATED = 0
    REQUEST_DELIVERED = 1
    REQUEST_GRANTED = 2
    REQUEST_STATE_CHOICES = [
        (REQUEST_CREATED, "Created"),
        (REQUEST_DELIVERED, "Delivered"),
        (REQUEST_GRANTED, "Granted")
    ]

    target = models.ForeignKey(User, on_delete=models.CASCADE, related_name="directed_questions")
    source = models.ForeignKey(User, on_delete=models.CASCADE, related_name="asked_questions")
    state = models.IntegerField(choices=REQUEST_STATE_CHOICES, default=REQUEST_CREATED)
    message = models.TextField(null=True, blank=True)

    answer_latitude = models.FloatField(null=True, blank=True)
    answer_longitude = models.FloatField(null=True, blank=True)

    date_creation = models.DateTimeField(auto_now_add=True)
    date_last_update = models.DateTimeField(auto_now=True)

    def is_expired(self):
        return (self.date_last_update + timedelta(minutes=5)) < timezone.now()

    def to_dict_request(self):
        return {"CREADOR_EMAIL": self.source.email, "MENSAJE": self.message, "TIMESTAMP": self.date_creation}

    def to_dict_response(self):
        return {"OBJETIVO_EMAIL": self.target.email, "ESTADO": "OK", "TIMESTAMP": self.date_creation,
                "LATITUD": self.answer_latitude, "LONGITUD": self.answer_longitude}


class Event(models.Model):
    name = models.CharField(max_length=100)
    place = models.CharField(max_length=200)
    closest_waypoint = models.ForeignKey(Waypoint, related_name="events_closest", on_delete=models.CASCADE)
    start_datetime = models.DateTimeField()

    def to_dict(self):
        return [self.name, self.place, self.closest_waypoint.id, str(self.start_datetime)]

    def __str__(self):
        return f"Event {self.name} at {self.place}"


class Group(models.Model):
    name = models.CharField(max_length=100)
    creation_date = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField(User, through = "Membership")

    def to_dict(self):
        return {"name": self.name, "creation_date": self.creation_date, "pk": self.pk}

    def __str__(self):
        return f"Group {self.name}"


class Membership(models.Model):
    user = models.ForeignKey(User, related_name="memberships", on_delete=models.CASCADE)
    group = models.ForeignKey(Group, related_name="memberships", on_delete=models.CASCADE)
    is_group_manager = models.BooleanField(default=False)
    join_date = models.DateTimeField(auto_now_add=True)
