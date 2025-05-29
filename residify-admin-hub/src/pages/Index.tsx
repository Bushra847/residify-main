
import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Redirect to appropriate dashboard based on user role
    return <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/resident-dashboard'} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-residify-blue-50 to-residify-teal-50">
      {/* Left side - Login Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <LoginForm />
      </div>
      
      {/* Right side - Branding */}
      <div className="flex-1 bg-residify-blue-600 flex flex-col items-center justify-center p-10 text-white">
        <div className="max-w-md space-y-6">
          <div className="flex items-center justify-center">
            <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center">
              <span className="text-residify-blue-600 font-bold text-3xl">R</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-center">Residify</h1>
          <p className="text-xl text-center text-residify-blue-100">
            Simplifying residential property management
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-6">
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <h3 className="text-xl font-medium">For Residents</h3>
              <p className="text-sm mt-2 text-residify-blue-100">
                Submit complaints, access documents, and stay connected with property management
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <h3 className="text-xl font-medium">For Admins</h3>
              <p className="text-sm mt-2 text-residify-blue-100">
                Manage properties, track expenses, and streamline resident onboarding
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
