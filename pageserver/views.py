from django.contrib.auth import authenticate, logout
from django.http import HttpResponse, Http404
from django.shortcuts import render, redirect, HttpResponseRedirect, render_to_response
from django.core.mail import EmailMessage, send_mail
from pageserver.models import *

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
        formulario = FormularioContactanos(request.POST)
        if formulario.is_valid():
            asunto = "Alguien quiere contactartese contigo"
            mensaje = "Una persona te a escrito!!"
            '''
            mail = EmailMessage(asunto, mensaje,to=['nexusmap2019@gmail.com'])
            mail.send()
            '''
            send_mail(
                asunto,
                mensaje,
                'nexusmap2019@gmail.com',
                ['nexusmap2019@gmail.com'],
                fail_silently=False,
            )
            return HttpResponseRedirect('/')
    else:
        formulario = FormularioContactanos()
    return render(request, "pageserver/contactus.html", {'form': formulario})


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


def visits_by_page(request):
    return render(request, "pageserver/report-visits-by-page.html", {"url": "?period=" + request.GET["period"]})


def visits_by_time_period(request):
    DELTA_TO_HOURS = {"1h": 1, "12h": 12, "1d": 24}
    return render(request, "pageserver/report-visits-by-time-period.html",
                  {"url": "?limit=" + request.GET["limit"] + "&period=" + request.GET["period"],
                   "deltaHours": DELTA_TO_HOURS[request.GET["period"]]})
