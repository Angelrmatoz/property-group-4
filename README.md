# Property Group - Real Estate Landing Page

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)
[![Dominio Propio](https://img.shields.io/badge/Online-propertygrouprd.app-blue?style=for-the-badge&logo=google-chrome)](https://www.propertygrouprd.app/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

## Descripción

Landing page profesional y responsiva para Property Group, empresa de bienes raíces. Este repositorio incluye el frontend (Next.js) y un backend (Express) usado para autenticación, APIs privadas y gestión de propiedades. El proyecto combina una landing pública con un panel de administración (dashboard) protegido por autenticación y CSRF.

## Características principales

- **Next.js (App Router)**: Estructura moderna para renderizado híbrido (SSR/SSG) y rutas modernas de la carpeta `app`.
- **Tailwind CSS**: Estilos utilitarios y responsivos con una paleta personalizada y utilidades para imágenes y layout.
- **Carrusel de imágenes**: Hero con transición suave y carga optimizada de imágenes.
- **Testimonios**: Sección visual y profesional con componentes reutilizables.
- **Formulario de contacto**: Envío de datos a email usando [Formspree](https://formspree.io/).
- **Autenticación y dashboard**: Backend Express con endpoints de auth, protección CSRF y panel administrativo para CRUD de propiedades.
- **Optimización para móvil**: Correcciones para evitar overflow horizontal y UX mejorada en dispositivos pequeños.
- **Modo oscuro/claro**: Soporte nativo con persistencia de preferencia.

## Instalación y uso

1. Clona el repositorio:
   ```bash
   El proyecto está desplegado y disponible en:
   cd property-group-4
   ```

- Dominio principal: **[https://www.propertygrouprd.app/](https://www.propertygrouprd.app/)**
- Vercel: [https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)
  ```bash
  pnpm install
  # o npm install
  ```

1. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   # o npm run dev
   ```
2. Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

## Estructura del proyecto

- `app/` — Páginas principales, layout, rutas y componentes de alto nivel.
- `components/` — Componentes reutilizables (UI, Header, Footer, Testimonials, etc).
- `hooks/` — Custom hooks (ej: useCarousel, useIsMobile, useToast).
- `public/` — Imágenes y recursos estáticos.
- `styles/` — Archivos CSS globales.
- `lib/` — Utilidades compartidas.

## Formulario de contacto

El formulario de contacto utiliza [Formspree](https://formspree.io/) para enviar mensajes directamente a un correo electrónico configurado, sin necesidad de backend propio. Todos los campos incluyen el atributo `name` requerido por Formspree.

## Resumen del backend

El directorio `backend/` contiene un servidor Express que expone APIs utilizadas por el dashboard y por operaciones autenticadas. Puntos clave:

- `backend/src/index.ts`: configuración de Express, CORS, cookies y csurf (protección CSRF).
- `backend/src/mongo.ts`: conexión a MongoDB usando Mongoose.
- `backend/src/controllers/`: controladores para `auth`, `properties`, `users`.
- `backend/src/middleware/`: middlewares como `auth`, `requireAdmin` y manejo de errores.
- `backend/src/models/`: modelos Mongoose (`User`, `Property`).

## Variables de entorno importantes

Principales variables usadas por el proyecto:

Frontend (Next.js):

- `BACKEND_URL` (server-side): URL pública del backend (ej: https://property-group-4.onrender.com). Usado para construir URLs desde SSR o server-side code.
- `NEXT_PUBLIC_BACKEND_URL` / `NEXT_PUBLIC_BASE_URL` (opcional): URL que el cliente puede usar desde el navegador — sólo si es necesario exponerla al bundle cliente.

Backend (Express):

- `FRONTEND_ORIGIN`: origen exacto del frontend (ej: https://www.propertygrouprd.app). Uso: CORS allowed origin.
- `MONGODB_URI`: cadena de conexión a MongoDB.
- `JWT_SECRET`: secreto para firmar JWTs.
- `TRUST_PROXY`: marca para que Express confíe en cabeceras `X-Forwarded-*` (útil en Render/Vercel).
- `ENABLE_CSRF`: si quieres deshabilitar temporalmente CSRF (no recomendado en producción).

Nota de seguridad: nunca marques variables secretas con el prefijo `NEXT_PUBLIC_` ni actives "Automatically expose System Environment Variables" en Vercel.

## Despliegue

- Frontend: desplegado en Vercel. Configurar variables en el panel de Vercel y redeploy.
- Backend: desplegado en Render (o cualquier host Node). Antes de desplegar, establece `FRONTEND_ORIGIN`, `MONGODB_URI`, `JWT_SECRET` y `TRUST_PROXY` según tu entorno.

Si frontend y backend están en dominios distintos (cross-site):

- CORS en backend debe permitir únicamente el origen del frontend y `credentials: true`.
- Cookies que deben viajar cross-site (ej: cookie CSRF o cookie de sesión) deben ser configuradas como `{ sameSite: 'none', secure: true }` en producción.

## Notas de debugging frecuentes

- Error 403 `{"error":"invalid csrf token"}`: normalmente la cookie CSRF no llega en la petición o no se incluyó el token. Verifica:

  1.  Que el backend emita la cookie CSRF con `SameSite=None` y `Secure` si el frontend está en otro dominio.
  2.  Que las respuestas de CORS incluyan `Access-Control-Allow-Credentials: true` y `Access-Control-Allow-Origin` igual al origen del frontend.
  3.  Que el cliente use `fetch(..., { credentials: 'include' })` y que incluya el token CSRF (si la app lo coloca en un header).

- Error 503 o problemas en producción: comprobar logs en Render/Vercel, revisar variables de entorno y que los servicios dependientes (MongoDB, Cloudinary) estén accesibles.

## Recomendaciones rápidas

- Cambiar la cookie CSRF en `backend/src/index.ts` a `sameSite: 'none'` y `secure: true` cuando `NODE_ENV === 'production'` si tu frontend está en otro dominio.
- Evitar hardcodear `http://localhost:${process.env.PORT}` para construir URLs en SSR; usar `BACKEND_URL` en producción.

## Contribuciones

- Pull requests son bienvenidos. Si un cambio requiere variables de entorno nuevas o pasos de despliegue, documenta los requisitos en el PR.

## Links útiles

- Frontend (Vercel): https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page
- Dominio principal: https://www.propertygrouprd.app/
