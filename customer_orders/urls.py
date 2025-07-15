from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.customer_order_create, name='customer_order_create'),
    path('records/', views.customer_order_records, name='customer_order_records'),
    path('detail/<int:order_id>/', views.order_detail, name='order_detail'),
    path('delete/<int:order_id>/', views.order_delete, name='order_delete'),
]