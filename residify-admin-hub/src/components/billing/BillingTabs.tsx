
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillList from "./BillList";

interface Bill {
  id: string;
  type: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: string;
}

interface BillingTabsProps {
  pendingBills: Bill[];
  paidBills: Bill[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  onPayNow: (billId: number) => Promise<void>;
}

const BillingTabs = ({ 
  pendingBills, 
  paidBills, 
  activeTab, 
  setActiveTab, 
  isAdmin, 
  onPayNow
}: BillingTabsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              {isAdmin ? "Pending Bills" : "Due Bills"}
            </TabsTrigger>
            <TabsTrigger value="paid">Paid Bills</TabsTrigger>
            {isAdmin && <TabsTrigger value="all">All Bills</TabsTrigger>}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="pending">
            <BillList 
              filters={{ bill_status: 'pending' }}
              isAdmin={isAdmin} 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </TabsContent>
          <TabsContent value="paid">
            <BillList 
              filters={{ bill_status: 'paid' }}
              isAdmin={isAdmin} 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="all">
              <BillList 
                filters={{}}
                isAdmin={isAdmin} 
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BillingTabs;
