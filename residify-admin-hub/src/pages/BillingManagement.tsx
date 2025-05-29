
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Dialog } from '@/components/ui/dialog';
import BillingHeader from '@/components/billing/BillingHeader';
import BillingTabs from '@/components/billing/BillingTabs';
import AddBillDialog from '@/components/billing/AddBillDialog';
import { useBillingData } from '@/hooks/useBillingData';

const BillingManagement = () => {
  const { user, isLoading } = useAuth();
  const {
    activeTab,
    setActiveTab,
    isAddingBill,
    setIsAddingBill,
    pendingBills,
    paidBills,
    handlePayNow,
    handleGenerateBills,
    handleAddBill,
  } = useBillingData();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <BillingHeader
            isAdmin={isAdmin}
            onGenerateBills={handleGenerateBills}
            setIsAddingBill={setIsAddingBill}
            isAddingBill={isAddingBill}
          />

          <BillingTabs
            pendingBills={pendingBills}
            paidBills={paidBills}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
            onPayNow={handlePayNow}
          />


          <Dialog open={isAddingBill} onOpenChange={setIsAddingBill}>
            <AddBillDialog 
              onAddBill={handleAddBill} 
              setIsAddingBill={setIsAddingBill} 
            />
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default BillingManagement;
