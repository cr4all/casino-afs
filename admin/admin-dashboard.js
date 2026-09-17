/** Dashboard panel — metrics charts, tables, and alert toasts */

let dashboardRefreshTimer = null;
let notificationPollTimer = null;
let alertSinceIso = null;
const seenAlertKeys = new Set();
const notificationInbox = [];
let notifyDropdownOpen = false;
let notifyOutsideHandler = null;
const TOAST_TTL_MS = 12000;
const MAX_TOASTS = 5;
const MAX_INBOX = 80;

function buildDashboardPanel(panel) {
  panel.innerHTML = `
    <div class="dashboard-toolbar">
      <label>${ui("dashTimeframe")}
        <select id="dash-hours">
          <option value="0.25">${ui("dash15m")}</option>
          <option value="1">${ui("dash1h")}</option>
          <option value="6">${ui("dash6h")}</option>
          <option value="24" selected>${ui("dash24h")}</option>
          <option value="168">${ui("dash7d")}</option>
        </select>
      </label>
      <label>${ui("dashBucket")}
        <select id="dash-bucket">
          <option value="5" selected>5m</option>
          <option value="15">15m</option>
          <option value="60">1h</option>
        </select>
      </label>
      <div class="dash-toolbar-actions">
        <label class="dash-auto-label">
          <input type="checkbox" id="dash-auto-refresh" checked>
          ${ui("dashAutoRefresh")}
        </label>
        <button type="button" id="dash-refresh-btn" class="secondary">${ui("dashRefresh")}</button>
      </div>
    </div>
    <section class="dash-card dash-notify-card">
      <h3>${ui("dashNotifyTitle")}</h3>
      <div class="dash-notify-settings">
        <label class="dash-notify-check">
          <input type="checkbox" id="dashboard.notifications_enabled" data-path="dashboard.notifications_enabled" data-type="checkbox">
          ${ui("dashNotifyEnabled")}
        </label>
        <label class="dash-notify-check">
          <input type="checkbox" id="dashboard.notify_on_block" data-path="dashboard.notify_on_block" data-type="checkbox">
          ${ui("dashNotifyBlock")}
        </label>
        <label class="dash-notify-check">
          <input type="checkbox" id="dashboard.notify_on_critical" data-path="dashboard.notify_on_critical" data-type="checkbox">
          ${ui("dashNotifyCritical")}
        </label>
        <label>${ui("dashNotifyInterval")}
          <input type="number" id="dashboard.poll_interval_seconds" data-path="dashboard.poll_interval_seconds" data-type="number" min="10" max="300" step="1" class="dash-notify-interval">
        </label>
      </div>
      <p class="hint dash-notify-hint">${ui("dashNotifyHint")}</p>
    </section>
    <div id="dash-hint" class="dash-hint hidden"></div>
    <div id="dash-stats" class="dash-stats"></div>
    <div class="dashboard-grid">
      <section class="dash-card dash-card-wide">
        <h3>${ui("dashBettingTitle")}</h3>
        <p class="dash-card-sub">${ui("dashBettingSub")}</p>
        <div id="dash-bet-chart" class="dash-chart"></div>
        <div id="dash-bet-legend" class="dash-legend"></div>
      </section>
      <section class="dash-card dash-card-third">
        <h3>${ui("dashDecisionsTitle")}</h3>
        <div id="dash-decisions" class="dash-decisions"></div>
      </section>
      <section class="dash-card dash-card-third">
        <h3>${ui("dashTopSignals")}</h3>
        <div id="dash-signals" class="dash-signals"></div>
      </section>
      <section class="dash-card dash-card-third">
        <h3>${ui("dashEventTypes")}</h3>
        <div id="dash-event-types" class="dash-event-types"></div>
      </section>
      <section class="dash-card dash-card-wide">
        <h3>${ui("dashRecentActions")}</h3>
        <p class="dash-card-sub">${ui("dashRecentActionsSub")}</p>
        <div class="log-table-wrap dash-table-wrap">
          <table class="log-table dash-actions-table">
            <thead>
              <tr>
                <th>${ui("dashColTime")}</th>
                <th>${ui("dashColDecision")}</th>
                <th>${ui("dashColRisk")}</th>
                <th>${ui("dashColUser")}</th>
                <th>${ui("dashColEvent")}</th>
                <th>${ui("dashColScore")}</th>
                <th>${ui("dashColSignals")}</th>
              </tr>
            </thead>
            <tbody id="dash-actions-body"></tbody>
          </table>
        </div>
      </section>
    </div>
  `;

  panel.querySelector("#dash-refresh-btn").addEventListener("click", () => loadDashboard());
  panel.querySelector("#dash-hours").addEventListener("change", () => loadDashboard());
  panel.querySelector("#dash-bucket").addEventListener("change", () => loadDashboard());
  panel.querySelector("#dash-auto-refresh").addEventListener("change", (e) => {
    if (e.target.checked) {
      startDashboardAutoRefresh();
    } else {
      stopDashboardAutoRefresh();
    }
  });
}

