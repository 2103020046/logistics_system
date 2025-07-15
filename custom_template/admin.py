from django.contrib import admin
from .models import CustomTemplate

@admin.register(CustomTemplate)
class CustomTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
