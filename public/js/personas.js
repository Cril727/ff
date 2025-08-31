// personas.js — versión simple
const APIPERSONAS = "http://127.0.0.1:8000/api/";
const token = localStorage.getItem("token");

const documentoInput = document.getElementById("txtBuscarPersona");
const formBuscarPersona = document.getElementById("formBusarPersona");
const resultContainer = document.getElementById("resultContainer");
const resultItems = document.getElementById("resultItems");


function clearResults() {
  if (resultContainer) resultContainer.innerHTML = "";
}


function cardItems(){
    
}

function renderCard(person = {}) {
  if (!resultContainer) return;
  const nombre = ((person.nombres || person.nombre) + " " + (person.apellidos || "")).trim() || "Sin nombre";
  const documento = person.documento || person.numero_documento || "—";
  const email = person.email || "—";
  const telefono = person.telefono || "—";

  resultContainer.innerHTML = `
    <div class="card mb-3" style="max-width:540px">
      <div class="card-body">
        <h5 class="card-title mb-1">${nombre}</h5>
        <p class="card-text mb-1"><small class="text-muted">Documento: ${documento}</small></p>
        <p class="card-text mb-1">Email: ${email}</p>
        <p class="card-text">Tel: ${telefono}</p>
      </div>
    </div>
  `;
}

function showMessage(html) {
  if (!resultContainer) return;
  resultContainer.innerHTML = html;
}

if (!formBuscarPersona) console.error("No se encontró #formBusarPersona");
else formBuscarPersona.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearResults();

  const documento = documentoInput.value.trim();
  if (!documento) return alert("Ingrese un documento");
  if (!token) return alert("No hay token. Inicie sesión.");

  try {
    const res = await fetch(`${APIPERSONAS}personaDocumento/${encodeURIComponent(documento)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });

    if (!res.ok) {
      const txt = await res.text();
      return showMessage(`<div class="alert alert-danger">Error ${res.status}: ${txt}</div>`);
    }

    const data = await res.json();
    console.log(data)

    const person = data.persona !== undefined ? data.persona : data;
    console.log("person:", person);
    if (!person) {
      showMessage(`<div class="alert alert-warning">No se encontró la persona.</div>`);
    } else {
      renderCard(person);
    }
  } catch (err) {
    console.error(err);
    showMessage(`<div class="alert alert-danger">Ocurrió un error. Revisa la consola.</div>`);
  }
});
