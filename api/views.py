from django.db.models import Q
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect

# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from datetime import datetime as ddt

from django.contrib.auth.models import Group

from api.permissions import *
from .models import *
from api.serializers import *
from rest_framework import permissions

from influxdb import InfluxDBClient


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


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsManagerOfGroup]

    def get_serializer_context(self):
        return {'request': self.request}

    def get_queryset(self):
        if self.request.user.is_anonymous:
            return []
        return self.queryset.filter(members__in=[self.request.user])


@csrf_exempt
def get_friends_groups(request):
    if request.user.is_authenticated:
        return JsonResponse({"friends": [f.to_friend_dict() for f in request.user.friends.all()],
                             "groups": [g.to_dict(request.user) for g in request.user.group_set.all()]})
    else:
        return JsonResponse({"friends": [], "groups": []})


def search_people(request):
    if request.user.is_authenticated:
        term = request.GET["query"]
        candidates = User.objects.exclude(friends__in=[request.user]).filter(blocked=False).filter(
            Q(name__icontains=term) | Q(email__icontains=term))
        return JsonResponse({"found": [f.to_search_dict() for f in candidates]})
    else:
        return JsonResponse({"found": []})


@csrf_exempt
def add_friend(request):
    if request.user.is_authenticated:
        request.user.friends.add(User.objects.get(email=request.POST["friend"]))
        request.user.save()
        return JsonResponse({"status": "OK"})
    else:
        return JsonResponse({"status": "ERROR"})


@csrf_exempt
def remove_friend(request):
    if request.user.is_authenticated:
        request.user.friends.remove(User.objects.get(email=request.POST["no_longer_friend"]))
        request.user.save()
        return JsonResponse({"status": "OK"})
    else:
        return JsonResponse({"status": "ERROR"})


from icalendar import Calendar
import datetime
import re


def removePracticals(classes):
    nonDupes = []
    for x in classes:
        hasDupe = False
        for y in nonDupes:
            if x.course.subject.name == y.course.subject.name and x.day == y.day:
                hasDupe = True
                x.delete()
        if not hasDupe:
            nonDupes.append(x)
    return nonDupes


def extractCourseParallel(text):
    regex = re.compile(r"^(\w+)\s+-\s+(.+)Paralelo N. (\d+) Aula: (.+)$")
    groups = regex.search(text)
    return groups[2].strip(), groups[3].strip()


def magicFindClosestWp(classroom: str):
    # HACK: do something to recognize more classrooms???
    if classroom.startswith("A-"):
        return 2
    if classroom.startswith("15A-"):
        return 1
    if classroom.startswith("16A-"):
        return 20
    if classroom.startswith("27-"):
        return 21
    if classroom.startswith("47"):
        return 22
    if classroom.startswith("BA"):
        return 13
    if classroom.startswith("31B"):
        return 12
    if classroom in ("COM1", "COM2"):
        return 11
    if classroom in ("ANDRÓMEDA", "ORIÓN", "CENTAURO", "PHOENIX"):
        return 19
    return 1


def findOrCreateSession(component):
    days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]
    subject, _ = Subject.objects.get_or_create(name=extractCourseParallel(component.get("description"))[0])
    parallel, _ = Course.objects.get_or_create(subject_id=subject.id,
                                               number=extractCourseParallel(component.get("description"))[1])
    dtstart = component.get('dtstart').dt - datetime.timedelta(hours=5)
    session, _ = Session.objects.get_or_create(course=parallel, day=days.index(component.get('rrule')['BYDAY'][0]),
                                               start_time=datetime.time(hour=dtstart.hour, minute=dtstart.minute),
                                               classroom=component.get('location'),
                                               closest_waypoint_id=magicFindClosestWp(component.get('location')))

    return session


@csrf_exempt
def upload_calendar(request):
    classes = []

    if request.user.is_authenticated:
        f = request.FILES["file"]
        f.seek(0)

        fcal = Calendar.from_ical(f.read())
        for component in fcal.walk():
            if component.name == "VEVENT":
                x = findOrCreateSession(component)
                if x not in classes:
                    classes.append(x)

        classes = removePracticals(classes)

        for x in classes:
            x.save()
            if x.course not in request.user.courses.all():
                request.user.courses.add(x.course)
                request.user.save()

    return redirect(request.POST["backurl"])


@csrf_exempt
def poll(request):
    if request.user.is_authenticated:
        tr_requests = []
        for tr in request.user.directed_questions.filter(state=TrackingRequest.REQUEST_CREATED):
            if tr.is_expired():
                tr.delete()
            else:
                tr.state = TrackingRequest.REQUEST_DELIVERED
                tr.save()
                tr_requests.append(tr)

        tr_responses = request.user.asked_questions.filter(state=TrackingRequest.REQUEST_GRANTED)
        for tr in tr_responses:
            tr.delete()

        return JsonResponse({"requests": [tr.to_dict_request() for tr in tr_requests],
                             "responses": [tr.to_dict_response() for tr in tr_responses]})
    else:
        return JsonResponse({"requests": [], "responses": []})


