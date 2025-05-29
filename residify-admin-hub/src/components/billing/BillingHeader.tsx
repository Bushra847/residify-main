
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, DollarSign } from 'lucide-react';

interface BillingHeaderProps {
  isAdmin: boolean;
  onGenerateBills: () => void;
  setIsAddingBill: (value: boolean) => void;
  isAddingBill: boolean;
}

const BillingHeader = ({ 
  isAdmin, 
  onGenerateBills, 
  setIsAddingBill, 
  isAddingBill 
}: BillingHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold">Billing Management</h1>
        <p className="text-muted-foreground">Manage and track all resident billing</p>
      </div>
      {isAdmin && (
        <div className="mt-4 flex gap-2 md:mt-0">
          <Dialog open={isAddingBill} onOpenChange={setIsAddingBill}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus size={16} className="mr-2" />
                Add New Bill
              </Button>
            </DialogTrigger>
          </Dialog>

          <Button onClick={onGenerateBills}>
            <DollarSign size={16} className="mr-2" />
            Generate Monthly Bills
          </Button>
        </div>
      )}
    </div>
  );
};

export default BillingHeader;
