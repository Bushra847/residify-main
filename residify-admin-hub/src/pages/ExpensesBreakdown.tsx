
import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ExpensesBreakdown = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  // Mock data for charts
  const expenseData = [
    { name: 'Maintenance', amount: 2500, fill: '#8884d8' },
    { name: 'Security', amount: 1800, fill: '#83a6ed' },
    { name: 'Watchman Salary', amount: 1200, fill: '#8dd1e1' },
    { name: 'Gardening', amount: 800, fill: '#82ca9d' },
    { name: 'Cleaning', amount: 1500, fill: '#a4de6c' },
    { name: 'Utilities', amount: 2200, fill: '#d0ed57' },
    { name: 'Administration', amount: 900, fill: '#ffc658' }
  ];

  const monthlyExpenseData = [
    { name: 'Jan', maintenance: 2200, security: 1500, watchman: 1000, utilities: 1800 },
    { name: 'Feb', maintenance: 2300, security: 1600, watchman: 1000, utilities: 1900 },
    { name: 'Mar', maintenance: 2150, security: 1550, watchman: 1000, utilities: 2000 },
    { name: 'Apr', maintenance: 2500, security: 1800, watchman: 1200, utilities: 2200 },
    { name: 'May', maintenance: 2400, security: 1750, watchman: 1200, utilities: 2100 },
    { name: 'Jun', maintenance: 2350, security: 1700, watchman: 1200, utilities: 2050 },
  ];

  const residentContribution = 430; // Monthly contribution per resident
  const totalResidents = 350;
  const totalMonthlyCollection = residentContribution * totalResidents;
  const totalMonthlyExpenses = expenseData.reduce((sum, expense) => sum + expense.amount, 0);
  
  const expenseBreakdownPerResident = expenseData.map(expense => ({
    ...expense,
    perResident: parseFloat((expense.amount / totalResidents).toFixed(2))
  }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Expenses Breakdown</h1>
            <p className="text-muted-foreground">Detailed analysis of residence expenses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Collection</CardTitle>
                <CardDescription>Total funds collected from residents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${totalMonthlyCollection.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  ${residentContribution} per resident × {totalResidents} residents
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Expenses</CardTitle>
                <CardDescription>Total expenses for the property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${totalMonthlyExpenses.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Across {expenseData.length} expense categories
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Balance</CardTitle>
                <CardDescription>Remaining funds after expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${(totalMonthlyCollection - totalMonthlyExpenses).toLocaleString()}</div>
                <p className={`text-sm mt-1 ${totalMonthlyCollection >= totalMonthlyExpenses ? 'text-green-600' : 'text-red-600'}`}>
                  {totalMonthlyCollection >= totalMonthlyExpenses ? 'Surplus' : 'Deficit'} of ${Math.abs(totalMonthlyCollection - totalMonthlyExpenses).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
                <CardDescription>Breakdown by expense category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Expense Trend</CardTitle>
                <CardDescription>Expenses over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyExpenseData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="maintenance" stackId="a" name="Maintenance" fill="#8884d8" />
                      <Bar dataKey="security" stackId="a" name="Security" fill="#82ca9d" />
                      <Bar dataKey="watchman" stackId="a" name="Watchman" fill="#ffc658" />
                      <Bar dataKey="utilities" stackId="a" name="Utilities" fill="#8dd1e1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Per Resident Breakdown</CardTitle>
              <CardDescription>How each expense category affects individual residents</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="table">
                <TabsList>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="chart">Chart View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="table" className="mt-4">
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left font-medium">Expense Category</th>
                          <th className="h-10 px-4 text-right font-medium">Total Amount</th>
                          <th className="h-10 px-4 text-right font-medium">Per Resident</th>
                          <th className="h-10 px-4 text-right font-medium">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenseBreakdownPerResident.map((expense, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-4">{expense.name}</td>
                            <td className="p-4 text-right">${expense.amount.toLocaleString()}</td>
                            <td className="p-4 text-right">${expense.perResident}</td>
                            <td className="p-4 text-right">
                              {((expense.amount / totalMonthlyExpenses) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-muted/50 font-medium">
                          <td className="p-4">Total</td>
                          <td className="p-4 text-right">${totalMonthlyExpenses.toLocaleString()}</td>
                          <td className="p-4 text-right">${(totalMonthlyExpenses / totalResidents).toFixed(2)}</td>
                          <td className="p-4 text-right">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="chart" className="mt-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={expenseBreakdownPerResident}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip formatter={(value) => [`$${value}`, 'Per Resident']} />
                        <Bar dataKey="perResident" fill="#82ca9d" name="Cost Per Resident" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ExpensesBreakdown;
