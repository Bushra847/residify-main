
import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { MessageSquare, Phone, Mail, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Help = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect if user is not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  const handleSendMessage = () => {
    toast({
      title: "Message Sent",
      description: "Your message has been sent to support. We'll respond shortly.",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-16 md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Help & Support</h1>
            <p className="text-muted-foreground">Get assistance with the Residify platform</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Find answers to common questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>How do I submit a maintenance request?</AccordionTrigger>
                      <AccordionContent>
                        You can submit a maintenance request through the "Submit Complaint" page. Navigate there using the sidebar, fill out the form with details about the issue, and click "Submit". Our maintenance team will receive your request and respond accordingly.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>When are monthly bills due?</AccordionTrigger>
                      <AccordionContent>
                        Monthly bills are typically due on the 1st of each month. You can view your upcoming payments and due dates on the "Billing Management" page. We recommend setting up automatic payments to avoid any late fees.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>How are maintenance costs divided among residents?</AccordionTrigger>
                      <AccordionContent>
                        Maintenance costs are divided equally among all residents. You can view the detailed breakdown of expenses on the "Expenses Breakdown" page, which shows how each cost contributes to your monthly fees.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Can I pay my bills online?</AccordionTrigger>
                      <AccordionContent>
                        Yes, you can pay your bills online through the "Billing Management" page. We accept various payment methods including credit/debit cards and bank transfers. You can also set up recurring payments for convenience.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger>How do I update my contact information?</AccordionTrigger>
                      <AccordionContent>
                        You can update your contact information on the "Settings" page under the "Profile" tab. Make sure to keep your information current so we can reach you for important communications.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6">
                      <AccordionTrigger>Who do I contact for emergencies?</AccordionTrigger>
                      <AccordionContent>
                        For emergencies that require immediate attention (such as water leaks, power outages, or security concerns), please call our emergency hotline at (555) 911-0000. For non-emergency issues, submit a request through the portal.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Send us a message and we'll get back to you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue={user.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user.email} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="Enter the subject of your message" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Describe your issue or question in detail"
                        rows={5}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSendMessage}>
                        <MessageSquare size={16} className="mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Ways to reach our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-muted p-2 rounded-md">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Phone Support</h4>
                      <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-5PM</p>
                      <a href="tel:+15551234567" className="text-sm text-blue-600 hover:underline">
                        (555) 123-4567
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-muted p-2 rounded-md">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Email Support</h4>
                      <p className="text-sm text-muted-foreground">24/7 Response</p>
                      <a href="mailto:support@residify.com" className="text-sm text-blue-600 hover:underline">
                        support@residify.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-muted p-2 rounded-md">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">Emergency Line</h4>
                      <p className="text-sm text-muted-foreground">24/7 Emergency Support</p>
                      <a href="tel:+15559110000" className="text-sm text-blue-600 hover:underline">
                        (555) 911-0000
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                  <CardDescription>Helpful guides and documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    User Guide
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Resident Handbook
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Payment Instructions
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Community Rules
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Office Hours</CardTitle>
                  <CardDescription>When you can visit us in person</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Located in Building A, Ground Floor
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Help;
