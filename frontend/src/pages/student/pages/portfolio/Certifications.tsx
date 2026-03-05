import { useState, useEffect } from 'react';
import Modal from '@/pages/student/components/common/Modal';
import Badge from '@/pages/student/components/common/Badge';
import { Plus, ExternalLink, Award, Trash2, Calendar, Edit2, Loader2 } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';
import { formatDate } from '@/pages/student/utils/formatDate';
import {
  getMyCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
} from '@/pages/student/services/studentApi';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[] | string;
  approvalStatus?: ApprovalStatus;
}

const ensureArray = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch (e) {
        // Fallback to split if JSON parse fails
      }
    }
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};


interface CertificationsProps {
  onPendingChange?: (hasPending: boolean) => void;
}

const emptyForm = {
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  credentialUrl: '',
  skills: '',
  document: null as File | null,
};

export default function Certifications({ onPendingChange }: CertificationsProps) {
  const { toast } = useToast();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    setLoading(true);
    getMyCertifications()
      .then((res: any) => setCertifications(res.data || []))
      .catch(() => setCertifications([]))
      .finally(() => setLoading(false));
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
    setFormData(emptyForm);
  };

  const handleEdit = (cert: Certification) => {
    setEditingCert(cert);
    setFormData({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      skills: ensureArray(cert.skills).join(', '),
      document: null,
    });
    setIsModalOpen(true);
    if (onPendingChange) onPendingChange(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.issuer.trim() || !formData.issueDate) {
      toast({ title: 'Validation Error', description: 'Name, issuer, and issue date are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('issuer', formData.issuer);
    submitData.append('issueDate', formData.issueDate);
    if (formData.expiryDate) submitData.append('expiryDate', formData.expiryDate);
    if (formData.credentialId) submitData.append('credentialId', formData.credentialId);
    if (formData.credentialUrl) submitData.append('credentialUrl', formData.credentialUrl);

    // Skills array to JSON string to parse on backend
    const skillsArray = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);
    submitData.append('skills', JSON.stringify(skillsArray));

    if (formData.document) {
      submitData.append('documentUrl', formData.document);
    }

    try {
      if (editingCert) {
        const res: any = await updateCertification(editingCert.id, submitData);
        setCertifications((prev) => prev.map((c) => (c.id === editingCert.id ? res.data : c)));
        toast({ title: 'Request Submitted', description: 'Changes submitted for faculty approval.' });
      } else {
        const res: any = await createCertification(submitData);
        setCertifications((prev) => [res.data, ...prev]);
        toast({ title: 'Request Submitted', description: 'Certification submitted for faculty approval.' });
      }
      if (onPendingChange) onPendingChange(true);
      closeModal();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCertification(id);
      setCertifications((prev) => prev.filter((c) => c.id !== id));
      toast({ title: 'Certification deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete.', variant: 'destructive' });
    }
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getApprovalBadgeVariant = (status?: ApprovalStatus): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : certifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">No certifications yet. Add your first one!</div>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert, index) => (
            <div key={cert.id} className="section-card p-6 group animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{cert.name}</h3>
                      <p className="text-muted-foreground">{cert.issuer}</p>
                    </div>
                    {cert.approvalStatus !== 'pending' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(cert)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cert.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Issued: {formatDate(cert.issueDate)}
                    </div>
                    {cert.expiryDate ? (
                      <Badge variant={isExpired(cert.expiryDate) ? 'danger' : 'success'}>
                        {isExpired(cert.expiryDate) ? 'Expired' : `Valid until ${formatDate(cert.expiryDate)}`}
                      </Badge>
                    ) : (
                      <Badge variant="success">No Expiry</Badge>
                    )}
                    <Badge variant={getApprovalBadgeVariant(cert.approvalStatus)}>
                      {cert.approvalStatus || 'pending'}
                    </Badge>
                  </div>

                  {cert.credentialId && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Credential ID: <span className="font-mono">{cert.credentialId}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-3">
                    {ensureArray(cert.skills).map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-muted rounded text-xs font-medium">{skill}</span>
                    ))}
                  </div>

                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
                      <ExternalLink className="w-4 h-4" />
                      Verify Credential
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCert ? 'Edit Certification' : 'Add New Certification'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Certification Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="e.g., AWS Certified Cloud Practitioner" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Issuing Organization *</label>
            <input type="text" value={formData.issuer} onChange={(e) => setFormData({ ...formData, issuer: e.target.value })} className="input-field" placeholder="e.g., Amazon Web Services" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Issue Date *</label>
              <input type="date" value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date</label>
              <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Credential ID</label>
            <input type="text" value={formData.credentialId} onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })} className="input-field" placeholder="e.g., AWS-CCP-123456" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Verification URL</label>
            <input type="url" value={formData.credentialUrl} onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })} className="input-field" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <input type="text" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} className="input-field" placeholder="Cloud, AWS, Infrastructure (comma separated)" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Upload Certificate (Optional)</label>
            <input type="file" onChange={(e) => setFormData({ ...formData, document: e.target.files?.[0] || null })} className="input-field py-1.5" accept=".jpg,.jpeg,.png,.pdf" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingCert ? 'Submit Changes' : 'Add Certification'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
