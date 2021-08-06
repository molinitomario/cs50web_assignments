# Generated by Django 3.2.5 on 2021-08-06 00:28

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0006_alter_user_following'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='following',
        ),
        migrations.AddField(
            model_name='user',
            name='following',
            field=models.ManyToManyField(blank=True, related_name='_network_user_following_+', to=settings.AUTH_USER_MODEL),
        ),
    ]