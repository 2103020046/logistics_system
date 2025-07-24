from django.contrib import admin
from .models import FinanceRecord

@admin.register(FinanceRecord)
class FinanceRecordAdmin(admin.ModelAdmin):
    list_display = ('order', 'is_verified', 'verify_date')
    list_filter = ('is_verified',)
    search_fields = ('order__order_number',)
    raw_id_fields = ('order',)
