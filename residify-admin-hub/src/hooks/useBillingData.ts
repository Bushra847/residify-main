import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { billingService, Bill as BaseBill, CreateSharedBillData, CreateBillData } from '@/services/billing';

export interface Bill extends BaseBill {
  paidDate?: string;
}

export const useBillingData = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [paidBills, setPaidBills] = useState<Bill[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch bills on mount and when page/tab changes
  useEffect(() => {
    fetchBills();
  }, [currentPage, activeTab]);

  const handlePayNow = async (billId: number) => {
    try {
      setIsLoading(true);
      await billingService.markBillAsPaid(billId);
      toast({
        title: 'Success',
        description: 'Bill marked as paid successfully',
      });
      await fetchBills();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark bill as paid',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleGenerateBills = async () => {
    try {
      setIsLoading(true);
      const result = await billingService.generateMonthlyBills();
      toast({
        title: 'Success',
        description: result.detail,
      });
      await fetchBills(); // Refresh the bills list
    } catch (error: any) {
      console.error('Error generating bills:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to generate monthly bills',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBill = async (data: CreateBillData | CreateSharedBillData) => {
    try {
      setIsLoading(true);
      
      if ('resident' in data) {
        // Individual bill
        await billingService.createBill(data as CreateBillData);
      } else {
        // Shared bill
        await billingService.createSharedBill(data as CreateSharedBillData);
      }
      
      await fetchBills();
      setIsAddingBill(false);
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to create bill',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const status = activeTab === 'pending' ? 'pending' : 'paid';
      const response = await billingService.getBills({ status }, currentPage);
      
      if (activeTab === 'pending') {
        setPendingBills(response.results);
      } else {
        setPaidBills(response.results);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bills',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isAddingBill,
    setIsAddingBill,
    pendingBills,
    paidBills,
    currentPage,
    setCurrentPage,
    isLoading,
    handlePayNow,
    handleGenerateBills,
    handleAddBill,
    fetchBills,
  };
};
