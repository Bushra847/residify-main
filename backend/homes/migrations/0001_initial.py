# Generated by Django 5.2 on 2025-04-06 19:59

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Home',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(max_length=50)),
                ('floor', models.IntegerField()),
                ('block', models.CharField(max_length=50)),
                ('status', models.CharField(choices=[('vacant', 'Vacant'), ('occupied', 'Occupied'), ('maintenance', 'Under Maintenance')], default='vacant', max_length=20)),
                ('rent', models.DecimalField(decimal_places=2, max_digits=10)),
                ('bedrooms', models.IntegerField()),
                ('bathrooms', models.IntegerField()),
                ('area', models.DecimalField(decimal_places=2, max_digits=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['block', 'floor', 'number'],
            },
        ),
    ]
