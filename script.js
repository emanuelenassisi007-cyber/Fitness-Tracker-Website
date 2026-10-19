/* ===== Pagina principale (dipende da common.js) ===== */

const calorie = $("calorie");
const peso = $("peso");
const obiettivo = $("obiettivo");
const chooseData = $("data");
const eta = $("eta");
const altezza = $("altezza");
const sesso = $("sesso");
const palInput = $("attivita");
const diff = $("diff");
const statoEl = $("stato");
const statusBox = document.querySelector(".status");
const statusLabel = document.querySelector(".status-label");
const msgGiorno = $("error");
const msgCalcolo = $("error2");
const storico = $("storico");
const ctxGrafico = $("grafico").getContext("2d");

let miografico = null;
let fabbisogno = null; // ultimo valore calcolato (kcal)

/* ---------- Inizializzazione ---------- */
const oggi = oggiISO();
chooseData.max = oggi;

const dataParam = new URLSearchParams(location.search).get("data");
chooseData.value =
  dataParam && normalizzaData(dataParam) && dataParam <= oggi
    ? dataParam
    : oggi;

const obSalvato = leggiObiettivo();
obiettivo.value = obSalvato !== null ? obSalvato : "";

/* ---------- Giorno esistente: precompila i campi ---------- */
function caricaGiorno(iso) {
  const e = caricaLista().find((x) => x.data === iso);
  if (e) {
    calorie.value = e.calorie;
    peso.value = e.peso;
  }
}
chooseData.addEventListener("change", () => caricaGiorno(chooseData.value));

