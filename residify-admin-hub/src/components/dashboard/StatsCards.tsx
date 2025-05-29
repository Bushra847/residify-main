
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Home, 
  DollarSign, 
  ClipboardCheck,
  Bell
} from 'lucide-react';

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Total Residents
            </div>
            <div className="text-2xl font-bold">350</div>
            <div className="mt-2 flex items-center text-sm text-residify-teal-500">
              <Users className="mr-2 h-4 w-4" />
              <span>+3% from last month</span>
            </div>
          </div>
          <Users className="h-10 w-10 text-gray-400" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Occupied Units
            </div>
            <div className="text-2xl font-bold">280</div>
            <div className="mt-2 flex items-center text-sm text-residify-teal-500">
              <Home className="mr-2 h-4 w-4" />
              <span>+5 units from last month</span>
            </div>
          </div>
          <Home className="h-10 w-10 text-gray-400" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Rent Collection
            </div>
            <div className="text-2xl font-bold">$85,000</div>
            <div className="mt-2 flex items-center text-sm text-residify-teal-500">
              <DollarSign className="mr-2 h-4 w-4" />
              <span>+8% from last month</span>
            </div>
          </div>
          <DollarSign className="h-10 w-10 text-gray-400" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Open Complaints
            </div>
            <div className="text-2xl font-bold">15</div>
            <div className="mt-2 flex items-center text-sm text-red-500">
              <Bell className="mr-2 h-4 w-4" />
              <span>-2 complaints from last month</span>
            </div>
          </div>
          <Bell className="h-10 w-10 text-gray-400" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
