from django.core.management.base import BaseCommand
from homes.models import Home
from residents.models import Resident
from django.contrib.auth import get_user_model
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Add dummy homes and assign them to residents'

    def handle(self, *args, **kwargs):
        # Create dummy homes
        blocks = ['A', 'B', 'C']
        floors = range(1, 5)  # 1 to 4
        units_per_floor = range(1, 5)  # 1 to 4
        home_data = []

        for block in blocks:
            for floor in floors:
                for unit in units_per_floor:
                    home = Home(
                        number=f"{unit:02d}",
                        floor=floor,
                        block=block,
                        status='vacant',
                        rent=random.randint(800, 2000),
                        bedrooms=random.randint(1, 4),
                        bathrooms=random.randint(1, 3),
                        area=random.randint(800, 2500)
                    )
                    home_data.append(home)

        # Bulk create homes
        Home.objects.bulk_create(home_data)
        self.stdout.write(self.style.SUCCESS(f'Created {len(home_data)} homes'))

        # Assign homes to existing residents
        residents = Resident.objects.filter(user__role='resident')
        available_homes = list(Home.objects.filter(status='vacant'))

        for resident in residents:
            if available_homes:
                home = random.choice(available_homes)
                available_homes.remove(home)
                home.status = 'occupied'
                home.save()
                resident.home = home
                resident.save()
                self.stdout.write(self.style.SUCCESS(f'Assigned home {home} to resident {resident}'))
            else:
                self.stdout.write(self.style.WARNING(f'No available homes for resident {resident}'))