/* ---------- Validazione ---------- */
function numeroInRange(input, min, max) {
  if (input.value.trim() === "") return null;
  const n = Number(input.value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

function leggiGiorno() {
  const dataValue = chooseData.value.trim();
  if (
    !calorie.value.trim() ||
    !peso.value.trim() ||
    !obiettivo.value.trim() ||
    !dataValue
  ) {
    mostraMessaggio(msgGiorno, "Compila tutti i campi prima di salvare.");
    return null;
  }
  if (dataValue > oggi) {
    mostraMessaggio(msgGiorno, "La data non può essere nel futuro.");
    return null;
  }
  const c = numeroInRange(calorie, 100, 20000);
  if (c === null) {
    mostraMessaggio(
      msgGiorno,
      "Le calorie devono essere tra 100 e 20000 kcal.",
    );
    return null;
  }
  const p = numeroInRange(peso, 20, 300);
  if (p === null) {
    mostraMessaggio(msgGiorno, "Il peso deve essere tra 20 e 300 kg.");
    return null;
  }
  const o = numeroInRange(obiettivo, 20, 300);
  if (o === null) {
    mostraMessaggio(msgGiorno, "L'obiettivo deve essere tra 20 e 300 kg.");
    return null;
  }
  return { data: dataValue, calorie: c, peso: arrotonda(p), obiettivo: o };
}

/* ---------- Salvataggio ---------- */
function salva() {
  const g = leggiGiorno();
  if (!g) return;

  // L'obiettivo è un'impostazione unica
  salvaLocale("obiettivo", String(g.obiettivo));

  // Una sola registrazione per giorno: sostituisce quella esistente
  const lista = caricaLista().filter((e) => e.data !== g.data);
  lista.push({ data: g.data, calorie: g.calorie, peso: g.peso });
  salvaLista(lista);

  mostraMessaggio(msgGiorno, "Giorno salvato con successo.", "success", 3000);
  aggiornaTutto();
}

/* ---------- Stato (peso attuale vs obiettivo) ---------- */
function aggiornaStato() {
  const ultimo = caricaLista().at(-1);
  const ob = leggiObiettivo();

  if (!ultimo || ob === null) {
    statoEl.textContent = "Stato";
    diff.textContent = "0";
    statusLabel.textContent = "salva un giorno per iniziare";
    statusBox.classList.remove("raggiunto");
    return;
  }

  const delta = arrotonda(ob - ultimo.peso);
  statoEl.textContent = `Stato (ultimo aggiornamento: ${formattaData(ultimo.data)} · peso ${ultimo.peso} kg · obiettivo ${ob} kg)`;

  if (delta === 0) {
    statoEl.textContent = `Congratulazioni! Hai raggiunto il tuo obiettivo di ${ob} kg`;
    diff.textContent = "0";
    statusLabel.textContent = "obiettivo raggiunto";
    statusBox.classList.add("raggiunto");
  } else {
    diff.textContent = Math.abs(delta).toFixed(1);
    statusLabel.textContent =
      delta < 0 ? "ancora da perdere" : "ancora da aggiungere";
    statusBox.classList.remove("raggiunto");
  }
}

/* ---------- Calcolo fabbisogno ---------- */
function calcolaCalorie() {
  if (!eta.value.trim() || !altezza.value.trim()) {
    mostraMessaggio(msgCalcolo, "Compila età e altezza prima di calcolare.");
    return;
  }
  const etaN = numeroInRange(eta, 10, 120);
  if (etaN === null) {
    mostraMessaggio(msgCalcolo, "L'età deve essere tra 10 e 120 anni.");
    return;
  }
  const altN = numeroInRange(altezza, 100, 250);
  if (altN === null) {
    mostraMessaggio(msgCalcolo, "L'altezza deve essere tra 100 e 250 cm.");
    return;
  }
  const ultimo = caricaLista().at(-1);
  if (!ultimo) {
    mostraMessaggio(
      msgCalcolo,
      "Salva prima almeno un giorno: serve il tuo peso attuale.",
    );
    return;
  }

  // Mifflin-St Jeor
  const base = 10 * ultimo.peso + 6.25 * altN - 5 * etaN;
  const bmr = sesso.value === "donna" ? base - 161 : base + 5;
  fabbisogno = Math.round(bmr * parseFloat(palInput.value));

  $("calCons").textContent = fabbisogno;
  aggiornaRiepilogo();
}

/* ---------- Media 7 giorni e deficit/surplus ---------- */
function aggiornaRiepilogo() {
  const box = $("riepilogo");
  if (fabbisogno === null) {
    box.hidden = true;
    return;
  }
  box.hidden = false;

  const limite = new Date();
  limite.setDate(limite.getDate() - 6);
  const recenti = caricaLista().filter((e) => e.data >= isoLocale(limite));

  if (recenti.length === 0) {
    $("media7").textContent = "—";
    $("deficit").textContent = "—";
    return;
  }

  const media = Math.round(
    recenti.reduce((s, e) => s + e.calorie, 0) / recenti.length,
  );
  const delta = media - fabbisogno;
  $("media7").textContent = `${media} kcal`;
  $("deficit").textContent =
    delta === 0
      ? "in pari"
      : delta > 0
        ? `+${delta} kcal (surplus)`
        : `−${Math.abs(delta)} kcal (deficit)`;
}

/* ---------- Storico (ultimi 3) ---------- */
function aggiornaStorico() {
  const recenti = [...caricaLista()].reverse().slice(0, 3);
  const righe = recenti.map((e) => {
    const riga = document.createElement("div");
    riga.className = "riga";
    riga.append(creaData(e), creaDati(e));
    return riga;
  });
  storico.replaceChildren(...righe);
}

/* ---------- Grafico: andamento nel tempo ---------- */
function aggiornaGrafico() {
  if (typeof Chart === "undefined") return; // offline: niente grafico

  const lista = caricaLista();
  const css = getComputedStyle(document.body);
  const testo = css.getPropertyValue("--muted").trim();
  const grigliaY = css.getPropertyValue("--colore-griglia-y").trim();
  const grigliaX = css.getPropertyValue("--colore-griglia-x").trim();

  if (miografico) miografico.destroy();

  miografico = new Chart(ctxGrafico, {
    type: "line",
    data: {
      labels: lista.map((e) => formattaData(e.data)),
      datasets: [
        {
          label: "Peso (kg)",
          data: lista.map((e) => e.peso),
          borderColor: "#2d5bff",
          backgroundColor: "rgba(45, 91, 255, 0.2)",
          tension: 0.2,
          yAxisID: "y",
        },
        {
          label: "Calorie (kcal)",
          data: lista.map((e) => e.calorie),
          borderColor: "#ff6384",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.2,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 0 },
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { labels: { color: testo } } },
      scales: {
        x: { ticks: { color: testo }, grid: { color: grigliaX } },
        y: {
          position: "left",
          title: { display: true, text: "Peso (kg)", color: testo },
          ticks: { color: testo },
          grid: { color: grigliaY },
        },
        y1: {
          position: "right",
          title: { display: true, text: "Kcal", color: testo },
          ticks: { color: testo },
          grid: { drawOnChartArea: false },
        },
      },
    },
  });
}

function aggiornaTutto() {
  aggiornaStato();
  aggiornaStorico();
  aggiornaGrafico();
  aggiornaRiepilogo();
}

/* ---------- Eventi ---------- */
$("btn-salva").addEventListener("click", salva);
$("btn-calcola").addEventListener("click", calcolaCalorie);
document.addEventListener("temacambiato", aggiornaGrafico);

caricaGiorno(chooseData.value);
aggiornaTutto();
