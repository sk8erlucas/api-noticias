# 📰 API de Noticias Financieras Argentina

API REST para la recopilación automática, análisis de impacto y consulta de noticias financieras del mercado argentino. Utiliza inteligencia artificial (OpenRouter) para generar resúmenes y determinar el impacto y sentimiento de cada noticia.

## Características

- **Scraping automático** de feeds RSS de noticias financieras argentinas
- **Análisis con IA** para cada noticia:
  - Resumen conciso (máx. 3 oraciones)
  - Nivel de impacto: `FUERTE`, `MODERADO` o `DEBIL`
  - Sentimiento: `POSITIVO`, `NEGATIVO` o `NEUTRO`
  - Razón del impacto y del sentimiento
- **Cron job** que ejecuta el procesamiento cada 24 horas (00:00 hora Argentina)
- **Deduplicación** automática por URL: no se repiten noticias ya guardadas
- **Feeds dinámicos**: se pueden agregar/quitar fuentes RSS sin reiniciar el servidor
- **Trigger manual** del job vía endpoint REST

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| IA | OpenRouter (modelos gratuitos) |
| Scraping | Axios + Cheerio |
| RSS | rss-parser |
| Scheduler | node-cron |

## Instalación

### Prerequisitos

- Node.js >= 18
- PostgreSQL >= 13

### Pasos

1. Clonar el repositorio:
```bash
git clone <url-del-repo>
cd api-noticias
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear el archivo `.env` a partir del ejemplo:
```bash
cp .env.example .env
```

4. Completar las variables de entorno en `.env` (ver sección siguiente).

5. Sincronizar el esquema con la base de datos:
```bash
npm run db:push
```

6. Cargar el feed inicial (Perfil - Economía):
```bash
npm run db:seed
```

7. Iniciar el servidor:
```bash
npm start
```

Para desarrollo con hot-reload:
```bash
npm run dev
```

## Variables de Entorno

Crear un archivo `.env` basado en `.env.example`:

| Variable | Descripción | Requerida | Default |
|---|---|---|---|
| `PORT` | Puerto del servidor | No | `3000` |
| `NODE_ENV` | Entorno (`development`/`production`) | No | — |
| `APP_URL` | URL pública de la aplicación | No | `http://localhost:3000` |
| `DATABASE_URL` | URL de conexión a PostgreSQL | **Sí** | — |
| `OPENROUTER_API_KEY` | API Key de [OpenRouter](https://openrouter.ai) | **Sí** | — |
| `AI_MODEL` | Modelo de IA a utilizar | No | `meta-llama/llama-3.1-8b-instruct:free` |

> ⚠️ **IMPORTANTE**: Nunca comitees el archivo `.env`. Está incluido en `.gitignore`.

### Modelos gratuitos disponibles en OpenRouter

- `meta-llama/llama-3.1-8b-instruct:free` *(default)*
- `google/gemma-2-9b-it:free`
- `mistralai/mistral-7b-instruct:free`

Ver lista completa en [openrouter.ai/models](https://openrouter.ai/models?q=free).

## API Reference

### 🗞️ Noticias

#### `GET /api/noticias`
Lista noticias con paginación y filtros opcionales.

**Query params:**
| Param | Tipo | Descripción |
|---|---|---|
| `page` | number | Número de página (default: `1`) |
| `limit` | number | Resultados por página, máx. 100 (default: `20`) |
| `sentimiento` | string | Filtrar por `POSITIVO`, `NEGATIVO` o `NEUTRO` |
| `impacto` | string | Filtrar por `FUERTE`, `MODERADO` o `DEBIL` |
| `fuente` | string | Filtrar por nombre de fuente (búsqueda parcial) |

**Ejemplo:**
```
GET /api/noticias?sentimiento=NEGATIVO&impacto=FUERTE&page=1&limit=10
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "El BCRA sube la tasa de interés al 60%",
      "link": "https://...",
      "resumen": "El Banco Central aumentó la tasa...",
      "impacto": "FUERTE",
      "sentimiento": "NEGATIVO",
      "razonImpacto": "Decisión del BCRA con efecto sistémico",
      "razonSentimiento": "Señal de mayor restricción monetaria",
      "fuente": "Perfil - Economía",
      "publicadoEn": "2024-03-25T10:00:00.000Z",
      "procesadoEn": "2024-03-25T00:01:30.000Z",
      "createdAt": "2024-03-25T00:01:30.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### `GET /api/noticias/:id`
Obtiene una noticia completa (incluye `contenido` scrapeado).

#### `DELETE /api/noticias/:id`
Elimina una noticia. Responde `204 No Content`.

---

### 📡 Feeds RSS

#### `GET /api/feeds`
Lista todos los feeds configurados.

#### `POST /api/feeds`
Agrega un nuevo feed RSS.

**Body:**
```json
{
  "nombre": "Infobae - Economía",
  "url": "https://www.infobae.com/feeds/rss/economia"
}
```

#### `PUT /api/feeds/:id`
Actualiza un feed (nombre, URL o estado activo).

**Body (todos opcionales):**
```json
{
  "nombre": "Nuevo nombre",
  "url": "https://nueva-url.com/feed",
  "activo": false
}
```

#### `DELETE /api/feeds/:id`
Elimina un feed. Responde `204 No Content`.

---

### ⚙️ Jobs

#### `POST /api/jobs/ejecutar`
Dispara manualmente el procesamiento de noticias (no espera a la tarea diaria).
El procesamiento ocurre en background; la respuesta es inmediata.

**Respuesta:**
```json
{
  "mensaje": "Procesamiento iniciado en background",
  "estado": "procesando"
}
```

---

### 🏥 Health Check

#### `GET /health`
```json
{ "status": "ok", "timestamp": "2024-03-25T00:00:00.000Z" }
```

## Cron Job

El sistema ejecuta automáticamente el procesamiento **todos los días a las 00:00 hora Argentina** (`America/Argentina/Buenos_Aires`).

**Flujo de procesamiento:**
1. Lee todos los feeds marcados como activos
2. Parsea el RSS y obtiene los artículos disponibles
3. Por cada artículo, verifica si ya existe en la DB (por URL)
4. Si es nuevo: scrapea el contenido completo del artículo
5. Envía título + contenido a la IA para análisis
6. Guarda la noticia con su resumen, impacto y sentimiento

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm start` | Inicia el servidor en producción |
| `npm run dev` | Inicia con hot-reload (nodemon) |
| `npm run db:push` | Sincroniza el schema con la DB (sin migración) |
| `npm run db:migrate` | Crea una migración con nombre |
| `npm run db:seed` | Carga los feeds iniciales |
| `npm run db:studio` | Abre Prisma Studio (UI de la DB) |

## Agregar más feeds

Usá el endpoint `POST /api/feeds` o agrega entradas al seed en [prisma/seed.js](prisma/seed.js):

```javascript
await prisma.feed.upsert({
  where: { url: 'https://mi-nuevo-feed.com/rss' },
  update: {},
  create: {
    nombre: 'Mi Nuevo Feed',
    url: 'https://mi-nuevo-feed.com/rss',
    activo: true,
  },
});
```

## Licencia

MIT