@csrf_exempt
def ask_position(request):
    if request.user.is_authenticated:
        target = User.objects.get(email=request.POST["friend_email"])
        if request.user not in target.friends.all():
            return JsonResponse({"status": "ERROR"})
        TrackingRequest.objects.create(target=target, source=request.user, message=request.POST.get("message", ""))
        return JsonResponse({"status": "OK"})
    else:
        return JsonResponse({"status": "ERROR"})


@csrf_exempt
def show_my_position(request):
    if request.user.is_authenticated:
        tr_request = TrackingRequest.objects.filter(target=request.user,
                                                    source__email=request.POST["friend_email"],
                                                    state=TrackingRequest.REQUEST_DELIVERED)[0]
        if request.POST["decision"] == "ACCEPT":
            tr_request.state = TrackingRequest.REQUEST_GRANTED
            tr_request.answer_latitude = request.POST["latitude"]
            tr_request.answer_longitude = request.POST["longitude"]
            tr_request.save()
        else:
            tr_request.delete()
        return JsonResponse({"status": "OK"})
    else:
        return JsonResponse({"status": "ERROR"})


@csrf_exempt
def signup(request):
    user = User.objects.create_user(username=request.POST["USERNAME"],
                                    name=request.POST["NAMES"] + " " + request.POST["LASTNAMES"],
                                    email=request.POST["EMAIL"],
                                    password=request.POST["PASSWORD"],
                                    career=request.POST["CAREER"])
    user.save()
    return JsonResponse({"members": [user.to_dict()]})


@csrf_exempt
def my_classes(request):
    if request.user.is_authenticated:
        today_index = ddt.today().isoweekday()  # Monday is 1 and Sunday is 7
        return JsonResponse(
            {"classes": [s.to_dict() for c in request.user.courses.all() for s in c.session_set.all() if
                         s.day == today_index]})
    else:
        return JsonResponse({"classes": []})


@csrf_exempt
def my_events(request):
    if request.user.is_authenticated:
        return JsonResponse(
            {"events": {e.id: e.to_dict()
                        for e in request.user.saved_events.all().order_by("start_datetime")
                        if e.start_datetime > timezone.now()}
             })
    else:
        return JsonResponse({"events": []})


@csrf_exempt
def add_my_event(request):
    if request.user.is_authenticated:
        ev = Event.objects.get(id=request.POST["event"])
        request.user.saved_events.add(ev)
        request.user.save()
        return JsonResponse({"status": "OK"})
    else:
        return JsonResponse({"status": "ERROR"})


@csrf_exempt
def remove_my_event(request):
    if request.user.is_authenticated:
        ev = Event.objects.get(id=request.POST["event"])
        request.user.saved_events.remove(ev)
        request.user.save()
        return JsonResponse({"status": "OK"})
    else:
        return JsonResponse({"status": "ERROR"})


@csrf_exempt
def admin_add_route(request):
    if request.user.is_staff:
        source = Waypoint.objects.get(id=request.POST["source"])
        target = Waypoint.objects.get(id=request.POST["target"])
        x = Route.objects.filter(source=source, target=target)
        if x.count():  # Route already exists
            x[0].distance = request.POST["distance"]
            x.save()
            y = Route.objects.filter(source=target, target=source)[0]
            y.distance = request.POST["distance"]
            y.save()
        else:  # Route does not exist, create it
            Route.objects.create(source=source, target=target, distance=request.POST["distance"])
            Route.objects.create(source=target, target=source, distance=request.POST["distance"])
        return JsonResponse({"result": "OK"})
    else:
        return JsonResponse({"result": "ERROR"})


@csrf_exempt
def ping(request):
    username = request.user.username if request.user.is_authenticated else "anonymous"

    client = InfluxDBClient("ec2-18-233-170-234.compute-1.amazonaws.com", 8086, "***", "***", "hits")
    client.write_points(
        [{"measurement": "visit", "tags": {"page": request.POST["page"]}, "fields": {"user": username}}])
    return HttpResponse()


def visits_by_page(request):
    if not request.user.is_staff:
        return HttpResponse(status=403)

    client = InfluxDBClient("ec2-18-233-170-234.compute-1.amazonaws.com", 8086, "***", "***", "hits")
    hits = client.query(
        f"SELECT count(*) as visits FROM \"hits\"..\"visit\" WHERE time > now() - {request.GET['period']} GROUP BY page")

    return JsonResponse([(k[1]["page"], next(v)["visits_user"]) for k, v in hits.items()], safe=False)


def visits_by_time_period(request):
    if not request.user.is_staff:
        return HttpResponse(status=403)

    client = InfluxDBClient("ec2-18-233-170-234.compute-1.amazonaws.com", 8086, "***", "***", "hits")
    hits = client.query(
        f"SELECT count(*) as visits FROM \"hits\"..\"visit\" WHERE time > now() - {request.GET['limit']} GROUP BY time({request.GET['period']})")

    return JsonResponse(list(hits.get_points()), safe=False)


def bargraph_stats(request):
    return JsonResponse(
        {"events": {"complete": Event.objects.filter(start_datetime__lt=datetime.datetime.now()).count(),
                    "saved": Event.objects.filter(users_who_saved__isnull=False).count(),
                    "all": Event.objects.all().count()},
         "users": {"loggedIn": User.objects.filter(
             last_login__gte=datetime.datetime.now() - datetime.timedelta(days=2)).count(),
                   "all": User.objects.all().count()}})
