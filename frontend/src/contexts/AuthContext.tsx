import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  authToken: string | null; // JWT stored separately
  // identifier may be an email address or a student ID when role is student
  login: (identifier: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUserData: (newData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
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
          let departmentObj = result.user.department;
          // If department is a string, convert to object with short_name
          if (departmentObj && typeof departmentObj === 'string') {
            departmentObj = { short_name: departmentObj, full_name: departmentObj };
          }
          const userObj = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role as UserRole,
            avatar: result.user.avatar || '',
            department: departmentObj || null,
            designation: result.user.designation || '',
            year: result.user.year,
            semester: result.user.semester,
            rollNo: result.user.rollNo,
            is_timetable_incharge: result.user.is_timetable_incharge || false,
            is_placement_coordinator: result.user.is_placement_coordinator || false,
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

  const refreshUserData = useCallback(async () => {
    // Get current user from localStorage to avoid dependency issues
    const userDataStr = localStorage.getItem('eduvertex_user');
    if (!userDataStr) return;
    
    try {
      const userData = JSON.parse(userDataStr);
      if (!userData || !userData.role) return;

      const token = localStorage.getItem('authToken');
      let response;
      
      // Fetch fresh user data based on role
      if (userData.role === 'faculty') {
        response = await fetch('/api/v1/faculty/me/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else if (userData.role === 'student') {
        response = await fetch('/api/v1/student/me/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // For admin users, use the standard getMe endpoint
        response = await fetch('/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const freshData = result.data;
          setUser(prev => {
            if (!prev) return null;
            const updatedUser = {
              ...prev,
              name: freshData.name || freshData.Name || prev.name,
              email: freshData.email || prev.email,
              designation: freshData.designation || prev.designation,
              avatar: freshData.avatar || freshData.profile_image_url || prev.avatar,
              is_timetable_incharge: freshData.is_timetable_incharge || false,
              is_placement_coordinator: freshData.is_placement_coordinator || false
            };
            localStorage.setItem('eduvertex_user', JSON.stringify(updatedUser));
            return updatedUser;
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, []);

  const updateUserData = (newData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newData };
      localStorage.setItem('eduvertex_user', JSON.stringify(updated));
      return updated;
    });
  };

  // derive token from localStorage so it stays updated
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  return (
    <AuthContext.Provider value={{ user, authToken, login, logout, updateUserData, refreshUserData, isAuthenticated: !!user }}>
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
