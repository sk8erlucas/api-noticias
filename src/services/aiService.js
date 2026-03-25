const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
    'X-Title': 'API Noticias Financieras Argentina',
  },
});

const MODEL = process.env.AI_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

const SYSTEM_PROMPT = `Eres un analista financiero especializado en el mercado argentino.
Tu tarea es analizar noticias financieras y responder ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional.

Criterios de impacto:
- FUERTE: decisiones del BCRA, cambios en el tipo de cambio, crisis, default, medidas macroeconómicas de alto impacto.
- MODERADO: indicadores económicos (inflación, PBI), resultados empresariales relevantes, cambios normativos.
- DEBIL: noticias sectoriales menores, actualizaciones rutinarias, datos secundarios.

Criterios de sentimiento:
- POSITIVO: crecimiento, estabilidad, inversión, mejora de indicadores, acuerdos favorables.
- NEGATIVO: recesión, default, crisis, caída de indicadores, conflictos.
- NEUTRO: información descriptiva sin implicancias claras positivas o negativas.`;

/**
 * Analiza una noticia financiera con IA y devuelve resumen + impacto + sentimiento.
 * @param {string} titulo
 * @param {string} contenido
 * @returns {Promise<{resumen: string, impacto: string, sentimiento: string, razon_impacto: string, razon_sentimiento: string}>}
 */
async function analyzeNews(titulo, contenido) {
  const userPrompt = `Analiza esta noticia financiera argentina y responde con el JSON exacto:
{
  "resumen": "resumen de máximo 3 oraciones",
  "impacto": "FUERTE|MODERADO|DEBIL",
  "sentimiento": "POSITIVO|NEGATIVO|NEUTRO",
  "razon_impacto": "breve explicación del impacto",
  "razon_sentimiento": "breve explicación del sentimiento"
}

Título: ${titulo}
Contenido: ${contenido.substring(0, 3000)}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 600,
  });

  const text = response.choices[0]?.message?.content || '';

  // Extraer JSON aunque venga envuelto en bloques markdown
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Respuesta de IA no contiene JSON válido: ${text.substring(0, 200)}`);
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Normalizar valores a mayúsculas
  return {
    resumen: parsed.resumen || '',
    impacto: String(parsed.impacto || '').toUpperCase(),
    sentimiento: String(parsed.sentimiento || '').toUpperCase(),
    razon_impacto: parsed.razon_impacto || '',
    razon_sentimiento: parsed.razon_sentimiento || '',
  };
}

module.exports = { analyzeNews };
