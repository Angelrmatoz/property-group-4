# Property Group - Backend API

Esta es la guía y manual técnico sobre cómo está construido el cerebro y la base de datos de Property Group 4, para que un desarrollador humano le sea fácil encontrar la lógica en caso de necesitar mantenimiento.

## 🏗️ Estructura de Carpetas

Este backend está hecho en **Node.js con Express**, y utiliza **MongoDB** como base de datos con **Mongoose**.

- `/src/index.ts`: Punto de entrada (Entry point) que levanta el servidor de Express. Aquí verás todo el middleware global config (CORS, Morgan, `app.use()`).
- `/src/mongo.ts`: Configuración que inicializa e inyecta la conexión a MongoDB desde la URI `.env`.
- `/src/controllers`: Cada archivo es una "ruta" (Route handler). Por ejemplo, en `login.ts` va toda la lógica para verificar emails y enviar Tokens JWT. `properties.ts` hace CRUD a los inmuebles inmobiliarios.
- `/src/models`: Schemas de Mongoose. Definen estrictamente todos los campos que MongoDB permitirá insertar en las colecciones (ej. Modelos para Usuarios y Modelos para Propiedades).
- `/src/middleware`: Archivos interceptores de peticiones. Por ejemplo, `error.ts` (manejar excepciones antes del crash de servidor) o autorización.
- `/src/utils`: Componentes reciclables para facilitar la carga al código. Destaca `config.ts` por donde entran las variables `.env`.
- `/docker-compose.dev.yml` y `Dockerfile`: Reglas de virtualización para aislar los entornos en empaquetados reproducibles, sin importar la máquina del programador.

## 🔒 Control de CORS
El Backend de esta App no sufre de restricciones abiertas. La variable `FRONTEND_ORIGIN` del `.env` le prohíbe explícitamente comunicarse con servidores no oficiales, pero permite listar arrays (separados por coma `,`) de frontend Vercel (tanto de Preview como de Prod).

## 🚀 Despliegue en Azure Container Apps
Este Backend ya no utiliza Render.com a causa de latencia y créditos. Está migrado al **Escudo Gratuito (Consumption Plan)** de Microsoft Azure.
La automatización y Continuous Integration funcionan de esta forma:
1. El programador hace `git push main`.
2. El archivo `.github/workflows/deploy-backend.yml` se gatilla automáticamente en un corredor remoto de GitHub alojado en el SO de Ubuntu.
3. Se compila `Dockerfile` para inyectar su código, exportándose a GitHub Container Registry (`ghcr.io`).
4. Azure "escala a cero", notando cambios nuevos de su imagen asignada y se refresca automáticamente.

> Las variables de base de datos `.env` **solo se registran manualmente en Azure**. GitHub no toca contraseñas en todo su trayecto CI/CD.

---

*Para instrucciones dirigidas específicamente a la Inteligencia Artificial que trabajan en este repositorio, revisa el archivo `AGENTS.md`.*
