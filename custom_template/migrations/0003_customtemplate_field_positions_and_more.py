# Generated by Django 5.1.5 on 2025-02-14 07:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('custom_template', '0002_alter_customtemplate_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='customtemplate',
            name='field_positions',
            field=models.JSONField(default=dict),
        ),
        migrations.AlterField(
            model_name='customtemplate',
            name='content',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='customtemplate',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='customtemplate',
            name='name',
            field=models.CharField(max_length=255),
        ),
    ]
