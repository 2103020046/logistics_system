# Generated by Django 5.1.5 on 2025-03-31 03:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0014_alter_item_delivery_charge_alter_item_goods_value_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='company_name',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='公司名称'),
        ),
    ]
