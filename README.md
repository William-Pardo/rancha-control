# Rancha Control

**Rancha Control** es una aplicación web para el control y gestión de la alacena familiar. Permite a los miembros de la familia registrar y seguir el inventario de alimentos, registrar aportes económicos, y visualizar estadísticas del hogar.

## ¿Qué es este proyecto?

Esta aplicación está diseñada para ayudar a las familias a:

- **Gestionar el inventario** de alimentos en la alacena
- **Registrar aportes económicos** de cada miembro de la familia  
- **Visualizar estadísticas** y resúmenes en un dashboard
- **Organizar la compra** de alimentos de manera colaborativa

## Arquitectura del Sistema

### Frontend (React + TypeScript)
- **App.tsx**: Componente principal de la aplicación
- **Componentes principales**:
  - `LoginView`: Sistema de autenticación de usuarios
  - `InventoryView`: Gestión del inventario de alimentos
  - `ContributionsView`: Registro de aportes económicos
  - `DashboardView`: Estadísticas y resúmenes
  - `Header`: Navegación y cambio de tema

### Backend (Node.js + Express)
- **server.js**: Servidor API REST
- **Integración con Firebase**:
  - Firestore para persistencia de datos
  - Firebase Auth para autenticación
- **Integración con Gemini AI** para funcionalidades inteligentes
- **Endpoints principales**:
  - `/api/inventory` - CRUD de inventario
  - `/api/contributions` - CRUD de aportes
  - `/api/users` - Gestión de usuarios
  - `/api/gemini` - Integración con IA

### Base de Datos (Firestore)
- **Colecciones**:
  - `inventory`: Items del inventario
  - `contributions`: Aportes económicos
  - `users`: Usuarios del sistema

## ¿Qué necesitas para ejecutar este proyecto?

### Prerrequisitos

1. **Node.js** (versión 16 o superior)
2. **npm** o **yarn**
3. **Cuenta de Google Cloud** con los siguientes servicios:
   - Firebase/Firestore
   - Google Cloud Run (para despliegue)
4. **API Key de Gemini AI**

### Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con:

```env
# Firebase
FIREBASE_SERVICE_ACCOUNT_BASE64=<tu-service-account-en-base64>
# O usar Application Default Credentials en Cloud Run

# Gemini AI
GEMINI_API_KEY=<tu-gemini-api-key>

# Configuración
NODE_ENV=development
PORT=4000
```

Para el frontend, crea un archivo `.env` en la raíz con:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## ¿Cómo ejecutar el proyecto?

### 1. Configuración del Backend

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar el servidor
npm start
```

### 2. Configuración del Frontend

```bash
# En la raíz del proyecto
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# Ejecutar en modo desarrollo
npm run dev
```

### 3. Acceder a la Aplicación

- Frontend: `http://localhost:5173` (o el puerto que asigne Vite)
- Backend API: `http://localhost:4000`

## ¿Cómo usar la aplicación?

### 1. Inicio de Sesión
- Selecciona tu usuario de la lista de miembros de la familia
- Cada usuario tiene permisos específicos según su rol

### 2. Gestión de Inventario
- **Ver inventario**: Lista todos los alimentos disponibles
- **Agregar items**: Registra nuevos alimentos con cantidad y fecha de vencimiento
- **Editar items**: Actualiza cantidades o información
- **Eliminar items**: Remueve alimentos consumidos o vencidos

### 3. Registro de Aportes
- **Registrar aportes**: Documenta contribuciones económicas de cada miembro
- **Ver historial**: Revisa aportes anteriores
- **Estadísticas**: Visualiza totales por persona y período

### 4. Dashboard
- **Resumen del inventario**: Items próximos a vencer, stock bajo
- **Resumen de aportes**: Totales y balances por miembro
- **Estadísticas generales**: Tendencias y análisis

## ¿Cómo desplegar en producción?

### Opción 1: Google Cloud Run (Recomendado)

El proyecto incluye configuración automática para Cloud Run:

1. **Configurar secretos en GitHub**:
   - `GCP_PROJECT_ID`: ID de tu proyecto de Google Cloud
   - `GCP_REGION`: Región de despliegue (ej: us-central1)
   - `GCP_SA_KEY`: Clave JSON de service account
   - `GEMINI_API_KEY`: Tu API key de Gemini

2. **Hacer push a la rama `main` o `feature/backend-gemini-proxy`**
   - El workflow automáticamente desplegará el backend

3. **Ver documentación detallada**: [deploy/README_CLOUD_RUN.md](deploy/README_CLOUD_RUN.md)

### Opción 2: Despliegue Manual

```bash
# Build del backend
cd backend
docker build -t rancha-backend .

# Desplegar donde prefieras (Heroku, DigitalOcean, etc.)
```

## Estructura del Proyecto

```
rancha-control/
├── README.md                    # Este archivo
├── App.tsx                      # Componente principal React
├── backend/
│   └── server.js               # Servidor Express + API
├── deploy/
│   └── README_CLOUD_RUN.md     # Instrucciones de despliegue
└── .github/
    └── workflows/
        └── cloud-run-deploy.yml # CI/CD automático
```

## Tecnologías Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Base de Datos**: Google Firestore
- **Autenticación**: Firebase Auth
- **IA**: Google Gemini API
- **Despliegue**: Google Cloud Run
- **CI/CD**: GitHub Actions

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Soporte

Si tienes preguntas o problemas:

1. Revisa este README
2. Consulta la documentación en `deploy/`
3. Abre un issue en GitHub
4. Contacta al equipo de desarrollo

---

**¡Ahora ya sabes qué es este proyecto y qué hacer con él!** 🎉

Comienza configurando tu entorno de desarrollo siguiendo los pasos de la sección "¿Cómo ejecutar el proyecto?"