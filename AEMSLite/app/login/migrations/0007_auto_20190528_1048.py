# Generated by Django 2.1.7 on 2019-05-28 10:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0006_partitem_ngrate'),
    ]

    operations = [
        migrations.AddField(
            model_name='maintenancelog',
            name='Remark',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='partitem',
            name='Asset',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='partitem',
            name='Maintainer',
            field=models.CharField(max_length=50, null=True),
        ),
    ]
