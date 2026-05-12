import api from './api';

export const authService = {

  async register(userData) {
    try {

        console.log("Enviando datos de registro:", userData); // Debug: Ver qué datos se están enviando

      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      // Lanzamos el error para que el componente lo capture
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  },


  async getProfile() {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("No autorizado");
    }
  }
  
};