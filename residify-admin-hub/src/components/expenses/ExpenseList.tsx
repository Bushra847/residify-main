import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { Expense } from '@/services/expenses';
import { format } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onView: (expense: Expense) => void;
  isAdmin?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const ExpenseList = ({ expenses, onApprove, onReject, onView, isAdmin = false }: ExpenseListProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
              <TableCell className="capitalize">{expense.category}</TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>${Number(expense.amount).toFixed(2)}</TableCell>
              <TableCell>{expense.created_by_name}</TableCell>
              <TableCell>
                <Badge
                  className={`${statusColors[expense.status]}`}
                >
                  {expense.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(expense)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  {isAdmin && expense.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApprove(expense.id)}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReject(expense.id)}
                        className="text-red-600"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExpenseList;
