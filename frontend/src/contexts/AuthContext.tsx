import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUserData: (newData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Keep existing context creation

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(() => {
    try {
      const savedUser = localStorage.getItem('eduvertex_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Dummy credentials for development
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    console.log('Login attempt:', {
      email: trimmedEmail,
      password: trimmedPassword,
      passwordLength: trimmedPassword.length,
      role,
      emailMatch: trimmedEmail === 'faculty@nscet.org',
      passwordMatch: trimmedPassword === 'password123',
      roleMatch: role === 'faculty'
    });

    if (role === 'faculty' && trimmedEmail === 'faculty@nscet.org' && trimmedPassword === 'password123') {
      console.log('Faculty dummy login success');
      const dummyFaculty = {
        id: 'mock-faculty-id',
        email: 'faculty@nscet.org',
        name: 'C. Prathap',
        role: 'faculty' as UserRole,
        avatar: '',
        department: 'Artificial Intelligence and Data Science'
      };
      setUser(dummyFaculty);
      localStorage.setItem('eduvertex_user', JSON.stringify(dummyFaculty));
      return true;
    }

    if (role === 'student' && trimmedEmail === 'student@nscet.org' && trimmedPassword === 'student123') {
      console.log('Student dummy login success');
      const dummyStudent = {
        id: 'mock-student-id',
        email: 'student@nscet.org',
        name: 'Test Student',
        role: 'student' as UserRole,
        avatar: '',
        department: 'Computer Science Engineering',
        year: 3,
        semester: 6,
        rollNo: '21CS001'
      };
      setUser(dummyStudent);
      localStorage.setItem('eduvertex_user', JSON.stringify(dummyStudent));
      return true;
    }

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        const userObj = {
          id: result.data?._id || result.user?.id || result.data?.id,
          email: result.data?.email || result.user?.email,
          name: result.data?.name || result.data?.admin_name || result.user?.name || 'Admin',
          role: role,
          avatar: result.data?.avatar || result.user?.avatar,
          department: result.data?.department || result.user?.department,
          year: result.data?.year || result.user?.year,
          semester: result.data?.semester || result.user?.semester,
          rollNo: result.data?.rollNo || result.user?.rollNo,
          token: result.token
        };
        setUser(userObj);
        localStorage.setItem('eduvertex_user', JSON.stringify(userObj));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eduvertex_user');
  };

  const updateUserData = (newData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newData };
      localStorage.setItem('eduvertex_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserData, isAuthenticated: !!user }}>
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
