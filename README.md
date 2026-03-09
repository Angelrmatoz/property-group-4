# Property Group - Full-Stack Web System for Real Estate Property Management

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)
[![Dominio Propio](https://img.shields.io/badge/Online-propertygrouprd.app-blue?style=for-the-badge&logo=google-chrome)](https://www.propertygrouprd.app/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

# Descripción

Sistema web **full-stack** desarrollado para Property Group, una empresa de bienes raíces.  
La aplicación combina una **landing pública optimizada para marketing** con un **panel administrativo seguro** para la gestión de propiedades.

El sistema incluye:

- Frontend moderno construido con Next.js
- Backend REST API desarrollado con Express
- Autenticación basada en JWT
- Protección contra ataques CSRF
- Persistencia de datos en MongoDB

El objetivo del proyecto es permitir a los administradores **gestionar propiedades inmobiliarias desde un dashboard privado**, mientras los usuarios pueden visualizar las propiedades desde la interfaz pública.

---

# Stack Tecnológico

### Frontend

- Next.js (App Router)
- React
- TailwindCSS
- TypeScript

### Backend

- Node.js
- Express.js
- JWT Authentication
- CSRF Protection

### Base de datos

- MongoDB
- Mongoose

### Infraestructura / Deployment

- Vercel (Frontend)
- Render (Backend)

---

# Características principales

- **Next.js (App Router)** para renderizado híbrido (SSR/SSG).
- **Tailwind CSS** para diseño responsivo y rápido desarrollo de UI.
- **Carrusel dinámico de imágenes** optimizado para rendimiento.
- **Sección de testimonios** con componentes reutilizables.
- **Formulario de contacto** integrado con Formspree.
- **Dashboard administrativo protegido** con autenticación.
- **CRUD completo de propiedades** desde el panel de administración.
- **Modo oscuro / claro** con persistencia de preferencias.
- **Optimización mobile-first** evitando overflow y problemas de UX.

---

# Flujo de la aplicación

1. Los usuarios acceden a la landing pública para visualizar propiedades disponibles.
2. Los administradores pueden autenticarse en el panel administrativo.
3. El backend valida las credenciales y genera un **JWT**.
4. El dashboard consume **APIs protegidas** para gestionar propiedades.
5. Las operaciones sensibles utilizan **protección CSRF**.
6. La información de propiedades se almacena en **MongoDB**.

---

# Instalación y uso

Clona el repositorio:

```bash
git clone https://github.com/Angelrmatoz/property-group-4
cd property-group-4
