import api from './api';

export interface Home {
  id: number;
  name: string;
  address: string;
  property_type: string;
  description: string;
  status: string;
  monthly_rent: number;
  created_at: string;
  updated_at: string;
}

export interface RawResident {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    phone: string;
    address: string;
  };
  home: Home;
  unit_number: string;
  lease_start_date: string;
  lease_end_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  is_active: boolean;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resident {
  id: number;
  name: string;
  email: string;
  phone: string;
  unitNumber: string;
  moveInDate: string;
  status: 'active' | 'inactive';
  isOwner: boolean;
  home: Home | null;
}

export interface CreateResidentData {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  home: number;
  unit_number: string;
  lease_start_date: string;
  lease_end_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  is_owner?: boolean;
}

export const residentsService = {
  async getHomes(onlyVacant: boolean = true) {
    const response = await api.get('/api/homes/', {
      params: {
        vacant: onlyVacant
      }
    });
    return response.data;
  },

  async getHome(id: number) {
    const response = await api.get(`/api/homes/${id}/`);
    return response.data;
  },

  async getResidents() {
    try {
      const response = await api.get('/api/residents/');
      const formattedResidents = response.data.map((resident: any) => {
        try {
          if (!resident || !resident.user) {
            console.error('Invalid resident data:', resident);
            throw new Error('Invalid resident data structure');
          }
          const formattedResident = {
            id: resident.id,
            name: `${resident.user.first_name} ${resident.user.last_name}`,
            email: resident.user.email,
            phone: resident.user.phone || '',
            unitNumber: resident.unit_number || 'N/A',
            moveInDate: resident.lease_start_date,
            status: resident.is_active ? 'active' : 'inactive',
            isOwner: resident.is_owner,
            home: resident.home || {
              id: 0,
              name: 'No Home',
              address: 'Not Assigned',
              property_type: 'N/A',
              description: 'N/A',
              status: 'N/A',
              monthly_rent: 0,
              created_at: '',
              updated_at: ''
            }
          };
          return formattedResident;
        } catch (err) {
          console.error('Error processing resident:', resident, err);
          throw err;
        }
      });
      return formattedResidents;
    } catch (error) {
      console.error('Error in getResidents:', error);
      throw error;
    }
  },

  async getResident(id: number) {
    const response = await api.get(`/api/residents/${id}/`);
    return response.data;
  },

  async createResident(data: any) {
    const response = await api.post('/api/residents/', data);
    return response.data;
  },

  async updateResident(id: number, data: any) {
    console.log('Raw form data:', data);
    
    // Format the data for the API
    const formattedData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone || '',
      unit_number: data.unitNumber,
      lease_start_date: data.leaseStartDate,
      lease_end_date: data.leaseEndDate,
      emergency_contact_name: data.emergencyContactName,
      emergency_contact_phone: data.emergencyContactPhone,
      is_owner: data.isOwner === 'true',  // Convert string to boolean
      home: data.home ? parseInt(data.home) : null  // Convert string to number or null
    };


    try {
      const response = await api.patch(`/api/residents/${id}/`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error updating resident:', error);
      throw error;
    }
  },

  async deleteResident(id: number) {
    await api.delete(`/api/residents/${id}/`);
  }
};
