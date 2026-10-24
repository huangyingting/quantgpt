// The headline check (HIT 15): paste a return series and see what the
// headline leaves out. Every window by start date, every calendar year,
// since inception with the drawdown first, and a net panel on the reader's
// own fee, account, tax rates and slippage.
//
// Pure functions: no DOM, no network, no storage. The page
// (learn/headline-check.html) imports them and so do the tests
// (scripts/headline-check.test.js). A pasted series never leaves the
// browser. ASCII only.

export const SLIPPAGE_BPS = [5, 10, 25, 50];
export const WINDOW_MONTHS = [1, 3, 12, 36, 60];

const MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun",
                     "jul", "aug", "sep", "oct", "nov", "dec"];

// ---------------------------------------------------------------- parsing

function mk(y, m, d) {
  if (!(y >= 1900 && y <= 2200) || !(m >= 1 && m <= 12)) return null;
  if (d != null && !(d >= 1 && d <= 31)) return null;
  return { y, m, d: d == null ? null : d };
}

function monthName(s) {
  const k = String(s).toLowerCase();
  if (k.length < 3) return 0;
  const i = MONTH_NAMES.indexOf(k.slice(0, 3));
  return i >= 0 && ("january february march april may june july august september " +
    "october november december sept").split(" ").some((w) => w.indexOf(k) === 0) ? i + 1 : 0;
}

