import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(__dirname, "..", "admin.js"), "utf8");
const match = src.match(/const TAB_SECTIONS = \[([\s\S]*?)\];\s*\n\s*const LOGS_SECTION/s);
if (!match) {
  console.error("TAB_SECTIONS not found");
  process.exit(1);
}

const fields = {};
const pathRe = /path:\s*"([^"]+)"/g;
const paths = [...match[1].matchAll(pathRe)].map((m) => m[1]);

for (const fieldPath of paths) {
  const esc = fieldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blockRe = new RegExp(
    `\\{\\s*path:\\s*"${esc}"([\\s\\S]*?)\\n      \\}(?=,|\\n    \\])`,
    "m"
  );
  const blockMatch = match[1].match(blockRe);
  if (!blockMatch) continue;
  const block = blockMatch[0];
  const label = block.match(/label:\s*"([^"]+)"/)?.[1];
  let description;
  const descBlock = block.match(/description:\s*\n\s*"([^"]+(?:\\"[^"]*)*)"/);
  const descLine = block.match(/description:\s*"([^"]+)"/);
  if (descBlock) description = descBlock[1];
  else if (descLine) description = descLine[1];
  let example;
  const exJson = block.match(/example:\s*\n\s*'([^']+)'/s);
  const exLine = block.match(/example:\s*"([^"]+)"/);
  if (exJson) example = exJson[1];
  else if (exLine) example = exLine[1];
  const signal = block.match(/signal:\s*"([^"]+)"/)?.[1];
  fields[fieldPath] = { label, description, example, signal };
}

fields["logging.sync_enabled"] = {
  label: "Sync request/response logging",
  description:
    "Store full request and response payloads for POST /evaluate in Postgres. View under Log viewer below.",
  example: "Enable during integration testing; disable in high-volume production if storage is a concern.",
};
fields["logging.async_enabled"] = {
  label: "Async request/response logging",
  description:
    "Store RabbitMQ scored/skipped/rejected/failed messages with payloads where available.",
  example: "Enable to debug casino.events → AFS pipeline without tailing container logs.",
};

fs.writeFileSync(path.join(__dirname, "..", "fields-en.json"), JSON.stringify(fields, null, 2));
console.log("Extracted", Object.keys(fields).length, "fields");
