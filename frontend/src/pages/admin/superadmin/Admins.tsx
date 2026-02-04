import { useState } from 'react';
import { AdminLayout } from '@/pages/admin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/components/dashboard/DataTable';
import { UserFormModal } from '@/pages/admin/components/modals/UserFormModal';
import { mockAdmins as initialAdmins } from '@/data/mockData';
import { Admin } from '@/types/auth'; // Ensure Admin type is exported from types/auth
import { Badge } from '@/pages/admin/components/ui/badge';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/pages/admin/components/ui/alert-dialog';

export default function SuperAdminAdmins() {
    const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
    const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Admin }>({
        open: false,
        mode: 'add',
    });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; data: Admin | null }>({
        open: false,
        data: null,
    });

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        {
            key: 'role',
            label: 'Role',
            render: (item: Admin) => (
                <span className="capitalize">{item.role.replace('_', ' ')}</span>
            )
        },
        {
            key: 'department',
            label: 'Department',
            render: (item: Admin) => item.department || '-'
        },
        {
            key: 'status',
            label: 'Status',
            render: (item: Admin) => (
                <Badge
                    variant={item.status === 'active' ? 'default' : 'secondary'}
                    className={item.status === 'active' ? 'bg-success' : ''}
                >
                    {item.status}
                </Badge>
            ),
        },
    ];

    const handleAdd = () => {
        setFormModal({ open: true, mode: 'add' });
    };

    const handleEdit = (item: Admin) => {
        setFormModal({ open: true, mode: 'edit', data: item });
    };

    const handleDelete = (item: Admin) => {
        setDeleteDialog({ open: true, data: item });
    };

    const confirmDelete = () => {
        if (deleteDialog.data) {
            setAdmins((prev) => prev.filter((a) => a.id !== deleteDialog.data!.id));
            toast.success('Admin deleted successfully');
        }
        setDeleteDialog({ open: false, data: null });
    };

    const handleSave = (data: any) => {
        if (formModal.mode === 'add') {
            const newAdmin: Admin = {
                id: String(Date.now()),
                name: data.name || '',
                email: data.email || '',
                role: data.role || 'executive',
                department: data.department,
                status: 'active',
            };
            setAdmins((prev) => [...prev, newAdmin]);
            toast.success('Admin added successfully');
        } else {
            setAdmins((prev) =>
                prev.map((a) => (a.id === formModal.data?.id ? { ...a, ...data } : a))
            );
            toast.success('Admin updated successfully');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
                    <p className="text-muted-foreground">Manage administrative access and roles</p>
                </div>

                <DataTable
                    data={admins}
                    columns={columns}
                    title="All Admins"
                    searchPlaceholder="Search admins..."
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <UserFormModal
                    open={formModal.open}
                    onClose={() => setFormModal({ open: false, mode: 'add' })}
                    onSave={handleSave}
                    type="admin"
                    initialData={formModal.data}
                    mode={formModal.mode}
                />

                <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, data: null })}>
                    <AlertDialogContent className="bg-card">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete {deleteDialog.data?.name}? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}
