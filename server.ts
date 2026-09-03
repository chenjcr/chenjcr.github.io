import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

const PORT = process.env.PORT || 8080;
const DATA_FILE = join(import.meta.dir, "shared_data.json");
const STATIC_DIR = import.meta.dir;

function loadData() {
  try {
    if (!existsSync(DATA_FILE)) return { records: [], stations: [] };
    const text = readFileSync(DATA_FILE, "utf-8");
    return text ? JSON.parse(text) : { records: [], stations: [] };
  } catch (e) {
    console.error("loadData error:", e.message);
    return { records: [], stations: [] };
  }
}

function saveData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    console.log(req.method, url.pathname);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/api/submit" && req.method === "POST") {
      try {
        const text = await req.text();
        const record = JSON.parse(text);
        const data = loadData();
        data.records.push(record);
        saveData(data);
        return new Response(JSON.stringify({ ok: true, total: data.records.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    if (url.pathname === "/api/records" && req.method === "GET") {
      const data = loadData();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
      });
    }

    if (url.pathname === "/api/records/clear" && req.method === "GET") {
      saveData({ records: [], stations: [] });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let fp = url.pathname === "/" ? "/inspection-mobile.html" : url.pathname;
    try {
      const fullPath = join(STATIC_DIR, fp);
      if (existsSync(fullPath)) {
        return new Response(Bun.file(fullPath));
      }
    } catch (e) {}

    return new Response("Not Found", { status: 404 });
  }
});

console.log("Server ready on port " + PORT);