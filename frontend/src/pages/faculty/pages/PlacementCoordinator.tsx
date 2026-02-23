import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  TrendingUp,
  Users,
  Briefcase,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

interface PlacementStats {
  totalStudents: number;
  placedStudents: number;
  placementPercentage: string;
  averagePackage: number;
}

interface PlacementDrive {
  id: number;
  company_name: string;
  position: string;
  package: string;
  date: string;
  description?: string;
}

export default function PlacementCoordinator() {
  const { user, refreshUserData } = useAuth();
  const refreshedRef = useRef(false);
  const [stats, setStats] = useState<PlacementStats | null>(null);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDriveForm, setShowDriveForm] = useState(false);
  const [driveFormData, setDriveFormData] = useState({
    company_name: '',
    position: '',
    package: '',
    date: '',
    description: '',
  });

  useEffect(() => {
    // Refresh user data once when component mounts to get latest coordinator status
    if (!refreshedRef.current) {
      refreshedRef.current = true;
      refreshUserData();
    }
  }, [refreshUserData]);

  useEffect(() => {
    if (user?.is_placement_coordinator) {
      fetchPlacementData();
    }
  }, [user?.is_placement_coordinator]);

  const checkIfPlacementCoordinator = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Access Denied</h2>
          <p className="text-slate-400 text-center">
            You are not assigned as a Placement Coordinator. Please contact your Department Admin.
          </p>
        </div>
      </div>
    );
  };

  const fetchPlacementData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch stats
      const statsResponse = await fetch('/api/v1/faculty/placement/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch drives
      const drivesResponse = await fetch('/api/v1/faculty/placement/drives', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (drivesResponse.ok) {
        const drivesData = await drivesResponse.json();
        setDrives(drivesData.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load placement data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driveFormData.company_name || !driveFormData.position || !driveFormData.package) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/faculty/placement/drives', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driveFormData),
      });

      if (!response.ok) throw new Error('Failed to create drive');

      await fetchPlacementData();
      setShowDriveForm(false);
      setDriveFormData({
        company_name: '',
        position: '',
        package: '',
        date: '',
        description: '',
      });

      toast.success('Placement drive created successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create placement drive');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.is_placement_coordinator) {
    return checkIfPlacementCoordinator();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Placement Coordination</h1>
            <p className="text-slate-400">Manage placements and recruitment drives</p>
          </div>
          <button
            onClick={() => setShowDriveForm(!showDriveForm)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Drive
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Placed Students</p>
                  <p className="text-3xl font-bold text-white">{stats.placedStudents}</p>
                </div>
                <Briefcase className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Placement %</p>
                  <p className="text-3xl font-bold text-white">{stats.placementPercentage}%</p>
                </div>
                <BarChart3 className="w-10 h-10 text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Avg Package</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.averagePackage > 0 ? `₹${stats.averagePackage}L` : 'TBD'}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Drive Form */}
        {showDriveForm && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Placement Drive</h2>
            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={driveFormData.company_name}
                    onChange={(e) => setDriveFormData({ ...driveFormData, company_name: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Position *</label>
                  <input
                    type="text"
                    value={driveFormData.position}
                    onChange={(e) => setDriveFormData({ ...driveFormData, position: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="Enter job position"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Package (LPA) *</label>
                  <input
                    type="text"
                    value={driveFormData.package}
                    onChange={(e) => setDriveFormData({ ...driveFormData, package: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="Enter package"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Drive Date</label>
                  <input
                    type="date"
                    value={driveFormData.date}
                    onChange={(e) => setDriveFormData({ ...driveFormData, date: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={driveFormData.description}
                  onChange={(e) => setDriveFormData({ ...driveFormData, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                  rows={3}
                  placeholder="Enter drive details"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Drive
                </button>
                <button
                  type="button"
                  onClick={() => setShowDriveForm(false)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Drives List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">Upcoming Drives</h2>
          {loading && !showDriveForm ? (
            <div className="flex items-center justify-center min-h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : drives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {drives.map((drive) => (
                <div
                  key={drive.id}
                  className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{drive.company_name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <p className="text-slate-400">Position</p>
                      <p className="text-white font-medium">{drive.position}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-slate-400">Package</p>
                      <p className="text-white font-medium">{drive.package} LPA</p>
                    </div>
                    {drive.date && (
                      <div className="flex justify-between items-center">
                        <p className="text-slate-400">Date</p>
                        <p className="text-white font-medium">
                          {new Date(drive.date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  {drive.description && (
                    <p className="text-slate-300 text-sm">{drive.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
              <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No placement drives scheduled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
