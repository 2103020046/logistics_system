# Generated by Django 5.1.5 on 2025-02-05 03:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_remove_order_transfer_fee_order_customer_order_no'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='date',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='日期'),
        ),
    ]
