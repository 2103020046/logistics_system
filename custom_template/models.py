from django.db import models
import json


class CustomTemplate(models.Model):
    name = models.CharField(max_length=255)
    content = models.TextField()  # 存储模板的 HTML 或文本内容
    field_positions = models.JSONField(default=dict)  # 存储字段的位置信息

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
