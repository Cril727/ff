// === js/api.js ===
const API = "http://127.0.0.1:8000/api"; // ajusta a tu host/LAN

const tokenKey = "token";
const getToken  = () => localStorage.getItem(tokenKey);
const setToken  = (t) => localStorage.setItem(tokenKey, t);
const clearToken= () => localStorage.removeItem(tokenKey);

const api = axios.create({ baseURL: API, timeout: 10000 });

// Adjunta Authorization en cada request
api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Manejo simple de 401: limpia y manda a login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      clearToken();
      if (!location.pathname.endsWith("index.html")) location.href = "./index.html";
    }
    return Promise.reject(err);
  }
);

