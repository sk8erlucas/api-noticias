# Leer más tarde y Favoritos — Guía de implementación para el Frontend

## Descripción general

Ambas funcionalidades (**leer más tarde** y **favoritos**) permiten al usuario guardar noticias personalmente. Todas las rutas son **privadas** y requieren autenticación JWT.

**Base path:** `/api/user`

---

## Autenticación requerida

Todos los endpoints de esta sección requieren el header:
```
Authorization: Bearer <token>
```
Si no se envía o es inválido, el servidor responde `401`.

---

## Leer más tarde

### `GET /api/user/leer-mas-tarde` — Listar noticias guardadas

**Respuesta exitosa `200`:**
```json
{
  "total": 2,
  "noticias": [
    {
      "id": 42,
      "titulo": "El Merval sube un 3% impulsado por los bancos",
      "link": "https://...",
      "resumen": "...",
      "impacto": "FUERTE",
      "sentimiento": "POSITIVO",
      "fuente": "Ámbito",
      "pais": "AR",
      "publicadoEn": "2026-03-30T10:00:00.000Z",
      "guardadoEn": "2026-03-30T12:30:00.000Z"
    }
  ]
}
```

---

### `POST /api/user/leer-mas-tarde/:noticiaId` — Agregar noticia

Agrega la noticia con el `id` indicado a la lista. Si ya existe, no genera error (idempotente).

**Ejemplo:**
```
POST /api/user/leer-mas-tarde/42
```

**Respuesta exitosa `201`:**
```json
{
  "mensaje": "Noticia agregada a leer más tarde.",
  "id": 7
}
```

**Errores posibles:**
| Status | Descripción             |
|--------|-------------------------|
| `400`  | noticiaId inválido      |
| `404`  | Noticia no encontrada   |

---

### `DELETE /api/user/leer-mas-tarde/:noticiaId` — Quitar noticia

**Ejemplo:**
```
DELETE /api/user/leer-mas-tarde/42
```

**Respuesta exitosa `200`:**
```json
{
  "mensaje": "Noticia eliminada de leer más tarde."
}
```

---

## Favoritos

### `GET /api/user/favoritos` — Listar favoritos

**Respuesta exitosa `200`:**
```json
{
  "total": 1,
  "noticias": [
    {
      "id": 15,
      "titulo": "Dólar blue baja luego de semanas de suba",
      "link": "https://...",
      "resumen": "...",
      "impacto": "MODERADO",
      "sentimiento": "NEGATIVO",
      "fuente": "Infobae",
      "pais": "AR",
      "publicadoEn": "2026-03-29T08:00:00.000Z",
      "guardadoEn": "2026-03-30T09:15:00.000Z"
    }
  ]
}
```

---

### `POST /api/user/favoritos/:noticiaId` — Agregar a favoritos

**Ejemplo:**
```
POST /api/user/favoritos/15
```

**Respuesta exitosa `201`:**
```json
{
  "mensaje": "Noticia agregada a favoritos.",
  "id": 3
}
```

**Errores posibles:**
| Status | Descripción             |
|--------|-------------------------|
| `400`  | noticiaId inválido      |
| `404`  | Noticia no encontrada   |

---

### `DELETE /api/user/favoritos/:noticiaId` — Quitar de favoritos

**Ejemplo:**
```
DELETE /api/user/favoritos/15
```

**Respuesta exitosa `200`:**
```json
{
  "mensaje": "Noticia eliminada de favoritos."
}
```

---

## Ejemplos de integración React

### Hook personalizado para favoritos
```jsx
import { useState, useEffect } from 'react';

function useFavoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    fetch('/api/user/favoritos', { headers })
      .then((r) => r.json())
      .then((data) => setFavoritos(data.noticias ?? []));
  }, []);

  const agregar = async (noticiaId) => {
    await fetch(`/api/user/favoritos/${noticiaId}`, { method: 'POST', headers });
    setFavoritos((prev) => [...prev, { id: noticiaId }]);
  };

  const quitar = async (noticiaId) => {
    await fetch(`/api/user/favoritos/${noticiaId}`, { method: 'DELETE', headers });
    setFavoritos((prev) => prev.filter((n) => n.id !== noticiaId));
  };

  return { favoritos, agregar, quitar };
}
```

### Botón toggle en una tarjeta de noticia
```jsx
function BotonFavorito({ noticiaId }) {
  const { favoritos, agregar, quitar } = useFavoritos();
  const esFavorito = favoritos.some((n) => n.id === noticiaId);

  const toggleFavorito = () => {
    if (esFavorito) quitar(noticiaId);
    else agregar(noticiaId);
  };

  return (
    <button onClick={toggleFavorito}>
      {esFavorito ? '★ Favorito' : '☆ Agregar a favoritos'}
    </button>
  );
}
```

---

## Notas importantes

- Un usuario **no puede duplicar** una noticia en la misma lista (la API es idempotente en el `POST`).
- Las listas son **independientes**: una noticia puede estar en favoritos y en leer más tarde al mismo tiempo.
- El campo `guardadoEn` indica **cuándo el usuario la guardó**, no cuándo fue publicada.
- Las listas se devuelven **ordenadas por fecha de guardado descendente** (la más reciente primero).
