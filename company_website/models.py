from django.db import models

class Consultation(models.Model):
    company_name = models.CharField('公司名称', max_length=100)
    cargo_type = models.CharField('货物类型', max_length=100)
    phone = models.CharField('联系电话', max_length=20)
    content = models.TextField('咨询内容')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    is_processed = models.BooleanField('已处理', default=False)

    class Meta:
        verbose_name = '咨询记录'
        verbose_name_plural = '咨询记录'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company_name} - {self.phone}"
