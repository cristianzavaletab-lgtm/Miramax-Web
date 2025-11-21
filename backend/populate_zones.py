import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Department, Province, District, Caserio

def populate():
    dept, _ = Department.objects.get_or_create(name="San Martín")
    prov, _ = Province.objects.get_or_create(name="Moyobamba", department=dept)
    dist, _ = District.objects.get_or_create(name="Moyobamba", province=prov)
    
    caserios = ["Los Milagros", "Indañe", "Marona", "San Mateo"]
    for c in caserios:
        Caserio.objects.get_or_create(name=c, district=dist)
        print(f"Created Caserio: {c}")

if __name__ == '__main__':
    populate()
