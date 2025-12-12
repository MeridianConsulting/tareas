# Frontend - Sistema de Gestión de Tareas

Frontend desarrollado con Next.js 16 (App Router) + React + Tailwind CSS.

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # Rutas de Next.js (App Router)
│   │   ├── login/              # Página de login
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── reports/            # Reportes
│   │   │   ├── daily/         # Reporte diario
│   │   │   └── management/    # Dashboard gerencial
│   │   ├── admin/              # Administración
│   │   │   ├── areas/         # Gestión de áreas
│   │   │   └── users/          # Gestión de usuarios
│   │   ├── layout.js           # Layout raíz
│   │   ├── page.js             # Página principal (redirige a dashboard)
│   │   └── globals.css         # Estilos globales
│   ├── components/             # Componentes reutilizables
│   │   ├── Layout.js           # Layout con sidebar
│   │   ├── Sidebar.js          # Barra lateral de navegación
│   │   ├── StatsCard.js        # Tarjeta de estadísticas
│   │   ├── TaskList.js         # Lista de tareas
│   │   └── TaskForm.js         # Formulario de tareas
│   └── lib/                    # Utilidades
│       ├── api.js              # Cliente API con manejo de JWT
│       └── auth.js             # Helpers de autenticación
├── public/                      # Archivos estáticos
├── .env.local                   # Variables de entorno (crear)
└── package.json
```

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost/api/v1
```

Ajustar la URL según la ubicación de tu backend PHP.

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Características Implementadas

### Autenticación
- Login con JWT (Access Token + Refresh Token)
- Renovación automática de tokens
- Bootstrap de sesión al recargar página
- Logout con revocación de refresh token

### Páginas
- **Login**: Autenticación de usuarios
- **Dashboard**: Lista de tareas con filtros
- **Reportes Diarios**: Reporte por área (lider_area, admin, gerencia)
- **Dashboard Gerencial**: Vista consolidada (admin, gerencia)
- **Administración de Áreas**: CRUD de áreas (solo admin)
- **Administración de Usuarios**: CRUD de usuarios (solo admin)

### Componentes
- **Layout**: Layout principal con sidebar
- **Sidebar**: Navegación lateral con menú contextual según rol
- **StatsCard**: Tarjetas de estadísticas
- **TaskList**: Tabla de tareas con estilos
- **TaskForm**: Formulario para crear/editar tareas

### Permisos por Rol
- **Admin**: Acceso completo
- **Gerencia**: Dashboard gerencial y reportes
- **Líder de área**: Reportes de su área
- **Colaborador**: Solo sus tareas

## Próximos Pasos

1. Crear página de detalle de tarea (`/tasks/[id]`)
2. Implementar creación/edición de tareas desde el frontend
3. Agregar comentarios y evidencias
4. Implementar gráficos con Chart.js o Recharts
5. Agregar paginación en listados grandes
6. Implementar búsqueda avanzada

## Notas

- El proyecto usa Next.js 16 con App Router
- Tailwind CSS v4 está configurado
- El manejo de JWT incluye refresh automático
- Las rutas están protegidas por el componente Layout
