import api from './api';

export interface Expense {
  id: number;
  amount: string;
  date: string;
  category: string;
  description: string;
  receipt?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: number;
  created_by_name: string;
  approved_by?: number;
  approved_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFilters {
  start_date?: string;
  end_date?: string;
  category?: string;
  status?: string;
  search?: string;
}

export interface ExpenseSummary {
  category_totals: {
    category: string;
    total: number;
  }[];
  monthly_totals: {
    month: number;
    year: number;
    total: number;
  }[];
  total: number;
}

export interface CreateExpenseData {
  amount: number;
  date: string;
  category: string;
  description: string;
  receipt?: File;
}

export const EXPENSE_CATEGORIES = [
  { value: 'utilities', label: 'Utilities' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'taxes', label: 'Taxes' },
  { value: 'other', label: 'Other' }
];

export const expenseService = {
  async getExpenses(filters?: ExpenseFilters, page: number = 1) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const response = await api.get(`/api/billing/expenses/?${params.toString()}`);
    return response.data;
  },

  async getExpense(id: number) {
    const response = await api.get(`/api/billing/expenses/${id}/`);
    return response.data;
  },

  async createExpense(data: CreateExpenseData) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'number') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value);
        }
      }
    });
    const response = await api.post('/api/billing/expenses/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateExpense(id: number, data: Partial<CreateExpenseData>) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'number') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value);
        }
      }
    });
    const response = await api.patch(`/api/billing/expenses/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteExpense(id: number) {
    await api.delete(`/api/billing/expenses/${id}/`);
  },

  async approveExpense(id: number) {
    const response = await api.post(`/api/billing/expenses/${id}/approve/`);
    return response.data;
  },

  async rejectExpense(id: number) {
    const response = await api.post(`/api/billing/expenses/${id}/reject/`);
    return response.data;
  },

  async getExpenseSummary(year?: number, month?: number) {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const response = await api.get(`/api/billing/expenses/summary/?${params.toString()}`);
    return response.data as ExpenseSummary;
  }
};
