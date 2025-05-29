import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from 'lucide-react';
import { Bill, SharedBill, billingService, BillFilters, BILL_STATUS } from '@/services/billing';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import PaymentDialog from './PaymentDialog';
import BillDetailsDialog from './BillDetailsDialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BillListProps {
  filters?: BillFilters;
  isAdmin: boolean;
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const BillList = ({ filters, isAdmin, activeTab, onTabChange }: BillListProps) => {
  const { toast } = useToast();
  const [bills, setBills] = useState<{ results: Bill[], count: number }>({ results: [], count: 0 });
  const [sharedBills, setSharedBills] = useState<SharedBill[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | SharedBill | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [billDetailsOpen, setBillDetailsOpen] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBills = async () => {
    try {
      setLoading(true);
      if (isAdmin && activeTab === 'shared') {
        const data = await billingService.getSharedBills(filters, currentPage);
        setSharedBills(data);
      } else {
        const data = await billingService.getBills({ ...filters, bill_status: activeTab === 'all' ? undefined : activeTab }, currentPage);
        setBills(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bills',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBillDetails = async (bill: Bill | SharedBill) => {
    try {
      if (!('resident_bills' in bill)) {
        // Fetch complete bill details including payments
        const billDetails = await billingService.getBill(bill.id);
        setSelectedBill(billDetails);
      } else {
        setSelectedBill(bill);
      }
      setBillDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching bill details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bill details',
        variant: 'destructive',
      });
    }
  };

  const handlePayNow = async (billId: number) => {
    try {
      setLoading(true);
      await billingService.markBillAsPaid(billId);
      toast({
        title: 'Success',
        description: 'Bill marked as paid',
      });
      fetchBills();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark bill as paid',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [filters, currentPage]);

  const getBillStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      
      <Table>
        <TableHeader>
          <TableRow>
            {isAdmin && activeTab === 'shared' ? (
              <>
                <TableHead>Bill Type</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Residents</TableHead>
                <TableHead>Actions</TableHead>
              </>
            ) : (
              <>
                <TableHead>Bill Type</TableHead>
                <TableHead>Resident</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Bill Screenshot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payments</TableHead>
                <TableHead>Actions</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : bills.results.length === 0 && sharedBills.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">No bills found</TableCell>
            </TableRow>
          ) : isAdmin && activeTab === 'shared' ? (
            sharedBills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium capitalize">{bill.bill_type}</TableCell>
                <TableCell>${bill.amount}</TableCell>
                <TableCell>{format(new Date(bill.due_date), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {bill.resident_bills.map((residentBill) => (
                      <Badge 
                        key={residentBill.id} 
                        variant={residentBill.status === 'paid' ? 'default' : 'secondary'}
                      >
                        {residentBill.resident.user.first_name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchBillDetails(bill)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            bills.results.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium capitalize">{bill.bill_type}</TableCell>
                <TableCell>{bill.resident.user.first_name} {bill.resident.user.last_name}</TableCell>
                <TableCell>${bill.amount}</TableCell>
                <TableCell>{format(new Date(bill.due_date), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {bill.screenshot && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(bill.screenshot!, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={bill.status === 'paid' ? 'default' : 
                            bill.status === 'overdue' ? 'destructive' : 
                            bill.status === 'partially_paid' ? 'outline' : 'secondary'}
                  >
                    {bill.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {bill.payments?.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {bill.payments?.map((payment) => (
                        <div key={payment.id} className="flex items-center gap-2">
                          <Badge
                            variant={payment.status === 'approved' ? 'default' :
                                    payment.status === 'rejected' ? 'destructive' : 'secondary'}
                          >
                            ${payment.amount} - {payment.status}
                          </Badge>
                          {payment.screenshot && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(payment.screenshot, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {isAdmin && payment.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => billingService.approvePayment(payment.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => billingService.rejectPayment(payment.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  {bill.status !== 'paid' && !isAdmin && (
                    <Button 
                      onClick={() => {
                        setSelectedBill(bill);
                        setPaymentDialogOpen(true);
                      }} 
                      size="sm" 
                      variant="outline"
                      disabled={loading}
                    >
                      Submit Payment
                    </Button>
                  )}
                  {isAdmin && bill.status !== 'paid' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={markingPaid === bill.id}
                      onClick={async () => {
                        try {
                          setMarkingPaid(bill.id);
                          await billingService.markBillAsPaid(bill.id);
                          await fetchBills();
                          toast({
                            title: 'Success',
                            description: 'Bill marked as paid',
                          });
                        } catch (error) {
                          console.error('Error marking bill as paid:', error);
                          toast({
                            title: 'Error',
                            description: 'Failed to mark bill as paid',
                            variant: 'destructive',
                          });
                        } finally {
                          setMarkingPaid(null);
                        }
                      }}
                    >
                      {markingPaid === bill.id ? 'Marking...' : 'Mark as Paid'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchBillDetails(bill)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      {!loading && bills.count > itemsPerPage && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {(() => {
              const totalPages = Math.ceil(bills.count / itemsPerPage);
              const maxVisiblePages = 5;
              const pages = [];
              
              if (totalPages <= maxVisiblePages) {
                // Show all pages if total pages are less than max visible
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // Always show first page
                pages.push(1);
                
                // Calculate middle pages
                let start = Math.max(2, currentPage - 1);
                let end = Math.min(totalPages - 1, currentPage + 1);
                
                // Add ellipsis after first page if needed
                if (start > 2) {
                  pages.push(-1); // -1 represents ellipsis
                }
                
                // Add middle pages
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }
                
                // Add ellipsis before last page if needed
                if (end < totalPages - 1) {
                  pages.push(-2); // -2 represents ellipsis
                }
                
                // Always show last page
                pages.push(totalPages);
              }
              
              return pages.map((pageNum, i) => (
                <PaginationItem key={i}>
                  {pageNum < 0 ? (
                    <span className="px-4">...</span>
                  ) : (
                    <PaginationLink 
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ));
            })()} 
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(bills.count / itemsPerPage), p + 1))}
                aria-disabled={currentPage === Math.ceil(bills.count / itemsPerPage)}
                className={currentPage === Math.ceil(bills.count / itemsPerPage) ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {selectedBill && (
        <>
          <PaymentDialog
            bill={selectedBill}
            open={paymentDialogOpen}
            onClose={() => {
              setPaymentDialogOpen(false);
              setSelectedBill(null);
            }}
            onPaymentSubmitted={fetchBills}
          />
          <BillDetailsDialog
            bill={selectedBill}
            open={billDetailsOpen}
            onClose={() => {
              setBillDetailsOpen(false);
              setSelectedBill(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default BillList;

