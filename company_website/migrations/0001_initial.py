# Generated by Django 5.1.5 on 2025-07-15 06:34

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Consultation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company_name', models.CharField(max_length=100, verbose_name='公司名称')),
                ('cargo_type', models.CharField(max_length=100, verbose_name='货物类型')),
                ('phone', models.CharField(max_length=20, verbose_name='联系电话')),
                ('content', models.TextField(verbose_name='咨询内容')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='创建时间')),
                ('is_processed', models.BooleanField(default=False, verbose_name='已处理')),
            ],
            options={
                'verbose_name': '咨询记录',
                'verbose_name_plural': '咨询记录',
                'ordering': ['-created_at'],
            },
        ),
    ]
