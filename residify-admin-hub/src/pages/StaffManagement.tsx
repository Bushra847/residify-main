
import React, { useState, useEffect } from 'react';
import { staffService, Staff, StaffRole, StaffCreateData, StaffUpdateData } from '@/services/staff';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Navigate } from 'react-router-dom';
import { Edit, Plus, Search, Trash2, UserCog } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const StaffManagement = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  // All useState hooks
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<any>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isViewingExpenses, setIsViewingExpenses] = useState(false);
  const [filterDates, setFilterDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roles, setRoles] = useState<StaffRole[]>([]);

  const loadRoles = async () => {
    try {
      const data = await staffService.getRoles();
      setRoles(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load roles'
      });
    }
  };

  const loadStaffMembers = async () => {
    try {
      const data = await staffService.getStaffMembers();
      setStaffMembers(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load staff members'
      });
    }
  };

  // Load staff members on component mount
  useEffect(() => {
    const loadData = async () => {
      await loadRoles();
      await loadStaffMembers();
    };
    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is not logged in or not an admin
  if (!user) {
    return <Navigate to="/" />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/resident-dashboard" />;
  }

  // Filter staff members based on search and role
  const filteredStaffMembers = staffMembers.filter(staff => {
    // Search filter
    const searchMatches = !searchQuery || [
      staff.first_name,
      staff.last_name,
      staff.email
    ].some(field => field.toLowerCase().includes(searchQuery.toLowerCase()));

    // Role filter
    const roleMatches = !roleFilter || roleFilter === 'all' || 
      (staff.role && staff.role.name && staff.role.name.toLowerCase() === roleFilter.toLowerCase());

    // Status filter
    const statusMatches = !statusFilter || statusFilter === 'all' || 
      (statusFilter === 'active' ? staff.is_active : !staff.is_active);

    return searchMatches && roleMatches && statusMatches;
  });

  const loadExpenses = async (staffId?: number) => {
    try {
      const data = await staffService.getExpenses({
        staff_id: staffId,
        start_date: filterDates.startDate || undefined,
        end_date: filterDates.endDate || undefined
      });
      setExpenses(data);

      const summary = await staffService.getExpenseSummary({
        staff_id: staffId,
        start_date: filterDates.startDate || undefined,
        end_date: filterDates.endDate || undefined
      });
      setExpenseSummary(summary);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load expenses'
      });
    }
  };

  const handleAddStaff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      console.log('Form data:', Object.fromEntries(formData));
      
      const name = formData.get('name')?.toString() || '';
      const email = formData.get('email')?.toString();
      const role = formData.get('role')?.toString();
      const salary = formData.get('salary')?.toString();
      const phone = formData.get('phone')?.toString();
      const startDate = formData.get('start-date')?.toString();

      console.log('Parsed form values:', { name, email, role, salary, phone, startDate });

      if (!name || !email || !role || !salary || !phone) {
        console.error('Missing required fields:', { name, email, role, salary, phone });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please fill in all required fields'
        });
        return;
      }

      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;
      const data: StaffCreateData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: parseInt(role || '0', 10),
        salary: Number(salary),
        contact_number: phone,
        emergency_contact: phone,
        is_active: true
      };
      
      console.log('Sending staff data:', data);
      const response = await staffService.createStaffMember(data);
      console.log('Staff creation response:', response);
      
      setIsAddingStaff(false);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Staff member added successfully'
      });
      loadStaffMembers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add staff member'
      });
    }
  };

  const handleEditStaff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('edit-name')?.toString() || '';
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;
    const data: StaffUpdateData = {
      first_name: firstName,
      last_name: lastName,
      email: formData.get('edit-email')?.toString() || '',
      role: parseInt(formData.get('edit-role')?.toString() || '0', 10),
      salary: Number(formData.get('edit-salary')) || 0,
      contact_number: formData.get('edit-phone')?.toString() || '',
      emergency_contact: formData.get('edit-phone')?.toString() || ''
    };
    try {
      if (!selectedStaff?.id) return;
      await staffService.updateStaffMember(selectedStaff.id, data);
      setIsEditingStaff(false);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Staff member updated successfully'
      });
      loadStaffMembers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update staff member'
      });
    }
  };

  const handleDeleteStaff = async (id: number) => {
    try {
      await staffService.deleteStaffMember(id);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Staff member deleted successfully'
      });
      loadStaffMembers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete staff member'
      });
    }
  };

  const openEditDialog = (staff: any) => {
    setSelectedStaff(staff);
    setIsEditingStaff(true);
  };

  const handleAddExpense = async (values: any) => {
    try {
      await staffService.createExpense(values);
      setIsAddingExpense(false);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Expense added successfully'
      });
      loadExpenses(values.staff);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add expense'
      });
    }
  };

  const handleMarkExpensePaid = async (id: number) => {
    try {
      await staffService.markExpensePaid(id);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Expense marked as paid'
      });
      loadExpenses(selectedStaff?.id);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark expense as paid'
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Staff Management</h1>
              <p className="text-muted-foreground">Manage and monitor staff members</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Add Staff Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                    <DialogDescription>Enter the details of the new staff member.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddStaff}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="col-span-1">Name</Label>
                        <Input id="name" name="name" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="col-span-1">Role</Label>
                        <div className="col-span-3">
                          <select name="role" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="">Select role</option>
                            {roles.map(role => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="col-span-1">Phone</Label>
                        <Input id="phone" name="phone" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="col-span-1">Email</Label>
                        <Input id="email" name="email" type="email" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="salary" className="col-span-1">Salary</Label>
                        <Input id="salary" name="salary" type="number" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start-date" className="col-span-1">Start Date</Label>
                        <Input id="start-date" name="start-date" type="date" className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setIsAddingStaff(false)}>Cancel</Button>
                      <Button type="submit">Add Staff</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name or email..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.id.toString()} value={role.name.toLowerCase()}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Staff List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.id}</TableCell>
                      <TableCell>{`${staff.first_name} ${staff.last_name}`}</TableCell>
                      <TableCell>
                        {staff.role ? (
                          <Badge variant="outline">{staff.role.name}</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{staff.emergency_contact}</TableCell>
                      <TableCell>${staff.salary}/mo</TableCell>
                      <TableCell>
                        <Badge variant={staff.is_active ? 'default' : 'secondary'}>
                          {staff.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(staff)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteStaff(staff.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Staff Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <UserCog size={36} className="mr-4 text-muted-foreground" />
                  <div>
                    <div className="text-3xl font-bold">{staffMembers.length}</div>
                    <p className="text-sm text-muted-foreground">Active staff members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Payroll</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${Number(staffMembers.reduce((sum, staff) => sum + Number(staff.salary || 0), 0)).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  ${staffMembers.length > 0 ? Number(staffMembers.reduce((sum, staff) => sum + Number(staff.salary || 0), 0) / staffMembers.length).toFixed(2) : '0.00'} average per staff
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Staff Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roles.map(role => {
                    const staffCount = staffMembers.filter(staff => staff.role.id === role.id).length;
                    const filteredCount = filteredStaffMembers.filter(staff => staff.role.id === role.id).length;
                    const percentage = staffMembers.length > 0 ? (staffCount / staffMembers.length) * 100 : 0;
                    if (staffCount === 0) return null;
                    return (
                      <div key={role.id} className="flex items-center justify-between">
                        <div className="text-sm font-medium">{role.name}</div>
                        <div className="text-sm text-muted-foreground">{filteredCount} of {staffCount} ({percentage.toFixed(0)}%)</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Staff Dialog */}
          {selectedStaff && (
            <Dialog open={isEditingStaff} onOpenChange={setIsEditingStaff}>
              <DialogContent>
                <form onSubmit={handleEditStaff}>
                  <DialogHeader>
                    <DialogTitle>Edit Staff Member</DialogTitle>
                    <DialogDescription>Update the details of {`${selectedStaff.first_name} ${selectedStaff.last_name}`}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-name" className="col-span-1">Name</Label>
                      <Input id="edit-name" name="edit-name" defaultValue={`${selectedStaff.first_name} ${selectedStaff.last_name}`} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-role" className="col-span-1">Role</Label>
                      <Select name="edit-role" defaultValue={selectedStaff.role.id.toString()}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role.id.toString()} value={role.id.toString()}>{role.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-phone" className="col-span-1">Phone</Label>
                      <Input id="edit-phone" name="edit-phone" defaultValue={selectedStaff.emergency_contact} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-email" className="col-span-1">Email</Label>
                      <Input id="edit-email" name="edit-email" type="email" defaultValue={selectedStaff.email} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-salary" className="col-span-1">Salary</Label>
                      <Input id="edit-salary" name="edit-salary" type="number" defaultValue={selectedStaff.salary} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsEditingStaff(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  );
};

export default StaffManagement;
