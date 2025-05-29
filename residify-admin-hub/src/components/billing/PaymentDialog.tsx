import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Bill, SharedBill } from '@/services/billing';
import { billingService } from '@/services/billing';

interface PaymentDialogProps {
  bill: Bill | SharedBill;
  open: boolean;
  onClose: () => void;
  onPaymentSubmitted: () => void;
}

const PaymentDialog = ({ bill, open, onClose, onPaymentSubmitted }: PaymentDialogProps) => {
  // Only allow payments for individual bills
  if ('resident_bills' in bill) {
    return null;
  }
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      // Create payment data
      const paymentData = {
        bill: bill.id,
        amount: bill.remaining_amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        ...(transactionId.trim() && { transaction_id: transactionId.trim() }),
        ...(notes.trim() && { notes: notes.trim() })
      };
      
      // If there's no screenshot, send JSON directly
      if (!screenshot) {
        await billingService.createPayment(paymentData);
      } else {
        // If there's a screenshot, use FormData
        const formData = new FormData();
        // Add all payment data to FormData
        Object.entries(paymentData).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        // Add the file last
        formData.append('screenshot', screenshot);
        await billingService.createPayment(formData);
      }

      // Payment request is made above
      toast({
        title: 'Success',
        description: 'Payment submitted successfully',
      });
      onPaymentSubmitted();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Pay</Label>
            <div className="text-lg font-semibold">
              ${bill.remaining_amount.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">This is the remaining amount for this bill</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any notes (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="screenshot">Payment Screenshot</Label>
            <Input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-gray-500">Optional: Upload a screenshot of your payment</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
