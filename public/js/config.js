// public/js/config.js — ¿a qué servidor le habla el frontend?
// En local: Express sirve las páginas y la API en el mismo lugar → '/api'
// En Vercel: las páginas viven en Vercel y la API en Railway → URL completa de Railway
const EN_VERCEL = location.hostname.endsWith('.vercel.app');

export const API_URL = EN_VERCEL
  ? 'https://CAMBIAR-POR-SU-API.up.railway.app/api'   // ← dominio que les dio Railway
  : '/api';
