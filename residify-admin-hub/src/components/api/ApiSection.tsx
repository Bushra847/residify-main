
import React from 'react';
import { Card } from '@/components/ui/card';

interface ApiSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ApiSection = ({ title, description, children }: ApiSectionProps) => {
  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default ApiSection;
