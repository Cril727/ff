// acciones.js - ultra simple
(() => {
    const API = "http://127.0.0.1:8000/api";
    const H = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
    });

    const fixDate = (v) =>
        v
            ? (v.replace("T", " ").match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
                ? v.replace("T", " ") + ":00"
                : v.replace("T", " "))
            : null;


    // ---- Agregar Elemento (reemplaza la sección anterior) ----
    document.getElementById("form-add-elemento")?.addEventListener(
        "submit",
        async (e) => {
            e.preventDefault();
            const pid = localStorage.getItem("idPersona");
            if (!pid) return alert("Busca una persona primero.");

            const payload = {
                codigo: document.getElementById("codigo").value,
                nombre: document.getElementById("nombre").value,
                caracteristicas:
                    document.getElementById("caracteristicas").value,
                foto: document.getElementById("foto").value,
                idTipo: document.getElementById("dropdownTipo").value,
                idPersona: Number(pid),
            };

            try {
                const res = await fetch(`${API}/agregarElemento`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${
                            localStorage.getItem("token") || ""
                        }`,
                    },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const json = await res.json().catch(() => null);
                    const msg = json?.message || (json?.errors
                        ? Object.values(json.errors).flat().join("\n")
                        : "Error al agregar elemento");
                    return alert(msg);
                }

                // success
                bootstrap.Modal.getInstance(
                    document.getElementById("modalElemento"),
                )?.hide();
                alert("Elemento agregado");
                document.getElementById("formBusarPersona")?.dispatchEvent(
                    new Event("submit"),
                );
            } catch (err) {
                console.error(err);
                alert("Error en la petición. Revisa la consola.");
            }
        },
    );

    document.getElementById("form-entrada")?.addEventListener(
        "submit",
        async (e) => {
            e.preventDefault();
            const pid = localStorage.getItem("idPersona") ||
                document.getElementById("idPersona")?.value;
            if (!pid) return alert("Selecciona una persona");
            const fecha =
                fixDate(document.getElementById("fechaHoraEntrada").value) ||
                new Date().toISOString().slice(0, 19).replace("T", " ");
            const p = {
                fechaHora: fecha,
                observacion:
                    document.getElementById("observacionEntrada").value ||
                    "Ingreso",
                idPersona: Number(pid),
            };
            const r = await fetch(`${API}/ingreso`, {
                method: "POST",
                headers: H(),
                body: JSON.stringify(p),
            });
            const j = await r.json();
            if (!r.ok) return alert("Error registrando ingreso");
            localStorage.setItem(
                "idIngreso",
                j?.registro?.idIngreso || j?.ingreso?.idIngreso || j?.idIngreso,
            );
            bootstrap.Modal.getInstance(document.getElementById("modalEntrada"))
                ?.hide();
            alert("Ingreso registrado");
        },
    );

    document.getElementById("form-salida")?.addEventListener(
        "submit",
        async (e) => {
            e.preventDefault();
            const idIngreso = localStorage.getItem("idIngreso") ||
                document.getElementById("idIngreso")?.value;
            if (!idIngreso) return alert("No hay ingreso");
            const fecha =
                fixDate(document.getElementById("fechaHoraSalida").value) ||
                new Date().toISOString().slice(0, 19).replace("T", " ");
            const p = {
                fechaHora: fecha,
                observaciones:
                    document.getElementById("observacionSalida").value ||
                    "Salida",
                idIngreso: Number(idIngreso),
            };
            const r = await fetch(`${API}/salida`, {
                method: "POST",
                headers: H(),
                body: JSON.stringify(p),
            });
            if (!r.ok) return alert("Error registrando salida");
            bootstrap.Modal.getInstance(document.getElementById("modalSalida"))
                ?.hide();
            alert("Salida registrada");
        },
    );

    async function actualizarIngresoElemento(
        idIE,
        idIngreso,
        idElemento,
        estado,
    ) {
        if (!idIE) return alert("Falta idIngresoElemento");
        const p = {
            idIngreso: Number(idIngreso),
            idElemento: Number(idElemento),
            estado,
        };
        const r = await fetch(`${API}/actualizarIngresoElementos/${idIE}`, {
            method: "PUT",
            headers: H(),
            body: JSON.stringify(p),
        });
        if (!r.ok) {
            const r2 = await fetch(`${API}/actualizarIngresoElemento/${idIE}`, {
                method: "PUT",
                headers: H(),
                body: JSON.stringify(p),
            });
            if (!r2.ok) return alert("Error actualizando ingresoElemento");
            alert("IngresoElemento actualizado");
            return;
        }
        alert("IngresoElemento actualizado");
    }

    async function handleEntradaElemento(idElemento, idIngresoElemento) {
        const idIngreso = localStorage.getItem("idIngreso");
        if (!idIngreso) {
            document.getElementById("idPersona").value = localStorage.getItem(
                "idPersona",
            );
            new bootstrap.Modal(document.getElementById("modalEntrada")).show();
            return alert("Registra primero un ingreso");
        }
        if (!idIngresoElemento) {
            if (!confirm("Crear registro y marcar activo?")) return;
            const p = {
                idIngreso: Number(idIngreso),
                idElemento: Number(idElemento),
                estado: "activo",
            };
            const r = await fetch(`${API}/ingresoElemento`, {
                method: "POST",
                headers: H(),
                body: JSON.stringify(p),
            });
            if (!r.ok) return alert("Error creando registro");
            alert("Registro creado");
            document.getElementById("formBusarPersona")?.dispatchEvent(
                new Event("submit"),
            );
            return;
        }
        await actualizarIngresoElemento(
            idIngresoElemento,
            idIngreso,
            idElemento,
            "activo",
        );
        document.getElementById("formBusarPersona")?.dispatchEvent(
            new Event("submit"),
        );
    }

    async function handleSalidaElemento(idElemento, idIngresoElemento) {
        const idIngreso = localStorage.getItem("idIngreso");
        if (!idIngreso) return alert("No hay ingreso");
        if (!idIngresoElemento) return alert("No hay registro para este item");
        await actualizarIngresoElemento(
            idIngresoElemento,
            idIngreso,
            idElemento,
            "inactivo",
        );
        document.getElementById("formBusarPersona")?.dispatchEvent(
            new Event("submit"),
        );
    }

    window.actualizarIngresoElemento = actualizarIngresoElemento;
    window.handleEntradaElemento = handleEntradaElemento;
    window.handleSalidaElemento = handleSalidaElemento;
})();
