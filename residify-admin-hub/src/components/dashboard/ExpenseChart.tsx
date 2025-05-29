
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Button } from "@/components/ui/button";

const data = [
  { name: 'Rent', value: 8500, color: '#3a8cb1' },
  { name: 'Water', value: 2300, color: '#38a08b' },
  { name: 'Security', value: 1800, color: '#8fc7db' },
  { name: 'Maintenance', value: 3200, color: '#b1e9d9' },
  { name: 'Electricity', value: 2700, color: '#5aa7c6' },
];

const COLORS = ['#3a8cb1', '#38a08b', '#8fc7db', '#b1e9d9', '#5aa7c6'];

const ExpenseChart = () => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  const toggleChartType = () => {
    setChartType(chartType === 'pie' ? 'bar' : 'pie');
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Expense Overview</CardTitle>
            <CardDescription>Monthly expense distribution</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleChartType}
          >
            {chartType === 'pie' ? 'Show Bar Chart' : 'Show Pie Chart'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartType === 'pie' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="value" name="Amount ($)" fill="#3a8cb1" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Total monthly expenses: <span className="font-medium text-foreground">$18,500</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExpenseChart;