function startDashboardAutoRefresh() {
  stopDashboardAutoRefresh();
  dashboardRefreshTimer = window.setInterval(() => loadDashboard(), 30000);
}

function stopDashboardAutoRefresh() {
  if (dashboardRefreshTimer) {
    window.clearInterval(dashboardRefreshTimer);
    dashboardRefreshTimer = null;
  }
}

async function loadDashboard() {
  const hours = document.getElementById("dash-hours")?.value || "24";
  const bucket = document.getElementById("dash-bucket")?.value || "5";
  try {
    const data = await api(`/dashboard/metrics?hours=${hours}&bucket_minutes=${bucket}`);
    renderDashboard(data);
  } catch (err) {
    showBanner(err.message, "error");
  }
}

function renderDashboard(data) {
  const hint = document.getElementById("dash-hint");
  if (hint) {
    if (data.overview.logging_hint) {
      hint.textContent = ui("dashNoDataHint");
      hint.classList.remove("hidden");
    } else {
      hint.classList.add("hidden");
    }
  }

  const stats = document.getElementById("dash-stats");
  if (stats) {
    stats.innerHTML = `
      <div class="stat-card"><span class="stat-label">${ui("dashActiveBettors")}</span><span class="stat-value">${data.betting.active_bettors}</span><span class="stat-meta">${ui("dashLast")} ${data.betting.active_window_minutes}m</span></div>
      <div class="stat-card"><span class="stat-label">${ui("dashTotalBets")}</span><span class="stat-value">${data.betting.total_bets}</span></div>
      <div class="stat-card"><span class="stat-label">${ui("dashBetVolume")}</span><span class="stat-value">${formatNumber(data.betting.total_volume)}</span></div>
      <div class="stat-card stat-danger"><span class="stat-label">${ui("dashBlocks")}</span><span class="stat-value">${data.decisions.blocks}</span></div>
      <div class="stat-card stat-warn"><span class="stat-label">${ui("dashChallenges")}</span><span class="stat-value">${data.decisions.challenges}</span></div>
      <div class="stat-card stat-danger"><span class="stat-label">${ui("dashCritical")}</span><span class="stat-value">${data.decisions.critical}</span></div>
      <div class="stat-card"><span class="stat-label">${ui("dashTotalScored")}</span><span class="stat-value">${data.overview.total_scored}</span></div>
      <div class="stat-card"><span class="stat-label">${ui("dashAvgLatency")}</span><span class="stat-value">${data.overview.avg_latency_ms ?? "—"}<small>ms</small></span></div>
    `;
  }

  renderBetChart(data.betting.series);
  renderDecisions(data.decisions);
  renderBarList("dash-signals", data.top_signals, "signal");
  renderBarList("dash-event-types", data.event_types, "event_type");
  renderRecentActions(data.recent_actions);
}

