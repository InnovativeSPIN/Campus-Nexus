import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  // identifier may be an email address or a student ID when role is student
  login: (identifier: string, password: string, role: UserRole) => Promise<boolean>;
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

  const login = async (identifier: string, password: string, role: UserRole): Promise<boolean> => {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPassword = password.trim();

    console.log('Login attempt:', {
      identifier: trimmedId,
      password: trimmedPassword,
      passwordLength: trimmedPassword.length,
      role
    });

    try {
      let response;
      
      // regardless of role, backend login endpoint now understands either studentId or email
      response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedId, password: trimmedPassword }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        const userObj = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role as UserRole,
          avatar: result.user.avatar || '',
          department: result.user.department || '',
          year: result.user.year,
          semester: result.user.semester,
          rollNo: result.user.rollNo,
          token: result.token
        };
        
        console.log('Login successful:', userObj.name, userObj.role);
        setUser(userObj);
        localStorage.setItem('eduvertex_user', JSON.stringify(userObj));
        localStorage.setItem('authToken', result.token);
        return true;
      }

      console.log('Login failed:', result.error || 'Unknown error');
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
