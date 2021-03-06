# Generated by Django 2.1.7 on 2019-09-04 13:45

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0023_auto_20190821_1110'),
    ]

    operations = [
        migrations.AddField(
            model_name='locationlog',
            name='CreatedTime',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='partitem',
            name='PlantCode',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='partitemresult',
            name='PlantCode',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='partitem',
            name='SubMaintainerIds',
            field=models.CharField(max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='partitem',
            name='SubMaintainers',
            field=models.CharField(max_length=300, null=True),
        ),
    ]
