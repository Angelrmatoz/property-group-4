# Property Group - Frontend

Este es el manual técnico para desarrolladores humanos (y robots) sobre cómo está estructurada la interfaz de usuario de Property Group 4.

## 🏗️ Estructura de Carpetas

Este proyecto está construido con **Next.js (App Router)** usando TypeScript. La lógica está dividida de la siguiente forma para mantener el código limpio:

- `/app`: Aquí vive el "App Router" de Next.js. Cada carpeta aquí representa una ruta en el navegador. (ej. `/app/login` es la ruta `tusitio.com/login`).
- `/components`: Aquí están todas las piezas de Lego reusables de UI (Botones, Formularios, Tarjetas de Propiedades, Carruseles). La mayoría son "Client Components" (`"use client"`).
- `/lib`: Utilidades compartidas, funciones de validación (Zod), y el control de Token Storage (dónde se guarda la sesión).
- `/hooks`: Hooks personalizados de React como `useCarousel` (para animaciones), `useIsMobile`, etc.
- `/services`: Archivos encargados de llamar al Backend (API requests usando Fetch o Axios). Todo lo que conecte con Azure pasa por aquí.

## 🔒 Flujo de Autenticación (Auth)

El sistema de autenticación está diseñado para ser seguro y flexible:
1. Cuando un usuario hace login exitosamente, el servidor devuelve un Token JWT.
2. Éste Token se almacena de forma inteligente gracias a `/lib/token-storage.ts`:
   - Si el usuario marcó *"Recuérdame"*: El token va a `localStorage` (persiste aunque cierre el navegador).
   - Si NO lo marcó: El token va a `sessionStorage` (se borra automáticamente si cierra la pestaña).
3. **Seguridad adicional:** El archivo `AuthWatcher.tsx` y las páginas como `/login` aseguran que si un usuario "echa para atrás" en el historial después de desloguearse, no pueda ver datos sensibles si no tenía "Recuérdame" activo.

## 🚀 Despliegue en Vercel

Este frontend está diseñado para correr 100% nativo y gratis en **Vercel**.
Las únicas variables de entorno cruciales son:
- `NEXT_PUBLIC_BACKEND_URL`: Debe apuntar siempre a la URL del contenedor backend en Azure (eg: `https://...azurecontainerapps.io`).
- Evita usar dominios locales para variables "públicas" en el entorno de Producción en Vercel.

---

*Nota: Para instrucciones dirigidas específicamente a IAs de Inteligencia Artificial que trabajan en este repositorio, revisa el archivo `AGENTS.md`.*
