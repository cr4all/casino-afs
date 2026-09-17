/** Searchable country multiselect for admin config fields */

function ui(key) {
  return window.AdminI18n ? AdminI18n.ui(key) : key;
}

function parseCountryFieldValue(raw, format) {
  if (format === "csv") {
    if (Array.isArray(raw)) {
      return raw.map((code) => String(code).trim().toUpperCase()).filter(Boolean);
    }
    return String(raw ?? "")
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean);
  }
  if (Array.isArray(raw)) {
    return raw.map((code) => String(code).trim().toUpperCase()).filter(Boolean);
  }
  return String(raw ?? "")
    .split(/[\n,]+/)
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
}

function formatCountryFieldValue(codes, format) {
  const unique = [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))].sort();
  if (format === "csv") {
    return unique.join(",");
  }
  return unique;
}

function createCountryMultiselect(field) {
  const format = field.countryFormat || "list";
  const locale = window.AfsCountries?.getLocale?.() || "en";
  const selected = new Set();

  const root = document.createElement("div");
  root.className = "country-multiselect";
  root.id = field.path;
  root.dataset.path = field.path;
  root.dataset.type = "countries";
  root.dataset.format = format;

  const chipsEl = document.createElement("div");
  chipsEl.className = "country-ms-chips";
  chipsEl.setAttribute("aria-live", "polite");

  const control = document.createElement("div");
  control.className = "country-ms-control";

  const search = document.createElement("input");
  search.type = "search";
  search.className = "country-ms-search";
  search.placeholder = ui("countrySearchPlaceholder");
  search.autocomplete = "off";
  search.setAttribute("aria-expanded", "false");
  search.setAttribute("aria-haspopup", "listbox");

  const dropdown = document.createElement("div");
  dropdown.className = "country-ms-dropdown hidden";
  dropdown.setAttribute("role", "listbox");
  dropdown.setAttribute("aria-multiselectable", "true");

  control.appendChild(search);
  control.appendChild(dropdown);
  root.appendChild(chipsEl);
  root.appendChild(control);

  function renderChips() {
    const codes = [...selected].sort();
    if (!codes.length) {
      chipsEl.innerHTML = "";
      chipsEl.classList.add("empty");
      return;
    }
    chipsEl.classList.remove("empty");
    chipsEl.innerHTML = codes
      .map(
        (code) =>
          `<button type="button" class="country-chip" data-code="${escapeHtml(code)}" aria-label="${escapeHtml(ui("countryRemove"))} ${escapeHtml(code)}">
            <span>${escapeHtml(window.AfsCountries.countryLabel(code, locale))}</span>
            <span class="country-chip-x" aria-hidden="true">×</span>
          </button>`
      )
      .join("");

    chipsEl.querySelectorAll(".country-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        selected.delete(chip.dataset.code);
        renderChips();
        renderOptions(search.value);
      });
    });
  }

  function renderOptions(filterText) {
    const query = filterText.trim().toLowerCase();
    const options = window.AfsCountries.sortedOptions(locale, [...selected]);
    const filtered = query
      ? options.filter(
          (opt) => opt.code.toLowerCase().includes(query) || opt.label.toLowerCase().includes(query)
        )
      : options;

    if (!filtered.length) {
      dropdown.innerHTML = `<p class="country-ms-empty">${escapeHtml(ui("countryNoResults"))}</p>`;
      return;
    }

    dropdown.innerHTML = filtered
      .map(
        (opt) => `
      <label class="country-ms-option">
        <input type="checkbox" value="${escapeHtml(opt.code)}" ${selected.has(opt.code) ? "checked" : ""}>
        <span>${escapeHtml(opt.label)}</span>
      </label>`
      )
      .join("");

    dropdown.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          selected.add(checkbox.value);
        } else {
          selected.delete(checkbox.value);
        }
        renderChips();
      });
    });
  }

  function openDropdown() {
    dropdown.classList.remove("hidden");
    search.setAttribute("aria-expanded", "true");
    renderOptions(search.value);
  }

  function closeDropdown() {
    dropdown.classList.add("hidden");
    search.setAttribute("aria-expanded", "false");
  }

  search.addEventListener("focus", openDropdown);
  search.addEventListener("input", () => renderOptions(search.value));
  search.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdown();
      search.blur();
    }
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) {
      closeDropdown();
    }
  });

  root._setCountryValues = (raw) => {
    selected.clear();
    parseCountryFieldValue(raw, format).forEach((code) => selected.add(code));
    renderChips();
    renderOptions(search.value);
  };

  root._getCountryValues = () => formatCountryFieldValue([...selected], format);

  renderChips();
  renderOptions("");

  return root;
}

function setCountryMultiselectValue(el, raw) {
  if (el?._setCountryValues) {
    el._setCountryValues(raw);
  }
}

function getCountryMultiselectValue(el) {
  return el?._getCountryValues?.() ?? (el.dataset.format === "csv" ? "" : []);
}
