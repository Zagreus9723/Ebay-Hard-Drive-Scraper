from django.contrib import admin
from django.urls import path
from . import views
from django.shortcuts import redirect
app_name = 'computer_parts'

def hard_drives_redirect(request):
    return redirect('tech:hard_drives')

urlpatterns = [
    path('home/', views.homepage, name='home'),
    path('', views.hard_drives, name='hard_drives'),
    # path('hard_drives/', views.hard_drives, name='hard_drives'),
]