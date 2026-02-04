import { AdminLayout } from '@/pages/admin/academic/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/admin/academic/components/ui/card';
import { dashboardStats, mockStudents, mockFaculty, mockDepartments } from '@/data/mockData';
import { FileText, Download, TrendingUp, Users, GraduationCap, Building2 } from 'lucide-react';
import { Button } from '@/pages/admin/academic/components/ui/button';
import { toast } from 'sonner';

export default function AcademicReports() {
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
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Academic Reports</h1>
          <p className="text-muted-foreground">View and download academic reports</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
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
                  <p className="text-sm text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardStats.totalDepartments}</p>
                </div>
                <Building2 className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.title} className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {report.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base text-foreground">{report.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{report.count} records</span>
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
