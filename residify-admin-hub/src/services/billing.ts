import api from './api';

export interface Resident {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  contact_number: string;
  unit_number: string;
}

export interface SharedBill {
  id: number;
  amount: number;
  due_date: string;
  bill_type: string;
  description: string;
  created_at: string;
  updated_at: string;
  resident_bills: Bill[];
}

export interface Payment {
  id: number;
  bill: Bill;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  notes: string;
  screenshot: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: number;
  resident: Resident;
  shared_bill: SharedBill;
  amount: number;
  bill_type: string;
  due_date: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  total_paid: number;
  screenshot: string | null;
  payment_screenshot: string | null;
  payment_date: string | null;
  payment_notes: string;
  remaining_amount: number;
  payments: Payment[];
}

export interface CreateBillData {
  amount: number;
  bill_type: string;
  due_date: string;
  description: string;
  resident: number;
  screenshot?: File;
}

export interface CreateSharedBillData {
  amount: number;
  bill_type: string;
  due_date: string;
  description: string;
}

export interface Payment {
  id: number;
  bill: Bill;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BillFilters {
  start_date?: string;
  end_date?: string;
  type?: string;
  status?: string;
  search?: string;
}

export interface PaymentFilters {
  start_date?: string;
  end_date?: string;
  payment_method?: string;
  bill_id?: number;
  search?: string;
}

export const BILL_TYPES = [
  { value: 'rent', label: 'Rent' },
  { value: 'utility', label: 'Utility' },
  { value: 'maintenance', label: 'Maintenance' }
];

export const BILL_STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'partially_paid', label: 'Partially Paid' }
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];



export const billingService = {
  async getSharedBills(filters?: BillFilters, page: number = 1) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await api.get(`/api/billing/shared-bills/?${params.toString()}`);
    return response.data;
  },

  async getBills(filters?: BillFilters & { bill_status?: string }, page: number = 1) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await api.get(`/api/billing/bills/?${params.toString()}`);
    return response.data;
  },

  async getBill(id: number) {
    const response = await api.get(`/api/billing/bills/${id}/`);
    return response.data;
  },

  async createBill(data: CreateBillData) {
    const formData = new FormData();
    formData.append('amount', data.amount.toString());
    formData.append('bill_type', data.bill_type);
    formData.append('due_date', data.due_date);
    formData.append('description', data.description);
    formData.append('resident', data.resident.toString());
    if (data.screenshot) {
      formData.append('screenshot', data.screenshot);
    }
    const response = await api.post('/api/billing/bills/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async createSharedBill(data: CreateSharedBillData) {
    try {
      console.log('Creating shared bill with data:', data);
      const response = await api.post('/api/billing/shared-bills/', data);
      console.log('Shared bill response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating shared bill:', {
        status: error.response?.status,
        data: error.response?.data,
        error: error
      });
      throw error;
    }
  },

  async updateBill(id: number, data: Partial<Bill> & { payment_screenshot?: File }) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'payment_screenshot' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value?.toString() ?? '');
        }
      }
    });
    const response = await api.patch(`/api/billing/bills/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteBill(id: number) {
    await api.delete(`/api/billing/bills/${id}/`);
  },

  async markBillAsPaid(id: number) {
    const response = await api.post(`/api/billing/bills/${id}/mark_as_paid/`);
    return response.data;
  },

  async createPayment(data: FormData | Record<string, any>) {
    const response = await api.post('/api/billing/payments/', data);
    return response.data;
  },

  async approvePayment(id: number) {
    const response = await api.post(`/api/billing/payments/${id}/approve_payment/`);
    return response.data;
  },

  async rejectPayment(id: number) {
    const response = await api.post(`/api/billing/payments/${id}/reject_payment/`);
    return response.data;
  },

  async getPaymentsByBill(billId: number, page: number = 1) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('bill_id', billId.toString());
    const response = await api.get(`/api/billing/payments/?${params.toString()}`);
    return response.data;
  },

  async getPayments(filters?: PaymentFilters & { status?: string }, page: number = 1) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const response = await api.get(`/api/billing/payments/?${params.toString()}`);
    return response.data;
  },

  async updatePayment(id: number, data: Partial<Payment>) {
    const response = await api.patch(`/api/billing/payments/${id}/`, data);
    return response.data;
  },

  async deletePayment(id: number) {
    await api.delete(`/api/billing/payments/${id}/`);
  },

  async generateMonthlyBills() {
    try {
      const response = await api.post('/api/billing/shared-bills/generate_monthly_bills/');
      return response.data;
    } catch (error: any) {
      console.error('Error generating monthly bills:', {
        status: error.response?.status,
        data: error.response?.data,
        error: error
      });
      throw error;
    }
  },
};
