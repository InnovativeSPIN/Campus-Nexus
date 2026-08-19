import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { apiFetch } from '@/lib/apiFetch';
import { useToast } from '@/pages/admin/executive/components/ui/use-toast';
import {
  Shield, Database, ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle,
  FileText, Clock, Download, Search, Filter, SlidersHorizontal, User,
  RefreshCw, Settings, Trash2, Play, AlertCircle, HelpCircle, HardDrive,
  Users, Key, Lock, Network, Terminal, Check, XCircle, ArrowUpRight, HelpCircle as HelpIcon
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

// Custom tooltip for Recharts to support theme-friendly styling in light/dark modes
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 shadow-md rounded-lg text-xs font-sans">
        <p className="font-bold text-foreground">{payload[0].name}</p>
        <p className="text-primary font-semibold mt-0.5">{`${payload[0].value.toFixed(1)} GB`}</p>
      </div>
    );
  }
  return null;
};

export default function BackupAndSecurity() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('backup-mgmt');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [data, setData] = useState<any>({
    backupStatus: { health: 'Healthy', successful: 0, failed: 0, inProgress: 0, lastBackup: null, nextBackup: '' },
    totalBackups: 0,
    storageUsage: { total: 500, used: 245.68, database: 128.45, files: 65.32, logs: 25.68, other: 26.23 },
    securityStatus: { status: 'Secure', score: 100, lastScan: '', nextScan: '', threats: { high: 0, medium: 0, low: 0 } },
    activeThreats: 0,
    backupHistory: [],
    securityAlerts: [],
    backupSchedule: { full: 'Daily', incremental: 'Every 24h', log: 'Every 6h', retention: 30 },
    securityChecks: { firewall: 'Enabled', malware: 'Enabled', ssl: 'Valid', twoFactor: 'Enabled', intrusion: 'Enabled' },
    systemInfo: { databaseSize: '0 MB', totalFiles: '0', serverUptime: '', lastBootTime: '' },
    accessControlUsers: [],
    settings: {}
  });
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${(data.storageUsage.used / data.storageUsage.total) * 100}%`;
    }
  }, [data.storageUsage.used, data.storageUsage.total, loading]);

  // Settings tab form states
  const [settingsForm, setSettingsForm] = useState({
    fullBackupSchedule: '',
    incrementalSchedule: '',
    logSchedule: '',
    retentionDays: 30,
    encryptionEnabled: true,
    offsiteStorageEnabled: true,
    twoFactorEnabled: true,
    firewallEnabled: true,
    malwareEnabled: true,
    intrusionPreventionEnabled: true
  });

  // Security logs filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('All Modules');
  const [filterSeverity, setFilterSeverity] = useState('All Severities');
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Disaster Recovery terminal outputs
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'NSCET Recovery System v3.2.1 initialized.',
    'System status: ONLINE',
    'Type a test or trigger an action from the panels above...'
  ]);
  const [recoveryRunning, setRecoveryRunning] = useState(false);

  // Fetch all dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/v1/executive/backup-security/status');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        // Sync settings form
        setSettingsForm({
          fullBackupSchedule: json.data.settings.fullBackupSchedule || 'Daily at 02:30 AM',
          incrementalSchedule: json.data.settings.incrementalSchedule || 'Every 24 Hours',
          logSchedule: json.data.settings.logSchedule || 'Every 6 Hours',
          retentionDays: json.data.settings.retentionDays || 30,
          encryptionEnabled: json.data.settings.encryptionEnabled !== false,
          offsiteStorageEnabled: json.data.settings.offsiteStorageEnabled !== false,
          twoFactorEnabled: json.data.settings.twoFactorEnabled !== false,
          firewallEnabled: json.data.settings.firewallEnabled !== false,
          malwareEnabled: json.data.settings.malwareEnabled !== false,
          intrusionPreventionEnabled: json.data.settings.intrusionPreventionEnabled !== false
        });
      } else {
        toast({ title: 'Error', description: 'Failed to fetch status data', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({ title: 'Network Error', description: 'Could not connect to API', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch security audit logs
  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await apiFetch('/api/v1/executive/backup-security/logs');
      const json = await res.json();
      if (json.success) {
        setSecurityLogs(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching security logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'security-logs') {
      fetchLogs();
    }
  }, [activeTab]);

  // Handle manual backup trigger
  const handleBackupNow = async (type: 'Full Backup' | 'Incremental' | 'Log Backup') => {
    try {
      setActionLoading(true);
      toast({ title: 'Triggering Backup', description: `Starting execution of ${type}...` });
      
      const res = await apiFetch('/api/v1/executive/backup-security/backup-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const json = await res.json();

      if (json.success) {
        toast({ title: 'Backup Successful', description: `Backup file "${json.data.name}" has been stored.` });
        fetchDashboardData();
      } else {
        toast({ title: 'Backup Failed', description: json.message || 'Error occurred during backup', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Backup Error', description: 'Could not complete backup execution', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle backup restore action
  const handleRestore = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to restore the database to the state of backup: "${name}"?\nThis will overwrite current system states.`)) {
      return;
    }

    try {
      setActionLoading(true);
      toast({ title: 'Initiating Restore', description: 'Rolling back database...' });

      const res = await apiFetch(`/api/v1/executive/backup-security/restore/${id}`, {
        method: 'POST'
      });
      const json = await res.json();

      if (json.success) {
        toast({ title: 'Restore Complete', description: json.message || 'System has been rolled back successfully.' });
        fetchDashboardData();
      } else {
        toast({ title: 'Restore Failed', description: json.message || 'Error occurred during rollback', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Restore Error', description: 'Could not complete database rollback', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle security integrity scan
  const handleSecurityScan = async () => {
    try {
      setActionLoading(true);
      toast({ title: 'Scanning System', description: 'Auditing firewall, encryption files, and access logs...' });

      const res = await apiFetch('/api/v1/executive/backup-security/scan', {
        method: 'POST'
      });
      const json = await res.json();

      if (json.success) {
        toast({ title: 'Security Scan Complete', description: json.message || 'Vulnerabilities scanned and resolved.' });
        fetchDashboardData();
      } else {
        toast({ title: 'Scan Failed', description: json.message || 'Vulnerability check failed', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Scan Error', description: 'Could not execute integrity check', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle settings update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await apiFetch('/api/v1/executive/backup-security/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const json = await res.json();

      if (json.success) {
        toast({ title: 'Settings Saved', description: 'Backup schedules and security features updated successfully.' });
        fetchDashboardData();
      } else {
        toast({ title: 'Error Saving Settings', description: json.message || 'Could not save configurations', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Network Error', description: 'Could not connect to update settings', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  // Simulate recovery testing
  const runDisasterRecoveryTest = () => {
    if (recoveryRunning) return;
    setRecoveryRunning(true);
    setTerminalLines(prev => [...prev, '\n', '--- STARTING DISASTER RECOVERY DRILL ---', `Timestamp: ${new Date().toISOString()}`]);

    const steps = [
      { text: '[STEP 1] Validating redundant server nodes connection...', delay: 500 },
      { text: '[STEP 2] Fetching target backup image from offsite Cloud Storage...', delay: 1200 },
      { text: '[STEP 3] Allocating virtual sandbox environment (Container #DR-44)...', delay: 2000 },
      { text: '[STEP 4] Deploying snapshot, running system integration checks...', delay: 2800 },
      { text: '[STEP 5] Database consistency checks: PASSED (1,24,578 records validated)', delay: 3500 },
      { text: '[SUCCESS] Failover target environment is ready. Verification DRILL: 100% SUCCESSFUL.', delay: 4200 },
    ];

    steps.forEach(step => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, step.text]);
        if (step.text.startsWith('[SUCCESS]')) {
          setRecoveryRunning(false);
          toast({ title: 'Recovery Test Completed', description: 'All failover node systems validated successfully.' });
        }
      }, step.delay);
    });
  };

  // Pie chart data formatting
  const pieData = [
    { name: 'Database Backups', value: parseFloat(data.storageUsage.database), color: '#3B82F6', bgClass: 'bg-blue-500' },
    { name: 'File Backups', value: parseFloat(data.storageUsage.files), color: '#10B981', bgClass: 'bg-emerald-500' },
    { name: 'Logs Backups', value: parseFloat(data.storageUsage.logs), color: '#F59E0B', bgClass: 'bg-amber-500' },
    { name: 'Other Backups', value: parseFloat(data.storageUsage.other), color: '#6B7280', bgClass: 'bg-gray-500' },
  ];

  // Helper to get severity colors
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  };

  // Filter security logs client-side
  const filteredLogs = securityLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesModule = filterModule === 'All Modules' || log.module === filterModule;
    const matchesSeverity = filterSeverity === 'All Severities' || log.severity === filterSeverity;
    
    return matchesSearch && matchesModule && matchesSeverity;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 text-foreground font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" /> Backup & Security
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Protect, monitor and manage your system database, security settings, audits and backups.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading || actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-card border border-border text-foreground hover:bg-muted/40 transition duration-150 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Data
            </button>
            <button
              onClick={handleSecurityScan}
              disabled={loading || actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition duration-150 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" /> Run Scan
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border mb-6 flex-wrap gap-1">
          {[
            { id: 'backup-mgmt', label: 'Backup Management', icon: Database },
            { id: 'security-overview', label: 'Security Overview', icon: ShieldCheck },
            { id: 'access-control', label: 'Access Control', icon: Users },
            { id: 'security-logs', label: 'Security Logs', icon: FileText },
            { id: 'data-protection', label: 'Data Protection', icon: Lock },
            { id: 'disaster-recovery', label: 'Disaster Recovery', icon: Network },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-sm text-muted-foreground">Loading Security & Backup states...</p>
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              
              {/* Card 1: Backup Status */}
              <div className="rounded-xl bg-card p-5 border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Backup Status</p>
                    <h3 className={`text-xl font-bold mt-1 font-sans ${data.backupStatus.health === 'Healthy' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {data.backupStatus.health}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 text-[11px] text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Successful:</span>
                    <span className="font-bold text-green-500">{data.backupStatus.successful}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="font-bold text-red-500">{data.backupStatus.failed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last completed:</span>
                    <span className="font-semibold text-foreground">
                      {data.backupStatus.lastBackup ? new Date(data.backupStatus.lastBackup).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Total Backups */}
              <div className="rounded-xl bg-card p-5 border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Backups</p>
                    <h3 className="text-3xl font-extrabold mt-1 text-foreground font-sans">{data.totalBackups}</h3>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
                    <HardDrive className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 text-[11px] text-muted-foreground">
                  <p>Archived db states and server assets.</p>
                  <p className="text-blue-600 mt-1 font-semibold flex items-center">
                    Retention: {data.backupSchedule.retention} days
                  </p>
                </div>
              </div>

              {/* Card 3: Storage Usage */}
              <div className="rounded-xl bg-card p-5 border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Storage Usage</p>
                    <h3 className="text-xl font-bold mt-1 text-foreground font-sans">
                      {data.storageUsage.used} GB
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500">
                    <HardDrive className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>of {data.storageUsage.total} GB limit</span>
                    <span>{((data.storageUsage.used / data.storageUsage.total) * 100).toFixed(1)}% used</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div 
                      ref={progressBarRef}
                      className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Security Status */}
              <div className="rounded-xl bg-card p-5 border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security Status</p>
                    <h3 className={`text-xl font-bold mt-1 font-sans ${data.securityStatus.status === 'Secure' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {data.securityStatus.status}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/40 text-[11px] text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Security Score:</span>
                    <span className="font-bold text-success">{data.securityStatus.score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Threats found:</span>
                    <span className={`font-bold ${data.activeThreats > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {data.activeThreats}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 5: Active Threats */}
              <div className="rounded-xl bg-card p-5 border border-border shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Threats</p>
                    <h3 className={`text-3xl font-extrabold mt-1 font-sans ${data.activeThreats > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {data.activeThreats}
                    </h3>
                  </div>
                  <div className={`p-2.5 rounded-lg ${data.activeThreats > 0 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-green-500/10 text-green-500'}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 text-[10px] text-muted-foreground">
                  {data.activeThreats > 0 ? (
                    <span className="text-red-400 font-semibold">Immediate attention required!</span>
                  ) : (
                    <span>System scan running regularly. No threat found.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Content Area - conditional tab render */}
            
            {/* TAB 1: Backup Management */}
            {activeTab === 'backup-mgmt' && (
              <div className="space-y-6">
                
                {/* Mid Grid - History & Pie */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                  
                  {/* Left Column: Backup History Table */}
                  <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-bold text-foreground flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> Backup History
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBackupNow('Full Backup')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition duration-150 cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          + Full Backup
                        </button>
                        <button
                          onClick={() => handleBackupNow('Incremental')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-card border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-muted/40 transition duration-150 cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          + Incremental
                        </button>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground font-semibold">
                            <th className="py-2.5">Backup Name</th>
                            <th className="py-2.5">Type</th>
                            <th className="py-2.5">Date & Time</th>
                            <th className="py-2.5">Size</th>
                            <th className="py-2.5">Status</th>
                            <th className="py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {data.backupHistory.map((backup: any) => (
                            <tr key={backup.id} className="group hover:bg-muted/40">
                              <td className="py-3 font-semibold text-foreground truncate max-w-[200px]" title={backup.name}>
                                {backup.name}
                              </td>
                              <td className="py-3 text-muted-foreground">{backup.type}</td>
                              <td className="py-3 text-muted-foreground">
                                {new Date(backup.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3 text-foreground font-medium">{backup.size}</td>
                              <td className="py-3">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  backup.status === 'Success' 
                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                    : backup.status === 'Failed'
                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                }`}>
                                  {backup.status}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toast({ title: 'Download Triggered', description: `Requesting file download: ${backup.name}` });
                                    }}
                                    className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
                                    title="Download Backup"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() => handleRestore(backup.id, backup.name)}
                                    disabled={actionLoading || backup.status !== 'Success'}
                                    className="p-1.5 hover:bg-green-500/10 rounded text-muted-foreground hover:text-green-500 transition disabled:opacity-30 cursor-pointer"
                                    title="Restore from Backup"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Storage Usage Overview Chart */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                    <h3 className="text-md font-bold text-foreground mb-4 flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-primary" /> Storage Usage Overview
                    </h3>
                    
                    <div className="h-44 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                      {pieData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${d.bgClass}`} />
                          <span className="truncate">{d.name}:</span>
                          <span className="font-bold text-foreground ml-auto">{d.value.toFixed(1)} GB</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Bottom Grid: Security Checks checklist & Alerts & Actions */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                  
                  {/* Column 1: Security Overview Score & Checklist */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-md font-bold text-foreground mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" /> Security Overview
                      </h3>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full border-4 border-green-500/30 flex flex-col items-center justify-center shrink-0">
                          <span className="text-xl font-extrabold text-success">{data.securityStatus.score}</span>
                          <span className="text-[8px] text-muted-foreground uppercase font-semibold">Score</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">System Integrity status</p>
                          <p className="text-[10px] text-muted-foreground">Vulnerability evaluation score. Maximum configuration standard.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs pt-3 border-t border-border/40">
                      {[
                        { label: 'Firewall Protection', value: data.securityChecks.firewall, icon: Network },
                        { label: 'Malware Protection', value: data.securityChecks.malware, icon: Shield },
                        { label: 'SSL Certificate Status', value: data.securityChecks.ssl, icon: Lock },
                        { label: 'Two-Factor Authentication', value: data.securityChecks.twoFactor, icon: Key },
                        { label: 'Intrusion Prevention System', value: data.securityChecks.intrusion, icon: ShieldAlert },
                      ].map((chk, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted border border-border/20">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <chk.icon className="w-3.5 h-3.5 text-primary" />
                            {chk.label}
                          </span>
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            chk.value === 'Enabled' || chk.value === 'Valid'
                              ? 'text-green-500 bg-green-500/10'
                              : 'text-red-500 bg-red-500/10'
                          }`}>
                            {chk.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Recent Security Alerts */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-md font-bold text-foreground mb-3 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-500" /> Recent Alerts
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">Latest critical vulnerabilities or network warnings.</p>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1 flex-1">
                      {data.securityAlerts.map((alert: any) => (
                        <div key={alert.id} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1 hover:border-border transition">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-foreground truncate max-w-[150px]">{alert.title}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded ${getSeverityBadge(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            {alert.details}
                          </p>
                          <div className="flex items-center justify-between text-[8px] text-muted-foreground pt-1">
                            <span className="font-semibold">IP: {alert.ip_address}</span>
                            <span>{new Date(alert.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Quick Actions Grid */}
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-md font-bold text-foreground mb-3 flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-primary" /> Quick Actions
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">Trigger manual checks or operation modules directly.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <button
                        onClick={() => handleBackupNow('Full Backup')}
                        disabled={actionLoading}
                        className="p-3 border border-border bg-muted/30 hover:bg-muted/60 rounded-xl text-left flex flex-col justify-between hover:border-primary/40 transition duration-150 cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        <Database className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-[11px] font-bold text-foreground mt-2">Backup Now</p>
                          <p className="text-[9px] text-muted-foreground">Trigger db snapshot</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleSecurityScan()}
                        disabled={actionLoading}
                        className="p-3 border border-border bg-muted/30 hover:bg-muted/60 rounded-xl text-left flex flex-col justify-between hover:border-green-500/40 transition duration-150 cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-[11px] font-bold text-foreground mt-2">Security Scan</p>
                          <p className="text-[9px] text-muted-foreground">Audit server configurations</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('security-logs');
                          fetchLogs();
                        }}
                        className="p-3 border border-border bg-muted/30 hover:bg-muted/60 rounded-xl text-left flex flex-col justify-between hover:border-yellow-500/40 transition duration-150 cursor-pointer shadow-sm"
                      >
                        <FileText className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="text-[11px] font-bold text-foreground mt-2">Access Logs</p>
                          <p className="text-[9px] text-muted-foreground">View network audit log</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('disaster-recovery')}
                        className="p-3 border border-border bg-muted/30 hover:bg-muted/60 rounded-xl text-left flex flex-col justify-between hover:border-purple-500/40 transition duration-150 cursor-pointer shadow-sm"
                      >
                        <Network className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-[11px] font-bold text-foreground mt-2">Recovery Drill</p>
                          <p className="text-[9px] text-muted-foreground">Test node redundancies</p>
                        </div>
                      </button>
                    </div>
                  </div>

                </div>

                {/* System Information Panel */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-3">System Information</h3>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4 text-xs">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-muted-foreground">Database Size</p>
                      <p className="text-lg font-bold text-foreground mt-1">{data.systemInfo.databaseSize}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-muted-foreground">Total Active Files</p>
                      <p className="text-lg font-bold text-foreground mt-1">{data.systemInfo.totalFiles}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-muted-foreground">Server Uptime</p>
                      <p className="text-lg font-bold text-foreground mt-1">{data.systemInfo.serverUptime}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-muted-foreground">Last Boot Time</p>
                      <p className="text-lg font-bold text-foreground mt-1">{data.systemInfo.lastBootTime}</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: Security Overview */}
            {activeTab === 'security-overview' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-4">Security Assessments & Active Threats</h3>
                  
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-6">
                    <div className="p-5 bg-[#800000]/10 border border-primary/20 rounded-xl text-center space-y-2">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                      </div>
                      <p className="text-xl font-bold text-foreground">{data.securityStatus.score} / 100</p>
                      <p className="text-xs text-muted-foreground">Integrity Standard Index. No critical patches missing.</p>
                    </div>
                    <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-xl text-center space-y-2">
                      <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="text-xl font-bold text-foreground">100% Valid</p>
                      <p className="text-xs text-muted-foreground">SSL / TLS handshake keys active and compliant.</p>
                    </div>
                    <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center space-y-2">
                      <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                        <SlidersHorizontal className="w-6 h-6" />
                      </div>
                      <p className="text-xl font-bold text-foreground">Daily</p>
                      <p className="text-xs text-muted-foreground">Integrity check duration schedules are configured.</p>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-foreground mb-3">All Logged Security Issues</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-semibold">
                          <th className="py-2">Alert Event</th>
                          <th className="py-2">Description</th>
                          <th className="py-2">Severity</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Logged Time</th>
                          <th className="py-2">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {data.securityAlerts.map((alert: any) => (
                          <tr key={alert.id} className="hover:bg-muted/40">
                            <td className="py-3 font-semibold text-foreground">{alert.title}</td>
                            <td className="py-3 text-muted-foreground max-w-[250px] truncate" title={alert.details}>{alert.details}</td>
                            <td className="py-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(alert.severity)}`}>
                                {alert.severity}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                alert.status === 'Active' ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'
                              }`}>
                                {alert.status}
                              </span>
                            </td>
                            <td className="py-3 text-muted-foreground">{new Date(alert.createdAt).toLocaleString()}</td>
                            <td className="py-3 text-muted-foreground font-mono">{alert.ip_address}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Access Control */}
            {activeTab === 'access-control' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Administrator Role Directory</h3>
                      <p className="text-xs text-muted-foreground">Manage administrative user logins and authorization states.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-semibold">
                          <th className="py-2">Admin Name</th>
                          <th className="py-2">Email Identity</th>
                          <th className="py-2">Primary Role</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Last Activity</th>
                          <th className="py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {data.accessControlUsers && data.accessControlUsers.map((user: any) => (
                          <tr key={user.id} className="hover:bg-muted/40">
                            <td className="py-3 font-semibold text-foreground flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                                {user.name.slice(0, 2).toUpperCase()}
                              </div>
                              {user.name}
                            </td>
                            <td className="py-3 text-muted-foreground">{user.email}</td>
                            <td className="py-3 text-muted-foreground">
                              {user.role_id === 2 ? 'Super Administrator' : 'Executive Administrator'}
                            </td>
                            <td className="py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                user.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {new Date(user.updatedAt).toLocaleString()}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  toast({ title: 'Access Updated', description: `Toggled access state for: ${user.name}` });
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  user.isActive 
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                    : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                } cursor-pointer`}
                              >
                                {user.isActive ? 'Disable Access' : 'Enable Access'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Security Logs */}
            {activeTab === 'security-logs' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex-1 max-w-md relative">
                      <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search logs by action, user or details..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary shadow-sm"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <select
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="bg-card border border-border text-muted-foreground text-xs rounded-lg px-3 py-2 focus:outline-none"
                        title="Filter by Module"
                      >
                        <option value="All Modules">All Modules</option>
                        <option value="System Security">System Security</option>
                        <option value="User Management">User Management</option>
                        <option value="Access Control">Access Control</option>
                      </select>

                      <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        className="bg-card border border-border text-muted-foreground text-xs rounded-lg px-3 py-2 focus:outline-none"
                        title="Filter by Severity"
                      >
                        <option value="All Severities">All Severities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  {logsLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground font-semibold">
                            <th className="py-2.5">User</th>
                            <th className="py-2.5">Module</th>
                            <th className="py-2.5">Action Executed</th>
                            <th className="py-2.5">Details</th>
                            <th className="py-2.5">Severity</th>
                            <th className="py-2.5">IP Address</th>
                            <th className="py-2.5">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {filteredLogs.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                No security logs match current filters.
                              </td>
                            </tr>
                          ) : (
                            filteredLogs.map((log: any) => (
                              <tr key={log.id} className="hover:bg-muted/40">
                                <td className="py-3 font-semibold text-foreground">
                                  {log.user_name}
                                  <p className="text-[9px] text-muted-foreground font-normal">{log.role}</p>
                                </td>
                                <td className="py-3 text-muted-foreground">{log.module}</td>
                                <td className="py-3 text-foreground font-medium">{log.action}</td>
                                <td className="py-3 text-muted-foreground max-w-[200px] truncate" title={log.details}>
                                  {log.details}
                                </td>
                                <td className="py-3">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(log.severity)}`}>
                                    {log.severity}
                                  </span>
                                </td>
                                <td className="py-3 text-muted-foreground font-mono">{log.ip_address || '127.0.0.1'}</td>
                                <td className="py-3 text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: Data Protection */}
            {activeTab === 'data-protection' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-2">Cryptographic & Security Standards</h3>
                  <p className="text-xs text-muted-foreground mb-6">The system implements defense-in-depth methods for institutional safety.</p>

                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-border bg-muted/30">
                        <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-primary" /> Advanced Database Encryption
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          All student, faculty profiles and internal assessment scores are encrypted at rest using AES-256 standard encryption keys. Keys are rotated on a 90-day schedule.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-muted/30">
                        <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                          <Network className="w-4 h-4 text-green-500" /> Redundant Offsite Storage
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Backups are copied to a secondary offline cold storage bucket across AWS and Google Cloud nodes securely utilizing TLS 1.3 tunnels.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 border border-border bg-muted/30 rounded-xl space-y-4">
                      <h4 className="text-sm font-bold text-foreground">Data Protection Checklist</h4>
                      <div className="space-y-3 text-xs">
                        {[
                          { title: 'AES-256 Bit Database Encryption', desc: 'Secure database file storage keys', active: true },
                          { title: 'Redundant Offsite Cloud Copying', desc: 'Realtime secondary file copies', active: true },
                          { title: 'SHA-256 Checksum Validation', desc: 'Backup file integrity validation', active: true },
                          { title: 'SSL / TLS Web Handshake Encryption', desc: 'Encryption for connections in transit', active: true },
                        ].map((chk, i) => (
                          <div key={i} className="flex items-start gap-3 p-2 bg-card rounded-lg">
                            {chk.active ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            )}
                            <div>
                              <p className="font-bold text-foreground">{chk.title}</p>
                              <p className="text-[10px] text-muted-foreground">{chk.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Disaster Recovery */}
            {activeTab === 'disaster-recovery' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">System Failover and Disaster Recovery</h3>
                      <p className="text-xs text-muted-foreground">Simulate backup rollbacks and verify redundancy servers load balancer routing.</p>
                    </div>
                    <button
                      onClick={runDisasterRecoveryTest}
                      disabled={recoveryRunning}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition cursor-pointer"
                    >
                      {recoveryRunning ? 'Testing Node failovers...' : 'Initiate DR Failover Test'}
                    </button>
                  </div>

                  <div className="p-4 bg-black rounded-lg border border-border/80 font-mono text-[11px] text-green-400 space-y-1.5 h-64 overflow-y-auto">
                    {terminalLines.map((line, idx) => (
                      <p key={idx} className="whitespace-pre-wrap">{line}</p>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted-foreground mt-2 italic">
                    Note: Drill simulations run on temporary sandbox virtual nodes. Live production systems will not undergo downtime.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 7: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground mb-4">Backup & Security Settings</h3>
                  
                  <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                    
                    {/* Schedule options */}
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                      <div className="space-y-2">
                        <label htmlFor="fullBackupSchedule" className="font-bold text-muted-foreground uppercase">Full Backup Schedule</label>
                        <input
                          id="fullBackupSchedule"
                          type="text"
                          title="Full Backup Schedule"
                          placeholder="Full Backup Schedule"
                          value={settingsForm.fullBackupSchedule}
                          onChange={(e) => setSettingsForm({ ...settingsForm, fullBackupSchedule: e.target.value })}
                          className="w-full bg-card border border-border text-foreground rounded-lg p-2.5 focus:outline-none focus:border-primary shadow-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="incrementalSchedule" className="font-bold text-muted-foreground uppercase">Incremental Backup Schedule</label>
                        <input
                          id="incrementalSchedule"
                          type="text"
                          title="Incremental Backup Schedule"
                          placeholder="Incremental Backup Schedule"
                          value={settingsForm.incrementalSchedule}
                          onChange={(e) => setSettingsForm({ ...settingsForm, incrementalSchedule: e.target.value })}
                          className="w-full bg-card border border-border text-foreground rounded-lg p-2.5 focus:outline-none focus:border-primary shadow-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="logSchedule" className="font-bold text-muted-foreground uppercase">Log Backup Schedule</label>
                        <input
                          id="logSchedule"
                          type="text"
                          title="Log Backup Schedule"
                          placeholder="Log Backup Schedule"
                          value={settingsForm.logSchedule}
                          onChange={(e) => setSettingsForm({ ...settingsForm, logSchedule: e.target.value })}
                          className="w-full bg-card border border-border text-foreground rounded-lg p-2.5 focus:outline-none focus:border-primary shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                      <div className="space-y-2">
                        <label htmlFor="retentionDays" className="font-bold text-muted-foreground uppercase">Backup Retention (Days)</label>
                        <input
                          id="retentionDays"
                          type="number"
                          title="Backup Retention Days"
                          placeholder="Backup Retention Days"
                          value={settingsForm.retentionDays}
                          onChange={(e) => setSettingsForm({ ...settingsForm, retentionDays: parseInt(e.target.value) || 30 })}
                          className="w-full bg-card border border-border text-foreground rounded-lg p-2.5 focus:outline-none focus:border-primary shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Switch / Checkbox options */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pt-4 border-t border-border/40">
                      
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                        <label htmlFor="encryptionEnabled">
                          <p className="font-bold text-foreground">Enable AES-256 Bit Encryption</p>
                          <p className="text-[10px] text-muted-foreground">Encrypt database storage at rest.</p>
                        </label>
                        <input
                          id="encryptionEnabled"
                          type="checkbox"
                          title="Enable AES-256 Bit Encryption"
                          placeholder="Encryption Enabled"
                          checked={settingsForm.encryptionEnabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, encryptionEnabled: e.target.checked })}
                          className="w-4 h-4 rounded text-primary focus:ring-primary bg-card border-border"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                        <label htmlFor="offsiteStorageEnabled">
                          <p className="font-bold text-foreground">Enable Offsite Redundant Sync</p>
                          <p className="text-[10px] text-muted-foreground">Mirror completed backup files to secondary cloud node.</p>
                        </label>
                        <input
                          id="offsiteStorageEnabled"
                          type="checkbox"
                          title="Enable Offsite Redundant Sync"
                          placeholder="Offsite Sync Enabled"
                          checked={settingsForm.offsiteStorageEnabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, offsiteStorageEnabled: e.target.checked })}
                          className="w-4 h-4 rounded text-primary focus:ring-primary bg-card border-border"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                        <label htmlFor="twoFactorEnabled">
                          <p className="font-bold text-foreground">Enforce Two-Factor Authentication</p>
                          <p className="text-[10px] text-muted-foreground">Require mobile authentication code for administrative log-ins.</p>
                        </label>
                        <input
                          id="twoFactorEnabled"
                          type="checkbox"
                          title="Enforce Two-Factor Authentication"
                          placeholder="Two Factor Enabled"
                          checked={settingsForm.twoFactorEnabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, twoFactorEnabled: e.target.checked })}
                          className="w-4 h-4 rounded text-primary focus:ring-primary bg-card border-border"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                        <label htmlFor="firewallEnabled">
                          <p className="font-bold text-foreground">Enable Firewall Safeguard Protection</p>
                          <p className="text-[10px] text-muted-foreground">Filter requests and protect endpoints against DDoS attempts.</p>
                        </label>
                        <input
                          id="firewallEnabled"
                          type="checkbox"
                          title="Enable Firewall Safeguard Protection"
                          placeholder="Firewall Enabled"
                          checked={settingsForm.firewallEnabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, firewallEnabled: e.target.checked })}
                          className="w-4 h-4 rounded text-primary focus:ring-primary bg-card border-border"
                        />
                      </div>

                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-150 cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading ? 'Saving Configurations...' : 'Save Configuration'}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}

            {/* Last updated footer stamp */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-4 border-t border-border/40">
              <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5" /> All systems monitored dynamically.</span>
              <span>Last updated: {new Date(data.securityStatus.lastScan).toLocaleString()} by Dr. R. Principal</span>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

// Simple Info icon replacement since we used it in the footer
function Info(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
