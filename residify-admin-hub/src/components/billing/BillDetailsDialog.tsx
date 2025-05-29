import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Bill as BillBase, SharedBill } from '@/services/billing';
import { Card, CardContent } from "@/components/ui/card";

interface Bill extends BillBase {
  original_amount?: number;
  penalty_amount?: number;
  total_due?: number;
}

interface BillDetailsDialogProps {
  bill: Bill | SharedBill | null;
  open: boolean;
  onClose: () => void;
}

const BillDetailsDialog = ({ bill, open, onClose }: BillDetailsDialogProps) => {
  if (!bill) return null;

  const isSharedBill = 'resident_bills' in bill;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bill Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Bill Type</p>
                  <p className="capitalize">{bill.bill_type}</p>
                </div>
                {!isSharedBill && (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Original Amount</p>
                      <p>${((bill as Bill).original_amount ?? (bill as Bill).amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Penalty Amount</p>
                      <p>${((bill as Bill).penalty_amount ?? 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500">Total Amount</p>
                      <p>${((bill as Bill).total_due ?? (bill as Bill).amount).toFixed(2)}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-500">Due Date</p>
                  <p>{format(new Date(bill.due_date), 'MMM d, yyyy')}</p>
                </div>
                {!isSharedBill && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Status</p>
                    <Badge 
                      variant={(bill as Bill).status === 'paid' ? 'default' : 
                              (bill as Bill).status === 'overdue' ? 'destructive' : 
                              (bill as Bill).status === 'partially_paid' ? 'outline' : 'secondary'}
                    >
                      {(bill as Bill).status.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
                {!isSharedBill && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Resident</p>
                    <p>{(bill as Bill).resident.user.first_name} {(bill as Bill).resident.user.last_name}</p>
                  </div>
                )}
                {isSharedBill && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Residents</p>
                    <div className="flex flex-wrap gap-1">
                      {(bill as SharedBill).resident_bills.map((residentBill) => (
                        <Badge 
                          key={residentBill.id} 
                          variant={residentBill.status === 'paid' ? 'default' : 'secondary'}
                        >
                          {residentBill.resident.user.first_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-500">Description</p>
                  <p>{bill.description || 'No description'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isSharedBill && (bill as Bill).screenshot && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-semibold text-gray-500 mb-2">Bill Screenshot</p>
                <img 
                  src={(bill as Bill).screenshot} 
                  alt="Bill Screenshot" 
                  className="max-h-96 object-contain rounded-lg border"
                />
              </CardContent>
            </Card>
          )}

          {!isSharedBill && (bill as Bill).payments?.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-semibold text-gray-500 mb-2">Payment Screenshots</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(bill as Bill).payments.map((payment) => (
                    payment.screenshot && (
                      <div key={payment.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={payment.status === 'approved' ? 'default' :
                                    payment.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            ${payment.amount} - {payment.status}
                          </Badge>
                          <p className="text-sm text-gray-500">
                            {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <img 
                          src={payment.screenshot} 
                          alt={`Payment Screenshot - $${payment.amount}`}
                          className="max-h-96 object-contain rounded-lg border"
                        />
                        {payment.notes && (
                          <p className="text-sm text-gray-500">{payment.notes}</p>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!isSharedBill && (bill as Bill).payments && (bill as Bill).payments.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-semibold text-gray-500 mb-4">Payment History</p>
                <div className="space-y-4">
                  {bill.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">${payment.amount}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge
                        variant={payment.status === 'approved' ? 'default' :
                                payment.status === 'rejected' ? 'destructive' : 'secondary'}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillDetailsDialog;
