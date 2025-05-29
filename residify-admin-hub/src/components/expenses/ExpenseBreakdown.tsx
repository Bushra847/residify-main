import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpenseSummary, EXPENSE_CATEGORIES } from '@/services/expenses';
import { format } from 'date-fns';

interface ExpenseBreakdownProps {
  summary: ExpenseSummary;
}

const ExpenseBreakdown = ({ summary }: ExpenseBreakdownProps) => {
  // Get category label from value
  const getCategoryLabel = (value: string) => {
    return EXPENSE_CATEGORIES.find(cat => cat.value === value)?.label || value;
  };

  // Get month name from number
  const getMonthName = (month: number) => {
    return format(new Date(2000, month - 1), 'MMMM');
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
          <CardDescription>Total approved expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.total.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Breakdown of expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.category_totals.map((category) => (
              <div key={category.category} className="flex items-center">
                <div className="w-40 font-medium">
                  {getCategoryLabel(category.category)}
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(category.total / summary.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right font-medium">
                  ${category.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>Expenses trend by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.monthly_totals.map((month) => (
              <div key={`${month.year}-${month.month}`} className="flex items-center">
                <div className="w-40 font-medium">
                  {getMonthName(month.month)} {month.year}
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${(month.total / Math.max(...summary.monthly_totals.map(m => m.total))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right font-medium">
                  ${month.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseBreakdown;
