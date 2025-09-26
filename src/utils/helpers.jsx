// helpers.js

/** Display helpers */
export function translateSizeLabel(value) {
  if (!value) return "-";
  let v = decodeURIComponent(value);
  v = v.replace(/έως|εώς|εως|ΕΩΣ|Έως/gi, "up to");
  v = v.replace(/εκ\.?/gi, "cm");
  v = v.replace(/χιλ\.?/gi, "mm");
  v = v.replace(/cm2|CM2/gi, "cm²");
  v = v.replace(/-+/g, "-").replace(/^-|-$/g, "").trim();
  return v;
}

export function formatTechniqueLabel(technique) {
  if (!technique) return "";
  const labelMap = {
    "1-color": "1 Color",
    "2-colors": "2 Colors",
    "3-colors": "3 Colors",
    "4-colors": "4 Colors",
    embroidery: "Embroidery",
    "full-color": "Full Color",
    "no-print": "No Print",
    "leather-badge": "Leather Badge",
  };
  return labelMap[technique] || technique.charAt(0).toUpperCase() + technique.slice(1).replace(/-/g, " ");
}

export function getTechniqueColors(technique) {
  const colorMap = {
    "1-color": ["#7627b9"],
    "2-colors": ["#7627b9", "#1cb4cf"],
    "3-colors": ["#7627b9", "#1cb4cf", "#fbbf24"],
    "4-colors": ["#7627b9", "#1cb4cf", "#fbbf24", "#ef4444"],
    embroidery: ["#f59e42"],
    "full-color": ["gradient"],
    "no-print": ["#e5e7eb"],
    "leather-badge": ["#8b4513"],
  };
  return colorMap[technique] || ["#6b7280"];
}

export function formatAttributeValue(value, attributeType = "") {
  if (value == null || String(value).trim() === "") return "None";
  if (attributeType === "size") return translateSizeLabel(value);
  return String(value).trim();
}

