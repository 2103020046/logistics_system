# Generated by Django 5.1.5 on 2025-02-06 02:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0011_remove_order_carrier_net_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='other_expenses',
            field=models.CharField(default='12.00', max_length=50, verbose_name='其他支出'),
        ),
        migrations.AlterField(
            model_name='order',
            name='total_freight',
            field=models.CharField(default='12.00', max_length=50, verbose_name='总运费'),
        ),
    ]
