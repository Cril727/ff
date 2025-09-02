(function () {
    const API = "http://127.0.0.1:8000/api/listarSalidas";
    const token = localStorage.getItem("token");
    const tbody = document.querySelector("#salidasTable tbody");
    const msg = document.getElementById("msg");

    fetch(API, {
        headers: token ? { "Authorization": "Bearer " + token } : {},
    })
        .then((res) =>
            res.ok ? res.json() : res.json().then((e) => Promise.reject(e))
        )
        .then((json) => {
            const items = Array.isArray(json.persona) ? json.persona : [];
            if (!items.length) {
                msg.innerHTML =
                    '<div class="alert alert-warning p-2">No hay salidas para mostrar.</div>';
                return;
            }

            // llenar tabla
            items.forEach((s) => {
                const ingreso = s.ingreso || {};
                const persona = ingreso.persona || {};
                const tr = document.createElement("tr");

                tr.innerHTML = `
            <td>${s.idSalida ?? ""}</td>
            <td>${s.fechaHora ?? ""}</td>
            <td>${s.observaciones ?? ""}</td>
            <td>${ingreso.idIngreso ?? ""}</td>
            <td>${ingreso.fechaHora ?? ""}</td>
            <td>${
                    (persona.nombres ? persona.nombres + " " : "") +
                    (persona.apellidos ?? "")
                }</td>
            <td>${persona.documento ?? ""}</td>
          `;

                tbody.appendChild(tr);
            });

            if ($.fn.DataTable.isDataTable("#salidasTable")) {
                $("#salidasTable").DataTable().destroy();
            }
            $("#salidasTable").DataTable({
                pageLength: 10,
                responsive: true,
            });
        })
        .catch((err) => {
            console.error(err);
            msg.innerHTML =
                '<div class="alert alert-danger p-2">Error al cargar datos. Revisa la consola.</div>';
        });
})();
