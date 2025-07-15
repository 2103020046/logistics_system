from django.contrib import admin
from .models import Consultation

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'phone', 'cargo_type', 'created_at', 'is_processed')
    list_filter = ('is_processed', 'created_at')
    search_fields = ('company_name', 'phone', 'content')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
