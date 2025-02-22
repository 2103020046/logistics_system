# Generated by Django 5.1.5 on 2025-02-05 12:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_rename_product_no_order_product_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='arrival_station',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='到站地址'),
        ),
        migrations.AlterField(
            model_name='order',
            name='arrival_station_phone',
            field=models.CharField(default='000-000-0000', max_length=20, verbose_name='到站查询电话'),
        ),
        migrations.AlterField(
            model_name='order',
            name='departure_station',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='发站地址'),
        ),
        migrations.AlterField(
            model_name='order',
            name='departure_station_phone',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='发站查询电话'),
        ),
        migrations.AlterField(
            model_name='order',
            name='receiver_phone',
            field=models.CharField(default='000-000-0000', max_length=20, verbose_name='收货方手机号'),
        ),
        migrations.AlterField(
            model_name='order',
            name='sender_phone',
            field=models.CharField(default='000-000-0000', max_length=20, verbose_name='发货方手机号'),
        ),
    ]
