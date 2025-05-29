import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  address?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post('/api/auth/token/', credentials);
      const { access, refresh, user } = response.data;
      if (access && refresh && user) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));
        // Set the token in axios headers
        api.defaults.headers.common.Authorization = `Bearer ${access}`;
        return user;
      }
      throw new Error('Invalid response from server');
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      }
      throw error;
    }
  },

  async register(data: RegisterData) {
    const response = await api.post('/api/residents/register/', data);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/users/me/');
    return response.data;
  },

  async updateProfile(data: Partial<RegisterData>) {
    const response = await api.patch('/api/auth/users/me/', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    // Remove the token from axios headers
    delete api.defaults.headers.common.Authorization;
  },

  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