// "2024-01-31", "2024/01/31", "2024-01", "01/31/2024" (US order), "01/2024",
// "Jan 2024", "January 2024", "2024 Jan". Returns {y, m, d} (d null for a
// month) or null.
export function parseDate(raw) {
  const s = String(raw == null ? "" : raw).trim().replace(/^"|"$/g, "").trim();
  let m;
  // a time may follow the day, but only a time: "2021-01-29 12" is the date
  // plus the front of a number cut at its thousands comma, never a date
  if ((m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T ]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?\s*(?:Z|[+-]\d{2}:?\d{2}|[AaPp][Mm])?)?$/))) return mk(+m[1], +m[2], +m[3]);
  if ((m = s.match(/^(\d{4})[-/.](\d{1,2})$/))) return mk(+m[1], +m[2], null);
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) return mk(+m[3], +m[1], +m[2]);
  if ((m = s.match(/^(\d{1,2})[/-](\d{4})$/))) return mk(+m[2], +m[1], null);
  if ((m = s.match(/^([A-Za-z]{3,9})[-\s.,']*(\d{4})$/))) {
    const mo = monthName(m[1]);
    return mo ? mk(+m[2], mo, null) : null;
  }
  if ((m = s.match(/^(\d{4})[-\s.,]*([A-Za-z]{3,9})$/))) {
    const mo = monthName(m[2]);
    return mo ? mk(+m[1], mo, null) : null;
  }
  return null;
}

// "1,234.50", "$1,234.50", "-2.5%", "(2.5)" (a negative), a unicode minus.
// A comma is read only as a thousands separator in its place: "12,5" (a
// decimal comma) is refused rather than read as 125.
export function parseNumber(raw) {
  let s = String(raw == null ? "" : raw).trim().replace(/^"|"$/g, "").trim().replace(/\u2212/g, "-");
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  s = s.replace(/[$\s%]/g, "");
  if (s.indexOf(",") >= 0 && !/^[-+]?\d{1,3}(,\d{3})+(\.\d*)?$/.test(s)) return null;
  s = s.replace(/,/g, "");
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return null;
  const v = parseFloat(s);
  return neg ? -v : v;
}

// a number with thousands commas and no quotes, at the end of a line
const GROUPED = "[-+(]?\\$?\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?%?\\)?";
const WHOLE_GROUPED = new RegExp("^" + GROUPED + "$");
const TAIL_GROUPED = new RegExp("^(.*?)(?:,\\s*|\\s+)(" + GROUPED + ")$");

// One pasted line -> {date, v} (date null when the line has none), or null
// when it does not read. A comma-separated line cuts an unquoted "12,500"
// at its commas; the tail is rejoined only when it reads as one grouped
// number and what is left before it is a date (or nothing at all).
export function readLine(line) {
  const f = splitLine(line);
  const v = parseNumber(f[f.length - 1]);
  const date = f.length > 1 ? parseDate(f.slice(0, -1).join(" ")) : null;
  if (v != null && (f.length === 1 || date)) return { date, v };
  if (WHOLE_GROUPED.test(line)) return { date: null, v: parseNumber(line) };
  const m = line.match(TAIL_GROUPED);
  if (m && line.indexOf("\t") < 0 && line.indexOf(";") < 0) {
    const d = parseDate(m[1].replace(/,/g, " "));
    if (d) return { date: d, v: parseNumber(m[2]) };
  }
  return null;
}

function csvSplit(line) {
  const out = [];
  let cur = "", q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === "," && !q) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function splitLine(line) {
  let f;
  if (line.indexOf("\t") >= 0) f = line.split("\t");
  else if (line.indexOf(";") >= 0) f = line.split(";");
  else if (line.indexOf(",") >= 0) f = csvSplit(line);
  else f = line.trim().split(/\s+/);
  return f.map((x) => x.trim()).filter((x) => x !== "");
}

export function monthKey(y, m) {
  return String(y).padStart(4, "0") + "-" + String(m).padStart(2, "0");
}

function nextMonth(key) {
  let y = +key.slice(0, 4), m = +key.slice(5, 7) + 1;
  if (m > 12) { y += 1; m = 1; }
  return monthKey(y, m);
}

function monthsBetween(a, b) {
  const out = [];
  for (let k = a; k <= b; k = nextMonth(k)) out.push(k);
  return out;
}

// kind: "values" (a balance or price, any frequency), "pct" (monthly
// returns in percent, 1.5 = 1.5%) or "dec" (monthly returns as decimals,
// 0.015 = 1.5%). startMonth ("YYYY-MM") is needed only when the lines
// carry no dates. Returns {months, rets, errors, notes, firstDate,
// partialFirst}: months[i] is the month rets[i] was earned in.
export function parseSeries(text, kind, startMonth) {
  const out = { months: [], rets: [], errors: [], notes: [], firstDate: null, partialFirst: false };
  if (["values", "pct", "dec"].indexOf(kind) < 0) {
    out.errors.push("choose what each line holds");
    return out;
  }
  const rows = [];
  const lines = String(text || "").split(/\r?\n/);
  let seen = 0;
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line[0] === "#") return;
    seen += 1;
    const r = readLine(line);
    if (!r) {
      const f = splitLine(line);
      // a header line: the first line, no number at its end and no date at
      // its start ("2021-01-29; 12,5" is a line to fix, not a header)
      if (seen === 1 && parseNumber(f[f.length - 1]) == null && !parseDate(f[0])) return;
      const why = /\d,(\d{1,2}|\d{4,})(?!\d)/.test(line)
        ? "a decimal comma, as in 12,5, is not read: write the number with a point (12.5)"
        : /\d,\d{3}/.test(line)
          ? "a number with thousands commas, as in 12,500, did not read: remove the commas or put the number in quotes"
          : "could not read";
      out.errors.push("line " + (i + 1) + ": " + why + " (\"" + line.slice(0, 40) + "\")");
      return;
    }
    rows.push({ date: r.date, v: r.v, line: i + 1 });
  });
  if (out.errors.length) return out;
  if (!rows.length) { out.errors.push("nothing to read: paste one line per date or month"); return out; }
  const dated = rows.filter((r) => r.date).length;
  if (dated && dated !== rows.length) {
    out.errors.push("some lines have a date and some do not: give every line a date, or none");
    return out;
  }
  if (!dated) {
    const sm = parseDate(startMonth);
    if (!sm) { out.errors.push("these lines have no dates: enter the first month"); return out; }
    let k = monthKey(sm.y, sm.m);
    rows.forEach((r) => {
      r.date = { y: +k.slice(0, 4), m: +k.slice(5, 7), d: null };
      k = nextMonth(k);
    });
  }
  const ord = (r) => r.date.y * 10000 + r.date.m * 100 + (r.date.d == null ? 32 : r.date.d);
  const sorted = rows.slice().sort((a, b) => ord(a) - ord(b) || a.line - b.line);
  if (sorted.some((r, i) => r !== rows[i])) out.notes.push("sorted oldest first");
  const first = sorted[0].date;
  out.firstDate = first.d == null ? monthKey(first.y, first.m)
    : monthKey(first.y, first.m) + "-" + String(first.d).padStart(2, "0");

  if (kind === "values") {
    if (sorted.some((r) => !(r.v > 0))) {
      out.errors.push("a balance or price must be above zero (line " + sorted.find((r) => !(r.v > 0)).line + ")");
      return out;
    }
    const ends = {}, counts = {};
    sorted.forEach((r) => {
      const k = monthKey(r.date.y, r.date.m);
      ends[k] = r.v;
      counts[k] = (counts[k] || 0) + 1;
    });
    const keys = Object.keys(ends).sort();
    if (keys.length < 2 && counts[keys[0]] < 2) {
      out.errors.push("one value is a starting point, not a record: paste at least two months");
      return out;
    }
    const firstKey = keys[0];
    let prev = sorted[0].v;
    let start = firstKey;
    if (counts[firstKey] === 1) start = nextMonth(firstKey);   // the lone first value is a month end
    else out.partialFirst = true;                               // the first month runs from its first date
    let carried = 0;
    let last = ends[firstKey];
    for (const k of monthsBetween(start, keys[keys.length - 1])) {
      const e = ends[k] != null ? ends[k] : last;
      if (ends[k] == null) carried += 1;
      out.months.push(k);
      out.rets.push(e / prev - 1);
      prev = e;
      last = e;
    }
    if (carried) out.notes.push(carried + " month(s) had no value; the change is counted in the next month that has one");
    return out;
  }

  const byMonth = {};
  for (const r of sorted) {
    const k = monthKey(r.date.y, r.date.m);
    if (byMonth[k] != null) {
      out.errors.push("two returns for " + k + " (line " + r.line + "): paste one return per month, or paste values instead");
      return out;
    }
    const x = kind === "pct" ? r.v / 100 : r.v;
    if (!(x > -1)) {
      out.errors.push("a monthly return of " + (100 * x).toFixed(1) + "% on line " + r.line + " loses more than everything");
      return out;
    }
    byMonth[k] = x;
  }
  const keys = Object.keys(byMonth).sort();
  const all = monthsBetween(keys[0], keys[keys.length - 1]);
  const missing = all.filter((k) => byMonth[k] == null);
  if (missing.length) {
    out.errors.push("no return for " + missing.slice(0, 5).join(", ") + (missing.length > 5 ? " and " + (missing.length - 5) + " more" : "") +
                    ": every month from the first to the last is needed");
    return out;
  }
  out.months = all;
  out.rets = all.map((k) => byMonth[k]);
  return out;
}

