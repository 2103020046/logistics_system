# Generated by Django 5.1.5 on 2025-07-24 10:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('customer_orders', '0005_alter_customerorder_delivery_method_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='customerorder',
            options={'verbose_name': '客户下单', 'verbose_name_plural': '客户下单'},
        ),
    ]
