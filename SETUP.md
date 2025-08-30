# Guía de Configuración - Rancha Control

Esta guía te ayudará a configurar el proyecto Rancha Control desde cero.

## 1. Prerrequisitos

### Software Requerido
- **Node.js** 18 o superior
- **npm** o **yarn**
- **Git**

### Servicios Externos
- **Cuenta de Google Cloud Platform**
- **Proyecto de Firebase** con Firestore habilitado
- **API Key de Google Gemini**

## 2. Configuración de Firebase

### 2.1 Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Firestore Database
4. Configura las reglas de seguridad según tus necesidades

### 2.2 Crear Service Account
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a "IAM & Admin" > "Service Accounts"
4. Crea una nueva cuenta de servicio
5. Asigna los roles:
   - Firebase Admin SDK Administrator Service Agent
   - Cloud Datastore User
6. Genera una clave JSON y descárgala

### 2.3 Preparar Credenciales
```bash
# Convierte el JSON de service account a base64
cat path/to/your-service-account.json | base64 | tr -d '\n'
```

## 3. Configuración del Proyecto

### 3.1 Clonar y Configurar
```bash
# Clonar el repositorio
git clone https://github.com/William-Pardo/rancha-control.git
cd rancha-control

# Instalar dependencias del frontend
npm install

# Configurar variables de entorno del frontend
cp .env.example .env
# Editar .env con tus configuraciones

# Instalar dependencias del backend
cd backend
npm install

# Configurar variables de entorno del backend
cp .env.example .env
# Editar .env con tus credenciales
```

### 3.2 Configurar Variables de Entorno

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:4000
```

#### Backend (backend/.env)
```env
# Firebase
FIREBASE_SERVICE_ACCOUNT_BASE64=tu_service_account_en_base64

# Gemini AI
GEMINI_API_KEY=tu_gemini_api_key

# Server
NODE_ENV=development
PORT=4000
```

## 4. Configuración de Gemini AI

### 4.1 Obtener API Key
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Copia la clave y agrégala a tu archivo `.env`

## 5. Configuración de Firestore

### 5.1 Estructura de Datos
El proyecto usa las siguientes colecciones:

```
firestore/
├── users/
│   └── {userId}
│       ├── id: string
│       ├── name: string
│       ├── role: "admin" | "member"
│       └── avatar?: string
├── inventory/
│   └── {itemId}
│       ├── id: string
│       ├── name: string
│       ├── category: FoodCategory
│       ├── quantity: number
│       ├── unit: string
│       ├── expirationDate?: string
│       ├── addedBy: string
│       ├── addedAt: string
│       └── updatedAt?: string
└── contributions/
    └── {contributionId}
        ├── id: string
        ├── userId: string
        ├── amount: number
        ├── description: string
        ├── date: string
        └── category: "groceries" | "utilities" | "other"
```

### 5.2 Datos de Ejemplo
Puedes crear usuarios de ejemplo directamente en Firestore:

```json
// Colección: users
{
  "id": "user-admin",
  "name": "Administrador",
  "role": "admin"
}

{
  "id": "user-jairo", 
  "name": "Jairo",
  "role": "member"
}
```

## 6. Ejecución del Proyecto

### 6.1 Modo Desarrollo

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
# Desde la raíz del proyecto
npm run dev
```

### 6.2 Acceso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## 7. Verificación

### 7.1 Verificar Backend
```bash
curl http://localhost:4000/api/users
```

### 7.2 Verificar Frontend
1. Abre http://localhost:5173
2. Deberías ver la pantalla de login
3. Si hay usuarios en Firestore, aparecerán en la lista

## 8. Troubleshooting

### Problema: Firebase Admin no inicializa
- Verifica que la variable `FIREBASE_SERVICE_ACCOUNT_BASE64` esté correctamente configurada
- Asegúrate de que el JSON esté en formato base64 válido

### Problema: No aparecen usuarios en login
- Verifica que Firestore tenga documentos en la colección `users`
- Revisa la consola del navegador para errores de API

### Problema: Error de CORS
- Asegúrate de que el backend esté ejecutándose en el puerto correcto
- Verifica la variable `VITE_API_BASE_URL` en el frontend

### Problema: Error de Gemini API
- Verifica que tu API key de Gemini sea válida
- Asegúrate de que la API esté habilitada en tu proyecto de Google Cloud

## 9. Próximos Pasos

Una vez configurado:
1. Agrega usuarios a Firestore
2. Prueba crear items de inventario
3. Registra algunos aportes
4. Explora el dashboard

## 10. Despliegue

Para despliegue en producción, consulta:
- [deploy/README_CLOUD_RUN.md](deploy/README_CLOUD_RUN.md) para Cloud Run
- La sección de despliegue en el README principal

---

¡Tu aplicación Rancha Control está lista para usar! 🎉