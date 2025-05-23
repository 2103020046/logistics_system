# Generated by Django 5.1.5 on 2025-02-03 01:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order_number', models.CharField(default='123456789', max_length=50, unique=True, verbose_name='运单号')),
                ('sender', models.CharField(default='Default Carrier', max_length=100, verbose_name='发货方')),
                ('sender_phone', models.CharField(default='000-000-0000', max_length=20, verbose_name='手机号')),
                ('sender_address', models.TextField(default='Default Carrier', verbose_name='详细地址')),
                ('receiver', models.CharField(default='Default Carrier', max_length=100, verbose_name='收货方')),
                ('receiver_phone', models.CharField(default='000-000-0000', max_length=20, verbose_name='手机号')),
                ('receiver_address', models.TextField(default='Default Carrier', verbose_name='详细地址')),
                ('total_freight', models.DecimalField(decimal_places=2, default='12', max_digits=10, verbose_name='总运费')),
                ('payment_method', models.CharField(default='Default Carrier', max_length=50, verbose_name='付款方式')),
                ('other_expenses', models.DecimalField(decimal_places=2, default='12', max_digits=10, verbose_name='其他支出')),
                ('expense_details', models.TextField(blank=True, default='Default Carrier', null=True, verbose_name='费用说明')),
                ('carrier', models.CharField(default='Default Carrier', max_length=100, verbose_name='承运商')),
                ('carrier_net', models.CharField(default='Default Carrier_net', max_length=100, verbose_name='承运网点')),
                ('departure_station_phone', models.CharField(blank=True, max_length=20, null=True, verbose_name='发站电话')),
                ('arrival_station_phone', models.CharField(default='000-000-0000', max_length=20, verbose_name='到站电话')),
                ('transfer_fee', models.DecimalField(decimal_places=2, default='111', max_digits=10, verbose_name='中转费')),
            ],
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_name', models.CharField(max_length=100, verbose_name='品名')),
                ('package_type', models.CharField(max_length=50, verbose_name='包装')),
                ('quantity', models.IntegerField(verbose_name='件数')),
                ('weight', models.DecimalField(decimal_places=2, max_digits=6, verbose_name='重量(kg)')),
                ('volume', models.DecimalField(decimal_places=2, max_digits=6, verbose_name='体积(m³)')),
                ('freight', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='运费(元)')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.order')),
            ],
        ),
    ]
