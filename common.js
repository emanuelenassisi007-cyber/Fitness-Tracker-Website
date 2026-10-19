/* ===== Utilità condivise tra index e cronologia ===== */

const $ = (id) => document.getElementById(id);

/* ---------- Storage ---------- */
function leggiJSON(chiave, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(chiave));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function salvaLocale(chiave, valore) {
  try {
    localStorage.setItem(chiave, valore);
  } catch {
    /* storage pieno o bloccato: ignoriamo */
  }
}

/* ---------- Date ---------- */
function isoLocale(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function oggiISO() {
  return isoLocale(new Date());
}

// Accetta "YYYY-MM-DD" oppure il vecchio formato "GG/MM/AAAA"
function normalizzaData(d) {
  if (typeof d !== "string") return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(d.trim());
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}

function formattaData(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/* ---------- Dati ---------- */
function normalizzaEntry(e) {
  if (!e || typeof e !== "object") return null;
  const data = normalizzaData(e.data);
  const calorie = Number(e.calorie);
  const peso = Number(e.peso);
  if (!data || !Number.isFinite(calorie) || !Number.isFinite(peso)) return null;
  if (calorie < 0 || peso <= 0) return null;
  return { data, calorie, peso };
}

// Restituisce la lista ordinata per data crescente, senza duplicati per giorno
function caricaLista() {
  const raw = leggiJSON("lista", []);
  if (!Array.isArray(raw)) return [];
  const mappa = new Map();
  raw.forEach((e) => {
    const n = normalizzaEntry(e);
    if (n) mappa.set(n.data, n); // l'ultima registrazione del giorno vince
  });
  return [...mappa.values()].sort((a, b) => a.data.localeCompare(b.data));
}

function salvaLista(lista) {
  const ordinata = [...lista].sort((a, b) => a.data.localeCompare(b.data));
  salvaLocale("lista", JSON.stringify(ordinata));
}

function leggiObiettivo() {
  const v = parseFloat(localStorage.getItem("obiettivo"));
  return Number.isFinite(v) ? v : null;
}

function arrotonda(n) {
  return Math.round(n * 10) / 10;
}

/* ---------- DOM ---------- */
function creaDati(e) {
  const dati = document.createElement("span");
  dati.className = "dati";
  const b1 = document.createElement("b");
  b1.textContent = e.calorie;
  const b2 = document.createElement("b");
  b2.textContent = e.peso;
  dati.append(b1, " kcal · ", b2, " kg");
  return dati;
}

function creaData(e) {
  const data = document.createElement("span");
  data.className = "data";
  data.textContent = formattaData(e.data);
  return data;
}

/* ---------- Messaggi ---------- */
function mostraMessaggio(el, testo, tipo = "error", durata = 4000) {
  el.className = `msg ${tipo}`;
  const icona = el.querySelector("i");
  if (icona) {
    icona.className =
      tipo === "success"
        ? "fa-solid fa-circle-check"
        : "fa-solid fa-circle-exclamation";
  }
  el.querySelector("span").textContent = testo;
  el.hidden = false;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.hidden = true;
  }, durata);
}

/* ---------- Tema ---------- */
function applicaTema(scuro) {
  const btn = $("theme");
  document.body.classList.toggle("dark-mode", scuro);
  btn.innerHTML = scuro
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  btn.setAttribute(
    "aria-label",
    scuro ? "Passa al tema chiaro" : "Passa al tema scuro",
  );
}

applicaTema(localStorage.getItem("tema") === "dark");

$("theme").addEventListener("click", () => {
  const scuro = !document.body.classList.contains("dark-mode");
  applicaTema(scuro);
  salvaLocale("tema", scuro ? "dark" : "light");
  document.dispatchEvent(new CustomEvent("temacambiato"));
});
