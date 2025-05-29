import api from './api';

export interface User {
  first_name: string;
  last_name: string;
}

export interface Resident {
  user: User;
}

export interface Complaint {
  id: number;
  resident: Resident;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to?: any;
  created_at: string;
  updated_at: string;
}

export interface ComplaintUpdate {
  id?: number;
  complaint: number | Complaint;
  updated_by?: any;
  new_status: string;
  comment: string;
  created_at?: string;
  updated_at?: string;
}

export const complaintsService = {
  async getComplaints(): Promise<Complaint[]> {
    try {
      const response = await api.get('/api/complaints/complaints/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch complaints:', error.response?.data || error.message);
      throw error;
    }
  },

  async getComplaint(id: number): Promise<Complaint> {
    try {
      const response = await api.get(`/api/complaints/complaints/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch complaint ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  async createComplaint(data: FormData | { title: string; description: string; category: string; priority: string }): Promise<Complaint> {
    try {
      const response = await api.post('/api/complaints/complaints/', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create complaint:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateComplaint(id: number, data: Partial<Complaint>): Promise<Complaint> {
    try {
      const response = await api.patch(`/api/complaints/complaints/${id}/`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to update complaint ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  async deleteComplaint(id: number): Promise<void> {
    try {
      await api.delete(`/api/complaints/complaints/${id}/`);
    } catch (error: any) {
      console.error(`Failed to delete complaint ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  async assignComplaint(id: number, staffId: number): Promise<Complaint> {
    try {
      const response = await api.post(`/api/complaints/complaints/${id}/assign/`, {
        staff_id: staffId
      });
      return response.data;
    } catch (error: any) {
      console.error(`Failed to assign complaint ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  async getComplaintUpdates(complaintId: number): Promise<ComplaintUpdate[]> {
    try {
      const response = await api.get(`/api/complaints/complaints/${complaintId}/updates/`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch updates for complaint ${complaintId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  async createComplaintUpdate(data: Partial<ComplaintUpdate>): Promise<ComplaintUpdate> {
    try {
      const response = await api.post('/api/complaints/updates/', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create complaint update:', error.response?.data || error.message);
      throw error;
    }
  }
};
