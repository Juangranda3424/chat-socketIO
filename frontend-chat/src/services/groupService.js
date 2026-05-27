import api from './api';

export const groupService = {

  async createGroup(groupData) {
    try {
      const response = await api.post('/groups', groupData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  },

  async getGroups() {
    try {
      const response = await api.get('/groups');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  },

  async getGroupById(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  },

  async addMemberToGroup(groupId, usuario_id) {
    try {
      const response = await api.post(`/groups/${groupId}/members`, { usuario_id });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  },

  async getGroupMembers(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  },

  async deleteGroup(groupId) {
    try {
      const response = await api.delete(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error("Error de conexión");
    }
  }
};
