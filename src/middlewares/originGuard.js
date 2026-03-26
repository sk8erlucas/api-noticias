// Solo permite peticiones cuyo Origin o Referer pertenezca a *.sitemaster.com.ar
// Si no se envía ninguno de los dos (llamadas server-side / SSR), se deja pasar.
const ALLOWED_ORIGIN = /^https?:\/\/([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*sitemaster\.com\.ar(\/.*)?$/i;

function originGuard(req, res, next) {
  const origin = req.headers['origin'] || req.headers['referer'] || '';

  // Sin header de origen → llamada server-side, se permite
  if (!origin) {
    return next();
  }

  if (!ALLOWED_ORIGIN.test(origin)) {
    return res.status(403).json({ error: 'Acceso denegado: origen no permitido.' });
  }

  next();
}

module.exports = originGuard;
