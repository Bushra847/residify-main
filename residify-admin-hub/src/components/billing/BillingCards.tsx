
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Calendar, Plus } from 'lucide-react';

interface Bill {
  id: string;
  type: string;
  amount: number;
  paidDate: string;
  status: string;
}

interface BillingCardsProps {
  paidBills: Bill[];
}

const BillingCards = ({ paidBills }: BillingCardsProps) => {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="font-medium">Credit Card</p>
                <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Change</Button>
          </div>

          <Button variant="outline" className="w-full">
            <Plus size={16} className="mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
          <CardDescription>View your payment history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paidBills.slice(0, 3).map((bill, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div>
                <p className="font-medium">{bill.type}</p>
                <p className="text-xs text-muted-foreground">{bill.paidDate}</p>
              </div>
              <p className="font-medium">${bill.amount.toFixed(2)}</p>
            </div>
          ))}
          <Button variant="link" className="w-full">
            View Full History
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing Documents</CardTitle>
          <CardDescription>Access your billing documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <FileText size={16} className="mr-2" />
            Annual Statement 2024
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Calendar size={16} className="mr-2" />
            Payment Schedule 2025
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText size={16} className="mr-2" />
            Tax Documents
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingCards;
