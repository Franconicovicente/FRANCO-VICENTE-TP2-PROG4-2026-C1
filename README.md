# Nobu — TP2 Programación IV (2026 C1)

Red social desarrollada como Trabajo Práctico de la materia Programación IV. Permite a los usuarios registrarse, iniciar sesión, publicar contenido, comentar, y gestionar su perfil. Incluye un panel de administración con gestión de usuarios y estadísticas visuales.

## 👤 Alumno

**Franco Vicente**

## 🔗 Enlaces

- **Deploy (Frontend):** [franco-vicente-tp-2-prog-4-2026-c1.vercel.app](https://franco-vicente-tp-2-prog-4-2026-c1.vercel.app/)
- **Repositorio:** [github.com/Franconicovicente/FRANCO-VICENTE-TP2-PROG4-2026-C1](https://github.com/Franconicovicente/FRANCO-VICENTE-TP2-PROG4-2026-C1.git)
- **Backend (API):** desplegado en Render

## 🛠️ Tecnologías utilizadas

### Frontend
- **Angular 18+** (standalone components, sin NgModules)
- **Signals** para el manejo de estado reactivo (`signal`, `computed`, `input`, `output`)
- **RxJS** para manejo de observables y operadores (`forkJoin`, `timer`, `catchError`)
- **Chart.js** para gráficos del dashboard de estadísticas
- **CSS** con variables personalizadas (sistema de theming claro/oscuro)
- **PWA** (Progressive Web App) — instalable como app nativa
- **Vercel** para el hosting y deploy continuo

### Backend
- **NestJS** (framework de Node.js)
- **MongoDB** + **Mongoose** como base de datos
- **JWT** (`jsonwebtoken` + `@nestjs/jwt` + `@nestjs/passport`) para autenticación y autorización
- **bcrypt** para encriptación de contraseñas
- **Cloudinary** + Multer para almacenamiento de imágenes de perfil y publicaciones
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

---

### 🚀 Sprint #2 — Miércoles 24 de junio

**Frontend (Angular):**
- **Página Publicaciones (Feed):** listado de publicaciones conectado al backend real, ordenado por fecha por defecto, con opción de reordenar por cantidad de me gusta desde un selector. Paginación mediante botón "Cargar más" (carga de a tandas limitadas, usando `offset`/`limit`).
- Cada publicación se renderiza como un componente independiente y reutilizable (`PostCardComponent`), compartido entre el Feed y Mi Perfil.
- Dar y quitar "me gusta" en cada publicación, reflejado en tiempo real sin recargar la página.
- Eliminar las publicaciones propias directamente desde la tarjeta de la publicación, con confirmación mediante modal (no `alert()`). Si el usuario tiene rol `administrador`, puede eliminar también publicaciones de otros usuarios.
- Creación de publicaciones desde el Feed con título, descripción e imagen opcional (con previsualización antes de publicar).
- **Componente Mi Perfil:** muestra todos los datos reales del usuario logueado (nombre, apellido, usuario, correo, fecha de nacimiento, descripción, foto de perfil). Muestra las últimas 3 publicaciones propias mediante el mismo componente de tarjeta reutilizado del Feed.
- Interceptor HTTP (`authInterceptor`) que adjunta automáticamente el token JWT en el header `Authorization` de cada petición saliente, sin necesidad de repetirlo manualmente en cada servicio.
- Guard de rutas (`authGuard`) conectado realmente al estado de sesión, bloqueando el acceso a Feed y Mi Perfil si no hay una sesión activa.

**Backend (NestJS):**
- **Implementación de autenticación JWT real:** se incorporó `@nestjs/jwt`, `@nestjs/passport` y `passport-jwt` para validar el token en cada request protegido (`JwtStrategy` + `JwtAuthGuard`), exponiendo los datos del usuario autenticado (`uuid`, `correo`, `username`, `rol`) mediante un decorador propio (`@CurrentUser()`).
- **Módulo Publicaciones — Controller:**
  - `POST /posts`: alta de publicación (título, descripción, imagen opcional subida a Cloudinary). El autor se obtiene del JWT.
  - `GET /posts`: listado con parámetro de orden (`sort=fecha` o `sort=likes`), paginación con `offset`/`limit`, y filtro por usuario autor.
  - `DELETE /posts/:id`: baja lógica (soft delete). Solo el autor o un administrador pueden eliminar.
  - `POST /posts/:id/like` y `DELETE /posts/:id/like`: dar y quitar me gusta, evitando duplicados.

---

### 🚀 Sprint #3 — Martes 30 de junio

**Frontend (Angular):**
- **Pantalla de carga inicial (Splash):** al iniciar la app, se muestra una pantalla animada con el logo y nombre de la app mientras se valida el token contra el backend. Si el token es válido, navega al Feed; si no, limpia la sesión y redirige al Login. Usa `forkJoin` con un timer mínimo de 700ms para garantizar que el splash siempre sea visible.
- **Pantalla de detalle de publicación:** vista completa de una publicación con sus comentarios paginados (5 por página, botón "Cargar más"). Permite escribir nuevos comentarios y editar los propios (con marca de "(editado)").
- **Sistema de gestión de sesión:** contador que dispara un modal a los 10 minutos de sesión activa (cuando quedan 5 de los 15 totales del token JWT) preguntando si el usuario desea extender la sesión. Si confirma, llama a `/auth/refrescar` y reinicia el contador. Si cualquier petición devuelve 401 (token vencido), el interceptor limpia la sesión automáticamente y redirige al Login.
- **Variables de entorno** (`environments/`): separación de URLs de desarrollo (`localhost`) y producción (Render), seleccionadas automáticamente por Angular según el comando (`ng serve` vs `ng build`).

**Backend (NestJS):**
- **Módulo Comentarios:** sub-recurso de publicaciones con rutas anidadas (`/posts/:postId/comments`).
  - `POST /posts/:postId/comments`: agregar comentario, autor y fecha tomados del JWT.
  - `GET /posts/:postId/comments`: listar comentarios paginados, ordenados más recientes primero.
  - `PUT /posts/:postId/comments/:commentId`: editar mensaje propio, marca el comentario como `modificado: true`.
- **Módulo Autenticación — nuevos endpoints:**
  - `POST /auth/autorizar`: valida el token actual y devuelve los datos completos del usuario autenticado.
  - `POST /auth/refrescar`: genera un nuevo token con la misma payload y vencimiento de 15 minutos, renovando la sesión sin necesidad de volver a ingresar credenciales.
- **`GET /posts/:id`**: endpoint para traer una publicación individual por su ID, con el autor poblado.

---

### 🚀 Sprint #4 — Miércoles 1 de julio

**Frontend (Angular):**
- **Dashboard de Administración:** sección exclusiva para usuarios con rol `administrador`, accesible desde el sidebar (los links solo aparecen si el usuario logueado es admin).
- **Gestión de Usuarios (solo admin):** listado completo de usuarios con su estado (activo/deshabilitado). Formulario para crear nuevos usuarios con radio buttons para elegir el rol (`usuario` o `administrador`). Botones para deshabilitar y rehabilitar usuarios individualmente.
- **Dashboard de Estadísticas (solo admin):** 3 gráficos interactivos con Chart.js y selector de rango de fechas (`desde`/`hasta`):
  - Gráfico de **torta**: publicaciones por usuario en el período seleccionado.
  - Gráfico de **barras**: cantidad de comentarios por publicación en el período seleccionado.
  - Gráfico de **líneas**: evolución de comentarios por fecha en el período seleccionado.
- **3 Pipes propias:** `FechaRelativaPipe` (convierte fechas ISO a texto relativo: "Hace 2 horas", "Ayer", etc.), `NombreCompletoPipe` (concatena nombre y apellido), `EstadoUsuarioPipe` (muestra "Activo" o "Deshabilitado" según el campo `eliminado`).
- **3 Directivas propias:** `ResaltarAdminDirective` (aplica estilos visuales a elementos de usuarios administradores), `TooltipDirective` (muestra un tooltip personalizado al hacer hover), `AutoFocusDirective` (enfoca automáticamente un input al renderizarse).
- **PWA (Progressive Web App):** la app es instalable como aplicación nativa en dispositivos móviles y de escritorio. Incluye Service Worker para caché de recursos, manifest con nombre, íconos y colores de la app, y soporte offline para los recursos ya cacheados.

**Backend (NestJS):**
- **Módulo Usuarios — Controller (solo admin):** todas las rutas protegidas con `JwtAuthGuard` + `AdminGuard` (valida que el token pertenezca a un administrador).
  - `GET /users`: listado de todos los usuarios (sin contraseñas).
  - `POST /users`: alta de nuevo usuario con rol elegible (`usuario` o `administrador`).
  - `DELETE /users/:id`: baja lógica (campo `eliminado: true`). Un usuario deshabilitado no puede iniciar sesión y recibe un mensaje informativo al intentarlo.
  - `POST /users/:id/habilitar`: alta lógica, rehabilita un usuario previamente deshabilitado.
- **Módulo Estadísticas — Controller (solo admin):** rutas protegidas con `JwtAuthGuard` + `AdminGuard`, con parámetros opcionales `desde` y `hasta` para filtrar por rango de fechas.
  - `GET /stats/posts-por-usuario`: cantidad de publicaciones agrupadas por autor.
  - `GET /stats/comentarios-por-fecha`: cantidad de comentarios agrupados por día.
  - `GET /stats/comentarios-por-publicacion`: cantidad de comentarios agrupados por publicación.
- **`AdminGuard`:** guard propio que verifica que el payload del JWT contenga `rol: 'administrador'`, lanzando un `403 Forbidden` en caso contrario.
