import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from '@/services/dashboard';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface RecentActivityProps {
  activity: DashboardStats['recent_activity'];
}

export const RecentActivity = ({ activity }: RecentActivityProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.bills.map(bill => (
              <div key={bill.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="text-sm font-medium capitalize">{bill.bill_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(bill.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${bill.amount}</p>
                  <Badge 
                    variant={bill.status === 'paid' ? 'default' : 
                            bill.status === 'overdue' ? 'destructive' : 'secondary'}
                  >
                    {bill.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.payments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="text-sm font-medium">${payment.amount}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(payment.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge
                  variant={payment.status === 'approved' ? 'default' :
                          payment.status === 'rejected' ? 'destructive' : 'secondary'}
                >
                  {payment.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.complaints.map(complaint => (
              <div key={complaint.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="text-sm font-medium">{complaint.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(complaint.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge
                  variant={complaint.status === 'resolved' ? 'default' : 'secondary'}
                >
                  {complaint.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
