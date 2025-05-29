
import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, FileText, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';

interface User {
  role: string;
  first_name: string;
}

const ResidentDashboard = () => {
  const { user, isLoading } = useAuth() as { user: User | null; isLoading: boolean };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is not logged in or not a resident
  if (!user) {
    return <Navigate to="/" />;
  }

  if (user.role !== 'resident') {
    return <Navigate to="/admin-dashboard" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Resident Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.first_name}!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="col-span-3">
              <CardContent className="pt-6">
                <Dashboard />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/complaint-submission">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell size={16} className="mr-2" />
                    Submit Complaint
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResidentDashboard;
