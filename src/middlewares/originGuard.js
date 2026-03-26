// Solo permite peticiones cuyo Origin o Referer pertenezca a *.sitemaster.com.ar
const ALLOWED_ORIGIN = /^https?:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?\.sitemaster\.com\.ar(\/.*)?$/i;

function originGuard(req, res, next) {
  const origin = req.headers['origin'] || req.headers['referer'] || '';

  if (!ALLOWED_ORIGIN.test(origin)) {
    return res.status(403).json({ error: 'Acceso denegado: origen no permitido.' });
  }

  next();
}

module.exports = originGuard;
