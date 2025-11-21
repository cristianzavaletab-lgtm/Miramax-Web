import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def create_roles():
    roles = [
        {'username': 'admin', 'password': 'admin123', 'role': 'admin'},
        {'username': 'cobrador', 'password': 'cobrador123', 'role': 'cobrador'},
        {'username': 'oficina', 'password': 'oficina123', 'role': 'oficina'},
        {'username': 'gerencia', 'password': 'gerencia123', 'role': 'gerencia'},
    ]

    for role_data in roles:
        username = role_data['username']
        password = role_data['password']
        role = role_data['role']
        
        # Delete existing user if exists
        User.objects.filter(username=username).delete()
        
        # Create user with proper password hashing
        user = User.objects.create_user(
            username=username,
            password=password,
            role=role
        )
        print(f"Created user: {username} with role {role}")

if __name__ == '__main__':
    create_roles()
    print("\n✅ All users created successfully!")
    print("You can now login with:")
    print("  - admin / admin123")
    print("  - cobrador / cobrador123")
    print("  - oficina / oficina123")
    print("  - gerencia / gerencia123")
