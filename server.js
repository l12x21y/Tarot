import "dotenv/config";
import { createServer } from "node:http";
import { writeFileSync, existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
import { createHash } from "node:crypto";

const port = Number(process.env.RECORDING_PORT ?? 8787);
const allowedOrigin = process.env.ALLOWED_ORIGIN ?? "https://test0415.netlify.app";
// 使用 Render 的持久化磁盘路径（如果可用）或本地路径
const basePath = process.env.RENDER_DISK_PATH || process.cwd();
const dataFile = resolve(basePath, "data", "session-records.sqlite");
const csvExportFile = resolve(basePath, "data", "session-records-export.csv");
const dataDir = dirname(dataFile);

const buildCorsHeaders = () => ({
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type"
});

const sendJson = (res, statusCode, body) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...buildCorsHeaders()
  });
  res.end(JSON.stringify(body));
};

const collectRequestBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
};

const parseLimit = (rawValue, fallback = 100) => {
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.min(Math.floor(value), 1000);
};

const parseOffset = (rawValue) => {
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.floor(value);
};

await mkdir(dataDir, { recursive: true });

const db = new Database(dataFile);
console.log(`[startup] dataFile=${dataFile} exists=${existsSync(dataFile)}`);
db.exec(`
  CREATE TABLE IF NOT EXISTS session_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    received_at TEXT NOT NULL,
    session_id TEXT,
    type TEXT,
    ts INTEGER,
    mode TEXT,
    role TEXT,
    content TEXT,
    inquiry TEXT,
    pre_appraisal TEXT,
    orientation TEXT,
    card_name TEXT,
    card_number TEXT,
    reflection TEXT,
    event_json TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_session_events_session_id ON session_events(session_id);
  CREATE INDEX IF NOT EXISTS idx_session_events_ts ON session_events(ts);
`);

// Ensure older DBs get the new column/index: migrate if necessary
try {
  const cols = db.prepare("PRAGMA table_info(session_events);").all();
  const hasInquiryId = cols.some((c) => c.name === "inquiry_id");
  if (!hasInquiryId) {
    console.log("[migration] adding inquiry_id column to session_events");
    db.prepare("ALTER TABLE session_events ADD COLUMN inquiry_id TEXT;").run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_session_events_inquiry_id ON session_events(inquiry_id);").run();
  }
} catch (err) {
  console.warn("[migration] failed to migrate DB schema", err);
}

// Log current table schema for debugging
try {
  const colsNow = db.prepare("PRAGMA table_info(session_events);").all();
  console.log("[db schema]", colsNow.map((c) => ({ name: c.name, type: c.type })));
} catch (e) {
  console.warn("[db schema] failed to read table_info", e);
}

const insertEventStmt = db.prepare(`
  INSERT INTO session_events (
    inquiry_id,
    received_at,
    session_id,
    type,
    ts,
    mode,
    role,
    content,
    inquiry,
    pre_appraisal,
    orientation,
    card_name,
    card_number,
    reflection,
    event_json
  ) VALUES (
    @inquiryId,
    @receivedAt,
    @sessionId,
    @type,
    @ts,
    @mode,
    @role,
    @content,
    @inquiry,
    @preAppraisal,
    @orientation,
    @cardName,
    @cardNumber,
    @reflection,
    @eventJson
  );
`);

const buildCsvFromRows = (rows) => {
  const safe = (value) => `\"${String(value ?? "").replace(/\"/g, '\"\"')}\"`;
  const dataRows = rows.map((row) => {
    const event = JSON.parse(row.event_json);
    return [
      row.id,
      safe(event.inquiryId),
      safe(event.sessionId),
      safe(event.type),
      safe(event.ts),
      safe(event.mode),
      safe(event.message?.role),
      safe(event.message?.content),
      safe(event.inquiry),
      safe(event.orientation),
      safe(event.card?.name),
      safe(event.card?.number),
      safe(event.receivedAt)
    ].join(",");
  });
  const header = "id,inquiry_id,session_id,type,ts,mode,role,content,inquiry,orientation,card_name,card_number,received_at";
  return [header, ...dataRows].join("\n");
};

