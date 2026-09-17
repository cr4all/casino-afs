# Batch-translate fields-en.json -> fields-<locale>.json (chunked for 5000 char API limit)
# pip install deep-translator
# python admin/scripts/translate-fields.py [locales...]
import json
import sys
import time
from pathlib import Path

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("Install: pip install deep-translator", file=sys.stderr)
    sys.exit(1)

ADMIN = Path(__file__).resolve().parent.parent
EN = json.loads((ADMIN / "fields-en.json").read_text(encoding="utf-8"))
LOCALE_TARGETS = {
    "es": "es", "ru": "ru", "ko": "ko", "fr": "fr", "de": "de",
    "pt": "pt", "zh": "zh-CN", "ja": "ja", "it": "it",
}
DELIM = "\n###FIELD###\n"
KEY_DELIM = "|||"
CHUNK = 20


def translate_blob(text: str, translator: GoogleTranslator) -> str:
    if not text.strip():
        return text
    for attempt in range(4):
        try:
            return translator.translate(text)
        except Exception as exc:
            print(f"    retry {attempt + 1}: {str(exc)[:120]}")
            time.sleep(2 ** attempt)
    return text


def translate_key_batch(en: dict, key: str, translator: GoogleTranslator) -> dict[str, str]:
    paths = [p for p, e in en.items() if e.get(key)]
    result: dict[str, str] = {}
    for start in range(0, len(paths), CHUNK):
        chunk_paths = paths[start : start + CHUNK]
        payload = DELIM.join(f"{p}{KEY_DELIM}{en[p][key]}" for p in chunk_paths)
        translated = translate_blob(payload, translator)
        parts = translated.split(DELIM)
        for i, path in enumerate(chunk_paths):
            chunk = parts[i] if i < len(parts) else en[path][key]
            if KEY_DELIM in chunk:
                _, val = chunk.split(KEY_DELIM, 1)
            else:
                val = en[path][key]
            result[path] = val.strip()
        time.sleep(0.35)
    return result


def translate_locale(locale: str) -> None:
    target = LOCALE_TARGETS[locale]
    print(f"Translating {locale} ({target})...")
    translator = GoogleTranslator(source="en", target=target)
    out: dict = {p: {} for p in EN}
    for key in ("label", "description", "example", "signal"):
        print(f"  batch: {key} ({sum(1 for e in EN.values() if e.get(key))} fields)")
        batch = translate_key_batch(EN, key, translator)
        for path, val in batch.items():
            out[path][key] = val
    path = ADMIN / f"fields-{locale}.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {path}")


if __name__ == "__main__":
    for loc in sys.argv[1:] or LOCALE_TARGETS:
        if loc in LOCALE_TARGETS:
            translate_locale(loc)
