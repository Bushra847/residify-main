import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ExpenseList from '@/components/expenses/ExpenseList';
import AddExpenseDialog from '@/components/expenses/AddExpenseDialog';
import ExpenseBreakdown from '@/components/expenses/ExpenseBreakdown';
import { expenseService, Expense, ExpenseSummary, CreateExpenseData } from '@/services/expenses';

const ExpenseManagement = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch expenses and summary
  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, summaryData] = await Promise.all([
        expenseService.getExpenses({}, currentPage),
        expenseService.getExpenseSummary()
      ]);
      setExpenses(expensesData.results);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch expenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleAddExpense = async (data: CreateExpenseData) => {
    try {
      setLoading(true);
      await expenseService.createExpense(data);
      toast({
        title: 'Success',
        description: 'Expense added successfully',
      });
      setIsAddingExpense(false);
      fetchData();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExpense = async (id: number) => {
    try {
      setLoading(true);
      await expenseService.approveExpense(id);
      toast({
        title: 'Success',
        description: 'Expense approved successfully',
      });
      fetchData();
    } catch (error) {
      console.error('Error approving expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve expense',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectExpense = async (id: number) => {
    try {
      setLoading(true);
      await expenseService.rejectExpense(id);
      toast({
        title: 'Success',
        description: 'Expense rejected successfully',
      });
      fetchData();
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject expense',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewExpense = (expense: Expense) => {
    // TODO: Implement view expense details
    console.log('View expense:', expense);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Expense Management</h1>
              <p className="text-muted-foreground">Manage and track your expenses</p>
            </div>
            {user?.role === 'admin' && (
              <Button onClick={() => setIsAddingExpense(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            )}
          </div>

          {summary && <ExpenseBreakdown summary={summary} />}

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
            <ExpenseList
              expenses={expenses}
              onApprove={handleApproveExpense}
              onReject={handleRejectExpense}
              onView={handleViewExpense}
              isAdmin={user?.role === 'admin'}
            />
          </div>

          <AddExpenseDialog
            isOpen={isAddingExpense}
            onClose={() => setIsAddingExpense(false)}
            onSubmit={handleAddExpense}
          />
        </main>
      </div>
    </div>
  );
};

export default ExpenseManagement;