const refreshCsvExportFile = () => {
  try {
    const rows = db
      .prepare("SELECT id, event_json FROM session_events ORDER BY id ASC")
      .all();
    const csv = buildCsvFromRows(rows);
    writeFileSync(csvExportFile, csv, "utf8");
    return true;
  } catch (error) {
    console.warn("[csv export] failed to refresh file", error);
    return false;
  }
};

refreshCsvExportFile();

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { ok: false, error: "Missing request URL" });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? `localhost:${port}`}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      ...buildCorsHeaders()
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/logs") {
    try {
      const raw = await collectRequestBody(req);
      const parsed = JSON.parse(raw);
      const receivedAt = new Date().toISOString();
      const inquiryId = parsed?.sessionId && parsed?.inquiry
        ? createHash("sha256").update(`${parsed.sessionId}|${parsed.inquiry}`).digest("hex")
        : null;
      const row = {
        receivedAt,
        inquiryId,
        sessionId: parsed?.sessionId ?? null,
        type: parsed?.type ?? null,
        ts: Number.isFinite(Number(parsed?.ts)) ? Number(parsed.ts) : null,
        mode: parsed?.mode ?? null,
        role: parsed?.message?.role ?? null,
        content: parsed?.message?.content ?? null,
        inquiry: parsed?.inquiry ?? null,
        preAppraisal: parsed?.preAppraisal ?? null,
        orientation: parsed?.orientation ?? null,
        cardName: parsed?.card?.name ?? null,
        cardNumber: parsed?.card?.number ?? null,
        reflection: parsed?.reflection ?? null,
        eventJson: JSON.stringify({ receivedAt, inquiryId, ...parsed })
      };

      let info;
      try {
        info = insertEventStmt.run(row);
        console.log("[insert] run info:", info);
      } catch (e) {
        console.warn("[insert] failed to run statement", e, row);
        throw e;
      }
      const csvRefreshed = refreshCsvExportFile();
      sendJson(res, 200, {
        ok: true,
        id: Number(db.prepare("SELECT last_insert_rowid() AS id").get().id),
        csvRefreshed
      });
    } catch (error) {
      sendJson(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid payload"
      });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/logs") {
    try {
      const sessionId = url.searchParams.get("sessionId");
      const type = url.searchParams.get("type");
      const limit = parseLimit(url.searchParams.get("limit"), 100);
      const offset = parseOffset(url.searchParams.get("offset"));

      const filters = [];
      const params = { limit, offset };
      if (sessionId) {
        filters.push("session_id = @sessionId");
        params.sessionId = sessionId;
      }
      if (type) {
        filters.push("type = @type");
        params.type = type;
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
      const rows = db
        .prepare(
          `SELECT id, inquiry_id, received_at, session_id, type, ts, mode, role, content, inquiry, pre_appraisal, orientation, card_name, card_number, reflection
           FROM session_events
           ${whereClause}
           ORDER BY id DESC
           LIMIT @limit OFFSET @offset`
        )
        .all(params);

      const totalRow = db
        .prepare(`SELECT COUNT(*) AS total FROM session_events ${whereClause}`)
        .get(params);

      sendJson(res, 200, {
        ok: true,
        total: Number(totalRow.total),
        limit,
        offset,
        rows
      });
    } catch (error) {
      sendJson(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : "Query failed"
      });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/export") {
    try {
      const format = url.searchParams.get("format") ?? "json";
      const rows = db
        .prepare("SELECT id, event_json FROM session_events ORDER BY id ASC")
        .all();

      if (format === "csv") {
        const csv = buildCsvFromRows(rows);
        res.writeHead(200, {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=session-events.csv",
          "Access-Control-Allow-Origin": allowedOrigin
        });
        res.end(csv);
        return;
      }

      const events = rows.map((row) => JSON.parse(row.event_json));
      sendJson(res, 200, { ok: true, count: events.length, events });
    } catch (error) {
      sendJson(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : "Export failed"
      });
    }
    return;
  }

  sendJson(res, 404, { ok: false, error: "Not found" });
});

server.listen(port, () => {
  console.log(`Recording backend listening on http://localhost:${port}`);
});