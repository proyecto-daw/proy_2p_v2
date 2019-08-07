from django.contrib.auth import authenticate, logout
from django.http import HttpResponse, Http404
from django.shortcuts import render, redirect

# Create your views here.
from django.views.decorators.csrf import csrf_exempt


def aboutus(request):
    return render(request, "pageserver/aboutus.html")


def home(request):
    return render(request, "pageserver/index.html")


def view_events(request):
    return render(request, "pageserver/events.html")


def contacts(request):
    return render(request, "pageserver/contacts.html")


def quehacemos(request):
    return render(request, "pageserver/quehacemos.html")


def admin_home(request):
    return render(request, "pageserver/admin.html")


def admin_users(request):
    return render(request, "pageserver/admin-users.html")


def admin_places(request):
    return render(request, "pageserver/admin-places.html")


def admin_events(request):
    return render(request, "pageserver/admin-events.html")


def admin_routes(request):
    return render(request, "pageserver/admin-add-route.html")


def contactus(request):
    if request.method == 'POST':
        print(request.POST["firstName"])
    return render(request, "pageserver/contactus.html")


def team(request):
    return render(request, "pageserver/team.html")


def news(request):
    return render(request, "pageserver/news.html")


from django.contrib import auth


@csrf_exempt
def login(request):
    if request.method == "POST":
        username = request.POST['inputEmail']
        password = request.POST['inputPassword']
        user = auth.authenticate(request, username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect("index")
        else:
            return render(request, "pageserver/login.html")
    else:
        return render(request, "pageserver/login.html")


def logout_view(request):
    logout(request)
    return redirect("index")


def register(request):
    return render(request, "pageserver/register.html")


def user_profile(request):
    return render(request, "pageserver/user-profile.html")
