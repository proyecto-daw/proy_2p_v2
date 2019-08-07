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

from api import views as api_views
from . import views

urlpatterns = [
    path('', views.home, name="index"),
    path('about-us', views.aboutus, name="aboutus"),
    path('events', views.view_events, name="view_events"),
    path('contacts', views.contacts, name="contacts"),
    path('que-hacemos', views.quehacemos, name="quehacemos"),
    path('admin-home', views.admin_home, name="admin_home"),
    path('admin-users', views.admin_users, name="admin_users"),
    path('admin-places', views.admin_places, name="admin_places"),
    path('admin-events', views.admin_events, name="admin_events"),
    path('admin-routes', views.admin_routes, name="admin_add_route"),

    path('contactus', views.contactus, name="contactus"),
    path('team', views.team, name="team"),
    path('news', views.news, name="news"),

    path('login', views.login, name="login"),
    path('logout', views.logout_view, name="logout"),
    path('profile', views.user_profile, name="user_profile"),
    path('register', views.register, name="register"),

    path('get_my_classes', api_views.my_classes, name="my_classes"),
    path('get_my_events', api_views.my_events, name="my_events"),
    path('add_my_event', api_views.add_my_event, name="add_my_event"),
    path('remove_my_event', api_views.remove_my_event, name="remove_my_event"),
    path('get_friends_groups', api_views.get_friends_groups, name="get_friends_groups"),
    path('search_people', api_views.search_people, name="search_people"),
    path('add_friend', api_views.add_friend, name="add_friend"),
    path('remove_friend', api_views.remove_friend, name="remove_friend"),
    path('upload_calendar', api_views.upload_calendar, name="upload_calendar"),
    path('poll', api_views.poll, name="poll"),
    path('ask_position', api_views.ask_position, name="ask_position"),
    path('publish_my_position', api_views.show_my_position, name="show_my_position"),
    path('add_new_route', api_views.admin_add_route, name="api_admin_add_route"),
]
