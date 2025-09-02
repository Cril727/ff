(function () {
    const API = "http://127.0.0.1:8000/api/ingresoPersonas";
    const token = localStorage.getItem("token") || "";
    const tbody = document.querySelector("#tbl tbody");
    const alertEl = document.getElementById("alert");
    const btn = document.getElementById("reload");

    function showAlert(msg, type = "warning") {
        alertEl.innerHTML =
            `<div class="alert alert-${type} p-2" role="alert">${msg}</div>`;
        setTimeout(() => alertEl.innerHTML = "", 4000);
    }

    function formatDate(iso) {
        try {
            return new Date(iso).toLocaleString();
        } catch (e) {
            return iso || "";
        }
    }

    function render(personas = []) {
        tbody.innerHTML = "";

        if (!personas.length) {
            tbody.innerHTML =
                `<tr><td colspan="8" class="text-center py-3">No hay registros</td></tr>`;
            return;
        }

        personas.forEach((p) => {
            const elementos = Array.isArray(p.elementos) ? p.elementos : [];
            const elementosPreview = elementos.map((el) => {
                const estado =
                    (el.ingreso_elementos && el.ingreso_elementos[0] &&
                        el.ingreso_elementos[0].estado) || "—";
                return `${el.nombre || el.codigo || "sin nombre"} (${estado})`;
            }).join(", ") || "—";

            // --- NUEVO: cantidad de ingresos y fecha del último ingreso
            const ingresos = Array.isArray(p.ingresos) ? p.ingresos : [];
            const countIngresos = ingresos.length;
            const lastIngreso = countIngresos
                ? ingresos[countIngresos - 1].fechaHora
                : null;
            // -----------------------------------------------

            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${p.idPersona ?? ""}</td>
        <td>${p.documento ?? ""}</td>
        <td>${(p.nombres ?? "") + " " + (p.apellidos ?? "")}</td>
        <td>${p.email ?? ""}</td>
        <td>${p.telefono ?? ""}</td>
        <td class="muted">${formatDate(p.created_at)}</td>
        <td>${elementos.length}</td>
        <td>${countIngresos}</td>                           <!-- muestra #Ingresos -->
        <td class="muted">${
                lastIngreso ? formatDate(lastIngreso) : "—"
            }</td>  <!-- muestra última entrada -->
        <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${elementosPreview}">${elementosPreview}</td>
    `;
            tbody.appendChild(tr);
        });

        // Inicializar o refrescar DataTable
        if ($.fn.DataTable.isDataTable("#tbl")) {
            $("#tbl").DataTable().destroy();
        }
        $("#tbl").DataTable({
            pageLength: 10,
            responsive: true,
        });
    }

    async function load() {
        try {
            const res = await fetch(API, {
                headers: token
                    ? {
                        "Authorization": "Bearer " + token,
                        "Accept": "application/json",
                    }
                    : { "Accept": "application/json" },
            });

            if (!res.ok) {
                const txt = await res.text();
                showAlert(
                    `Error ${res.status}: ${res.statusText} — ${txt}`,
                    "danger",
                );
                render([]);
                return;
            }

            const json = await res.json();

            // Asegura compatibilidad con distintas estructuras de respuesta
            const personas = Array.isArray(json.persona)
                ? json.persona
                : (Array.isArray(json.data) ? json.data : []);

            render(personas);
        } catch (err) {
            showAlert("Fallo de conexión: " + err.message, "danger");
            render([]);
        }
    }

    btn.addEventListener("click", load);
    load();
})();
