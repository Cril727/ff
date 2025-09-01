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

function cardItems(person = {}) {
    if (!resultItems) return;

    const elementosArr = Array.isArray(person.elementos)
        ? person.elementos
        : (person.elementos ? [person.elementos] : []);

    if (elementosArr.length === 0) {
        resultItems.innerHTML =
            `<div class="alert alert-secondary">No hay items para esta persona.</div>`;
        return;
    }

    let html = `<div class="container"><h1>Items del usuario</h1></div>`;

    // agrega una tarjeta por cada elemento
    elementosArr.forEach((elemento) => {
        const codigo = elemento.codigo || "***";
        const nombre = elemento.nombre || "***";
        const caracteristicas = elemento.caracteristicas || "***";
        const fotoUrl = elemento.foto;
        const tipo = elemento.tipo.tipo;

        // extrae estado de forma segura
        const estadoObj = elemento.ultimo_ingreso_elemento;
        const estado = estadoObj ? estadoObj.estado : null;


        if (estado === "activo") {
            botonEntradaSalida =
                '<button class="btn btn-primary mb-3">Registrar Salida</button>';
        } else {
            botonEntradaSalida =
                '<button class="btn btn-success mb-3">Registrar Entrada</button>';
        }


        html += `
      <div class="card mb-3" style="max-width:540px">
        <div class="card-body">
          <h5 class="card-title mb-1">${nombre}</h5>
          <p class="card-text mb-1"><small class="text-muted">Codigo: ${codigo}</small></p>
          <p class="card-text mb-1">Caracteristicas: ${caracteristicas}</p>
          <p class="card-text mb-1">Tipo: ${tipo}</p>
          <p class="card-text mb-1">Estado: ${estado}</p>
          <img src="${fotoUrl}" alt="${nombre}" class="img-fluid" style="width: 80px; height: 90px;">
          <div>${botonEntradaSalida}</div>
          <button class="btn btn-warning mb-3">Editar</button>
          
        </div>
      </div>
    `;
    });

    resultItems.innerHTML = html;
}


function renderCard(person = {}) {
    if (!resultContainer) return;
    const nombre =
        ((person.nombres || person.nombre) + " " + (person.apellidos || ""))
            .trim() || "Sin nombre";
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
        <button class="btn btn-success mb-2" data-bs-toggle="modal" data-bs-target="#modalElemento" id="btn-nuevo">
                Agregar elemento
        </button>

        <button class="btn btn-primary mb-2" data-bs-toggle="modal" data-bs-target="#modalEntrada">Ingreso</button>
        <button class="btn btn-danger mb-2" data-bs-toggle="modal" data-bs-target="#modalSalida">Salida</button>
      </div>
    </div>
  `;
}

function showMessage(html) {
    if (!resultContainer) return;
    resultContainer.innerHTML = html;
}

if (!formBuscarPersona) console.error("No se encontró #formBusarPersona");
else {
    formBuscarPersona.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearResults();

        const documento = documentoInput.value.trim();
        if (!documento) return alert("Ingrese un documento");
        if (!token) return alert("No hay token. Inicie sesión.");

        try {
            const res = await fetch(
                `${APIPERSONAS}personaPorDocumento/${
                    encodeURIComponent(documento)
                }`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!res.ok) {
                const txt = await res.text();
                return showMessage(
                    `<div class="alert alert-warning">No se encontró la persona.</div>`,
                );
            }

            const data = await res.json();
            console.log(data);

            const person = data.persona !== undefined ? data.persona : data;
            console.log("person:", person);
            if (!person) {
                showMessage(
                    `<div class="alert alert-warning">No se encontró la persona.</div>`,
                );
            } else {
                renderCard(person);
                cardItems(person);
            }
        } catch (err) {
            console.error(err);
            showMessage(
                `<div class="alert alert-danger">Ocurrió un error. Revisa la consola.</div>`,
            );
        }
    });
}

//Estado del prestamo

// let ingresoElementos = fetch(`${APIPERSONAS}ingresosElementos`,{
//     headers:{
//         Authorization:`Bearer ${token}`
//     }
// })

// .then(response => response.json())
// .then(data => {
//     console.log(data)
// })
