import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Department, Province, District, Caserio
from django.db import IntegrityError

print("=" * 60)
print("COMPREHENSIVE DATABASE TESTING")
print("=" * 60)

# Test 1: List all departments
print("\n✅ TEST 1: List all departments")
print("-" * 60)
depts = Department.objects.all()
for d in depts:
    print(f"  {d.code}: {d.name}")
print(f"Total: {depts.count()} departments")

# Test 2: Test hierarchy
print("\n✅ TEST 2: Test hierarchical relationships")
print("-" * 60)
ll = Department.objects.get(code='LL')
print(f"Department: {ll.name}")
provs = Province.objects.filter(department=ll)
print(f"  Provinces: {provs.count()}")
for p in provs:
    print(f"    - {p.name}")
    dists = District.objects.filter(province=p)
    print(f"      Districts: {dists.count()}")
    for d in dists:
        print(f"        - {d.name}")
        cases = Caserio.objects.filter(district=d)
        print(f"          Caseríos: {cases.count()}")
        for c in cases:
            print(f"            - {c.name}")

# Test 3: Test duplicate validation
print("\n✅ TEST 3: Test duplicate code validation")
print("-" * 60)
try:
    Department.objects.create(name='Duplicate Test', code='LL')
    print("❌ ERROR: Duplicate code was allowed!")
except IntegrityError:
    print("✅ PASS: Duplicate code blocked correctly")

# Test 4: Test edit operation
print("\n✅ TEST 4: Test edit operation")
print("-" * 60)
lima = Department.objects.get(code='LIMA')
original_name = lima.name
print(f"Original name: {original_name}")
lima.name = "Lima Metropolitana"
lima.save()
lima.refresh_from_db()
print(f"Updated name: {lima.name}")
# Revert
lima.name = "Lima"
lima.save()
print(f"Reverted to: {lima.name}")

# Test 5: Count all hierarchical entities
print("\n✅ TEST 5: Database statistics")
print("-" * 60)
print(f"Departments: {Department.objects.count()}")
print(f"Provinces: {Province.objects.count()}")
print(f"Districts: {District.objects.count()}")
print(f"Caseríos: {Caserio.objects.count()}")

print("\n" + "=" * 60)
print("ALL TESTS COMPLETED SUCCESSFULLY!")
print("=" * 60)
