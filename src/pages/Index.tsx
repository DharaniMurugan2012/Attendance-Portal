
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/LoginForm';
import { Clock } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();

  useEffect(() => {
    if (state.isAuthenticated) {
      if (state.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [state.isAuthenticated, state.user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <Clock className="h-12 w-12 text-attendance-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-attendance-dark">TimeTrack Buddy</h1>
          <p className="text-gray-500 mt-2">Employee Attendance Management System</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Demo Credentials</p>
          <p>Admin: admin@example.com / admin123</p>
          <p>User: john@example.com / password123</p>
        </div>
      </div>
      
      <footer className="w-full text-center text-xs text-gray-400 mt-16">
        <p>&copy; 2025 TimeTrack Buddy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
