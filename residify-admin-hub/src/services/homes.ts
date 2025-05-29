import api from './api';

export interface Home {
  id: number;
  number: string;
  block: string;
  type: string;
  status: 'vacant' | 'occupied';
  created_at: string;
  updated_at: string;
}

export interface CreateHomeData {
  number: string;
  block: string;
  type: string;
}

const homeService = {
  async getHomes() {
    const response = await api.get('/api/homes/');
    return response.data;
  },

  async getVacantHomes() {
    const response = await api.get('/api/homes/', {
      params: { status: 'vacant' }
    });
    return response.data;
  },

  async createHome(data: CreateHomeData) {
    const response = await api.post('/api/homes/', data);
    return response.data;
  },

  async updateHome(id: number, data: Partial<CreateHomeData>) {
    const response = await api.patch(`/api/homes/${id}/`, data);
    return response.data;
  },

  async deleteHome(id: number) {
    await api.delete(`/api/homes/${id}/`);
  },
};

export default homeService;
