import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      
      const errMsg = error.response.data?.error || 'Ocurrió un error inesperado';
      // Despachar evento para mostrar Toast (atrapado en App.jsx)
      window.dispatchEvent(new CustomEvent('api-error', { detail: errMsg }));
    } else {
      window.dispatchEvent(new CustomEvent('api-error', { detail: 'Error de red. Verifique su conexión.' }));
    }
    return Promise.reject(error);
  }
);

export default api;