/** Normalization used by pricing + lookups */
const norm = (v) => String(v ?? "").trim().toLowerCase();
const decodeMaybe = (v) => { try { return decodeURIComponent(v); } catch { return v; } };
const parseNum = (val) => {
  if (val == null) return 0;
  const n = Number(String(val).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/** Unique value helpers */
function uniqueAttributeValues(
  nodes,
  attributeLabel,
  { caseInsensitive = true, sort = false, includeEmpty = true } = {}
) {
  const want = norm(attributeLabel);
  const seen = new Set();
  const out = [];

  for (const node of nodes ?? []) {
    const attrs = node.attributes?.nodes ?? node.attributes ?? [];
    // normalize label when picking a value
    const pair = attrs.find((a) => norm(a.label) === want);
    const val = pair?.value;

    if (val == null || String(val).trim() === "") {
      if (includeEmpty && !seen.has("")) {
        seen.add("");
        out.push("");
      }
      continue;
    }

    const key = caseInsensitive ? norm(val) : String(val).trim();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(String(val).trim());
    }
  }

  if (sort) return [...out].sort((a, b) => a.localeCompare(b));
  return out;
}

export function uniqueTechniques(nodes, { caseInsensitive = true } = {}) {
  const techniques = uniqueAttributeValues(nodes, "technique", { caseInsensitive, sort: false, includeEmpty: false });
  const colorOrder = ["1-color", "2-colors", "3-colors", "4-colors"];
  const last = "no-print";

  const ordered = [];
  for (const t of colorOrder) if (techniques.includes(t)) ordered.push(t);

  const rest = techniques.filter((t) => !colorOrder.includes(t) && t !== last).sort((a, b) => a.localeCompare(b));
  if (rest.length) ordered.push(...rest);
  if (techniques.includes(last)) ordered.push(last);

  return ordered;
}

export function uniquePositions(nodes, opts = {}) {
  const vals = uniqueAttributeValues(nodes, "position", opts);
  const nonEmpty = vals.filter((v) => v !== "");
  return vals.includes("") ? [...nonEmpty, ""] : nonEmpty;
}

export function uniqueSizes(nodes, opts = {}) {
  const vals = uniqueAttributeValues(nodes, "size", opts);
  const nonEmpty = vals.filter((v) => v !== "");
  return vals.includes("") ? [...nonEmpty, ""] : nonEmpty;
}

export function uniqueExtras(nodes, opts = {}) {
  const vals = uniqueAttributeValues(nodes, "extra", opts);
  const nonEmpty = vals.filter((v) => v !== "");
  return vals.includes("") ? [...nonEmpty, ""] : nonEmpty;
}

/** Pricing helpers that mirror /api/print-price */
const BRAND_MARKUPS = {
  xindao: { priceMultiplier: 1.1, printMarkup: 1.4 },
  stricker: { priceMultiplier: 1, printMarkup: 0.99 },
  midocean: { priceMultiplier: 1, printMarkup: 1 },
  pf: { priceMultiplier: 1, printMarkup: 1 },
  mdisplay: { priceMultiplier: 1, printMarkup: 1 },
  stock: { priceMultiplier: 1, printMarkup: 1 },
  kits: { priceMultiplier: 1, printMarkup: 1 },
};
const getBrand = (brand) => BRAND_MARKUPS[norm(brand)] || { priceMultiplier: 1, printMarkup: 1 };

const normalizeVariation = (v) => ({
  ...v,
  _attrs: Object.fromEntries(
    (v.attributes?.nodes || v.attributes || []).map((a) => [norm(a.label), decodeMaybe(norm(a.value || ""))])
  ),
});

const tierPrice = (metaData = [], qty) => {
  let price = null;
  for (const m of metaData) {
    if (!m.key?.startsWith("_price_print_")) continue;
    const mt = m.key.match(/^_price_print_(\d+)_((\d+)|infinity)(?:_customer)?$/);
    if (!mt) continue;
    const min = Number(mt[1]);
    const max = mt[2] === "infinity" ? Infinity : Number(mt[2]);
    if (qty >= min && (max === Infinity ? true : qty < max)) {
      const p = parseNum(m.value);
      price = price == null ? p : Math.min(price, p);
    }
  }
  return price ?? 0;
};
const setupCost = (metaData = []) => parseNum(metaData.find((m) => m.key === "_price_print_setup")?.value);

const finalUnitPrice = (node, qty, { basePrice, brand, manipulation }) => {
  const print = tierPrice(node.metaData, qty);
  const setup = setupCost(node.metaData);
  const handling = parseNum(manipulation);
  const basePrintPerUnit = (setup / qty) + print + (handling / qty);
  const withMarkup = basePrintPerUnit * getBrand(brand).printMarkup;
  return withMarkup + parseNum(basePrice);
};

/** Try exact match then size="" fallback, like the API */
const matchWithFallback = (nodes, want) => {
  const exact = nodes.find((n) => {
    const a = n._attrs;
    return a.technique === want.technique && a.position === want.position && a.extra === want.extra && a.size === want.size;
  });
  if (exact) return exact;
  if (want.size) {
    return nodes.find((n) => {
      const a = n._attrs;
      return a.technique === want.technique && a.position === want.position && a.extra === want.extra && (a.size === "" || a.size == null);
    });
  }
  return null;
};

/** Absolute cheapest across all variations */
export function findCheapestCombination(variations, quantity = 100, basePrice = 0, brand = "Unknown", manipulation = 0) {
  const nodes = (variations || []).map(normalizeVariation);
  if (!nodes.length) {
    return { technique: "1-color", position: "", size: "", extra: "", totalCost: parseNum(basePrice), variation: null };
  }

  let best = null;
  let bestUnit = Infinity;

  for (const n of nodes) {
    // skip no-print if you only want printed options
    if (n._attrs.technique === "no-print") continue;

    const unit = finalUnitPrice(n, quantity, { basePrice, brand, manipulation });
    if (unit < bestUnit) {
      bestUnit = unit;
      const a = n._attrs;
      best = { technique: a.technique || "", position: a.position || "", size: a.size || "", extra: a.extra || "", totalCost: unit, variation: n };
    }
  }
  return best || { technique: "1-color", position: "", size: "", extra: "", totalCost: parseNum(basePrice), variation: null };
}

/** Cheapest given some chosen fields */
export function findCheapestForConstraints(
  variations,
  constraints = {},
  quantity = 100,
  basePrice = 0,
  brand = "Unknown",
  manipulation = 0
) {
  const nodes = (variations || []).map(normalizeVariation);
  if (!nodes.length) {
    return { technique: constraints.technique || "1-color", position: constraints.position || "", size: constraints.size || "", extra: constraints.extra || "", totalCost: parseNum(basePrice), variation: null };
  }

  const wantColor = norm(constraints.color || constraints.colour || "");
  const filtered = nodes.filter((n) => {
    const a = n._attrs;
    if (constraints.technique && a.technique !== norm(constraints.technique)) return false;
    if (constraints.position && a.position !== norm(constraints.position)) return false;
    if (constraints.size && a.size !== decodeMaybe(norm(constraints.size))) return false;
    if (constraints.extra && a.extra !== norm(constraints.extra)) return false;
    if (wantColor && !(a.color === wantColor || a.colour === wantColor)) return false;
    return true;
  });

  let best = null;
  let bestUnit = Infinity;

  // exact + fallback, if technique given
  if (constraints.technique) {
    const candidate = matchWithFallback(nodes, {
      technique: norm(constraints.technique),
      position: norm(constraints.position || ""),
      extra: norm(constraints.extra || ""),
      size: decodeMaybe(norm(constraints.size || "")),
    });
    if (candidate) {
      const unit = finalUnitPrice(candidate, quantity, { basePrice, brand, manipulation });
      best = { ...candidate, unit };
      bestUnit = unit;
    }
  }

  for (const n of filtered) {
    const unit = finalUnitPrice(n, quantity, { basePrice, brand, manipulation });
    if (unit < bestUnit) {
      bestUnit = unit;
      const a = n._attrs;
      best = { technique: a.technique || "", position: a.position || "", size: a.size || "", extra: a.extra || "", totalCost: unit, variation: n };
    }
  }

  return best || { technique: constraints.technique || "1-color", position: constraints.position || "", size: constraints.size || "", extra: constraints.extra || "", totalCost: parseNum(basePrice), variation: null };
}
