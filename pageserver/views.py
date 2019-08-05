from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
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


def contactus(request):
    if request.method == 'POST':
        print(request.POST["firstName"])
    return render(request, "pageserver/contactus.html")


def team(request):
    return render(request, "pageserver/team.html")


def news(request):
    return render(request, "pageserver/news.html")


def login(request):
    return render(request, "pageserver/login.html")

def register(request):
    return render(request, "pageserver/register.html")


def user_profile(request):
    return render(request, "pageserver/user-profile.html")
