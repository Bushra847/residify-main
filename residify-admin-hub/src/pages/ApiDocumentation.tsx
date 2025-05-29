
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ApiEndpointCard from '@/components/api/ApiEndpointCard';
import ApiSection from '@/components/api/ApiSection';
import { apiEndpoints } from '@/data/apiEndpoints';

const ApiDocumentation = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('authentication');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  // Only allow admins to access this page
  if (user.role !== 'admin') {
    return <Navigate to="/resident-dashboard" />;
  }

  const filteredEndpoints = apiEndpoints.filter(endpoint => 
    endpoint.category === activeSection
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">API Documentation</h1>
            <p className="text-muted-foreground">
              Complete reference for integrating with the Residential Management System API
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {['authentication', 'residents', 'billing', 'complaints', 'documents', 'staff'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                  activeSection === section
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          <ApiSection 
            title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} 
            description={`API endpoints for ${activeSection} operations`}
          >
            {filteredEndpoints.map((endpoint, index) => (
              <ApiEndpointCard
                key={index}
                endpoint={endpoint}
              />
            ))}
          </ApiSection>
        </main>
      </div>
    </div>
  );
};

export default ApiDocumentation;
