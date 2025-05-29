import api from './api';

export interface UpdateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

const userService = {
  async updateProfile(data: UpdateUserData) {
    const response = await api.patch('/api/auth/users/me/', data);
    return response.data;
  },

  async changePassword(data: ChangePasswordData) {
    const response = await api.patch('/api/auth/users/me/', {
      password: data.new_password,
      current_password: data.current_password
    });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/api/auth/users/me/');
    return response.data;
  }
};

export default userService;
