@echo off
start cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"
start cmd /k "cd frontend && npm run dev"
echo Servidores iniciados...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
pause
