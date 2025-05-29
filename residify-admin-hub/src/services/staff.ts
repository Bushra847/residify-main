import api from './api';

export interface StaffRole {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StaffCreateData {
  first_name: string;
  last_name: string;
  email: string;
  role: number;
  salary: number;
  is_active: boolean;
  contact_number: string;
  emergency_contact: string;
  address?: string;
  national_id?: string;
}

export interface StaffUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: number;
  salary?: number;
  is_active?: boolean;
  contact_number?: string;
  emergency_contact?: string;
  address?: string;
  national_id?: string;
}

export interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: StaffRole | null;
  salary: number;
  is_active: boolean;
  joining_date: string;
  contact_number: string;
  emergency_contact: string;
  address?: string;
  national_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  staff: Staff;
  date: string;
  start_time: string;
  end_time: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const staffService = {
  async getRoles() {
    const response = await api.get('/api/staff/role/');
    return response.data;
  },

  async getStaffMembers() {
    const response = await api.get('/api/staff/staff/');
    return response.data;
  },

  async getStaffMember(id: number) {
    const response = await api.get(`/api/staff/staff/${id}/`);
    return response.data;
  },

  async createStaffMember(data: StaffCreateData) {
    console.log('Creating staff member with data:', data);
    try {
      const response = await api.post('/api/staff/staff/', data);
      console.log('Staff creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Staff creation error:', error.response?.data || error);
      throw error;
    }
  },

  async updateStaffMember(id: number, data: StaffUpdateData) {
    const response = await api.patch(`/api/staff/staff/${id}/`, data);
    return response.data;
  },

  async deleteStaffMember(id: number) {
    await api.delete(`/api/staff/staff/${id}/`);
  },

  async getSchedules() {
    const response = await api.get('/api/staff/schedules/');
    return response.data;
  },

  async getSchedulesByStaff(staffId: number) {
    const response = await api.get(`/api/staff/schedules/by_staff/?staff_id=${staffId}`);
    return response.data;
  },

  async createSchedule(data: Partial<Schedule>) {
    const response = await api.post('/api/staff/schedules/', data);
    return response.data;
  },

  async updateSchedule(id: number, data: Partial<Schedule>) {
    const response = await api.patch(`/api/staff/schedules/${id}/`, data);
    return response.data;
  },

  async deleteSchedule(id: number) {
    await api.delete(`/api/staff/schedules/${id}/`);
  },

  // Expense functions
  async getExpenses(params?: {
    staff_id?: number;
    expense_type?: string;
    start_date?: string;
    end_date?: string;
    is_paid?: boolean;
  }) {
    const response = await api.get('/api/staff/expenses/', { params });
    return response.data;
  },

  async getExpense(id: number) {
    const response = await api.get(`/api/staff/expenses/${id}/`);
    return response.data;
  },

  async createExpense(data: {
    staff: number;
    amount: number;
    date: string;
    expense_type: string;
    description?: string;
  }) {
    const response = await api.post('/api/staff/expenses/', data);
    return response.data;
  },

  async updateExpense(id: number, data: {
    amount?: number;
    date?: string;
    expense_type?: string;
    description?: string;
    is_paid?: boolean;
    paid_date?: string;
  }) {
    const response = await api.patch(`/api/staff/expenses/${id}/`, data);
    return response.data;
  },

  async deleteExpense(id: number) {
    await api.delete(`/api/staff/expenses/${id}/`);
  },

  async markExpensePaid(id: number, paid_date?: string) {
    const response = await api.post(`/api/staff/expenses/${id}/mark_paid/`, { paid_date });
    return response.data;
  },

  async getExpenseSummary(params?: {
    staff_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get('/api/staff/expenses/summary/', { params });
    return response.data;
  }
};
