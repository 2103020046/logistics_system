from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('consultations/', views.consultation_list, name='consultation_list'),
]