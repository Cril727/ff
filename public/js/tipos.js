function tipos() {
  const select = document.getElementById('dropdownTipo');
  const TIPOSURL = "http://127.0.0.1:8000/api/";
  const token = localStorage.getItem("token");

  fetch(`${TIPOSURL}listarTipos`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => {
    const tipos = data.tipos ?? data;
    select.innerHTML = '<option value="">-- Selecciona un tipo --</option>';
    if (!tipos || tipos.length === 0) {
      select.innerHTML += '<option value="">(no hay tipos)</option>';
      return;
    }
    tipos.forEach(t => {
      const id = t.idTipo ?? t.id;
      const nombre = t.tipo ?? t.nombre;
      select.innerHTML += `<option value="${id}">${nombre}</option>`;
    });
  })
  .catch(e => {
    console.error(e);
    select.innerHTML = '<option value="">Error al cargar</option>';
  });
}
