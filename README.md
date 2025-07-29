# Property Group - Real Estate Landing Page

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)
[![Dominio Propio](https://img.shields.io/badge/Online-propertygrouprd.app-blue?style=for-the-badge&logo=google-chrome)](https://www.propertygrouprd.app/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

# Property Group - Real Estate Landing Page

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

## Descripción

Landing page profesional y responsiva para Property Group, empresa de bienes raíces. Incluye hero con carrusel de imágenes, testimonios, sección de servicios, información de contacto y formulario funcional para envío de mensajes vía correo electrónico (sin backend propio).

## Características principales

- **Next.js (App Router)**: Estructura moderna y optimizada para SSR y SSG.
- **Tailwind CSS**: Estilos utilitarios y responsivos, con personalización de paleta y clases para imágenes.
- **Carrusel de imágenes**: Hero con transición suave y fade automático.
- **Testimonios**: Sección visual y profesional.
- **Formulario de contacto**: Envío de datos a email usando [Formspree](https://formspree.io/) (no requiere backend propio). Todos los campos tienen atributo `name` para compatibilidad.
- **Sin desbordamiento en móvil**: Corrección de scroll horizontal y líneas blancas.
- **Textarea sin resize manual**: Mejor UX en dispositivos móviles.
- **Modo oscuro/claro**: Alternancia de tema con persistencia.

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

3. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   # o npm run dev
   ```
4. Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

## Estructura del proyecto

- `app/` — Páginas principales, layout, rutas y componentes de alto nivel.
- `components/` — Componentes reutilizables (UI, Header, Footer, Testimonials, etc).
- `hooks/` — Custom hooks (ej: useCarousel, useIsMobile, useToast).
- `public/` — Imágenes y recursos estáticos.
- `styles/` — Archivos CSS globales.
- `lib/` — Utilidades compartidas.

## Formulario de contacto

El formulario de contacto utiliza [Formspree](https://formspree.io/) para enviar mensajes directamente a un correo electrónico configurado, sin necesidad de backend propio. Todos los campos incluyen el atributo `name` requerido por Formspree.
