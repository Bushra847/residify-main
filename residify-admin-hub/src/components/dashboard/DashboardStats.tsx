import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats as DashboardStatsType } from '@/services/dashboard';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface DashboardStatsProps {
  stats: DashboardStatsType;
  isAdmin?: boolean;
}

export const DashboardStats = ({ stats, isAdmin }: DashboardStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Billing Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">${stats.billing.total_amount}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid</p>
                <p className="text-lg font-semibold text-green-600">${stats.billing.total_paid}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold text-amber-600">${stats.billing.total_pending}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isAdmin ? 'Collection Rate' : 'Payment Rate'}
              </p>
              <p className="text-lg font-semibold">
                {isAdmin ? stats.billing.collection_rate.toFixed(2) : stats.billing.payment_rate.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && stats.occupancy && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Homes</p>
                <p className="text-2xl font-bold">{stats.occupancy.total_homes}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                  <p className="text-lg font-semibold text-green-600">{stats.occupancy.occupied_homes}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vacant</p>
                  <p className="text-lg font-semibold text-amber-600">{stats.occupancy.vacant_homes}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                <p className="text-lg font-semibold">{stats.occupancy.occupancy_rate.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
              <p className="text-2xl font-bold">{stats.complaints.total}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-lg font-semibold text-green-600">{stats.complaints.resolved}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold text-amber-600">{stats.complaints.total - stats.complaints.resolved}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
              <p className="text-lg font-semibold">{stats.complaints.resolution_rate.toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
