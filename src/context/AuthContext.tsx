
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, UserRole } from '../types';

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

// Sample user data - in a real app, this would come from an API
const ADMIN_USER = {
  id: 'admin1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin' as UserRole
};

const SAMPLE_USERS = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user' as UserRole
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user' as UserRole
  }
];

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        isAuthenticated: true, 
        user: action.payload, 
        isLoading: false,
        error: null 
      };
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        isLoading: false, 
        error: action.payload 
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('attendanceUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: parsedUser });
      } catch (error) {
        localStorage.removeItem('attendanceUser');
      }
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // This would be an API call in a real application
      // Simulating network request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, we'd validate credentials from the backend
      // For demo purposes, we're using mock users
      if (role === 'admin' && email === 'admin@example.com' && password === 'admin123') {
        dispatch({ type: 'LOGIN_SUCCESS', payload: ADMIN_USER });
        localStorage.setItem('attendanceUser', JSON.stringify(ADMIN_USER));
        return;
      }

      const foundUser = SAMPLE_USERS.find(
        user => user.email === email && role === 'user'
      );

      // Simple password check for demo (all users use "password123")
      if (foundUser && password === 'password123') {
        dispatch({ type: 'LOGIN_SUCCESS', payload: foundUser });
        localStorage.setItem('attendanceUser', JSON.stringify(foundUser));
      } else {
        dispatch({ 
          type: 'LOGIN_FAILURE', 
          payload: 'Invalid email or password' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: 'Login failed. Please try again.' 
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('attendanceUser');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