// ---------------------------------------------------------------- the record

export function compound(rets, i, j) {
  let g = 1;
  for (let k = i; k <= j; k++) g *= 1 + rets[k];
  return g - 1;
}

// Every window of `len` consecutive months, keyed by its start month, with
// the worst, the median and the best. The median is a real window (the
// lower middle one when the count is even), so it has a start date too.
export function rollingWindows(months, rets, len) {
  const windows = [];
  for (let i = 0; i + len <= rets.length; i++) {
    windows.push({ start: months[i], end: months[i + len - 1], ret: compound(rets, i, i + len - 1) });
  }
  if (!windows.length) return null;
  const order = windows.map((_, i) => i).sort((a, b) => windows[a].ret - windows[b].ret || a - b);
  return {
    len, windows,
    worst: windows[order[0]],
    median: windows[order[(order.length - 1) >> 1]],
    best: windows[order[order.length - 1]],
    losing: windows.filter((w) => w.ret < 0).length,
  };
}

// Every calendar year in order, partial years flagged with the months they
// cover. A year is partial when it has fewer than 12 months, or when it is
// the first year and the first month started after its first day.
export function calendarYears(months, rets, partialFirst) {
  const years = [];
  let cur = null;
  months.forEach((m, i) => {
    const y = m.slice(0, 4);
    if (!cur || cur.year !== y) { cur = { year: y, first: m, last: m, months: 0, g: 1 }; years.push(cur); }
    cur.months += 1;
    cur.last = m;
    cur.g *= 1 + rets[i];
  });
  return years.map((c, i) => ({
    year: c.year, first: c.first, last: c.last, months: c.months, ret: c.g - 1,
    partial: c.months < 12 || (i === 0 && !!partialFirst),
  }));
}

