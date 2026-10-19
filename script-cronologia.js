/* ===== Pagina cronologia (dipende da common.js) ===== */

const contenitore = $("cronologia");
const msg = $("msg");
const fileInput = $("file-import");

function creaAzioni(e) {
  const azioni = document.createElement("div");
  azioni.className = "azioni";

  const modifica = document.createElement("a");
  modifica.className = "icon-btn small";
  modifica.href = `index.html?data=${encodeURIComponent(e.data)}`;
  modifica.setAttribute("aria-label", `Modifica il ${formattaData(e.data)}`);
  modifica.innerHTML = '<i class="fa-solid fa-pen"></i>';

  const elimina = document.createElement("button");
  elimina.type = "button";
  elimina.className = "icon-btn small danger";
  elimina.setAttribute("aria-label", `Elimina il ${formattaData(e.data)}`);
  elimina.innerHTML = '<i class="fa-solid fa-trash"></i>';
  elimina.addEventListener("click", () => {
    if (!confirm(`Eliminare la registrazione del ${formattaData(e.data)}?`))
      return;
    salvaLista(caricaLista().filter((x) => x.data !== e.data));
    render();
    mostraMessaggio(msg, "Registrazione eliminata.", "success", 3000);
  });

  azioni.append(modifica, elimina);
  return azioni;
}

function render() {
  const lista = [...caricaLista()].reverse(); // più recenti per prime
  const box = lista.map((e) => {
    const riga = document.createElement("div");
    riga.className = "box-dati";
    riga.append(creaData(e), creaDati(e), creaAzioni(e));
    return riga;
  });
  contenitore.replaceChildren(...box);
}

/* ---------- Esporta ---------- */
$("btn-export").addEventListener("click", () => {
  const dati = { lista: caricaLista(), obiettivo: leggiObiettivo() };
  const blob = new Blob([JSON.stringify(dati, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fitness-tracker-${oggiISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

/* ---------- Importa ---------- */
$("btn-import").addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  try {
    const dati = JSON.parse(await file.text());
    const arr = Array.isArray(dati) ? dati : dati.lista;
    if (!Array.isArray(arr)) throw new Error("formato non valido");

    const mappa = new Map(caricaLista().map((e) => [e.data, e]));
    let importati = 0;
    arr.forEach((e) => {
      const n = normalizzaEntry(e);
      if (n) {
        mappa.set(n.data, n);
        importati++;
      }
    });
    salvaLista([...mappa.values()]);

    if (!Array.isArray(dati)) {
      const ob = parseFloat(dati.obiettivo);
      if (Number.isFinite(ob)) salvaLocale("obiettivo", String(ob));
    }

    render();
    mostraMessaggio(
      msg,
      `Importate ${importati} registrazioni.`,
      "success",
      3000,
    );
  } catch {
    mostraMessaggio(msg, "File non valido: impossibile importare i dati.");
  }
  fileInput.value = "";
});

render();
