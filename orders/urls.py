# orders/urls.py
from django.urls import path
from . import views  # 确保导入了视图函数


urlpatterns = [
    path('', views.index, name='index'),
    path('order', views.orders, name='order'),
    path('api/orders/', views.create_order, name='create_order'),
    path('history/', views.order_history, name='order_history'),
    path('api/orders/<int:order_id>/', views.get_order_detail, name='order_detail'),
    path('orders/edit/<int:order_id>/', views.edit_order, name='edit_order'),
    path('orders/delete/<int:order_id>/', views.delete_order, name='delete_order'),

]
