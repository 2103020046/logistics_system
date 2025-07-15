from django.contrib import admin
from .models import Order, Item

class ItemInline(admin.TabularInline):
    model = Item
    extra = 1

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    inlines = [ItemInline]
    list_display = ('order_number', 'sender', 'receiver', 'date')
    search_fields = ('order_number', 'sender', 'receiver')

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'quantity', 'weight', 'order')
    list_filter = ('order',)
