from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, logout
from django.contrib.auth.decorators import login_required
from django.forms import ModelForm
from django.http import HttpResponse, Http404
from django.shortcuts import render, redirect, HttpResponseRedirect, render_to_response, get_object_or_404
from django.core.mail import EmailMessage, send_mail
from django.urls import reverse

from pageserver.models import *

from django.views.generic import DetailView, CreateView, UpdateView, DeleteView
from api.models import Group, Membership, User

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


@staff_member_required
def admin_home(request):
    return render(request, "pageserver/admin.html")


@staff_member_required
def admin_users(request):
    return render(request, "pageserver/admin-users.html")


@staff_member_required
def admin_places(request):
    return render(request, "pageserver/admin-places.html")


@staff_member_required
def admin_events(request):
    return render(request, "pageserver/admin-events.html")


@staff_member_required
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


@login_required
def user_profile(request):
    return render(request, "pageserver/user-profile.html")


def visits_by_page(request):
    return render(request, "pageserver/report-visits-by-page.html", {"url": "?period=" + request.GET["period"]})


def visits_by_time_period(request):
    DELTA_TO_HOURS = {"1h": 1, "12h": 12, "1d": 24}
    return render(request, "pageserver/report-visits-by-time-period.html",
                  {"url": "?limit=" + request.GET["limit"] + "&period=" + request.GET["period"],
                   "deltaHours": DELTA_TO_HOURS[request.GET["period"]]})


class GroupDetailView(DetailView):
    model = Group
    template_name = "pageserver/group_detail.html"
    context_object_name = 'group'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        context['is_group_manager'] = self.request.user.memberships.get(group=self.object).is_group_manager
        return context


class GroupCreateView(CreateView):
    model = Group
    template_name = 'pageserver/group_create.html'

    fields = ["name"]

    def get_success_url(self):
        return reverse("user_profile")

    def form_valid(self, form):
        self.object = form.save()

        self.object.memberships.create(user=self.request.user, is_group_manager=True)

        return HttpResponseRedirect(self.get_success_url())


class GroupUpdateView(UpdateView):
    model = Group
    context_object_name = 'group'
    template_name = "pageserver/group_edit.html"

    def get_object(self, queryset=None):
        """ Hook to ensure object is owned by request.user. """
        obj = super(GroupUpdateView, self).get_object()
        if not self.request.user.memberships.get(group=obj).is_group_manager:
            raise Http404
        return obj

    def get_success_url(self):
        return reverse("group_detail", kwargs={"pk": self.object.pk})

    fields = ['name']


class GroupMemberAddView(CreateView):
    model = Membership
    context_object_name = 'membership'
    template_name = "pageserver/group_member_add.html"

    fields = ["is_group_manager"]

    def form_valid(self, form):
        form.instance.group = get_object_or_404(Group, pk=self.kwargs["group_pk"])
        form.instance.user = get_object_or_404(User, email=form.data["user_email"])
        return super(GroupMemberAddView, self).form_valid(form)

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        context['group'] = get_object_or_404(Group, pk=self.kwargs["group_pk"])
        return context

    def get_success_url(self):
        return reverse("user_profile")


class GroupDeleteView(DeleteView):
    model = Group
    context_object_name = 'group'
    template_name = "pageserver/group_delete.html"

    def get_success_url(self):
        return reverse("user_profile")

    def get_object(self, queryset=None):
        """ Hook to ensure object is owned by request.user. """
        obj = super(GroupDeleteView, self).get_object()
        if not self.request.user.memberships.get(group=obj).is_group_manager:
            raise Http404
        return obj