function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function renderBetChart(series) {
  const el = document.getElementById("dash-bet-chart");
  const legend = document.getElementById("dash-bet-legend");
  if (!el) return;

  if (!series.length || series.every((p) => p.bet_count === 0 && p.unique_bettors === 0)) {
    el.innerHTML = `<p class="dash-empty">${ui("dashChartEmpty")}</p>`;
    if (legend) legend.innerHTML = "";
    return;
  }

  const maxBets = Math.max(...series.map((p) => p.bet_count), 1);
  const maxUsers = Math.max(...series.map((p) => p.unique_bettors), 1);

  el.innerHTML = series
    .map((point) => {
      const betH = Math.round((point.bet_count / maxBets) * 100);
      const userH = Math.round((point.unique_bettors / maxUsers) * 100);
      const label = formatChartTime(point.ts);
      return `
        <div class="dash-bar-group" title="${label} — ${ui("dashBets")}: ${point.bet_count}, ${ui("dashUsers")}: ${point.unique_bettors}">
          <div class="dash-bars">
            <div class="dash-bar dash-bar-bets" style="height:${betH}%"></div>
            <div class="dash-bar dash-bar-users" style="height:${userH}%"></div>
          </div>
          <span class="dash-bar-label">${label}</span>
        </div>`;
    })
    .join("");

  if (legend) {
    legend.innerHTML = `
      <span><i class="dash-swatch dash-swatch-bets"></i> ${ui("dashBets")}</span>
      <span><i class="dash-swatch dash-swatch-users"></i> ${ui("dashUniqueBettors")}</span>
    `;
  }
}

function formatChartTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function renderDecisions(decisions) {
  const el = document.getElementById("dash-decisions");
  if (!el) return;
  const items = [
    ["allow", decisions.allows, "dashAllow"],
    ["challenge", decisions.challenges, "dashChallenge"],
    ["block", decisions.blocks, "dashBlock"],
    ["critical", decisions.critical, "dashCriticalLevel"],
    ["high", decisions.high, "dashHighLevel"],
  ];
  const max = Math.max(...items.map((i) => i[1]), 1);
  el.innerHTML = items
    .map(([key, count, labelKey]) => {
      const w = Math.round((count / max) * 100);
      return `<div class="dash-row"><span class="dash-row-label">${ui(labelKey)}</span><div class="dash-row-bar"><div class="dash-row-fill dash-fill-${key}" style="width:${w}%"></div></div><span class="dash-row-val">${count}</span></div>`;
    })
    .join("");
}

function renderBarList(elementId, items, labelKey) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (!items.length) {
    el.innerHTML = `<p class="dash-empty">${ui("dashListEmpty")}</p>`;
    return;
  }
  const max = Math.max(...items.map((i) => i.count), 1);
  el.innerHTML = items
    .map((item) => {
      const w = Math.round((item.count / max) * 100);
      const label = item[labelKey];
      return `<div class="dash-row" title="${escapeHtml(label)}"><span class="dash-row-label">${escapeHtml(label)}</span><div class="dash-row-bar"><div class="dash-row-fill" style="width:${w}%"></div></div><span class="dash-row-val">${item.count}</span></div>`;
    })
    .join("");
}

