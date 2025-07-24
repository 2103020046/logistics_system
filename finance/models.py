from django.db import models
from orders.models import Order

class FinanceRecordManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().select_related('order')

class FinanceRecord(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='finance_record')
    is_verified = models.BooleanField(default=False, verbose_name="是否核销")
    verify_date = models.DateField(null=True, blank=True, verbose_name="核销日期")
    
    objects = FinanceRecordManager()
    
    class Meta:
        verbose_name = '财务记录'
        verbose_name_plural = '财务记录'
        ordering = ['-verify_date', 'order__order_number']  # 添加排序

    def __str__(self):
        return f"{self.order.order_number} - {'已核销' if self.is_verified else '未核销'}"
