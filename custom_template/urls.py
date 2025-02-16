from django.urls import path
from . import views

app_name = 'custom_template'

urlpatterns = [
    path('editor/', views.template_editor, name='editor'),
    path('list/', views.template_list, name='template_list'),
    path('delete/<int:template_id>/', views.delete_template, name='delete_template'),
    path('api/templates/', views.template_list_api, name='template_list_api'),
    path('api/templates/<int:template_id>/', views.template_detail_api, name='template_detail_api'),
]
