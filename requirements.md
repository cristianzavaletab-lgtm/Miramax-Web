# ESPECIFICACIÓN COMPLETA DEL SISTEMA DE COBRANZA MIRAMAX
Versión: Profesional – Escalable – Multi-zona

## 1️⃣ MÓDULOS PRINCIPALES DEL SISTEMA

### 1. LOGIN Y SEGURIDAD
- Login con usuario y contraseña.
- Seguridad con JWT.
- Roles de usuario: Administrador, Cobrador, Oficina, Gerencia.
- Sesión persistente hasta cerrar sesión.
- Bitácora de actividad (audit log).

### 2. DASHBOARD GENERAL
- Total de clientes.
- Total de clientes activos/inactivos.
- Recaudación del día y del mes.
- Deuda total pendiente.
- Porcentaje de cobranza.
- Ranking de cobradores.
- Alertas: Deuda > 5/10/30 días, Clientes en proceso de corte.

### 3. GESTIÓN DE CLIENTES
- CRUD: Crear, editar, eliminar, listar.
- Campos: Nombre, Teléfono, Dirección, Zona, Cobrador asignado, Monto mensual, Estado, Fecha registro.
- Historial completo: Pagos, Deuda, Cortes.
- Botón WhatsApp y Código QR.

### 4. MÓDULO DE COBRADORES
- Asignación de zonas y clientes.
- Control de cobrados/no encontrados/morosos.
- Ranking semanal/mensual.

### 5. REGISTRO DE PAGOS
- Métodos: Efectivo, Yape, Plin, Transferencia.
- Validación de duplicados.
- Tipos: Normal, Anticipado, Atrasado, Reposición.
- Recibo digital descargable.

### 6. DEUDAS Y MOROSIDAD
- Cálculo automático.
- Clasificación: Pendiente (1-5), Atrasado (6-10), Crítico (10-30), Moroso (+30).
- Etiquetas visuales.

### 7. CORTES Y REPOSICIÓN
- Corte automático por deuda.
- Registro de motivo.
- Reposición automática al pagar.

### 8. RECORDATORIOS AUTOMÁTICOS
- WhatsApp API.
- Mensajes diferenciados por nivel de deuda.
- Programación automática (3 días antes, 5/10/30 días después).

### 9. REPORTES
- Excel: Deudas, Pagos, Zonas, Recaudación, Cortes, Morosidad.
- Dashboard: Gráficos.

### 🔟 BACKUP Y RESTAURACIÓN
- Automático 24h / Manual.
- Retención 7 días.

## 2️⃣ FUNCIONES AVANZADAS

### 11. APP PARA COBRADORES (PWA – Modo Offline)
- Ver lista clientes, deuda.
- Registrar pago offline.
- Sincronización.
- Escaneo QR.

### 12. SEGURIDAD Y VALIDACIÓN
- Contraseñas encriptadas.
- Logs de cambios.

### 13. ESCALABILIDAD
- API REST.
- Migración a SQL/Postgres.

## 3️⃣ FLUJO DE TRABAJO
- **Administrador**: Configuración global.
- **Cobrador**: Campo, pagos, offline.
- **Oficina**: Gestión administrativa.
- **Gerencia**: Análisis.

## 4️⃣ TECNOLOGÍAS (Ajustado a solicitud)
- **Frontend**: React, Material UI, Axios, PWA.
- **Backend**: Django (Python) + Django REST Framework.
- **Base de Datos**: SQLite (inicial) -> PostgreSQL.
- **Auth**: JWT.