// Since inception on month-end values: the drawdown (peak, trough and the
// month it was made back, if it was), the worst and best month, the losing
// months, the total, and the annualized rate from 12 months on.
export function sinceInception(months, rets) {
  const n = rets.length;
  let g = 1, peak = 1, peakIdx = -1, maxDD = 0, ddPeak = -1, ddTrough = -1;
  const curve = [];
  for (let i = 0; i < n; i++) {
    g *= 1 + rets[i];
    curve.push(g);
    if (g > peak) { peak = g; peakIdx = i; }
    const dd = g / peak - 1;
    if (dd < maxDD) { maxDD = dd; ddPeak = peakIdx; ddTrough = i; }
  }
  let recovered = null;
  if (ddTrough >= 0) {
    const level = ddPeak < 0 ? 1 : curve[ddPeak];
    for (let i = ddTrough + 1; i < n; i++) if (curve[i] >= level) { recovered = months[i]; break; }
  }
  let wi = 0, bi = 0;
  rets.forEach((r, i) => { if (r < rets[wi]) wi = i; if (r > rets[bi]) bi = i; });
  return {
    months: n, first: months[0], last: months[n - 1],
    total: g - 1,
    cagr: n >= 12 ? Math.pow(g, 12 / n) - 1 : null,
    maxDrawdown: maxDD,
    ddPeak: ddTrough < 0 ? null : (ddPeak < 0 ? "inception" : months[ddPeak]),
    ddTrough: ddTrough < 0 ? null : months[ddTrough],
    recovered,
    worstMonth: { month: months[wi], ret: rets[wi] },
    bestMonth: { month: months[bi], ret: rets[bi] },
    losingMonths: rets.filter((r) => r < 0).length,
  };
}

// ---------------------------------------------------------------- the net panel

function num(x) {
  const v = typeof x === "number" ? x : parseNumber(x);
  return v == null || !isFinite(v) ? null : v;
}

// One path of the account, month by month. Simplified, not tax advice:
//  - slippage: turnover (percent of the account bought plus sold in a
//    month) x bps, taken off that month's return, only for the leader's
//    trades (a follower's actual results already carry it)
//  - the flat fee: paid from the account every month (a yearly fee spread
//    evenly over its months); the model does not deduct it from gains
//  - tax (taxable only): each calendar year's net gain at the reader's
//    federal plus state rate, paid from the account at the year's last
//    month in the series; a losing year's loss is carried forward against
//    later gains. No wash sales, no long-term rates, no dividends apart,
//    no state rules beyond the one rate. An IRA pays nothing inside.
export function netRun(months, rets, o, bps) {
  const account = o.account;
  const feeMonth = o.feePer === "year" ? o.fee / 12 : o.fee;
  const rate = o.taxable ? (o.fedRate + o.stateRate) / 100 : 0;
  const slip = o.series === "leader" ? (o.turnover / 100) * (bps / 10000) : 0;
  let B = account, yearGain = 0, carry = 0;
  const t = { fees: 0, taxes: 0, slippage: 0, emptied: null };
  for (let i = 0; i < rets.length; i++) {
    if (B <= 0) break;
    const gain = B * (rets[i] - slip);
    t.slippage += B * slip;
    B += gain;
    yearGain += gain;
    const fee = Math.min(feeMonth, Math.max(B, 0));
    B -= fee;
    t.fees += fee;
    const yearEnd = i === rets.length - 1 || months[i + 1].slice(0, 4) !== months[i].slice(0, 4);
    if (rate > 0 && yearEnd) {
      let tax = 0;
      if (yearGain > 0) {
        const off = Math.min(carry, yearGain);
        carry -= off;
        tax = Math.min((yearGain - off) * rate, Math.max(B, 0));
      } else {
        carry += -yearGain;
      }
      B -= tax;
      t.taxes += tax;
      yearGain = 0;
    }
    if (B <= 0 && t.emptied == null) { t.emptied = months[i]; B = 0; }
  }
  const n = rets.length;
  const growth = B / account;
  return {
    bps, ending: B, total: growth - 1,
    cagr: n >= 12 && growth > 0 ? Math.pow(growth, 12 / n) - 1 : null,
    fees: t.fees, taxes: t.taxes, slippage: t.slippage, emptied: t.emptied,
  };
}

