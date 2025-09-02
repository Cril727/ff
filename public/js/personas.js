// personas.js - versión mínima y estable
(() => {
    const API = "http://127.0.0.1:8000/api/";
    const token = localStorage.getItem("token");
    let fichas = [];

    const documentoInput = document.getElementById("txtBuscarPersona");
    const form = document.getElementById("formBusarPersona");
    const resultContainer = document.getElementById("resultContainer");
    const resultItems = document.getElementById("resultItems");
    const btnBuscar = document.getElementById("btnBusacar");

    function clear() {
        if (resultContainer) resultContainer.innerHTML = "";
        if (resultItems) resultItems.innerHTML = "";
    }

    function renderCard(person = {}) {
        if (!resultContainer) return;
        const nombre = ((person.nombres || person.nombre) || "") + " " +
            (person.apellidos || "");
        const documento = person.documento || person.numero_documento || "—";
        const email = person.email || "—";
        const telefono = person.telefono || "—";
        const pid = person.idPersona || person.id_persona || person.id;
        if (pid) {
            localStorage.setItem("idPersona", pid);
            const hid = document.getElementById("idPersona");
            if (hid) hid.value = pid;
        }
        resultContainer.innerHTML = `
      <div class="card mb-3" style="max-width:540px">
        <div class="card-body">
          <h5 class="card-title mb-1">${nombre.trim() || "Sin nombre"}</h5>
          <p class="card-text mb-1"><small class="text-muted">Documento: ${documento}</small></p>
          <p class="card-text mb-1">Email: ${email}</p>
          <p class="card-text">Tel: ${telefono}</p>
          <button class="btn btn-success mb-2" data-bs-toggle="modal" data-bs-target="#modalElemento">Agregar elemento</button>
          <button class="btn btn-primary mb-2" data-bs-toggle="modal" data-bs-target="#modalEntrada">Ingreso</button>
          <button class="btn btn-danger mb-2" data-bs-toggle="modal" data-bs-target="#modalSalida">Salida</button>
        </div>
      </div>`;
    }

    function renderItems(person = {}) {
        if (!resultItems) return;
        const elementos = Array.isArray(person.elementos)
            ? person.elementos
            : (person.elementos ? [person.elementos] : []);
        if (elementos.length === 0) {
            resultItems.innerHTML =
                `<div class="alert alert-secondary">No hay items para esta persona.</div>`;
            return;
        }
        let html = `<div class="container"><h5>Items</h5></div>`;
        elementos.forEach((el) => {
            const idEl = el.idElemento || el.id || "";
            const codigo = el.codigo || "—";
            const nombre = el.nombre || "—";
            const car = el.caracteristicas || "—";
            const foto = el.foto
                ? `<img src="${el.foto}" alt="${nombre}" style="width:80px;height:90px;object-fit:cover;">`
                : "";
            const ultimo = el.ultimoIngresoElemento ||
                el.ultimo_ingreso_elemento || null;
            const idIngresoElemento = ultimo
                ? (ultimo.idIngresoElemento || ultimo.id)
                : "";
            const estado = ultimo ? (ultimo.estado || "").toLowerCase() : "";
            const boton = estado === "activo"
                ? `<button class="btn btn-primary mb-2" onclick="handleSalidaElemento(${idEl}, ${idIngresoElemento})">Registrar Salida</button>`
                : `<button class="btn btn-success mb-2" onclick="handleEntradaElemento(${idEl}, ${idIngresoElemento})">Registrar Entrada</button>`;
            html += `
        <div class="card mb-2" style="max-width:540px">
          <div class="card-body">
            <h6 class="card-title">${nombre}</h6>
            <p class="card-text"><small class="text-muted">Código: ${codigo}</small></p>
            <p class="card-text">Características: ${car}</p>
            <p class="card-text">Estado: ${estado || "—"}</p>
            ${foto}
            <div class="mt-2">${boton} <button class="btn btn-warning" onclick="abrirModalEditarElemento(${idEl})">Editar</button></div>
          </div>
        </div>`;
        });
        resultItems.innerHTML = html;
    }

    if (btnBuscar) {
        btnBuscar.addEventListener("click", (ev) => {
            ev.preventDefault();
            if (form) {
                form.dispatchEvent(new Event("submit", { cancelable: true }));
            }
        });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            clear();
            const documento = (documentoInput?.value || "").trim();
            if (!documento) return alert("Ingresa un documento");
            if (!token) return alert("No hay token. Inicia sesión.");
            try {
                const res = await fetch(
                    `${API}personaPorDocumento/${
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
                    resultContainer.innerHTML =
                        `<div class="alert alert-warning">Persona no encontrada</div>`;
                    return;
                }
                const data = await res.json();
                const person = data.persona || data;
                if (!person) {
                    resultContainer.innerHTML =
                        `<div class="alert alert-warning">Persona no encontrada</div>`;
                    return;
                }
                renderCard(person);
                renderItems(person);
            } catch (err) {
                console.error(err);
                resultContainer.innerHTML =
                    `<div class="alert alert-danger">Error - revisa la consola</div>`;
            }
        });
    }

    window.abrirModalEditarElemento = function (id) {
        const modal = new bootstrap.Modal(
            document.getElementById("modalElemento"),
        );
        const hid = document.getElementById("idElemento");
        if (hid) hid.value = id || "";
        modal.show();
    };

    const API_PERSONAS = "http://127.0.0.1:8000/api/listarPersonas";
    const API_ROLES = "http://127.0.0.1:8000/api/listarRoles";
    const API_CREAR = "http://127.0.0.1:8000/api/agregarUsuario";
    const API_ASIGNAR = "http://127.0.0.1:8000/api/asignarRol";
    const API_ACTUALIZAR_BASE = "http://127.0.0.1:8000/api/actualizarRol/";

    let roles = [];
    let personas = [];

    async function cargarRoles() {
        try {
            const res = await fetch(API_ROLES, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            const maybe = Array.isArray(data) && Array.isArray(data[0])
                ? data[0]
                : data;
            roles = (maybe || []).map((r) => ({ idRol: r.idRol, rol: r.rol }));
        } catch (e) {
            console.error("Error roles", e);
            roles = [];
        }
    }

    async function cargarPersonas() {
        try {
            const res = await fetch(API_PERSONAS, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            console.log(data);
            if (Array.isArray(data)) personas = data;
            else if (data.personas && Array.isArray(data.personas)) {
                personas = data.personas;
            } else if (data.persona && Array.isArray(data.persona)) {
                personas = data.persona;
            } else if (data.persona && typeof data.persona === "object") {
                personas = [data.persona];
            } else personas = [];
            renderTabla();
        } catch (e) {
            console.error("Error personas", e);
            document.getElementById("tablaPersonas").innerHTML =
                `<tr><td colspan="7">Error al cargar personas</td></tr>`;
        }
    }

    // --- renderTabla mejorada ---
    function renderTabla() {
        const tbody = document.getElementById("tablaPersonas");
        if (!personas || personas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8">No hay personas</td></tr>`;
            return;
        }

        tbody.innerHTML = personas.map((p) => {
            const idPersona = p.idPersona ?? p.id ?? null;
            const options = roles.map((r) => {
                const sel = (p.roles && p.roles.length &&
                        (p.roles[0].idRol === r.idRol ||
                            p.roles[0].rol === r.rol))
                    ? "selected"
                    : "";
                return `<option value="${r.idRol}" ${sel}>${r.rol}</option>`;
            }).join("");

            return `
        <tr data-id="${idPersona}">
          <td>${p.documento ?? ""}</td>
          <td>${p.nombres ?? ""}</td>
          <td>${p.apellidos ?? ""}</td>
          <td>${p.email ?? ""}</td>
          <td>${p.telefono ?? ""}</td>
          <td>${p.ficha ? p.ficha.numeroFicha : ""}</td>
          <td>
            <select class="form-select form-select-sm rol-select" data-persona="${idPersona}">
              <option value="">-- Sin rol --</option>
              ${options}
            </select>
          </td>
          <td>
            <button class="btn btn-danger btn-eliminar" data-id="${idPersona}">Eliminar</button>
            <button class="btn btn-primary btn-editar" data-id="${idPersona}">Editar</button>
          </td>
        </tr>`;
        }).join("");

        // listeners
        document.querySelectorAll(".rol-select").forEach((sel) =>
            sel.addEventListener("change", onRolChange)
        );

        document.querySelectorAll(".btn-eliminar").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                const id = btn.getAttribute("data-id");
                deletePersona(id);
            })
        );

        document.querySelectorAll(".btn-editar").forEach((btn) =>
            btn.addEventListener("click", (e) => {
                const id = btn.getAttribute("data-id");
                console.log("editar", id);
            })
        );
    }

    const API_FICHAS = "http://127.0.0.1:8000/api/mostrarFichas";

    async function cargarFichas() {
        const select = document.getElementById("selectFicha");
        if (!select) return;

        try {
            const res = await fetch(API_FICHAS, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            fichas = data.ficahs || [];
            select.innerHTML =
                `<option value="">-- Selecciona una ficha --</option>`;
            fichas.forEach((f) => {
                select.innerHTML +=
                    `<option value="${f.idFicha}">${f.numeroFicha}</option>`;
            });
        } catch (err) {
            console.error("Error cargando fichas:", err);
            select.innerHTML =
                `<option value="">Error al cargar fichas</option>`;
            fichas = [];
        }
    }

    async function deletePersona(idPersona) {
        if (!idPersona) return;

        if (
            !confirm(
                "¿Eliminar persona con id " + idPersona +
                    "? Esta acción no se puede deshacer.",
            )
        ) {
            return;
        }

        const token = localStorage.getItem("token");
        const url = `http://127.0.0.1:8000/api/eliminarPersona/${idPersona}`;

        try {
            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                },
            });

            let json = null;
            try {
                json = await res.json();
            } catch (e) {}

            if (res.ok) {
                const row = document.querySelector(
                    `tr[data-id="${idPersona}"]`,
                );
                if (row) row.remove();

                alert(
                    json && json.message
                        ? json.message
                        : "Persona eliminada correctamente.",
                );
            } else {
                const msg = (json &&
                    (json.message ||
                        (json.errors && JSON.stringify(json.errors)))) ||
                    `Error ${res.status}`;
                alert("No se pudo eliminar: " + msg);
                console.error("deletePersona error:", res.status, json);
            }
        } catch (err) {
            console.error("Error al eliminar persona:", err);
            alert("Error de red al intentar eliminar. Revisa la consola.");
        }
    }

    // Modal de actualización
    const formUpdateUsuario = document.getElementById("formUpdateUsuario");
    const modalUpdateUsuarioEl = document.getElementById("modalUpdateUsuario");
    const modalUpdateUsuario = new bootstrap.Modal(modalUpdateUsuarioEl);

    // Función para abrir modal y llenar datos
    function abrirModalActualizarUsuario(usuario) {
        if (!formUpdateUsuario) return;

        // Llenar campos
        formUpdateUsuario.documento.value = usuario.documento || "";
        formUpdateUsuario.nombres.value = usuario.nombres || "";
        formUpdateUsuario.apellidos.value = usuario.apellidos || "";
        formUpdateUsuario.email.value = usuario.email || "";
        formUpdateUsuario.telefono.value = usuario.telefono || "";

        // Llenar selectFicha
        const selectFicha = formUpdateUsuario.querySelector(
            'select[name="idFicha"]',
        );
        if (selectFicha) {
            selectFicha.innerHTML =
                `<option value="">-- Selecciona ficha --</option>`;
            (fichas || []).forEach((f) => {
                const sel = usuario.ficha && usuario.ficha.idFicha == f.idFicha
                    ? "selected"
                    : "";
                selectFicha.innerHTML +=
                    `<option value="${f.idFicha}" ${sel}>${f.numeroFicha}</option>`;
            });
        }

        modalUpdateUsuario.show();

        // Listener submit
        formUpdateUsuario.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                documento: formUpdateUsuario.documento.value,
                nombres: formUpdateUsuario.nombres.value,
                apellidos: formUpdateUsuario.apellidos.value,
                email: formUpdateUsuario.email.value,
                telefono: formUpdateUsuario.telefono.value,
                password: formUpdateUsuario.password.value || undefined,
                password_confirmation:
                    formUpdateUsuario.password_confirmation.value || undefined,
                idFicha: selectFicha?.value || null,
            };

            if (!data.password) {
                delete data.password;
                delete data.password_confirmation;
            }

            try {
                const res = await fetch(
                    `${API}actualizarPersona/${usuario.idPersona}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token
                                ? { Authorization: `Bearer ${token}` }
                                : {}),
                        },
                        body: JSON.stringify(data),
                    },
                );

                if (res.ok) {
                    alert("Usuario actualizado correctamente");
                    modalUpdateUsuario.hide();
                    await cargarPersonas();
                } else {
                    const json = await res.json();
                    alert(
                        "Error al actualizar: " +
                            JSON.stringify(json.errors || json.message),
                    );
                }
            } catch (err) {
                console.error(err);
                alert("Error de red");
            }
        };
    }

    // Sobreescribir click de botones editar
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-editar")) {
            const id = e.target.dataset.id;
            const usuario = personas.find((p) => (p.idPersona ?? p.id) == id);
            if (usuario) abrirModalActualizarUsuario(usuario);
        }
    });

    async function onRolChange(e) {
        const idRol = parseInt(e.target.value) || null;
        const idPersona = e.target.dataset.persona;
        if (!idRol || !idPersona) return;
        const persona = personas.find((x) =>
            (x.idPersona ?? x.id ?? "") == idPersona
        );
        const teniaRol = persona && persona.roles && persona.roles.length;
        try {
            if (!teniaRol) {
                const res = await fetch(API_ASIGNAR, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        idRol,
                        idPersona: parseInt(idPersona),
                    }),
                });
                if (res.ok) {
                    persona.roles = [{
                        idRol,
                        rol: roles.find((r) => r.idRol === idRol)?.rol ?? "",
                    }];
                } else alert("Error al asignar rol");
            } else {
                const res = await fetch(API_ACTUALIZAR_BASE + idPersona, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ idRol }),
                });
                if (res.ok) {
                    persona.roles = [{
                        idRol,
                        rol: roles.find((r) => r.idRol === idRol)?.rol ?? "",
                    }];
                } else alert("Error al actualizar rol");
            }
        } catch (err) {
            console.error(err);
            alert("Error de red");
        }
    }

    const formUsuario = document.getElementById("formUsuario");

    if (formUsuario) {
        formUsuario.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Obtener el id de la ficha seleccionada
            const formData = new FormData(e.target);
            const selectFicha = document.getElementById("selectFicha");
            const fichaValue = selectFicha?.value
                ? parseInt(selectFicha.value)
                : null;
            formData.set("idFicha", fichaValue); // fuerza que siempre sea número o null
            const payload = Object.fromEntries(formData);

            try {
                const res = await fetch(API_CREAR, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    const modalEl = document.getElementById("modalUsuario");
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    e.target.reset();
                    await cargarPersonas();
                    alert("Usuario creado correctamente.");
                } else {
                    alert("Error al crear usuario");
                }
            } catch (err) {
                console.error(err);
                alert("Error de red al crear usuario");
            }
        });
    }

    (async function init() {
        await cargarRoles();
        await cargarPersonas();
        await cargarFichas();
    })();
})();
