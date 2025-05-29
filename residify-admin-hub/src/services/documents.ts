import api from './api';

export interface Document {
  id: number;
  resident: any;
  title: string;
  document_type: string;
  file: File | string;
  description: string;
  is_verified: boolean;
  verified_by: any;
  verified_at: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export const documentsService = {
  async getDocuments() {
    const response = await api.get('/documents/documents/');
    return response.data;
  },

  async getDocument(id: number) {
    const response = await api.get(`/documents/documents/${id}/`);
    return response.data;
  },

  async createDocument(data: FormData) {
    const response = await api.post('/documents/documents/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateDocument(id: number, data: FormData) {
    const response = await api.patch(`/documents/documents/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteDocument(id: number) {
    await api.delete(`/documents/documents/${id}/`);
  },

  async verifyDocument(id: number) {
    const response = await api.post(`/documents/documents/${id}/verify/`);
    return response.data;
  }
};
