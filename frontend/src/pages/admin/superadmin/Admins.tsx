import { useState, useEffect } from 'react';
import { AdminLayout } from '@/pages/admin/superadmin/components/layout/AdminLayout';
import { DataTable } from '@/pages/admin/superadmin/components/dashboard/DataTable';
import { UserFormModal } from '@/pages/admin/superadmin/components/modals/UserFormModal';
import { Admin } from '@/types/auth';
import { Badge } from '@/pages/admin/superadmin/components/ui/badge';
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
} from '@/pages/admin/superadmin/components/ui/alert-dialog';

export default function SuperAdminAdmins() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [formModal, setFormModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Admin }>({
        open: false,
        mode: 'add',
    });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; data: Admin | null }>({
        open: false,
        data: null,
    });

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/users');
            const result = await response.json();
            if (result.success) {
                // Filter users to only include admin roles
                const adminRoles = [
                    'superadmin',
                    'super-admin',
                    'executiveadmin',
                    'academicadmin',
                    'exam_cell_admin',
                    'placement_cell_admin',
                    'research_development_admin',
                    'department-admin'
                ];
                const adminUsers = result.data.filter((user: any) => adminRoles.includes(user.role))
                    .map((user: any) => ({
                        id: user._id,
                        name: user.name || user.admin_name || 'N/A',
                        email: user.email,
                        role: user.role,
                        department: user.department,
                        avatar: user.avatar,
                        status: user.isActive ? 'active' : 'inactive',
                    }));
                setAdmins(adminUsers);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const columns = [
        {
            key: 'avatar',
            label: 'Photo',
            render: (item: Admin) => (
                <img
                    src={item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`}
                    alt={item.name}
                    className="w-8 h-8 rounded-full object-cover border border-border"
                />
            )
        },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        {
            key: 'role',
            label: 'Role',
            render: (item: Admin) => (
                <span className="capitalize">{item.role.replace('_', ' ').replace('-', ' ').replace('admin', ' admin')}</span>
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

    const confirmDelete = async () => {
        if (deleteDialog.data) {
            try {
                const response = await fetch(`/api/v1/users/${deleteDialog.data.id}`, {
                    method: 'DELETE',
                });
                const result = await response.json();
                if (result.success) {
                    toast.success('Admin deleted successfully');
                    fetchAdmins();
                } else {
                    toast.error(result.error || 'Failed to delete admin');
                }
            } catch (error) {
                console.error('Error deleting admin:', error);
                toast.error('Error deleting admin');
            }
        }
        setDeleteDialog({ open: false, data: null });
    };

    const handleSave = async (data: any) => {
        try {
            // Map frontend roles to backend roles if necessary
            let role = data.role;
            if (role === 'executive') role = 'executiveadmin';
            if (role === 'academic') role = 'academicadmin';

            const payload = {
                name: data.name,
                admin_name: data.name,
                email: data.email,
                role: role,
                department: data.department,
                departmentCode: data.departmentCode,
                password: '123', // Default password as per Conversation 73ff5a50-d901-4766-a1f3-c74339b4864e
                isActive: true
            };

            const url = formModal.mode === 'add' ? '/api/v1/users' : `/api/v1/users/${formModal.data?.id}`;
            const method = formModal.mode === 'add' ? 'POST' : 'PUT';

            let response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            let result = await response.json();
            if (result.success) {
                const userId = formModal.mode === 'add' ? result.data._id : formModal.data?.id;

                // Handle file upload if present
                if (data.avatarFile) {
                    const formData = new FormData();
                    formData.append('file', data.avatarFile);

                    const photoResponse = await fetch(`/api/v1/users/${userId}/photo`, {
                        method: 'PUT',
                        body: formData,
                    });
                    const photoResult = await photoResponse.json();
                    if (!photoResult.success) {
                        toast.error('Admin saved but photo upload failed');
                    }
                }

                toast.success(`Admin ${formModal.mode === 'add' ? 'added' : 'updated'} successfully`);
                setFormModal({ open: false, mode: 'add' });
                fetchAdmins();
            } else {
                toast.error(result.error || `Failed to ${formModal.mode === 'add' ? 'add' : 'update'} admin`);
            }
        } catch (error) {
            console.error('Error saving admin:', error);
            toast.error('Error saving admin');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
                    <p className="text-muted-foreground">Manage administrative access and roles</p>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                ) : (
                    <DataTable
                        data={admins}
                        columns={columns}
                        title="All Admins"
                        searchPlaceholder="Search admins..."
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}

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
