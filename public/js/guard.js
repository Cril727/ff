// === js/guard.js ===
(function () {
  const hasToken = !!localStorage.getItem("token");
  if (!hasToken) location.href = "./index.html";
})();

