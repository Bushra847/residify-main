
import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Download, Eye, FileText, Search, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Documents = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('lease');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  // Mock documents data
  const leaseDocuments = [
    { id: 'DOC-2025-001', name: 'Lease Agreement', type: 'PDF', size: '1.2 MB', date: '2025-01-10' },
    { id: 'DOC-2025-002', name: 'Lease Addendum', type: 'PDF', size: '0.8 MB', date: '2025-01-10' },
    { id: 'DOC-2025-003', name: 'Parking Agreement', type: 'PDF', size: '0.5 MB', date: '2025-01-10' }
  ];
  
  const propertyDocuments = [
    { id: 'DOC-2025-004', name: 'Building Rules', type: 'PDF', size: '0.7 MB', date: '2025-02-15' },
    { id: 'DOC-2025-005', name: 'Moving Instructions', type: 'PDF', size: '0.6 MB', date: '2025-02-15' },
    { id: 'DOC-2025-006', name: 'Amenities Guide', type: 'PDF', size: '1.5 MB', date: '2025-02-15' }
  ];
  
  const financialDocuments = [
    { id: 'DOC-2025-007', name: 'Payment Receipt - March', type: 'PDF', size: '0.3 MB', date: '2025-03-05' },
    { id: 'DOC-2025-008', name: 'Payment Receipt - April', type: 'PDF', size: '0.3 MB', date: '2025-04-05' },
    { id: 'DOC-2025-009', name: 'Annual Statement 2024', type: 'PDF', size: '0.9 MB', date: '2025-01-15' }
  ];

  const handleViewDocument = (documentId: string) => {
    toast({
      title: "Opening Document",
      description: `Opening document ${documentId} for viewing.`,
    });
  };

  const handleDownloadDocument = (documentId: string) => {
    toast({
      title: "Document Downloaded",
      description: `Document ${documentId} has been downloaded.`,
    });
  };

  const handleUploadDocument = () => {
    toast({
      title: "Upload Started",
      description: "Please select a document to upload.",
    });
  };

  // Function to render the appropriate document list based on active tab
  const renderDocumentList = () => {
    let documents;
    
    if (activeTab === 'lease') {
      documents = leaseDocuments;
    } else if (activeTab === 'property') {
      documents = propertyDocuments;
    } else {
      documents = financialDocuments;
    }
    
    return (
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left font-medium">Document</th>
              <th className="h-10 px-4 text-left font-medium hidden md:table-cell">Type</th>
              <th className="h-10 px-4 text-left font-medium hidden md:table-cell">Size</th>
              <th className="h-10 px-4 text-left font-medium hidden md:table-cell">Date</th>
              <th className="h-10 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className={activeTab === 'lease' ? 'text-blue-500' : activeTab === 'property' ? 'text-green-500' : 'text-amber-500'} />
                    <span>{doc.name}</span>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">{doc.type}</td>
                <td className="p-4 hidden md:table-cell">{doc.size}</td>
                <td className="p-4 hidden md:table-cell">{doc.date}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDocument(doc.id)}>
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc.id)}>
                      <Download size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Documents</h1>
              <p className="text-muted-foreground">Manage and access your documents</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={handleUploadDocument}>
                <Upload size={16} className="mr-2" />
                Upload Document
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-8" />
            </div>

            <Card>
              <CardHeader className="pb-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-2">
                    <TabsTrigger value="lease">Lease Documents</TabsTrigger>
                    <TabsTrigger value="property">Property Information</TabsTrigger>
                    <TabsTrigger value="financial">Financial Documents</TabsTrigger>
                  </TabsList>
                </Tabs>
                <CardTitle>
                  {activeTab === 'lease' && "Lease Documents"}
                  {activeTab === 'property' && "Property Information"}
                  {activeTab === 'financial' && "Financial Documents"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsContent value="lease">
                    {renderDocumentList()}
                  </TabsContent>
                  <TabsContent value="property">
                    {renderDocumentList()}
                  </TabsContent>
                  <TabsContent value="financial">
                    {renderDocumentList()}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...financialDocuments, ...leaseDocuments].slice(0, 3).map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                      <div className="bg-muted p-6 flex items-center justify-center">
                        <FileText size={48} className="text-muted-foreground" />
                      </div>
                      <CardContent className="p-4">
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{doc.date} • {doc.size}</p>
                        </div>
                        <div className="flex mt-3 gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc.id)}>
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadDocument(doc.id)}>
                            <Download size={14} className="mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Documents;
