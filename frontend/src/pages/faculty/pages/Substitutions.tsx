import { useEffect, useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const Substitutions = () => {
    const [alterations, setAlterations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { authToken, user } = useAuth();

    useEffect(() => {
        fetchAlterations();
    }, []);

    const fetchAlterations = async () => {
        try {
            const token = authToken || localStorage.getItem('authToken');
            // Filter by department_id for security - only show substitutions for this department
            const deptId = user?.department_id;
            const url = deptId 
                ? `/api/v1/faculty/timetable/alterations?department_id=${deptId}`
                : '/api/v1/faculty/timetable/alterations';
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const data = await response.json();
            if (data.success) {
                setAlterations(data.data);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load substitution requests.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
            case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Faculty Substitutions</h1>
                    <p className="text-muted-foreground">Monitor and manage class substitution requests within your department.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Substitution Requests</CardTitle>
                        <CardDescription>A log of all original to substitute faculty changes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p>Loading...</p>
                        ) : alterations.length === 0 ? (
                            <p className="text-muted-foreground">No substitution requests found.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Requested By</TableHead>
                                        <TableHead>Original Faculty</TableHead>
                                        <TableHead>Substitute Faculty</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alterations.map((alt) => (
                                        <TableRow key={alt.id}>
                                            <TableCell>{alt.proposed_date ? new Date(alt.proposed_date).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>
                                                {alt.requested_by === alt.old_faculty_id ? alt.oldFaculty?.Name : 'Timetable Incharge'}
                                            </TableCell>
                                            <TableCell>{alt.oldFaculty?.Name}</TableCell>
                                            <TableCell>{alt.newFaculty?.Name}</TableCell>
                                            <TableCell className="max-w-xs truncate">{alt.reason}</TableCell>
                                            <TableCell>{getStatusBadge(alt.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};

export default Substitutions;
