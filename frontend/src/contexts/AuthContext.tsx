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
  loginError: string | null;
  clearLoginError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Keep existing context creation

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(() => {
    try {
      const savedUser = localStorage.getItem('campus_nexus_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });

  const [loginError, setLoginError] = useState<string | null>(null);

  const clearLoginError = () => setLoginError(null);

  const login = async (identifier: string, password: string, role: UserRole): Promise<boolean> => {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPassword = password.trim();


    try {
      let response;

      // regardless of role, backend login endpoint now understands either studentId or email
      response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedId, password: trimmedPassword, requestedRole: role }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        setLoginError(null);
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
          is_class_incharge: result.user.is_class_incharge || false,
          class_incharge_class_id: result.user.class_incharge_class_id || null,
          token: result.token
        };
        console.log('Login successful:', userObj.name, userObj.role);
        // If this user is a department-admin, prefer faculty profile details
        if (userObj.role === 'department-admin') {
          try {
            const profileRes = await fetch('/api/v1/faculty/me/profile', {
              headers: { 'Authorization': `Bearer ${result.token}` }
            });
            if (profileRes.ok) {
              const ct = profileRes.headers.get('content-type') || '';
              let profileJson: any = null;
              if (ct.includes('application/json')) {
                try {
                  profileJson = await profileRes.json();
                } catch (e) {
                  console.warn('Failed to parse JSON profile response', e);
                }
              } else {
                console.warn('Non-JSON profile response, content-type=', ct);
              }
              const prof = profileJson ? (profileJson.data || profileJson) : null;
              // Merge selected faculty profile fields into userObj
              if (prof) {
                userObj.name = prof.Name || prof.name || userObj.name;
                userObj.email = prof.email || userObj.email;
                userObj.avatar = prof.avatar || prof.profile_image_url || userObj.avatar;
                userObj.designation = prof.designation || userObj.designation;
                // Normalize department to a short string to avoid rendering objects
                if (prof.department) {
                  userObj.department = typeof prof.department === 'object'
                    ? (prof.department.short_name || prof.department.full_name)
                    : prof.department;
                }
                userObj.is_timetable_incharge = prof.is_timetable_incharge || userObj.is_timetable_incharge;
                userObj.is_placement_coordinator = prof.is_placement_coordinator || userObj.is_placement_coordinator;
                userObj.is_class_incharge = prof.is_class_incharge || userObj.is_class_incharge;
                userObj.class_incharge_class_id = prof.class_incharge_class_id ?? userObj.class_incharge_class_id;
              }
            }
          } catch (err) {
            console.error('Failed to fetch faculty profile for department-admin:', err);
          }
        }

        setUser(userObj);
        localStorage.setItem('campus_nexus_user', JSON.stringify(userObj));
        localStorage.setItem('authToken', result.token);
        return true;
      }

      const errMsg = result.error || 'Invalid credentials';
      setLoginError(errMsg);
      console.log('Login failed:', errMsg);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Invalid credentials');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campus_nexus_user');
    localStorage.removeItem('authToken');
  };

  const refreshUserData = useCallback(async () => {
    // Get current user from localStorage to avoid dependency issues
    const userDataStr = localStorage.getItem('campus_nexus_user');
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
        // For admin users, prefer fetching faculty profile for department-admin role
        if (userData.role === 'department-admin') {
          response = await fetch('/api/v1/faculty/me/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          // For other admin users, use the standard getMe endpoint
          response = await fetch('/api/v1/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }

      if (response.ok) {
        const ct = response.headers.get('content-type') || '';
        let result: any = null;
        if (ct.includes('application/json')) {
          try {
            result = await response.json();
          } catch (e) {
            console.warn('Failed to parse refresh response JSON', e);
          }
        } else {
          console.warn('Non-JSON refresh response, content-type=', ct);
        }
        if (result && result.success && result.data) {
          const freshData = result.data;
          setUser(prev => {
            if (!prev) return null;

            let freshDept = freshData.department;
            if (freshDept && typeof freshDept === 'string') {
              freshDept = { short_name: freshDept, full_name: freshDept };
            }

            const updatedUser = {
              ...prev,
              name: freshData.name || freshData.Name || prev.name,
              email: freshData.email || prev.email,
              designation: freshData.designation || prev.designation,
              avatar: freshData.avatar || freshData.profile_image_url || prev.avatar,
              department: freshDept || prev.department,
              is_timetable_incharge: freshData.is_timetable_incharge || false,
              is_placement_coordinator: freshData.is_placement_coordinator || false,
              is_class_incharge: freshData.is_class_incharge || false,
              class_incharge_class_id: freshData.class_incharge_class_id ?? prev.class_incharge_class_id ?? null,
            };
            localStorage.setItem('campus_nexus_user', JSON.stringify(updatedUser));
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
      const normDept = (newData as any).department && typeof (newData as any).department === 'object'
        ? ((newData as any).department.short_name || (newData as any).department.full_name)
        : (newData as any).department;
      const merged = { ...prev, ...newData, ...(normDept ? { department: normDept } : {}) };
      const updated = merged;
      localStorage.setItem('campus_nexus_user', JSON.stringify(updated));
      return updated;
    });
  };

  // derive token from localStorage so it stays updated
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  return (
    <AuthContext.Provider value={{ user, authToken, login, logout, updateUserData, refreshUserData, loginError, clearLoginError, isAuthenticated: !!user }}>
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
