
import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ComplaintForm from '@/components/forms/ComplaintForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ComplaintSubmission = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Submit a Complaint</h1>
            <p className="text-muted-foreground">
              Report issues with your unit or the property
            </p>
          </div>
          
          <ComplaintForm />
        </main>
      </div>
    </div>
  );
};

export default ComplaintSubmission;
