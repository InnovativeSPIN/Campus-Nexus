import React from 'react';
import { AdminLayout } from '@/pages/admin/executive/components/layout/AdminLayout';
import { FileText } from 'lucide-react';

export default function Reports() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Standard reports overview.</p>
        </div>
        <div className="bg-white border rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Reports Module</h2>
          <p className="text-gray-500 max-w-md mt-2">
            The reporting functionality has been moved to specialized modules. Please check "Audit & Reports" for detailed system audits and report generation.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
