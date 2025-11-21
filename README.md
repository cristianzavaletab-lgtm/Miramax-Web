# Miramax Collection System

Sistema de cobranza desarrollado con Django y React.

## Requisitos previos
- Python 3.8+
- Node.js 14+

## Cómo ejecutar el sistema

Necesitas abrir dos terminales (una para el backend y otra para el frontend).

### 1. Backend (Django)
En la primera terminal:
```bash
cd backend
# Activar entorno virtual
venv\Scripts\activate
# Iniciar servidor
python manage.py runserver
```
El backend correrá en: `http://127.0.0.1:8000/`

### 2. Frontend (React)
En la segunda terminal:
```bash
cd frontend
# Iniciar servidor de desarrollo
npm run dev
```
El frontend correrá en: `http://localhost:5173/`

## Acceso
Una vez ambos servidores estén corriendo, abre tu navegador y ve a:
**[http://localhost:5173](http://localhost:5173)**

## Credenciales
**Usuario:** `admin`
**Contraseña:** `admin123`

Debes crear un superusuario para acceder inicialmente si no lo has hecho:
```bash
cd backend
venv\Scripts\activate
python manage.py createsuperuser
```
