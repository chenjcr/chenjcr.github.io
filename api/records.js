export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      let data = await kv.get('inspection_data') || { records: [], stations: [] };
      res.status(200).json(data);
    } else {
      if (!global._inspectionData) global._inspectionData = { records: [], stations: [] };
      res.status(200).json(global._inspectionData);
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
