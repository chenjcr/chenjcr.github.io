export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({error:'Method not allowed'}); return; }
  try {
    const record = req.body;
    // Use Vercel KV if available, otherwise use global storage
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv');
      let data = await kv.get('inspection_data') || { records: [], stations: [] };
      data.records.push(record);
      await kv.set('inspection_data', data);
      res.status(200).json({ ok: true, total: data.records.length });
    } else {
      // Fallback: use global storage (resets on cold start)
      if (!global._inspectionData) global._inspectionData = { records: [], stations: [] };
      global._inspectionData.records.push(record);
      res.status(200).json({ ok: true, total: global._inspectionData.records.length });
    }
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
}
