"""
URL configuration for logistics_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
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

# logistics_system/urls.py
from django.contrib import admin
from django.urls import include, path

app_name = ['orders', 'custom_template']


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('orders.urls')),
    path('company_website/', include('company_website.urls')),  # 公司官网URL
    path('custom_template/', include('custom_template.urls')),
    path('customer_order/', include('customer_orders.urls')),
]