// The whole panel from the reader's inputs (strings or numbers). The
// series switch is required: "leader" (the leader's trades, so a follower
// pays slippage at every level shown) or "follower" (a follower's actual
// results, which already hold lag and slippage, so neither is taken again).
export function netPanel(months, rets, input) {
  const errors = [];
  const series = input.series;
  if (series !== "leader" && series !== "follower") {
    errors.push("choose what the series is: the leader's trades, or a follower's actual results");
  }
  const o = {
    series,
    account: num(input.account),
    fee: num(input.fee == null || input.fee === "" ? 0 : input.fee),
    feePer: input.feePer === "year" ? "year" : "month",
    taxable: input.accountType === "taxable",
    fedRate: num(input.fedRate),
    stateRate: num(input.stateRate == null || input.stateRate === "" ? 0 : input.stateRate),
    turnover: num(input.turnover),
    alt: num(input.altAnnual == null || input.altAnnual === "" ? 0 : input.altAnnual),
  };
  if (!(o.account > 0)) errors.push("enter the account size");
  if (o.fee == null || o.fee < 0) errors.push("the fee must be zero or more");
  // a taxable account needs the reader's own federal rate (a state rate
  // left blank is zero); nothing is assumed for them
  if (o.taxable && (o.fedRate == null || o.stateRate == null || o.fedRate < 0 || o.stateRate < 0 ||
                    o.fedRate + o.stateRate >= 100)) errors.push("enter your own tax rates, in percent");
  if (series === "leader" && (o.turnover == null || o.turnover < 0)) {
    errors.push("enter the turnover (percent of the account bought plus sold in a month) to price slippage");
  }
  if (o.alt == null) errors.push("the alternative's return must be a number");
  if (errors.length) return { errors };
  if (series === "follower") o.turnover = 0;
  const grossRun = netRun(months, rets, { ...o, fee: 0, taxable: false, series: "follower" }, 0);
  const rows = series === "leader"
    ? SLIPPAGE_BPS.map((b) => netRun(months, rets, o, b))
    : [netRun(months, rets, o, 0)];
  const annualFee = o.feePer === "year" ? o.fee : o.fee * 12;
  return {
    errors: [], series, taxable: o.taxable, rate: o.taxable ? o.fedRate + o.stateRate : 0,
    turnover: o.turnover, annualFee,
    gross: grossRun,
    rows,
    breakEven: breakEvenBalance(annualFee, grossRun.cagr, o.alt / 100),
  };
}

// The balance at which a flat yearly fee equals the gross excess: the
// gross annualized return over the reader's own alternative, in dollars.
// Below it the fee takes more than the whole excess. Null with a reason
// when there is no such balance.
export function breakEvenBalance(annualFee, grossCagr, altAnnual) {
  if (grossCagr == null) return { balance: null, reason: "needs at least 12 months" };
  const excess = grossCagr - (altAnnual || 0);
  if (!(annualFee > 0)) return { balance: null, excess, reason: "no fee entered" };
  if (!(excess > 0)) return { balance: null, excess, reason: "the gross return does not exceed the alternative, so any fee widens the gap" };
  return { balance: annualFee / excess, excess };
}
