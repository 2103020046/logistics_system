# orders/urls.py
from django.urls import path
from . import views
from .views import export_orders

urlpatterns = [
    path('', views.index, name='index'),
    path('order/', views.orders, name='order'),
    path('api/orders/', views.create_order, name='create_order'),
    path('history/', views.order_history, name='order_history'),
    path('api/orders/<int:order_id>/', views.get_order_detail, name='order_detail'),
    path('orders/edit/<int:order_id>/', views.edit_order, name='edit_order'),
    path('orders/delete/<int:order_id>/', views.delete_order, name='delete_order'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('orders/export/', export_orders, name='export_orders'),
    path('api/orders/today_count/', views.get_today_order_count, name='today_order_count'),
]
