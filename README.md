# Property Group - Full-Stack Web System for Real Estate Property Management

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)
[![Dominio Propio](https://img.shields.io/badge/Online-propertygrouprd.app-blue?style=for-the-badge&logo=google-chrome)](https://www.propertygrouprd.app/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

# Descripción

Sistema web **full-stack** desarrollado para Property Group, una empresa de bienes raíces.

La aplicación combina una **landing pública optimizada para marketing** con un **panel administrativo seguro** para la gestión de propiedades inmobiliarias.

El proyecto incluye:

El proyecto está desplegado y disponible en:
- Dominio principal: **[https://www.propertygrouprd.app/](https://www.propertygrouprd.app/)**
- Vercel: [https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)

Para correrlo localmente:

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd property-group-4
   ```

2. Instala dependencias:
   ```bash
   pnpm install
   # o npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   # o npm run dev
   ```
4. Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

# Stack Tecnológico

## Frontend

- Next.js (App Router)
- React
- TailwindCSS
- TypeScript

## Backend

- Node.js
- Express.js
- JWT Authentication
- CSRF Protection

## Base de datos

- MongoDB
- Mongoose

## Infraestructura / Deployment

- Vercel (Frontend)
- Render (Backend)

---

- `BACKEND_URL` / `NEXT_PUBLIC_BACKEND_URL`: URL pública del backend (ej: https://property-group- backend...azurecontainerapps.io). Usado para construir URLs desde SSR o cliente para interactuar con la API.
- `NEXT_PUBLIC_BACKEND_URL` / `NEXT_PUBLIC_BASE_URL` (opcional): URL que el cliente puede usar desde el navegador — sólo si es necesario exponerla al bundle cliente.

- **Next.js (App Router)** para renderizado híbrido (SSR / SSG)
- **Tailwind CSS** para diseño responsivo y desarrollo rápido de UI
- **Carrusel dinámico de imágenes** optimizado para rendimiento
- **Sección de testimonios** con componentes reutilizables
- **Formulario de contacto** integrado con Formspree
- **Panel administrativo protegido** mediante autenticación
- **CRUD completo de propiedades** desde el dashboard
- **Modo oscuro / claro** con persistencia de preferencias
- **Optimización mobile-first** para mejorar la experiencia en dispositivos móviles

---

# Flujo de la aplicación

1. Los usuarios acceden a la landing pública para visualizar propiedades disponibles.
2. Los administradores pueden autenticarse desde el panel administrativo.
3. El backend valida credenciales y genera un **JWT** para autenticación.
4. El dashboard consume **APIs protegidas** para gestionar propiedades.
5. Todas las operaciones sensibles utilizan **protección CSRF**.
6. La información de las propiedades se almacena en **MongoDB**.

- **Frontend**: Desplegado en Vercel. Configurar variables en el panel de Vercel y hacer redeploy.
- **Backend**: Desplegado en **Azure Container Apps**. El proceso de CI/CD está automatizado mediante GitHub Actions (`.github/workflows/deploy-backend.yml`).
  1. Al hacer Push, GitHub Actions empaqueta la imagen Docker y la sube a GHCR (`ghcr.io`).
  2. Azure Container Apps jala la nueva imagen automáticamente y despliega un contenedor Serverless (Consumption mode).
  3. Las variables de entorno (`FRONTEND_ORIGIN`, `MONGODB_URI`, `JWT_SECRET`) se configuran manualmente en el portal de Azure.

# Instalación y uso

Clona el repositorio:

```bash
git clone https://github.com/Angelrmatoz/property-group-4
cd property-group-4
```

Instala las dependencias:

```bash
pnpm install
# o
npm install
```

Inicia el servidor de desarrollo:

```bash
pnpm dev
# o
npm run dev
```

Abre en tu navegador:

```
http://localhost:3000
```

---

# Proyecto en producción

Dominio principal:

https://www.propertygrouprd.app/

Deployment frontend:

https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page

---

# Estructura del proyecto

```
app/           → páginas, layouts y rutas
components/    → componentes reutilizables
hooks/         → custom hooks
lib/           → utilidades compartidas
styles/        → estilos globales
public/        → recursos estáticos

backend/
  src/
    controllers/
    middleware/
    models/
    mongo.ts
    index.ts
```

---

# Backend

El directorio `backend/` contiene un servidor Express encargado de:

- Autenticación de usuarios
- Protección de rutas
- Gestión de propiedades
- Comunicación con MongoDB

Archivos importantes:

- `backend/src/index.ts` → configuración principal de Express
- `backend/src/mongo.ts` → conexión a MongoDB mediante Mongoose
- `backend/src/controllers/` → lógica de negocio
- `backend/src/middleware/` → autenticación, autorización y manejo de errores
- `backend/src/models/` → modelos de datos (`User`, `Property`)

---

# Variables de entorno

## Frontend (Next.js)

```
BACKEND_URL
NEXT_PUBLIC_BACKEND_URL
NEXT_PUBLIC_BASE_URL
```

## Backend (Express)

```
FRONTEND_ORIGIN
MONGODB_URI
JWT_SECRET
TRUST_PROXY
ENABLE_CSRF
```

⚠️ Nunca expongas variables sensibles con el prefijo `NEXT_PUBLIC`.

---

# Despliegue

Frontend:

- desplegado en **Vercel**

Backend:

- desplegado en **Render**

Si el frontend y backend están en dominios distintos (cross-site):

- habilitar `credentials: true` en CORS
- configurar cookies con:

```
sameSite: 'none'
secure: true
```

---

# Notas de debugging frecuentes

### Error 403 — invalid csrf token

Normalmente ocurre cuando la cookie CSRF no llega correctamente.

Verificar:

- cookie CSRF enviada por el backend
- `Access-Control-Allow-Credentials`
- `Access-Control-Allow-Origin`
- uso de `fetch(..., { credentials: 'include' })`

### Error 503 en producción

Revisar:

- logs de Render o Vercel
- variables de entorno
- conexión a MongoDB
- disponibilidad de servicios externos

---

# Contribuciones

Pull requests son bienvenidos.

Si un cambio requiere nuevas variables de entorno o pasos de despliegue adicionales, por favor documentarlo en el PR.
