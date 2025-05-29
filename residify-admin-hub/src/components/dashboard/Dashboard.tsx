import React, { useEffect, useState } from 'react';
import { DashboardStats as DashboardStatsType, dashboardService } from '@/services/dashboard';
import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { useToast } from '@/components/ui/use-toast';

interface DashboardProps {
  isAdmin?: boolean;
}

export const Dashboard = ({ isAdmin }: DashboardProps) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = isAdmin
          ? await dashboardService.getAdminDashboard()
          : await dashboardService.getResidentDashboard();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-center text-red-500">Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-8">
      <DashboardStats stats={stats} isAdmin={isAdmin} />
      <RecentActivity activity={stats.recent_activity} />
    </div>
  );
};
