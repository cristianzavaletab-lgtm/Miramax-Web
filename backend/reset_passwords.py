"""
Script para resetear contraseñas de usuarios con hash correcto.
Ejecutar: python reset_passwords.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def reset_all_passwords():
    """Reset passwords for all users with proper hashing."""
    users_data = [
        ('admin', 'admin123', 'admin', True),
        ('cobrador', 'cobrador123', 'cobrador', False),
        ('oficina', 'oficina123', 'oficina', False),
        ('gerencia', 'gerencia123', 'gerencia', False),
    ]
    
    print("=" * 50)
    print("RESETTING USER PASSWORDS")
    print("=" * 50)
    
    for username, password, role, is_superuser in users_data:
        try:
            user = User.objects.get(username=username)
            user.set_password(password)
            if is_superuser:
                user.is_superuser = True
                user.is_staff = True
            user.save()
            print(f"✅ Password reset for: {username}")
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create_user(
                username=username,
                password=password,
                role=role
            )
            if is_superuser:
                user.is_superuser = True
                user.is_staff = True
                user.save()
            print(f"✅ Created new user: {username}")
    
    print("\n" + "=" * 50)
    print("✅ ALL PASSWORDS RESET SUCCESSFULLY!")
    print("=" * 50)
    print("\nCredentials:")
    print("  admin / admin123")
    print("  cobrador / cobrador123")
    print("  oficina / oficina123")
    print("  gerencia / gerencia123")
    print("\n⚠️  IMPORTANT: Restart Django server for changes to take effect!")
    print("=" * 50)

if __name__ == '__main__':
    reset_all_passwords()
