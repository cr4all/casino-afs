/**
 * Free device context collector for casino/iGaming platforms.
 *
 * Uses FingerprintJS open-source (MIT): https://github.com/fingerprintjs/fingerprintjs
 * Loaded from the official OSS CDN — no paid Pro SDK required.
 *
 * Usage:
 *   <script src="https://openfpcdn.io/fingerprintjs/v4/iife.min.js"></script>
 *   <script src="/client/fingerprint-collector.js"></script>
 *   <script>
 *     collectDeviceContext().then(ctx => console.log(ctx));
 *   </script>
 */
async function collectDeviceContext() {
  if (typeof FingerprintJS === "undefined") {
    throw new Error("FingerprintJS OSS not loaded. Include https://openfpcdn.io/fingerprintjs/v4/iife.min.js");
  }

  const agent = await FingerprintJS.load();
  const result = await agent.get();

  return {
    fingerprint: result.visitorId,
    fingerprint_version: result.version || "v4",
    user_agent: navigator.userAgent,
    browser_language: navigator.language || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    platform: navigator.platform || null,
    screen_resolution: typeof screen !== "undefined" ? `${screen.width}x${screen.height}` : null,
  };
}

if (typeof module !== "undefined") {
  module.exports = { collectDeviceContext };
}
