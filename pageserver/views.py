from django.contrib.auth import authenticate, logout
from django.shortcuts import render, redirect
from django.core.mail import EmailMessage
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
            asunto = str(formulario.cleaned_data.get("nombres"))+" "+str(formulario.cleaned_data.get("apellidos"))\
                     +" quiere contactartese contigo"

            datos ="    Nombres:               {0}\n " \
                    "   Apellidos:             {1}\n " \
                    "   Correo electronico:    {2}\n " \
                    "   Fecha de Nacimiento:   {3}\n " \
                    "   Lugar de Origen:       {4}\n" \
                    "   Comentarios:           {5}\n".format(
                formulario.cleaned_data.get("nombres"),
                formulario.cleaned_data.get("apellidos"),
                formulario.cleaned_data.get("correo"),
                formulario.cleaned_data.get("fecha_de_nacimiento"),
                formulario.cleaned_data.get("lugar_origen"),
                formulario.cleaned_data.get("comentarios"))

            mensaje = "!!Una persona a escrito para contactarse!!"+"\n " \
                        "Y nos a dejado los siguientes datos: \n \n \n"+datos

            mode = ModelForm.create(formulario.cleaned_data.get("nombres"),
                            formulario.cleaned_data.get("apellidos"),
                            formulario.cleaned_data.get("correo"),
                            formulario.cleaned_data.get("fecha_de_nacimiento"),
                            formulario.cleaned_data.get("lugar_origen"),
                            formulario.cleaned_data.get("comentarios"))

            mail = EmailMessage(asunto, mensaje,to=['nexusmap2019@gmail.com'])
            mail.send()
            mode.save()
            return render(request,"pageserver/contactusAgradecimiento.html")
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
