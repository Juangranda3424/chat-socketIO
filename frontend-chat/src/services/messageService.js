import api from './api';

export const messageService = {

  async createMessage(messageData) {
    try {
      const response = await api.post('/messages', messageData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  },

  async getMessagesByGroup(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}/messages`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  },

  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  }
};
