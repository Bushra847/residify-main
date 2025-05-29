import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BILL_TYPES, billingService, CreateBillData, CreateSharedBillData } from '@/services/billing';
import { residentsService, Resident } from '@/services/residents';
import { useToast } from '@/components/ui/use-toast';

interface AddBillDialogProps {
  onAddBill: (data: CreateBillData | CreateSharedBillData) => void;
  setIsAddingBill: (value: boolean) => void;
  residentId?: number;
}

const AddBillDialog = ({ onAddBill, setIsAddingBill, residentId }: AddBillDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isForAllResidents, setIsForAllResidents] = useState(false);
  const [formData, setFormData] = useState<Omit<CreateBillData, 'amount' | 'screenshot'> & { amount: string, screenshot?: File }>({
    bill_type: '',
    amount: '',
    due_date: '',
    description: '',
    resident: residentId || 0,
  });

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const data = await residentsService.getResidents();
        setResidents(data);
      } catch (error) {
        console.error('Error fetching residents:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch residents',
          variant: 'destructive',
        });
      }
    };

    fetchResidents();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.bill_type || !formData.amount || !formData.due_date || (!isForAllResidents && !formData.resident)) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const amount = parseFloat(formData.amount);

      if (isForAllResidents) {
        // Create a shared bill for all residents
        const sharedBillData: CreateSharedBillData = {
          bill_type: formData.bill_type,
          amount,
          due_date: formData.due_date,
          description: formData.description || '', // Ensure description is never undefined
        };

        console.log('Creating shared bill with data:', sharedBillData);
        try {
          const result = await billingService.createSharedBill(sharedBillData);
          console.log('Shared bill creation result:', result);
          
          if (result) {
            toast({
              title: 'Success',
              description: 'Shared bill created and distributed to all residents',
            });
            onAddBill(sharedBillData);
            setIsAddingBill(false);
          }
        } catch (error: any) {
          console.error('Shared bill creation error:', {
            error,
            response: error.response?.data,
            status: error.response?.status
          });
          throw error;
        }
      } else {
        // Create a bill for a specific resident
        const billData: CreateBillData = {
          ...formData,
          amount,
          description: formData.description || '', // Ensure description is never undefined
        };

        console.log('Creating individual bill with data:', billData);
        try {
          const result = await billingService.createBill(billData);
          console.log('Individual bill creation result:', result);
          
          if (result) {
            toast({
              title: 'Success',
              description: 'Bill created successfully',
            });
            onAddBill(billData);
            setIsAddingBill(false);
          }
        } catch (error: any) {
          console.error('Individual bill creation error:', {
            error,
            response: error.response?.data,
            status: error.response?.status
          });
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Bill creation error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || error.response?.data?.error || 'Failed to create bill',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Bill</DialogTitle>
        <DialogDescription>Add a new bill to assign to residents.</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="screenshot" className="col-span-1">Bill Screenshot</Label>
          <Input
            id="screenshot"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="bill-type" className="col-span-1">Type</Label>
          <Select
            value={formData.bill_type}
            onValueChange={(value) => setFormData({ ...formData, bill_type: value })}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select bill type" />
            </SelectTrigger>
            <SelectContent>
              {BILL_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="col-span-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-residents"
                checked={isForAllResidents}
                onCheckedChange={(checked) => setIsForAllResidents(checked as boolean)}
              />
              <span>Create bill for all residents</span>
            </div>
          </Label>
        </div>

        {!isForAllResidents && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="resident" className="col-span-1">Resident</Label>
            <Select
              value={formData.resident?.toString()}
              onValueChange={(value) => setFormData({ ...formData, resident: parseInt(value) })}
              disabled={isForAllResidents}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select resident" />
              </SelectTrigger>
              <SelectContent>
                {residents?.map((resident) => (
                  <SelectItem key={resident?.id} value={resident?.id?.toString() ?? ''}>
                    {resident?.name ?? 'Unknown Resident'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="col-span-1">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            className="col-span-3"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            step="0.01"
            min="0"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="due-date" className="col-span-1">Due Date</Label>
          <Input
            id="due-date"
            type="date"
            className="col-span-3"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="col-span-1">Description</Label>
          <Input
            id="description"
            className="col-span-3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </form>
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsAddingBill(false)} disabled={loading}>Cancel</Button>
        <Button onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }} disabled={loading}>Create Bill</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddBillDialog;
