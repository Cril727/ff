// === js/login.js ===
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-login");
    const alertBox = document.getElementById("alert");
    const btn = document.getElementById("btn-login");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        btn.disabled = true;
        btn.textContent = "Ingresando...";
        alertBox.classList.add("d-none");
        alertBox.textContent = "";

        try {
            const { data } = await api.post("/login", {
                email: document.getElementById("email").value.trim(),
                password: document.getElementById("password").value,
            });
            localStorage.setItem("token", data.token);
            location.href = "./app.html";
        } catch (err) {
            alertBox.textContent = err?.response?.data?.message ||
                "Login inválido";
            alertBox.classList.remove("d-none");
        } finally {
            btn.disabled = false;
            btn.textContent = "Iniciar sesión";
        }
    });
});
