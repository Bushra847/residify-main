
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { complaintsService } from '@/services/complaints';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Upload, X, CheckCircle } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

const formSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  title: z.string().min(5, 'Title should be at least 5 characters'),
  description: z.string().min(20, 'Description should be at least 20 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Please select priority level',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ComplaintForm = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      title: '',
      description: '',
      priority: 'medium',

    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Validate file type and size
    const isValidType = ACCEPTED_FILE_TYPES.includes(selectedFile.type);
    const isValidSize = selectedFile.size <= MAX_FILE_SIZE;
    
    if (!isValidType) {
      toast.error(`File type not accepted: ${selectedFile.name}`);
      return;
    }
    if (!isValidSize) {
      toast.error(`File too large: ${selectedFile.name}`);
      return;
    }
    
    setFiles([selectedFile]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const simulateUpload = () => {
    setUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setUploading(true);
      
      // Create FormData if there's a file
      if (files.length > 0) {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, value.toString());
          }
        });
        formData.append('evidence', files[0]);
        
        await complaintsService.createComplaint(formData);
      } else {
        await complaintsService.createComplaint({
          title: values.title,
          description: values.description,
          category: values.category,
          priority: values.priority
        });
      }
      
      toast.success('Complaint submitted successfully!');
      form.reset();
      setFiles([]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
        Object.values(error.response?.data || {}).flat().join(', ') || 
        'Failed to submit complaint';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    "maintenance",
    "noise",
    "security",
    "cleanliness",
    "other"
  ];

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Submit a Complaint</CardTitle>
        <CardDescription>
          Fill out this form to report any issues with your unit or the property
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief title of your complaint" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide detailed information about the issue" 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Include when the issue started and any steps you've already taken.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* File upload section */}
                <div className="space-y-4 mt-6">
                  <div>
                    <FormLabel htmlFor="fileUpload">Evidence (Optional)</FormLabel>
                    <div className="mt-1 flex justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-md">
                      <div className="space-y-2 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="fileUpload"
                            className="relative cursor-pointer font-medium text-primary hover:underline"
                          >
                            <span>Upload photo or document</span>
                            <input
                              id="fileUpload"
                              name="fileUpload"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept={ACCEPTED_FILE_TYPES.join(', ')}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, PDF up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File preview */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected File</p>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <span className="text-xs font-medium text-gray-700 truncate" style={{ maxWidth: '200px' }}>
                            {files[0].name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(files[0].size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setFiles([])}
                          className="h-6 w-6"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">Uploading file...</span>
                        <span className="text-sm ml-auto">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border p-4 rounded-md bg-accent/30 flex items-start space-x-2.5">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Note about complaint tracking
                </p>
                <p className="text-sm text-muted-foreground">
                  After submitting this form, you will receive a confirmation email with a tracking number.
                  You can use this number to check the status of your complaint at any time.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="gap-2">
                <span>Submit Complaint</span>
                {files.length > 0 && <Upload size={16} />}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ComplaintForm;
