import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, UserRole } from '@/types/auth';
import { normalizeImageUrl } from '@/utils/imageUrl';

interface AuthContextType {
  user: User | null;
  authToken: string | null; // JWT stored separately
  // identifier may be an email address or a student ID when role is student
  login: (identifier: string, password: string, role?: UserRole) => Promise<boolean>;
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
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.avatar) {
          parsed.avatar = normalizeImageUrl(parsed.avatar) || parsed.avatar;
        }
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });

  const [authToken, setAuthTokenState] = useState<string | null>(() => {
    return localStorage.getItem('authToken');
  });

  const [loginError, setLoginError] = useState<string | null>(null);

  const clearLoginError = () => setLoginError(null);

  const login = async (identifier: string, password: string, role?: UserRole): Promise<boolean> => {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPassword = password.trim();


    try {
      let response;

      const bodyData: any = { email: trimmedId, password: trimmedPassword };
      if (role) {
        bodyData.requestedRole = role;
      }

      response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (result.success && result.user) {
        setLoginError(null);
        let departmentObj = result.user.department;
        // If department is a string, convert to object with short_name
        if (departmentObj && typeof departmentObj === 'string') {
          departmentObj = { short_name: departmentObj, full_name: departmentObj };
        }
        const rawRole = result.user.role;
        const normalizedRole = (typeof rawRole === 'object' ? (rawRole.role_name || rawRole.name) : rawRole) || role;

        const userObj: any = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: normalizedRole as UserRole,
          avatar: normalizeImageUrl(result.user.avatar) || '',
          department: departmentObj || null,
          designation: result.user.designation || '',
          year: result.user.year,
          semester: result.user.semester,
          rollNo: result.user.rollNo,
          token: result.token
        };
        console.log('Login successful:', userObj.name, userObj.role);
        
        // Extract department_id from JWT token immediately
        try {
          if (result.token) {
            const parts = result.token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              console.log('[AUTH] JWT payload:', payload);
              
              if (payload.department_id) {
                userObj.department_id = payload.department_id;
                console.log('[AUTH] Set department_id from JWT token:', payload.department_id);
              }
            }
          }
        } catch (err) {
          console.warn('[AUTH] Failed to decode JWT token:', err);
        }
        
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
                userObj.avatar = normalizeImageUrl(prof.avatar || prof.profile_image_url || userObj.avatar) || '';
                userObj.designation = prof.designation || userObj.designation;
                
                console.log('[AUTH] Faculty profile received:', {
                  has_department_id: !!prof.department_id,
                  department_id: prof.department_id,
                  has_department: !!prof.department,
                  department: prof.department
                });
                
                // Store department_id for API calls - try multiple names
                if (prof.department_id) {
                  userObj.department_id = prof.department_id;
                  console.log('[AUTH] Set department_id from prof.department_id:', prof.department_id);
                } else if (prof.departmentId) {
                  userObj.department_id = prof.departmentId;
                  console.log('[AUTH] Set department_id from prof.departmentId:', prof.departmentId);
                }
                
                // Also normalize department to a short string to avoid rendering objects
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

        // Persist to localStorage BEFORE updating state to avoid race conditions with redirects
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('campus_nexus_user', JSON.stringify(userObj));
        
        setUser(userObj);
        setAuthTokenState(result.token);

        // Fetch timetable-related role flags (class coordinator / timetable incharge) - only for faculty roles
        const userRole = userObj.role || userObj.position;
        if (userRole === 'faculty' || userRole === 'department-admin') {
          try {
            const rolesRes = await fetch('/api/v1/faculty/me/timetable-roles', {
              headers: { 'Authorization': `Bearer ${result.token}` }
            });
            if (rolesRes.ok) {
              const rolesJson = await rolesRes.json();
              if (rolesJson.success && rolesJson.data) {
                const updated = {
                  ...userObj,
                  is_timetable_incharge: rolesJson.data.isTimetableIncharge || false,
                  is_class_incharge: rolesJson.data.isClassCoordinator || false
                };
                localStorage.setItem('campus_nexus_user', JSON.stringify(updated));
                setUser(updated);
              }
            }
          } catch (err) {
            console.warn('Failed to fetch timetable role flags:', err);
          }
        }

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
    localStorage.removeItem('campus_nexus_user');
    localStorage.removeItem('authToken');
    setUser(null);
    setAuthTokenState(null);
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
              avatar: normalizeImageUrl(freshData.avatar || freshData.profile_image_url || prev.avatar) || prev.avatar,
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
      const normAvatar = newData.avatar ? normalizeImageUrl(newData.avatar) : undefined;
      const merged = { ...prev, ...newData, ...(normDept ? { department: normDept } : {}), ...(normAvatar ? { avatar: normAvatar } : {}) };
      const updated = merged;
      localStorage.setItem('campus_nexus_user', JSON.stringify(updated));
      return updated;
    });
  };

  // No need to derive from localStorage anymore as we have authToken state

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
