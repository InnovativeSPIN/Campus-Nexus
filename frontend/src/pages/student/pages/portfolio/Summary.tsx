import { useState, useEffect } from 'react';
import { Award, Target, BookOpen, Flag, Loader2, CheckCircle2 } from 'lucide-react';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import {
  getMyProjects,
  getMyCertifications,
  getMySports,
  getMyEvents
} from '@/pages/student/services/studentApi';
import { formatDate } from '@/pages/student/utils/formatDate';

export default function Summary() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        projects: [],
        certifications: [],
        sports: [],
        events: []
    });

    useEffect(() => {
        const fetchApprovedData = async () => {
            setLoading(true);
            try {
                const results = await Promise.all([
                    getMyProjects({ approvalStatus: 'approved' }),
                    getMyCertifications({ approvalStatus: 'approved' }),
                    getMySports({ approvalStatus: 'approved' }),
                    getMyEvents({ approvalStatus: 'approved' })
                ]);
                
                setData({
                    projects: (results[0] as any).data || [],
                    certifications: (results[1] as any).data || [],
                    sports: (results[2] as any).data || [],
                    events: (results[3] as any).data || []
                });
            } catch (err) {
                console.error('Failed to fetch portfolio summary:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApprovedData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const totalApproved = data.projects.length + data.certifications.length + data.sports.length + data.events.length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Summary Banner */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-border/50 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold mb-2">Verified Portfolio Summary</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    These are your officially verified achievements. Once approved by your Class Incharge, items from your management area are reflected here.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-semibold">
                    <Award className="w-4 h-4" />
                    {totalApproved} Verified Accomplishments
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Certifications */}
                <SectionCard title="Certifications" icon={Award} subtitle={`${data.certifications.length} verified`}>
                    <div className="space-y-4">
                        {data.certifications.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4 italic">No verified certifications yet.</p>
                        ) : (
                            data.certifications.map((item: any) => (
                                <div key={item.id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground">{item.issuer} • {formatDate(item.issueDate)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>

                {/* Projects */}
                <SectionCard title="Key Projects" icon={BookOpen} subtitle={`${data.projects.length} verified`}>
                    <div className="space-y-4">
                        {data.projects.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4 italic">No verified projects yet.</p>
                        ) : (
                            data.projects.map((item: any) => (
                                <div key={item.id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</p>
                                        <Badge variant="info" className="mt-2 text-[10px]">{item.status}</Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>

                {/* Sports */}
                <SectionCard title="Sports & Athletics" icon={Target} subtitle={`${data.sports.length} verified`}>
                    <div className="space-y-4">
                        {data.sports.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4 italic">No verified sports records.</p>
                        ) : (
                            data.sports.map((item: any) => (
                                <div key={item.id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                    <div className="p-2 rounded-lg bg-info/10 text-info">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground">{item.category} • {item.level}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>

                {/* Events */}
                <SectionCard title="Events & Participation" icon={Flag} subtitle={`${data.events.length} verified`}>
                    <div className="space-y-4">
                        {data.events.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4 italic">No verified event participations.</p>
                        ) : (
                            data.events.map((item: any) => (
                                <div key={item.id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                    <div className="p-2 rounded-lg bg-warning/10 text-warning">
                                        <Flag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{item.eventName}</h4>
                                        <p className="text-xs text-muted-foreground">{item.eventType} • {item.achievement || 'Participant'}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}
