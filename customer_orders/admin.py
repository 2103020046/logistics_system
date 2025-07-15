from django.contrib import admin
from .models import CustomerOrder

@admin.register(CustomerOrder)
class CustomerOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'shipper_name', 'receiver_name', 'status')
    list_filter = ('status', 'transport_type', 'payment_method')
    search_fields = ('order_number', 'shipper_name', 'receiver_name')
