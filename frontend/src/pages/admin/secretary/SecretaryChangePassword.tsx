import { useState } from 'react';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import ExecutiveProtectedRoute from '@/pages/admin/executive/components/common/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/pages/admin/executive/hooks/use-toast';

export default function SecretaryChangePassword() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    } else if (formData.currentPassword && formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password cannot be the same as your current password';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token =
        localStorage.getItem('authToken') ||
        (() => {
          try {
            return JSON.parse(localStorage.getItem('campus_nexus_user') || '{}')?.token;
          } catch {
            return null;
          }
        })();

      const response = await fetch('/api/v1/auth/updatepassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: 'Success',
          description: 'Password updated successfully.',
        });

        // Update token in storage if server issued a new one
        if (result.token) {
          localStorage.setItem('authToken', result.token);
          try {
            const storedUser = JSON.parse(localStorage.getItem('campus_nexus_user') || '{}');
            storedUser.token = result.token;
            localStorage.setItem('campus_nexus_user', JSON.stringify(storedUser));
          } catch {
            // Ignore parse errors
          }
        }

        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setErrors({});
      } else {
        const errorMsg = result.error || result.message || 'Failed to update password';
        toast({
          title: 'Update Failed',
          description: errorMsg,
          variant: 'destructive',
        });

        if (errorMsg.toLowerCase().includes('current password')) {
          setErrors((prev) => ({ ...prev, currentPassword: errorMsg }));
        } else if (errorMsg.toLowerCase().includes('same')) {
          setErrors((prev) => ({ ...prev, newPassword: errorMsg }));
        }
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: 'Update Failed',
        description: 'An unexpected network or server error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ExecutiveProtectedRoute>
      <AdminLayout>
        <div className="max-w-4xl mx-auto py-2 px-2 sm:px-4">
          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800 tracking-tight">
              Profile
            </h1>
          </div>

          {/* Centered Card */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-6">
              Change Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Current Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-slate-700"
                >
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-slate-800 bg-slate-50/50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-colors ${
                      errors.currentPassword ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    aria-label={showPasswords.current ? 'Hide current password' : 'Show current password'}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-slate-700"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter your new password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-slate-800 bg-slate-50/50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-colors ${
                      errors.newPassword ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    aria-label={showPasswords.new ? 'Hide new password' : 'Show new password'}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your new password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-slate-800 bg-slate-50/50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] transition-colors ${
                      errors.confirmPassword ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    aria-label={showPasswords.confirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements Section */}
              <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 mt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold text-blue-900">Password Requirements:</p>
                    <ul className="mt-1.5 list-disc list-inside space-y-1 text-xs text-blue-800/90 leading-relaxed">
                      <li>At least 6 characters long</li>
                      <li>Use a mix of letters, numbers, and symbols</li>
                      <li>Avoid using your name or common words</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Update Password Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg bg-[#800000] hover:bg-[#660000] active:scale-[0.99] text-white font-medium text-sm transition-all duration-150 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </AdminLayout>
    </ExecutiveProtectedRoute>
  );
}
