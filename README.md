# Nobu — TP2 Programación IV (2026 C1)

Red social desarrollada como Trabajo Práctico de la materia Programación IV. Permite a los usuarios registrarse, iniciar sesión, publicar contenido y gestionar su perfil.

## 👤 Alumno

**Franco Vicente**

## 🔗 Enlaces

- **Deploy (Frontend):** [franco-vicente-tp-2-prog-4-2026-c1.vercel.app](https://franco-vicente-tp-2-prog-4-2026-c1.vercel.app/)
- **Repositorio:** [github.com/Franconicovicente/FRANCO-VICENTE-TP2-PROG4-2026-C1](https://github.com/Franconicovicente/FRANCO-VICENTE-TP2-PROG4-2026-C1.git)
- **Backend (API):** desplegado en Render

## 🛠️ Tecnologías utilizadas

### Frontend
- **Angular ** 
- **Signals** para el manejo de estado reactivo
- **CSS** con variables personalizadas (sistema de theming claro/oscuro)
- **Vercel** para el hosting y deploy continuo

### Backend
- **NestJS** 
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
