import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Keep existing context creation

// Mock users for demo
const mockUsers: Record<UserRole, User> = {
  superadmin: {
    id: '1',
    email: 'superadmin@edu.com',
    name: 'Super Admin',
    role: 'superadmin',
  },
  executive: {
    id: '2',
    email: 'executive@edu.com',
    name: 'Executive Admin',
    role: 'executive',
  },
  academic: {
    id: '3',
    email: 'academic@edu.com',
    name: 'Academic Admin',
    role: 'academic',
  },
  faculty: {
    id: '4',
    email: 'faculty@edu.com',
    name: 'Dr. John Smith',
    role: 'faculty',
    department: 'Computer Science',
  },
  student: {
    id: '5',
    email: 'student@edu.com',
    name: 'Jane Doe',
    role: 'student',
    department: 'Computer Science',
    rollNo: 'CS2024001',
    year: 3,
    semester: 5,
  },
  'department-admin': {
    id: '6',
    email: 'deptadmin@edu.com',
    name: 'Department Admin',
    role: 'department-admin',
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(() => {
    const savedUser = localStorage.getItem('eduvertex_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email: string, password: string, role: UserRole): boolean => {
    if (password === '123') {
      const userObj = { ...mockUsers[role], email };
      setUser(userObj);
      localStorage.setItem('eduvertex_user', JSON.stringify(userObj));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eduvertex_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
