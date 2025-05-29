import React, { useState, useEffect } from 'react';
import { residentsService, Resident, Property } from '@/services/residents';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

export default function ResidentManagement() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddingResident, setIsAddingResident] = useState(false);
  const [isEditingResident, setIsEditingResident] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadResidents();
    loadProperties();
  }, []);

  const loadResidents = async () => {
    try {
      const data = await residentsService.getResidents();
      setResidents(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load residents'
      });
    }
  };

  const loadProperties = async () => {
    try {
      const data = await residentsService.getProperties();
      setProperties(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load properties'
      });
    }
  };

  const handleAddResident = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const data = {
        username: formData.get('username'),
        password: formData.get('password'),
        email: formData.get('email'),
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        phone: formData.get('phone'),
        property: Number(formData.get('property')),
        lease_start_date: formData.get('leaseStart'),
        lease_end_date: formData.get('leaseEnd'),
        emergency_contact_name: formData.get('emergencyName'),
        emergency_contact_phone: formData.get('emergencyPhone'),
        unit_number: formData.get('unitNumber')
      };

      await residentsService.createResident(data);
      setIsAddingResident(false);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Resident added successfully'
      });
      loadResidents();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add resident'
      });
    }
  };

  const handleEditResident = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedResident) return;

    const formData = new FormData(event.currentTarget);
    
    try {
      const data = {
        property: Number(formData.get('property')),
        lease_start_date: formData.get('leaseStart'),
        lease_end_date: formData.get('leaseEnd'),
        emergency_contact_name: formData.get('emergencyName'),
        emergency_contact_phone: formData.get('emergencyPhone'),
        unit_number: formData.get('unitNumber')
      };

      await residentsService.updateResident(selectedResident.id, data);
      setIsEditingResident(false);
      setSelectedResident(null);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Resident updated successfully'
      });
      loadResidents();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update resident'
      });
    }
  };

  const handleDeleteResident = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this resident?')) return;
    
    try {
      await residentsService.deleteResident(id);
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Resident deleted successfully'
      });
      loadResidents();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete resident'
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resident Management</h1>
        <Dialog open={isAddingResident} onOpenChange={setIsAddingResident}>
          <DialogTrigger asChild>
            <Button>Add Resident</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Resident</DialogTitle>
              <DialogDescription>Enter the details of the new resident.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddResident}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="col-span-1">Username</Label>
                  <Input id="username" name="username" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="col-span-1">Password</Label>
                  <Input id="password" name="password" type="password" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="col-span-1">Email</Label>
                  <Input id="email" name="email" type="email" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="col-span-1">First Name</Label>
                  <Input id="firstName" name="firstName" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="col-span-1">Last Name</Label>
                  <Input id="lastName" name="lastName" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="col-span-1">Phone</Label>
                  <Input id="phone" name="phone" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="property" className="col-span-1">Property</Label>
                  <select 
                    id="property" 
                    name="property" 
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select property</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unitNumber" className="col-span-1">Unit Number</Label>
                  <Input id="unitNumber" name="unitNumber" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="leaseStart" className="col-span-1">Lease Start</Label>
                  <Input id="leaseStart" name="leaseStart" type="date" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="leaseEnd" className="col-span-1">Lease End</Label>
                  <Input id="leaseEnd" name="leaseEnd" type="date" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="emergencyName" className="col-span-1">Emergency Contact</Label>
                  <Input id="emergencyName" name="emergencyName" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="emergencyPhone" className="col-span-1">Emergency Phone</Label>
                  <Input id="emergencyPhone" name="emergencyPhone" className="col-span-3" required />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsAddingResident(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Resident</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Lease Period</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {residents.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell>{resident.user.first_name} {resident.user.last_name}</TableCell>
                <TableCell>{resident.user.email}</TableCell>
                <TableCell>{resident.property?.name || 'N/A'}</TableCell>
                <TableCell>{resident.unit_number || 'N/A'}</TableCell>
                <TableCell>
                  {format(new Date(resident.lease_start_date), 'MMM d, yyyy')} - {format(new Date(resident.lease_end_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedResident(resident);
                        setIsEditingResident(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteResident(resident.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditingResident} onOpenChange={setIsEditingResident}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
            <DialogDescription>Update the resident's details.</DialogDescription>
          </DialogHeader>
          {selectedResident && (
            <form onSubmit={handleEditResident}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="property" className="col-span-1">Property</Label>
                  <select 
                    id="property" 
                    name="property" 
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={selectedResident.property?.id}
                    required
                  >
                    <option value="">Select property</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unitNumber" className="col-span-1">Unit Number</Label>
                  <Input 
                    id="unitNumber" 
                    name="unitNumber" 
                    className="col-span-3" 
                    defaultValue={selectedResident.unit_number || ''} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="leaseStart" className="col-span-1">Lease Start</Label>
                  <Input 
                    id="leaseStart" 
                    name="leaseStart" 
                    type="date" 
                    className="col-span-3" 
                    defaultValue={selectedResident.lease_start_date} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="leaseEnd" className="col-span-1">Lease End</Label>
                  <Input 
                    id="leaseEnd" 
                    name="leaseEnd" 
                    type="date" 
                    className="col-span-3" 
                    defaultValue={selectedResident.lease_end_date} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="emergencyName" className="col-span-1">Emergency Contact</Label>
                  <Input 
                    id="emergencyName" 
                    name="emergencyName" 
                    className="col-span-3" 
                    defaultValue={selectedResident.emergency_contact_name} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="emergencyPhone" className="col-span-1">Emergency Phone</Label>
                  <Input 
                    id="emergencyPhone" 
                    name="emergencyPhone" 
                    className="col-span-3" 
                    defaultValue={selectedResident.emergency_contact_phone} 
                    required 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditingResident(false);
                  setSelectedResident(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">Update Resident</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
