# Generated by Django 2.1.7 on 2019-04-19 03:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0003_auto_20190419_1008'),
    ]

    operations = [
        migrations.AddField(
            model_name='partitem',
            name='TrnDate',
            field=models.DateTimeField(default='2019-03-03 11:00:00'),
            preserve_default=False,
        ),
    ]