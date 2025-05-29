
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Upload, Bell, Users, Download, Plus, FileText } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    // {
    //   title: "Add Resident",
    //   icon: <Upload size={16} />,
    //   onClick: () => navigate('/registration'),
    //   variant: "default" as const,
    // },
    {
      title: "View Complaints",
      icon: <Bell size={16} />,
      onClick: () => navigate('/complaints'),
      variant: "outline" as const,
    },
    {
      title: "Manage Residents",
      icon: <Users size={16} />,
      onClick: () => navigate('/residents'),
      variant: "outline" as const,
    },
    {
      title: "API Documentation",
      icon: <FileText size={16} />,
      onClick: () => navigate('/api-documentation'),
      variant: "outline" as const,
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="justify-start"
              onClick={action.onClick}
            >
              {action.icon}
              <span className="ml-2">{action.title}</span>
            </Button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button className="w-full" variant="secondary">
            <Plus size={16} className="mr-2" />
            Create Announcement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
