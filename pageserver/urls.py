"""proy_2p_v2 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.home, name="index"),
    path('about-us', views.aboutus, name="aboutus"),
    path('events', views.view_events, name="view_events"),
    path('contacts', views.contacts, name="contacts"),
    path('que-hacemos', views.quehacemos, name="quehacemos"),
    path('admin-home', views.admin_home, name="admin_home"),
    path('contact-us', views.contactus, name="contactus"),
    path('team', views.team, name="team"),
    path('news', views.news, name="news"),
    path('login', views.login, name="login"),
    path('profile', views.user_profile, name="user_profile"),
    path('register', views.register, name="register"),
]
