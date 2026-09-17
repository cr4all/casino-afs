/**
 * Builds admin-i18n-fields.js from fields-en.json + fields-<locale>.json files.
 * Run: node admin/scripts/build-field-i18n.mjs
 * Add/update fields-<locale>.json for each non-English locale.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminDir = path.join(__dirname, "..");
const locales = ["en", "es", "ru", "ko", "fr", "de", "pt", "zh", "ja", "it"];

const en = JSON.parse(fs.readFileSync(path.join(adminDir, "fields-en.json"), "utf8"));
const bundles = { en };

for (const locale of locales) {
  if (locale === "en") continue;
  const file = path.join(adminDir, `fields-${locale}.json`);
  if (fs.existsSync(file)) {
    bundles[locale] = JSON.parse(fs.readFileSync(file, "utf8"));
  } else {
    console.warn(`Missing ${file} — falling back to English for ${locale}`);
    bundles[locale] = en;
  }
}

const out = `/* Auto-generated — do not edit by hand. Run: node admin/scripts/build-field-i18n.mjs */
(function () {
  const FIELD_BUNDLES = ${JSON.stringify(bundles, null, 2)};

  function fieldText(path, key, fallback) {
    const locale = window.AdminI18n ? AdminI18n.getLocale() : "en";
    const bundle = FIELD_BUNDLES[locale] || FIELD_BUNDLES.en;
    const entry = bundle[path];
    if (entry && entry[key] != null && entry[key] !== "") {
      return entry[key];
    }
    const enEntry = FIELD_BUNDLES.en[path];
    if (enEntry && enEntry[key] != null && enEntry[key] !== "") {
      return enEntry[key];
    }
    return fallback;
  }

  function localizeField(field) {
    if (!field || !field.path) {
      return field;
    }
    return {
      ...field,
      label: fieldText(field.path, "label", field.label),
      description: fieldText(field.path, "description", field.description),
      example: fieldText(field.path, "example", field.example),
      signal: fieldText(field.path, "signal", field.signal),
    };
  }

  window.AdminI18n = window.AdminI18n || {};
  AdminI18n.fieldText = fieldText;
  AdminI18n.localizeField = localizeField;
})();
`;

fs.writeFileSync(path.join(adminDir, "admin-i18n-fields.js"), out);
console.log("Wrote admin-i18n-fields.js with locales:", Object.keys(bundles).join(", "));
