# Serene Social — TP2 Programación IV (2026 C1)

Red social desarrollada como Trabajo Práctico de la materia Programación IV. Permite a los usuarios registrarse, iniciar sesión, publicar contenido y gestionar su perfil.

## 👤 Alumno

**Franco Vicente**

## 🔗 Enlaces

- **Deploy (Frontend):** [franco-vicente-tp-2-prog-4-2026-c1.vercel.app](https://franco-vicente-tp-2-prog-4-2026-c1.vercel.app/)
- **Repositorio:** [github.com/Franconicovicente/FRANCO-VICENTE-TP2-PROG4-2026-C1](https://github.com/Franconicovicente/FRANCO-VICENTE-TP2-PROG4-2026-C1.git)
- **Backend (API):** desplegado en Render

## 🛠️ Tecnologías utilizadas

### Frontend
- **Angular 18+** (standalone components, sin NgModules)
- **Signals** para el manejo de estado reactivo
- **CSS** con variables personalizadas (sistema de theming claro/oscuro)
- **Vercel** para el hosting y deploy continuo

### Backend
- **NestJS** (framework de Node.js)
- **MongoDB** + **Mongoose** como base de datos
- **JWT** (jsonwebtoken) para autenticación
- **bcrypt** para encriptación de contraseñas
- **Cloudinary** + Multer para almacenamiento de imágenes de perfil
- **Render** para el hosting y deploy continuo

### Base de datos
- **MongoDB Atlas** (cloud)

## 📁 Estructura del proyecto

Este es un monorepo con dos carpetas principales:

```
/
├── backend/    → API REST construida con NestJS
└── frontend/   → Aplicación cliente construida con Angular
```

---

## 📌 Sprints

### 🚀 Sprint #1 — Martes 23 de junio

**Frontend (Angular):**
- Creación del proyecto Angular con arquitectura modular (`core`, `shared`, `pages`).
- Implementación de las 4 pantallas principales: **Registro**, **Login**, **Publicaciones (Feed)** y **Mi Perfil**.
- Deploy del frontend en Vercel.
- Navegación clara entre componentes mediante rutas anidadas y un layout compartido (navbar + sidebar) para las pantallas autenticadas.
- Favicon e identidad visual propia.
- **Login:** formulario con validaciones reactivas, acepta inicio de sesión por correo o nombre de usuario indistintamente.
- **Registro:** formulario completo con nombre, apellido, correo, nombre de usuario, contraseña, repetir contraseña, fecha de nacimiento y descripción breve. Incluye campo de tipo `file` para la foto de perfil, con previsualización antes de enviarla. El atributo `rol` del usuario se asigna por defecto como `"usuario"`.
- Sistema de modales propio para confirmaciones y mensajes de error/éxito (sin uso de `alert()` nativo del navegador).
- Soporte de tema claro/oscuro persistente.

**Backend (NestJS):**
- Creación del proyecto NestJS con arquitectura modular.
- Módulos implementados: **Autenticación**, **Usuarios**, **Publicaciones**.
- **Autenticación — Registro (POST `/auth/register`):** recibe todos los datos del formulario (incluyendo la imagen), valida que el correo y el nombre de usuario no estén duplicados, encripta la contraseña con `bcrypt` antes de guardarla, sube la imagen de perfil a Cloudinary y persiste la URL resultante en la base de datos.
- **Autenticación — Login (POST `/auth/login`):** recibe usuario/correo y contraseña en texto plano, compara contra el hash almacenado, y de ser válido devuelve todos los datos del usuario (sin la contraseña) junto con un token JWT.
- Conexión a base de datos MongoDB Atlas mediante Mongoose.

### 🚀 Sprint #2 — Miércoles 24 de junio

**Frontend (Angular):**
- **Página Publicaciones (Feed):** listado de publicaciones conectado al backend real, ordenado por fecha por defecto, con opción de reordenar por cantidad de me gusta desde un selector. Paginación mediante botón "Cargar más" (carga de a tandas limitadas, usando `offset`/`limit`).
- Cada publicación se renderiza como un componente independiente y reutilizable (`PostCardComponent`), compartido entre el Feed y Mi Perfil.
- Dar y quitar "me gusta" en cada publicación, reflejado en tiempo real sin recargar la página.
- Eliminar las publicaciones propias directamente desde la tarjeta de la publicación, con confirmación mediante modal (no `alert()`). Si el usuario tiene rol `administrador`, puede eliminar también publicaciones de otros usuarios.
- Creación de publicaciones desde el Feed con título, descripción e imagen opcional (con previsualización antes de publicar).
- **Componente Mi Perfil:** muestra todos los datos reales del usuario logueado (nombre, apellido, usuario, correo, fecha de nacimiento, descripción, foto de perfil) obtenidos del usuario autenticado. Muestra las últimas 3 publicaciones propias mediante el mismo componente de tarjeta reutilizado del Feed.
- Interceptor HTTP (`authInterceptor`) que adjunta automáticamente el token JWT en el header `Authorization` de cada petición saliente, sin necesidad de repetirlo manualmente en cada servicio.
- Guard de rutas (`authGuard`) corregido y conectado realmente al estado de sesión, bloqueando el acceso a Feed y Mi Perfil si no hay una sesión activa.

**Backend (NestJS):**
- **Implementación de autenticación JWT real:** se incorporó `@nestjs/jwt`, `@nestjs/passport` y `passport-jwt` para validar el token en cada request protegido (`JwtStrategy` + `JwtAuthGuard`), exponiendo los datos del usuario autenticado (`uuid`, `correo`, `username`, `rol`) mediante un decorador propio (`@CurrentUser()`).
- **Módulo Publicaciones — Controller:**
  - `POST /posts`: alta de publicación (título, descripción, imagen opcional). La imagen se sube a Cloudinary y su URL se persiste en la base. El autor de la publicación se obtiene directamente del JWT, no se recibe desde el cliente.
  - `GET /posts`: listado de publicaciones con parámetro de orden (`sort=fecha` o `sort=likes`), y paginación mediante `offset` y `limit`. Permite además filtrar por usuario autor.
  - `DELETE /posts/:id`: baja lógica (soft delete, campo `eliminado`). Solo permitida si el usuario autenticado es el creador de la publicación o tiene rol `administrador`.
  - `POST /posts/:id/like`: agrega el "me gusta" del usuario autenticado a la publicación, evitando duplicados.
  - `DELETE /posts/:id/like`: quita el "me gusta" del usuario autenticado, solo si lo había dado previamente.
- Todas las rutas de creación, eliminación y "me gusta" están protegidas con `JwtAuthGuard`; el listado (`GET /posts`) permanece público en este sprint.