function renderRecentActions(rows) {
  const tbody = document.getElementById("dash-actions-body");
  if (!tbody) return;
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="log-empty">${ui("dashActionsEmpty")}</td></tr>`;
    return;
  }
  tbody.innerHTML = rows
    .map(
      (row) => `
    <tr>
      <td>${formatLogTime(row.ts)}</td>
      <td><span class="log-badge log-badge-${row.decision === "block" ? "failed" : row.decision === "challenge" ? "skipped" : "scored"}">${escapeHtml(row.decision)}</span></td>
      <td><span class="risk-pill risk-${row.risk_level}">${escapeHtml(row.risk_level)}</span></td>
      <td>${escapeHtml(row.user_id)}</td>
      <td>${escapeHtml(row.event_type)}</td>
      <td>${row.final_score}</td>
      <td class="log-summary">${escapeHtml((row.signals || []).join(", ") || "—")}</td>
    </tr>`
    )
    .join("");
}

function initDashboardTab(panel) {
  panel.classList.add("panel-dashboard");
  buildDashboardPanel(panel);
  loadDashboard();
  if (document.getElementById("dash-auto-refresh")?.checked) {
    startDashboardAutoRefresh();
  }
}

function getToastRoot() {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    root.className = "toast-root";
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-atomic", "false");
    document.body.appendChild(root);
  }
  return root;
}

function toastKindLabel(kind) {
  if (kind === "both") return ui("dashToastBoth");
  if (kind === "critical") return ui("dashToastCritical");
  return ui("dashToastBlock");
}

function showAlertToast(alert) {
  const root = getToastRoot();
  const toast = document.createElement("div");
  toast.className = `toast toast-${alert.kind}`;
  toast.setAttribute("role", "status");
  const signals = (alert.signals || []).slice(0, 3).join(", ");
  toast.innerHTML = `
    <div class="toast-head">
      <strong>${escapeHtml(toastKindLabel(alert.kind))}</strong>
      <button type="button" class="toast-close" aria-label="${escapeHtml(ui("logClose"))}">×</button>
    </div>
    <p class="toast-meta">${escapeHtml(formatLogTime(alert.ts))} · ${escapeHtml(alert.event_type)}</p>
    <p class="toast-line"><span>${ui("dashToastUser")}</span> ${escapeHtml(alert.user_id)}</p>
    <p class="toast-line"><span>${ui("dashToastScore")}</span> ${escapeHtml(String(alert.final_score))} · ${escapeHtml(alert.decision)} / ${escapeHtml(alert.risk_level)}</p>
    ${signals ? `<p class="toast-signals">${escapeHtml(signals)}</p>` : ""}
  `;
  toast.querySelector(".toast-close").addEventListener("click", () => dismissToast(toast));
  root.prepend(toast);
  while (root.children.length > MAX_TOASTS) {
    root.lastElementChild?.remove();
  }
  window.setTimeout(() => dismissToast(toast), TOAST_TTL_MS);
}

function dismissToast(toast) {
  if (!toast?.isConnected) return;
  toast.classList.add("toast-out");
  window.setTimeout(() => toast.remove(), 220);
}

function alertKey(alert) {
  return `${alert.event_id}:${alert.ts}:${alert.source}`;
}

function addNotification(alert) {
  const key = alertKey(alert);
  if (seenAlertKeys.has(key) || notificationInbox.some((item) => item.key === key)) {
    return false;
  }
  seenAlertKeys.add(key);
  notificationInbox.unshift({
    key,
    read: false,
    ...alert,
  });
  while (notificationInbox.length > MAX_INBOX) {
    const removed = notificationInbox.pop();
    if (removed) {
      seenAlertKeys.delete(removed.key);
    }
  }
  updateNotificationUi();
  showAlertToast(alert);
  return true;
}

function getUnreadNotificationCount() {
  return notificationInbox.filter((item) => !item.read).length;
}

function markNotificationRead(key) {
  const item = notificationInbox.find((entry) => entry.key === key);
  if (item && !item.read) {
    item.read = true;
    updateNotificationUi();
  }
}

function markAllNotificationsRead() {
  let changed = false;
  notificationInbox.forEach((item) => {
    if (!item.read) {
      item.read = true;
      changed = true;
    }
  });
  if (changed) {
    updateNotificationUi();
  }
}

function clearNotificationInbox() {
  notificationInbox.length = 0;
  seenAlertKeys.clear();
  updateNotificationUi();
  closeNotificationDropdown();
}

function initNotificationCenter() {
  const btn = document.getElementById("notify-btn");
  const dropdown = document.getElementById("notify-dropdown");
  const markAllBtn = document.getElementById("notify-mark-all");
  if (!btn || !dropdown || btn.dataset.bound === "true") {
    updateNotificationUi();
    return;
  }
  btn.dataset.bound = "true";

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (notifyDropdownOpen) {
      closeNotificationDropdown();
    } else {
      openNotificationDropdown();
    }
  });

  markAllBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    markAllNotificationsRead();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNotificationDropdown();
    }
  });

  updateNotificationUi();
}

function openNotificationDropdown() {
  const btn = document.getElementById("notify-btn");
  const dropdown = document.getElementById("notify-dropdown");
  if (!btn || !dropdown) {
    return;
  }
  notifyDropdownOpen = true;
  btn.setAttribute("aria-expanded", "true");
  dropdown.classList.remove("hidden");
  renderNotificationList();
  notifyOutsideHandler = (event) => {
    const wrap = document.getElementById("notify-wrap");
    if (wrap && !wrap.contains(event.target)) {
      closeNotificationDropdown();
    }
  };
  document.addEventListener("click", notifyOutsideHandler);
}

function closeNotificationDropdown() {
  const btn = document.getElementById("notify-btn");
  const dropdown = document.getElementById("notify-dropdown");
  notifyDropdownOpen = false;
  btn?.setAttribute("aria-expanded", "false");
  dropdown?.classList.add("hidden");
  if (notifyOutsideHandler) {
    document.removeEventListener("click", notifyOutsideHandler);
    notifyOutsideHandler = null;
  }
}

function updateNotificationUi() {
  const badge = document.getElementById("notify-badge");
  const btn = document.getElementById("notify-btn");
  const title = document.getElementById("notify-dropdown-title");
  const markAllBtn = document.getElementById("notify-mark-all");
  const count = getUnreadNotificationCount();

  if (badge) {
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.classList.toggle("hidden", count === 0);
  }
  if (btn) {
    btn.title = ui("notifyTitle");
    btn.setAttribute("aria-label", count ? ui("notifyTitleUnread").replace("{count}", String(count)) : ui("notifyTitle"));
  }
  if (title) {
    title.textContent = ui("notifyTitle");
  }
  if (markAllBtn) {
    markAllBtn.textContent = ui("notifyMarkAllRead");
    markAllBtn.disabled = count === 0;
  }
  if (notifyDropdownOpen) {
    renderNotificationList();
  }
}

function renderNotificationList() {
  const list = document.getElementById("notify-list");
  if (!list) {
    return;
  }
  if (!notificationInbox.length) {
    list.innerHTML = `<p class="notify-empty">${escapeHtml(ui("notifyEmpty"))}</p>`;
    return;
  }
  list.innerHTML = notificationInbox
    .map((item) => {
      const signals = (item.signals || []).slice(0, 2).join(", ");
      return `
        <button type="button" class="notify-item notify-item-${item.kind}${item.read ? "" : " notify-item-unread"}" data-key="${escapeHtml(item.key)}" role="menuitem">
          <span class="notify-item-head">
            <strong>${escapeHtml(toastKindLabel(item.kind))}</strong>
            ${item.read ? "" : `<span class="notify-unread-dot" aria-hidden="true"></span>`}
          </span>
          <span class="notify-item-meta">${escapeHtml(formatLogTime(item.ts))} · ${escapeHtml(item.event_type)}</span>
          <span class="notify-item-line">${escapeHtml(ui("dashToastUser"))}: ${escapeHtml(item.user_id)} · ${escapeHtml(String(item.final_score))}</span>
          ${signals ? `<span class="notify-item-signals">${escapeHtml(signals)}</span>` : ""}
        </button>`;
    })
    .join("");

  list.querySelectorAll(".notify-item").forEach((el) => {
    el.addEventListener("click", () => {
      markNotificationRead(el.dataset.key);
    });
  });
}

async function pollDashboardAlerts() {
  if (!alertSinceIso || typeof api !== "function") {
    return;
  }
  try {
    const data = await api(`/dashboard/alerts?since=${encodeURIComponent(alertSinceIso)}`);
    if (!data.notifications_enabled) {
      return;
    }
    let latestTs = alertSinceIso;
    data.alerts.forEach((alert) => {
      if (addNotification(alert) && alert.ts > latestTs) {
        latestTs = alert.ts;
      }
    });
    alertSinceIso = latestTs;
  } catch {
    /* ignore transient poll errors */
  }
}

function startNotificationPolling(runtimeConfig) {
  stopNotificationPolling();
  alertSinceIso = new Date().toISOString();
  clearNotificationInbox();
  initNotificationCenter();

  const dash = runtimeConfig?.dashboard;
  if (!dash?.notifications_enabled) {
    return;
  }
  if (!dash.notify_on_block && !dash.notify_on_critical) {
    return;
  }

  const seconds = Math.min(300, Math.max(10, Number(dash.poll_interval_seconds) || 30));
  pollDashboardAlerts();
  notificationPollTimer = window.setInterval(pollDashboardAlerts, seconds * 1000);
}

function stopNotificationPolling() {
  if (notificationPollTimer) {
    window.clearInterval(notificationPollTimer);
    notificationPollTimer = null;
  }
  clearNotificationInbox();
}

window.initNotificationCenter = initNotificationCenter;
window.startNotificationPolling = startNotificationPolling;

function restartNotificationPolling(runtimeConfig) {
  startNotificationPolling(runtimeConfig);
}

window.stopNotificationPolling = stopNotificationPolling;
window.restartNotificationPolling = restartNotificationPolling;
