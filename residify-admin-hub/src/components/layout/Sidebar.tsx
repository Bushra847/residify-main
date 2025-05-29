
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  ChevronLeft,
  Settings, 
  HelpCircle,
  ChevronRight,
  Bell,
  LayoutDashboard,
  Upload,
  Download,
  DollarSign,
  PieChart,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, 
  icon, 
  label, 
  isActive = false,
  isCollapsed 
}) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

interface NavLinkGroupProps {
  title: string;
  children: React.ReactNode;
  isCollapsed: boolean;
}

const NavLinkGroup: React.FC<NavLinkGroupProps> = ({ title, children, isCollapsed }) => {
  return (
    <div className="mt-6">
      {!isCollapsed && (
        <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <nav className="mt-1 space-y-1">{children}</nav>
    </div>
  );
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "h-screen fixed left-0 top-0 z-30 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar header/logo area */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-residify-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-sidebar-foreground font-bold text-lg">Residify</span>
          </Link>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg bg-sidebar-accent/50 text-sidebar-foreground hover:bg-sidebar-accent ml-auto"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* Dashboard section */}
        <NavLinkGroup title="Dashboard" isCollapsed={isCollapsed}>
          <SidebarLink
            to={isAdmin ? "/admin-dashboard" : "/resident-dashboard"}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            isActive={location.pathname === (isAdmin ? "/admin-dashboard" : "/resident-dashboard")}
            isCollapsed={isCollapsed}
          />
        </NavLinkGroup>

        {/* Management section - only for admins */}
        {isAdmin && (
          <NavLinkGroup title="Management" isCollapsed={isCollapsed}>
            <SidebarLink
              to="/residents"
              icon={<Users size={20} />}
              label="Residents"
              isActive={location.pathname === "/residents"}
              isCollapsed={isCollapsed}
            />
            {/* <SidebarLink
              to="/registration"
              icon={<Upload size={20} />}
              label="Registration"
              isActive={location.pathname === "/registration"}
              isCollapsed={isCollapsed}
            /> */}
            <SidebarLink
              to="/complaints-management"
              icon={<Bell size={20} />}
              label="Complaints"
              isActive={location.pathname === "/complaints-management"}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              to="/billing-management"
              icon={<DollarSign size={20} />}
              label="Billing Management"
              isActive={location.pathname === "/billing-management"}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              to="/expense-management"
              icon={<PieChart size={20} />}
              label="Expense Management"
              isActive={location.pathname === "/expense-management"}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              to="/staff-management"
              icon={<UserCog size={20} />}
              label="Staff Management"
              isActive={location.pathname === "/staff-management"}
              isCollapsed={isCollapsed}
            />
            {/* <SidebarLink
              to="/reports"
              icon={<Download size={20} />}
              label="Reports"
              isActive={location.pathname === "/reports"}
              isCollapsed={isCollapsed}
            /> */}
          </NavLinkGroup>
        )}
        
        {/* Resident section - for residents */}
        {!isAdmin && (
          <NavLinkGroup title="Resident" isCollapsed={isCollapsed}>
            <SidebarLink
              to="/complaint-submission"
              icon={<Bell size={20} />}
              label="Submit Complaint"
              isActive={location.pathname === "/complaint-submission"}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              to="/billing-management"
              icon={<DollarSign size={20} />}
              label="Billing Management"
              isActive={location.pathname === "/billing-management"}
              isCollapsed={isCollapsed}
            />
            <SidebarLink
              to="/expense-management"
              icon={<PieChart size={20} />}
              label="Expense Management"
              isActive={location.pathname === "/expense-management"}
              isCollapsed={isCollapsed}
            />
            {/* <SidebarLink
              to="/documents"
              icon={<FileText size={20} />}
              label="Documents"
              isActive={location.pathname === "/documents"}
              isCollapsed={isCollapsed}
            /> */}
          </NavLinkGroup>
        )}

        {/* Support section */}
        <NavLinkGroup title="Support" isCollapsed={isCollapsed}>
          <SidebarLink
            to="/settings"
            icon={<Settings size={20} />}
            label="Settings"
            isActive={location.pathname === "/settings"}
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            to="/help"
            icon={<HelpCircle size={20} />}
            label="Help & Support"
            isActive={location.pathname === "/help"}
            isCollapsed={isCollapsed}
          />
        </NavLinkGroup>
      </div>
    </aside>
  );
};

export default Sidebar;
