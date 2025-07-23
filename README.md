# Property Group - Real Estate Landing Page

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

## Descripción

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
   npm install
   # o
   pnpm install
   ```
3. Inicia el servidor de desarrollo:
   ```sh
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue

El proyecto está desplegado en Vercel:

**[https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page](https://vercel.com/angelrmatoz-1224s-projects/v0-react-landing-page)**

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, abre un issue o pull request para sugerencias o mejoras.

## Licencia

Este proyecto está bajo la licencia MIT.
