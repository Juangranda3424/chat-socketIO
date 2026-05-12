import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // Tu puerto de Node.js
  withCredentials: true, // ¡CRUCIAL! Permite enviar/recibir cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;