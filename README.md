# Property Group - Real Estate Landing Page

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)
[![Dominio Propio](https://img.shields.io/badge/Online-propertygrouprd.app-blue?style=for-the-badge&logo=google-chrome)](https://www.propertygrouprd.app/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

# Property Group - Real Estate Landing Page

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

## Descripción

Landing page profesional y responsiva para Property Group, empresa de bienes raíces. Incluye hero con carrusel de imágenes, testimonios, sección de servicios, información de contacto y formulario funcional para envío de mensajes vía correo electrónico (sin backend propio).

---

## Características principales

- **Next.js (App Router)**: Estructura moderna y optimizada para SSR y SSG.
- **Tailwind CSS**: Estilos utilitarios y responsivos, con personalización de paleta y clases para imágenes.
- **Carrusel de imágenes**: Hero con transición suave y fade automático.
- **Testimonios**: Sección visual y profesional.
- **Formulario de contacto**: Envío de datos a email usando [Formspree](https://formspree.io/) (no requiere backend propio). Todos los campos tienen atributo `name` para compatibilidad.
- **Sin desbordamiento en móvil**: Corrección de scroll horizontal y líneas blancas.
- **Textarea sin resize manual**: Mejor UX en dispositivos móviles.
- **Modo oscuro/claro**: Alternancia de tema con persistencia.
- **Licencia MIT**: Uso y modificación libre.

---

## Instalación y uso

---

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

---

## Estructura del proyecto

- `app/` — Páginas principales, layout, rutas y componentes de alto nivel.
- `components/` — Componentes reutilizables (UI, Header, Footer, Testimonials, etc).
- `hooks/` — Custom hooks (ej: useCarousel, useIsMobile, useToast).
- `public/` — Imágenes y recursos estáticos.
- `styles/` — Archivos CSS globales.
- `lib/` — Utilidades compartidas.

---

## Formulario de contacto

El formulario de contacto utiliza [Formspree](https://formspree.io/) para enviar mensajes directamente a un correo electrónico configurado, sin necesidad de backend propio. Todos los campos incluyen el atributo `name` requerido por Formspree.

---

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

Property Group es una landing page profesional para el sector inmobiliario, desarrollada con Next.js y React. Permite mostrar proyectos residenciales y comerciales, filtrar propiedades, y contactar asesores de manera sencilla y moderna. El diseño es responsivo, optimizado para SEO y preparado para despliegue en Vercel.

## Características principales

- Catálogo de proyectos inmobiliarios con filtros avanzados
- Diseño moderno y responsivo (mobile-first)
- Componentes UI reutilizables (Radix UI, Lucide, Geist, etc.)
- Formularios y validación con React Hook Form y Zod
- Animaciones y estilos con TailwindCSS
- Imágenes optimizadas y recursos estáticos
- Preparado para despliegue continuo en Vercel

## Stack Tecnológico

- **Framework:** Next.js (React)
- **Estilos:** TailwindCSS, tailwindcss-animate, tailwind-merge
- **Componentes UI:** Radix UI, Lucide, Geist, Embla Carousel
- **Formularios:** react-hook-form, zod
- **Gráficas:** recharts
- **Notificaciones:** sonner
- **Utilidades:** clsx, class-variance-authority
- **Despliegue:** Vercel

## Estructura del Proyecto

```
├── app/                # Páginas y rutas principales (Next.js App Router)
├── components/         # Componentes UI reutilizables
├── hooks/              # Hooks personalizados
├── lib/                # Utilidades y helpers
├── public/             # Imágenes y recursos estáticos
├── styles/             # Archivos de estilos globales
├── package.json        # Dependencias y scripts
├── next.config.mjs     # Configuración de Next.js
└── README.md           # Documentación del proyecto
```

## Instalación y uso local

1. Clona el repositorio:

   ```sh
   git clone https://github.com/Angelrmatoz/property-group-4.git
   cd property-group-4
   ```

2. Instala las dependencias:
   ```sh
   pnpm install
   # o (si prefieres npm)
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```sh
   pnpm run dev
   # o (si prefieres npm)
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue

El proyecto está desplegado y disponible en:

**[https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)**

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, abre un issue o pull request para sugerencias o mejoras.

## Licencia

Este proyecto está bajo la licencia MIT.
