# Generated by Django 5.1.5 on 2025-07-15 06:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer_orders', '0004_alter_customerorder_delivery_method_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customerorder',
            name='delivery_method',
            field=models.CharField(max_length=20, verbose_name='交货方式'),
        ),
        migrations.AlterField(
            model_name='customerorder',
            name='payment_method',
            field=models.CharField(choices=[('prepay', '提付'), ('collect', '到付')], max_length=20, verbose_name='付款方式'),
        ),
        migrations.AlterField(
            model_name='customerorder',
            name='transport_type',
            field=models.CharField(choices=[('fast', '快运'), ('normal', '普通运输')], max_length=20, verbose_name='运输要求'),
        ),
        migrations.AlterField(
            model_name='customerorder',
            name='volume',
            field=models.DecimalField(decimal_places=2, max_digits=10, verbose_name='体积(m³)'),
        ),
    ]
