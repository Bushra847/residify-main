
import React from 'react';
import { Bell, Search, Settings, User, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="w-full bg-white shadow-sm py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center md:hidden">
          {/* Mobile logo */}
          <span className="font-bold text-residify-blue-600 text-lg">Residify</span>
        </div>
        
        {/* Search bar - hidden on mobile */}
        <div className="hidden md:flex relative flex-1 max-w-md mx-4">
          {/* <Input
            type="text"
            placeholder="Search..."
            className="pl-10 rounded-full bg-gray-50"
          /> */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
            {/* <Search size={16} /> */}
          </div>
        </div>
        
        {/* Right side of header */}
        <div className="flex items-center gap-3">
          {/* <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
            <Bell size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
            <Settings size={18} />
          </Button> */}
          
          {/* User section */}
          {/* <div className="flex items-center ml-2">
            <div className="hidden md:block mr-3">
              <p className="text-xs text-muted-foreground">{user?.role || 'Not logged in'}</p>
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-residify-blue-100"
                onClick={handleLogout}
              >
                <User size={18} className="text-residify-blue-700" />
              </Button>
            </div>
          </div> */}
        </div>




        <div className="flex items-center ml-2">
            <div className="hidden md:block mr-3">
              <p className="text-sm font-medium leading-none">{user?.first_name || 'Guest'}</p>
              <p className="text-xs text-muted-foreground">{user?.role || 'Not logged in'}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 bg-residify-blue-100">
                    <AvatarFallback className="text-residify-blue-700 font-medium">
                      {user?.first_name ? user.first_name[0].toUpperCase() : "?"}
                      {user?.last_name ? user.last_name[0].toUpperCase() : ""}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium leading-none">{user?.first_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
    </header>




  );
};

export default Header;
