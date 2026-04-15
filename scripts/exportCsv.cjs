const fs = require("node:fs");
const Database = require("better-sqlite3");

const db = new Database("data/session-records.sqlite");
const rows = db
  .prepare(
    "SELECT id, session_id, type, ts, mode, role, content, inquiry, orientation, card_name, card_number, received_at FROM session_events ORDER BY id ASC"
  )
  .all();

const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const header = "id,session_id,type,ts,mode,role,content,inquiry,orientation,card_name,card_number,received_at";
const lines = rows.map((r) =>
  [
    r.id,
    esc(r.session_id),
    esc(r.type),
    esc(r.ts),
    esc(r.mode),
    esc(r.role),
    esc(r.content),
    esc(r.inquiry),
    esc(r.orientation),
    esc(r.card_name),
    esc(r.card_number),
    esc(r.received_at)
  ].join(",")
);

fs.writeFileSync("data/session-records-export.csv", [header, ...lines].join("\n"), "utf8");
console.log("exported data/session-records-export.csv");
