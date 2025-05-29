
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ResidentFilters from '@/components/residents/ResidentFilters';
import ResidentsTable, { Resident } from '@/components/residents/ResidentsTable';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { residentsService, Home } from '@/services/residents';

const Residents = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  useEffect(() => {
    const loadHomes = async () => {
      try {
        const data = await residentsService.getHomes();
        setHomes(data);
      } catch (error) {
        toast.error('Failed to load homes');
      }
    };
    loadHomes();
  }, []);

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      const data = await residentsService.getResidents();
      console.log('Received residents:', data);
      setResidents(data);
    } catch (error) {
      console.error('Error loading residents:', error);
      toast.error('Failed to load residents');
    }
  };

  // Filter residents based on search term and status filter
  console.log('Current residents state:', residents);
  const filteredResidents = residents.filter((resident) => {
    // Text search
    const matchesSearch = 
      searchTerm === '' || 
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.unitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    let matchesFilter = true;
    if (statusFilter === 'active') {
      matchesFilter = resident.status === 'active';
    } else if (statusFilter === 'inactive') {
      matchesFilter = resident.status === 'inactive';
    } else if (statusFilter === 'owner') {
      matchesFilter = resident.isOwner === true;
    } else if (statusFilter === 'tenant') {
      matchesFilter = resident.isOwner === false;
    }
    
    return matchesSearch && matchesFilter;
  });
  console.log('Filtered residents:', filteredResidents);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Only admin can access this page
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleAddResident = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditResident = (resident: Resident) => {
    setSelectedResident(resident);
    setIsEditDialogOpen(true);
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const homeId = formData.get('home');
      if (!homeId) {
        toast.error('Please select a home');
        return;
      }

      const data = {
        username: formData.get('username') as string,
        password: formData.get('password') as string,
        email: formData.get('email') as string,
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        phone: formData.get('phone') as string,
        unit_number: formData.get('unitNumber') as string,
        lease_start_date: formData.get('leaseStartDate') as string,
        lease_end_date: formData.get('leaseEndDate') as string,
        emergency_contact_name: formData.get('emergencyContactName') as string,
        emergency_contact_phone: formData.get('emergencyContactPhone') as string,
        is_owner: formData.get('isOwner') === 'true',
        home: parseInt(homeId as string, 10)
      };

      await residentsService.createResident(data);
      toast.success('Resident created successfully');
      loadResidents();
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create resident');
    }
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedResident) return;

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log('Form data before submission:', data);

    try {
      await residentsService.updateResident(selectedResident.id, data);
      toast.success('Resident updated successfully');
      loadResidents();
      setIsEditDialogOpen(false);
      setSelectedResident(null);
    } catch (error) {
      console.error('Error updating resident:', error);
      toast.error('Failed to update resident');
    }
  };

  const handleViewDetails = (resident: Resident) => {
    // In a real app, navigate to resident details page
    toast.info(`Viewing details for: ${resident.name}`);
    // navigate(`/residents/${resident.id}`);
  };

  const handleToggleActivation = async (resident: Resident) => {
    const newStatus = resident.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} this resident?`)) {
      return;
    }

    try {
      await residentsService.updateResident(resident.id, { 
        is_active: newStatus === 'active'
      });
      toast.success(`Resident ${resident.name} has been ${action}d`);
      loadResidents();
    } catch (error) {
      toast.error(`Failed to ${action} resident`);
    }
  };

  const handleDeleteResident = async (resident: Resident) => {
    if (!window.confirm('Are you sure you want to delete this resident? This action cannot be undone.')) {
      return;
    }

    try {
      await residentsService.deleteResident(resident.id);
      toast.success(`Resident ${resident.name} has been deleted`);
      loadResidents();
    } catch (error) {
      toast.error('Failed to delete resident');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Manage Residents</h1>
              <p className="text-muted-foreground">View and manage property residents</p>
            </div>
            <Button onClick={handleAddResident} className="gap-2">
              <UserPlus size={16} />
              <span>Add Resident</span>
            </Button>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Residents</CardTitle>
              <CardDescription>
                Total residents: {residents.length} | 
                Active: {residents.filter(r => r.status === 'active').length} |
                Inactive: {residents.filter(r => r.status === 'inactive').length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResidentFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
              
              <ResidentsTable 
                residents={filteredResidents}
                onEdit={handleEditResident}
                onViewDetails={handleViewDetails}
                onDeactivate={handleToggleActivation}
                onDelete={handleDeleteResident}
              />
            </CardContent>
          </Card>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Resident</DialogTitle>
                <DialogDescription>
                  Update resident information
                </DialogDescription>
              </DialogHeader>

              {selectedResident && (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          defaultValue={selectedResident.name.split(' ')[0]}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          defaultValue={selectedResident.name.split(' ').slice(1).join(' ')}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={selectedResident.email}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          defaultValue={selectedResident.phone}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unitNumber">Unit Number</Label>
                        <Input
                          id="unitNumber"
                          name="unitNumber"
                          defaultValue={selectedResident.unitNumber}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="leaseStartDate">Lease Start Date</Label>
                        <Input
                          id="leaseStartDate"
                          name="leaseStartDate"
                          type="date"
                          defaultValue={selectedResident.moveInDate}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="leaseEndDate">Lease End Date</Label>
                        <Input
                          id="leaseEndDate"
                          name="leaseEndDate"
                          type="date"
                          defaultValue={selectedResident.moveInDate}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                        <Input
                          id="emergencyContactName"
                          name="emergencyContactName"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                        <Input
                          id="emergencyContactPhone"
                          name="emergencyContactPhone"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="home">Home</Label>
                        <select
                          id="home"
                          name="home"
                          className="w-full p-2 border rounded-md"
                          defaultValue={selectedResident.home?.id || ''}
                          required
                        >
                          <option value="">Select a home</option>
                          {homes.map((home) => (
                            <option key={home.id} value={home.id}>
                              {home.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="isOwner">Resident Type</Label>
                        <select
                          id="isOwner"
                          name="isOwner"
                          className="w-full p-2 border rounded-md"
                          defaultValue={selectedResident.isOwner.toString()}
                          required
                        >
                          <option value="false">Tenant</option>
                          <option value="true">Owner</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        setSelectedResident(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Resident</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new resident
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" name="username" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitNumber">Unit Number</Label>
                      <Input id="unitNumber" name="unitNumber" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="leaseStartDate">Lease Start Date</Label>
                      <Input id="leaseStartDate" name="leaseStartDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leaseEndDate">Lease End Date</Label>
                      <Input id="leaseEndDate" name="leaseEndDate" type="date" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input id="emergencyContactName" name="emergencyContactName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <Input id="emergencyContactPhone" name="emergencyContactPhone" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="home">Home</Label>
                      <select
                        id="home"
                        name="home"
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select a home</option>
                        {homes.map((home) => (
                          <option key={home.id} value={home.id}>
                            {home.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isOwner">Resident Type</Label>
                      <select
                        id="isOwner"
                        name="isOwner"
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="false">Tenant</option>
                        <option value="true">Owner</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Resident</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Residents;
