
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { Clock, LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-attendance-primary mr-2" />
            <span className="font-bold text-xl text-attendance-primary">TimeTrack Buddy</span>
          </div>
          
          {state.isAuthenticated && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">
                  {state.user?.name} 
                  <span className="ml-1 text-xs text-gray-500 capitalize">
                    ({state.user?.role})
                  </span>
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-700 hover:text-attendance-primary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
