# Autenticación — Guía de implementación para el Frontend

## Descripción general

El sistema de autenticación usa **JWT (JSON Web Token)** con expiración de **7 días**. El token se envía en cada request protegido mediante el header `Authorization: Bearer <token>`.

---

## Endpoints

### `POST /api/auth/register` — Registro de usuario

Crea una cuenta nueva.

**Rate limit:** 20 peticiones cada 15 minutos por IP.

**Body (JSON):**
```json
{
  "email": "usuario@example.com",
  "password": "miPassword123",
  "nombre": "Lucas"
}
```

| Campo      | Tipo   | Requerido | Validaciones                          |
|------------|--------|-----------|---------------------------------------|
| `email`    | string | ✅         | Formato email válido, único           |
| `password` | string | ✅         | Mínimo 8 caracteres                   |
| `nombre`   | string | ❌         | Nombre para mostrar (opcional)        |

**Respuesta exitosa `201`:**
```json
{
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "nombre": "Lucas",
    "createdAt": "2026-03-30T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores posibles:**
| Status | Descripción                             |
|--------|-----------------------------------------|
| `400`  | Faltan campos requeridos o validación   |
| `409`  | El email ya está registrado             |

---

### `POST /api/auth/login` — Inicio de sesión

**Rate limit:** 20 peticiones cada 15 minutos por IP.

**Body (JSON):**
```json
{
  "email": "usuario@example.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa `200`:**
```json
{
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "nombre": "Lucas",
    "createdAt": "2026-03-30T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores posibles:**
| Status | Descripción                    |
|--------|--------------------------------|
| `400`  | Faltan campos requeridos       |
| `401`  | Credenciales inválidas         |

---

### `GET /api/auth/me` — Datos del usuario autenticado

Requiere autenticación.

**Header requerido:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa `200`:**
```json
{
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "nombre": "Lucas",
    "createdAt": "2026-03-30T12:00:00.000Z"
  }
}
```

**Errores posibles:**
| Status | Descripción              |
|--------|--------------------------|
| `401`  | Token ausente o inválido |
| `401`  | Token expirado           |

---

## Cómo usar el token en el frontend

1. **Guardar el token** tras login o registro (en `localStorage` o `sessionStorage`).
2. **Adjuntarlo en cada request protegido** como header HTTP.

### Ejemplo con `fetch`:
```js
const token = localStorage.getItem('token');

const response = await fetch('/api/user/favoritos', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### Ejemplo con `axios`:
```js
import axios from 'axios';

const api = axios.create({ baseURL: 'https://tu-api.com' });

// Interceptor global para agregar el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## Errores de autenticación

Cuando el servidor responde con `401`, el frontend debe:
1. Eliminar el token almacenado.
2. Redirigir al usuario al login.

```js
if (response.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

---

## Variable de entorno requerida en el servidor

```env
JWT_SECRET=una_clave_secreta_muy_larga_y_segura
```
