import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Complaint, ComplaintUpdate, complaintsService } from '@/services/complaints';

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  open: 'destructive',
  in_progress: 'secondary',
  resolved: 'default',
  closed: 'outline',
};

const priorityVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  low: 'outline',
  medium: 'default',
  high: 'secondary',
  urgent: 'destructive',
};

const ComplaintsManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');

  const { user } = useAuth();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await complaintsService.getComplaints();
      setComplaints(data);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch complaints';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleUpdateClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setComment('');
    setUpdateDialogOpen(true);
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setDetailsDialogOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedComplaint || !newStatus || !comment) {
      toast.warning('Please fill in all required fields');
      return;
    }

    try {
      await complaintsService.createComplaintUpdate({
        complaint: selectedComplaint.id,
        new_status: newStatus,
        comment,
      });
      await complaintsService.updateComplaint(selectedComplaint.id, { status: newStatus });
      toast.success('Complaint updated successfully');
      setUpdateDialogOpen(false);
      fetchComplaints();
    } catch (error: any) {
      console.error('Failed to update complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to update complaint');
    }
  };

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Complaints Management</h1>
            <p className="text-muted-foreground">Review and manage resident complaints</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-destructive/15 text-destructive p-4 rounded-md">{error}</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Complaints</CardTitle>
                <CardDescription>A list of all complaints submitted by residents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell>{complaint.id}</TableCell>
                          <TableCell>{complaint.title}</TableCell>
                          <TableCell>{complaint.category}</TableCell>
                          <TableCell>
                            <Badge variant={priorityVariants[complaint.priority]}>
                              {complaint.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariants[complaint.status]}>
                              {complaint.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(complaint.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateClick(complaint)}
                              >
                                Update
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleViewDetails(complaint)}
                              >
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Complaint Status</DialogTitle>
                <DialogDescription>
                  Update the status and add a comment to this complaint.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label>Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label>Comment</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your comment here..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSubmit}>Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Complaint Details</DialogTitle>
              </DialogHeader>
              {selectedComplaint && (
                <ScrollArea className="max-h-[80vh]">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Title</h3>
                      <p>{selectedComplaint.title}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="whitespace-pre-wrap">{selectedComplaint.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Category</h3>
                        <p>{selectedComplaint.category}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Priority</h3>
                        <Badge variant={priorityVariants[selectedComplaint.priority]}>
                          {selectedComplaint.priority}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Status</h3>
                        <Badge variant={statusVariants[selectedComplaint.status]}>
                          {selectedComplaint.status}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Created</h3>
                        <p>{format(new Date(selectedComplaint.created_at), 'PPP')}</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setDetailsDialogOpen(false);
                  handleUpdateClick(selectedComplaint!);
                }}>
                  Update Status
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default ComplaintsManagement;
