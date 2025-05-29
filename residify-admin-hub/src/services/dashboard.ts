import api from './api';

export interface DashboardStats {
  billing: {
    total_amount: number;
    total_paid: number;
    total_pending: number;
    collection_rate?: number;
    payment_rate?: number;
  };
  occupancy?: {
    total_homes: number;
    occupied_homes: number;
    vacant_homes: number;
    occupancy_rate: number;
  };
  complaints: {
    total: number;
    pending: number;
    resolved: number;
    resolution_rate: number;
  };
  recent_activity: {
    bills: Array<{
      id: number;
      amount: number;
      bill_type: string;
      status: string;
      created_at: string;
      due_date?: string;
    }>;
    payments: Array<{
      id: number;
      amount: number;
      status: string;
      created_at: string;
    }>;
    complaints: Array<{
      id: number;
      title: string;
      status: string;
      created_at: string;
    }>;
  };
}

export const dashboardService = {
  async getAdminDashboard() {
    const response = await api.get<DashboardStats>('/api/dashboard/admin/');
    return response.data;
  },

  async getResidentDashboard() {
    const response = await api.get<DashboardStats>('/api/dashboard/resident/');
    return response.data;
  },
};
