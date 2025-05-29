
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import ResidentDashboard from "./pages/ResidentDashboard";
import Registration from "./pages/Registration";
import ComplaintSubmission from "./pages/ComplaintSubmission";
import ComplaintsManagement from "./pages/ComplaintsManagement";
import BillingManagement from "./pages/BillingManagement";
import ExpenseManagement from "./pages/ExpenseManagement";
import StaffManagement from "./pages/StaffManagement";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import ApiDocumentation from "./pages/ApiDocumentation";
import Residents from "./pages/Residents";
import Profile from "./pages/Profile";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SnackbarProvider maxSnack={3}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/resident-dashboard" element={<ResidentDashboard />} />
            <Route path="/complaint-submission" element={<ComplaintSubmission />} />
            <Route path="/complaints-management" element={<ComplaintsManagement />} />
            <Route path="/billing-management" element={<BillingManagement />} />
            <Route path="/expense-management" element={<ExpenseManagement />} />
            <Route path="/staff-management" element={<StaffManagement />} />
            <Route path="/residents" element={<Residents />} /> {/* Add this route */}
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/api-documentation" element={<ApiDocumentation />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </SnackbarProvider>
  </QueryClientProvider>
);

export default App;
