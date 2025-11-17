# Play Match - Backoffice Web

Aplicación web de administración para gestión de canchas deportivas y reservas. Panel de control para administradores de canchas con dashboard, reportes y gestión completa de reservas.

## 🚀 Características principales

### Dashboard Administrativo
- **Panel principal** con métricas en tiempo real:
  - Total de reservas (confirmadas, pendientes, canceladas)
  - Ingresos totales y promedio por reserva
  - Tasa de ocupación de canchas
  - Visualización gráfica de tendencias

### Gestión de Canchas
- CRUD completo de canchas deportivas
- Configuración de horarios disponibles por intervalos
- Gestión de precios por hora
- Tipos de deporte: Fútbol, Pádel, Tenis, Básquet
- Vista de perfil detallada por cancha

### Sistema de Reservas
- Tabla completa de reservas con filtros avanzados:
  - Por estado (pendiente, confirmada, cancelada)
  - Por cancha
  - Por cliente (búsqueda por nombre)
  - Por período (día, semana, mes, todas)
- **Ordenamiento** por:
  - Fecha
  - Hora
  - Cliente
  - Estado
  - Monto
  - Cancha (alfabético)
- Confirmación/rechazo individual de reservas
- Confirmación masiva de reservas pendientes
- Vista de calendario de reservas
- Paginación de resultados

### Reportes
- Visualización de métricas de ocupación
- Gráficos de ingresos y tendencias
- Exportación de datos (próximamente)

### Gestión de Horarios
- Configuración de intervalos de disponibilidad
- Gestión de horarios especiales
- Vista de disponibilidad por cancha

## 🛠️ Stack Tecnológico

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Material-UI (MUI) v5
- **Estado Global**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Gráficos**: Recharts (para dashboard)
- **Gestión de Formularios**: React Hook Form (opcional)

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- Backend Play Match Service corriendo en `http://localhost:8080`

## ⚙️ Instalación

```bash
# Instalar dependencias
npm install

# o con yarn
yarn install
```

## 🚀 Ejecución local

```bash
# Modo desarrollo
npm run dev

# o con yarn
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Build para producción

```bash
# Compilar para producción
npm run build

# o con yarn
yarn build

# Preview del build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes React
│   ├── CalendarioReservas.tsx
│   ├── CanchaForm.tsx
│   ├── Dashboard.tsx
│   ├── HorariosManager.tsx
│   ├── Login.tsx
│   ├── NavigationLayout.tsx
│   ├── PerfilAdministradorCancha.tsx
│   ├── PerfilDueno.tsx
│   ├── Register.tsx
│   ├── ReportesView.tsx
│   └── ReservasTable.tsx
├── services/        # Servicios API
│   ├── authService.ts
│   ├── canchaService.ts
│   ├── reporteService.ts
│   └── reservaService.ts
├── store/          # Estado global (Zustand)
│   ├── useAuthStore.ts
│   ├── useCanchaStore.ts
│   ├── useReporteStore.ts
│   └── useReservaStore.ts
├── types/          # Tipos TypeScript
│   └── index.ts
├── utils/          # Utilidades
│   └── httpClient.ts
├── App.tsx         # Componente principal
└── main.tsx        # Punto de entrada
```

## 🔐 Autenticación

### Login

1. Ir a `http://localhost:5173`
2. Usar credenciales de administrador de cancha
3. El token JWT se almacena automáticamente en localStorage

### Roles

La aplicación está diseñada para el rol **ADMINISTRADOR_CANCHA**. Los usuarios con rol JUGADOR deben usar la aplicación móvil o web de clientes.

## 🎨 Componentes Principales

### Dashboard
- Resumen de métricas clave
- Gráficos de tendencias
- Accesos rápidos a funciones principales

### ReservasTable
- Tabla completa de reservas
- Filtros múltiples (estado, cancha, cliente, período)
- Ordenamiento por múltiples columnas
- Acciones rápidas (confirmar, rechazar)
- Paginación

### CanchaForm
- Formulario de creación/edición de canchas
- Validación de campos
- Gestión de horarios disponibles

### CalendarioReservas
- Vista de calendario mensual
- Visualización de reservas por fecha
- Navegación por meses

### HorariosManager
- Gestión de intervalos de disponibilidad
- Configuración de horarios especiales

## 🔧 Configuración

### API Base URL

Configurado en `src/utils/httpClient.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

### Interceptors

El cliente HTTP incluye:
- Inyección automática de token JWT
- Manejo de errores 401 (redirección a login)
- Logging de peticiones (en desarrollo)

## 📊 Funcionalidades de Reservas

### Filtros Disponibles

- **Estado**: Todas, Pendientes, Confirmadas, Canceladas
- **Cancha**: Todas o selección específica
- **Cliente**: Búsqueda por nombre
- **Período**: Hoy, Esta semana, Este mes, Todas las fechas

### Ordenamiento

Click en los encabezados de columna para ordenar por:
- Fecha (ascendente/descendente)
- Hora de inicio
- Cliente (alfabético)
- Estado
- Monto (menor a mayor / mayor a menor)
- Cancha (alfabético)

### Acciones Masivas

- Botón "Confirmar todas" para aprobar todas las reservas pendientes de una vez

## 🎯 Próximas Características

- [ ] Exportación de reportes a PDF/Excel
- [ ] Notificaciones en tiempo real
- [ ] Gestión de pagos
- [ ] Sistema de mensajería con clientes
- [ ] Estadísticas avanzadas
- [ ] Modo oscuro

## 🐛 Debugging

### Errores comunes

1. **Error de CORS**: Verificar que el backend esté configurado para permitir `http://localhost:5173`
2. **Token expirado**: Hacer logout y login nuevamente
3. **API no responde**: Verificar que el backend esté corriendo en el puerto 8080

### Logs

En desarrollo, todas las peticiones HTTP se loguean en la consola del navegador.

## 🤝 Contribución

Este proyecto es parte del sistema Play Match para gestión de canchas deportivas.

## 📝 Notas

- La aplicación requiere que el backend esté corriendo
- Los tokens JWT tienen una duración de 2 horas
- Las fechas se manejan en formato ISO (yyyy-MM-dd)
- Los montos se muestran en pesos argentinos (ARS)
