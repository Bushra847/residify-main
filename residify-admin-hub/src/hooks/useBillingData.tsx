
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Bill {
  id: string;
  type: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: string;
}

export const useBillingData = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [isAddingBill, setIsAddingBill] = useState(false);
  
  // Mock billing data
  const pendingBills: Bill[] = [
    { id: 'BILL-2025-001', type: 'Maintenance', amount: 150.00, dueDate: '2025-05-15', status: 'Pending' },
    { id: 'BILL-2025-002', type: 'Security', amount: 75.00, dueDate: '2025-05-15', status: 'Pending' },
    { id: 'BILL-2025-003', type: 'Watchman Salary', amount: 35.00, dueDate: '2025-05-15', status: 'Pending' },
    { id: 'BILL-2025-004', type: 'Cleaning', amount: 50.00, dueDate: '2025-05-15', status: 'Pending' },
    { id: 'BILL-2025-005', type: 'Utilities', amount: 120.00, dueDate: '2025-05-15', status: 'Pending' }
  ];

  const paidBills: Bill[] = [
    { id: 'BILL-2025-006', type: 'Maintenance', amount: 150.00, paidDate: '2025-04-01', status: 'Paid' },
    { id: 'BILL-2025-007', type: 'Security', amount: 75.00, paidDate: '2025-04-01', status: 'Paid' },
    { id: 'BILL-2025-008', type: 'Watchman Salary', amount: 35.00, paidDate: '2025-04-01', status: 'Paid' },
    { id: 'BILL-2025-009', type: 'Cleaning', amount: 50.00, paidDate: '2025-04-01', status: 'Paid' },
    { id: 'BILL-2025-010', type: 'Utilities', amount: 120.00, paidDate: '2025-04-01', status: 'Paid' }
  ];

  const handlePayNow = (billId: string) => {
    toast({
      title: "Payment Initiated",
      description: `Processing payment for bill ${billId}`,
    });
  };

  const handleDownloadInvoice = (billId: string) => {
    toast({
      title: "Invoice Downloaded",
      description: `Invoice ${billId} has been downloaded.`,
    });
  };

  const handleGenerateBills = () => {
    toast({
      title: "Bills Generated",
      description: "New bills have been generated and sent to all residents.",
    });
  };

  const handleAddBill = () => {
    setIsAddingBill(false);
    toast({
      title: "Bill Created",
      description: "New bill has been created and assigned to residents.",
    });
  };

  return {
    activeTab,
    setActiveTab,
    isAddingBill,
    setIsAddingBill,
    pendingBills,
    paidBills,
    handlePayNow,
    handleDownloadInvoice,
    handleGenerateBills,
    handleAddBill,
  };
};
