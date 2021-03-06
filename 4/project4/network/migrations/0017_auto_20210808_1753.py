# Generated by Django 3.2.5 on 2021-08-08 17:53

import datetime
from django.conf import settings
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0016_auto_20210808_1744'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2021, 8, 8, 17, 53, 58, 211344, tzinfo=utc)),
        ),
        migrations.AlterField(
            model_name='post',
            name='likes',
            field=models.ManyToManyField(blank=True, related_name='post', to=settings.AUTH_USER_MODEL),
        ),
    ]
