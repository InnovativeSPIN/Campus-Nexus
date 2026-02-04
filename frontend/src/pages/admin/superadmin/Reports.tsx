import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/admin/superadmin/components/ui/card';
import { dashboardStats, mockStudents, mockFaculty, mockDepartments } from '@/data/mockData';
import { FileText, Download, TrendingUp, Users, GraduationCap, Building2 } from 'lucide-react';
import { Button } from '@/pages/admin/superadmin/components/ui/button';
import { toast } from 'sonner';

export default function SuperAdminReports() {
  const handleDownload = (reportType: string) => {
    toast.success(`${reportType} report downloaded successfully`);
  };

  const reports = [
    {
      title: 'Student Enrollment Report',
      description: 'Complete list of all enrolled students with their details',
      icon: <GraduationCap className="h-5 w-5" />,
      count: mockStudents.length,
    },
    {
      title: 'Faculty Report',
      description: 'All faculty members with department and designation',
      icon: <Users className="h-5 w-5" />,
      count: mockFaculty.length,
    },
    {
      title: 'Department Report',
      description: 'Department-wise distribution of students and faculty',
      icon: <Building2 className="h-5 w-5" />,
      count: mockDepartments.length,
    },
    {
      title: 'Performance Report',
      description: 'Overall institution performance metrics',
      icon: <TrendingUp className="h-5 w-5" />,
      count: null,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and download institutional reports</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardStats.totalStudents}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Faculty</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardStats.totalFaculty}</p>
                </div>
                <Users className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Graduation Rate</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardStats.graduationRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardStats.attendanceRate}%</p>
                </div>
                <FileText className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.title} className="border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {report.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground">{report.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {report.count !== null && (
                    <span className="text-sm text-muted-foreground">
                      {report.count} records
                    </span>
                  )}
                  {report.count === null && <span />}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report.title)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
