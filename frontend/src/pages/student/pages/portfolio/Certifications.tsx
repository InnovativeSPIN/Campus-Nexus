import { useState } from 'react';
import Modal from '@/pages/student/components/common/Modal';
import Badge from '@/pages/student/components/common/Badge';
import { Plus, ExternalLink, Award, Trash2, Calendar, Edit2 } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';
import { formatDate } from '@/pages/student/utils/formatDate';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[];
  approvalStatus?: ApprovalStatus;
}

const initialCertifications: Certification[] = [
  {
    id: '1',
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    issueDate: '2024-01-15',
    expiryDate: '2027-01-15',
    credentialId: 'AWS-CCP-123456',
    credentialUrl: 'https://aws.amazon.com/verify',
    skills: ['Cloud Computing', 'AWS', 'Infrastructure'],
    approvalStatus: 'approved',
  },
  {
    id: '2',
    name: 'React Developer Certification',
    issuer: 'Meta',
    issueDate: '2023-11-20',
    credentialId: 'META-REACT-789',
    skills: ['React', 'JavaScript', 'Frontend'],
    approvalStatus: 'approved',
  },
  {
    id: '3',
    name: 'Python for Data Science',
    issuer: 'Coursera',
    issueDate: '2023-08-10',
    credentialUrl: 'https://coursera.org/verify/123',
    skills: ['Python', 'Data Science', 'Machine Learning'],
    approvalStatus: 'approved',
  },
];

interface CertificationsProps {
  onPendingChange?: (hasPending: boolean) => void;
}

export default function Certifications({ onPendingChange }: CertificationsProps) {
  const { toast } = useToast();
  const [certifications, setCertifications] = useState<Certification[]>(initialCertifications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    skills: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.issuer.trim() || !formData.issueDate) {
      toast({
        title: 'Validation Error',
        description: 'Name, issuer, and issue date are required.',
        variant: 'destructive',
      });
      return;
    }

    const newCert: Certification = {
      id: editingCert?.id || Date.now().toString(),
      name: formData.name,
      issuer: formData.issuer,
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate || undefined,
      credentialId: formData.credentialId || undefined,
      credentialUrl: formData.credentialUrl || undefined,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      approvalStatus: 'pending',
    };

    if (editingCert) {
      setCertifications(certifications.map(c => c.id === editingCert.id ? { ...newCert, approvalStatus: 'pending' } : c));
      toast({ title: 'Request Submitted', description: 'Your changes have been submitted to faculty for approval.' });
    } else {
      setCertifications([newCert, ...certifications]);
      toast({ title: 'Request Submitted', description: 'Your changes have been submitted to faculty for approval.' });
    }

    if (onPendingChange) onPendingChange(true);
    closeModal();
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
      skills: cert.skills.join(', '),
    });
    setIsModalOpen(true);
    if (onPendingChange) onPendingChange(true);
  };

  const handleDelete = (id: string) => {
    setCertifications(certifications.filter(c => c.id !== id));
    toast({ title: 'Certification deleted successfully' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
    setFormData({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      skills: '',
    });
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getApprovalBadgeVariant = (status?: ApprovalStatus): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
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
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(cert)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cert.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Issued: {formatDate(cert.issueDate)}
                  </div>
                  {cert.expiryDate && (
                    <Badge variant={isExpired(cert.expiryDate) ? 'danger' : 'success'}>
                      {isExpired(cert.expiryDate) ? 'Expired' : `Valid until ${formatDate(cert.expiryDate)}`}
                    </Badge>
                  )}
                  {!cert.expiryDate && (
                    <Badge variant="success">No Expiry</Badge>
                  )}
                  <Badge variant={getApprovalBadgeVariant(cert.approvalStatus)}>
                    {cert.approvalStatus || 'approved'}
                  </Badge>
                </div>

                {cert.credentialId && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Credential ID: <span className="font-mono">{cert.credentialId}</span>
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mt-3">
                  {cert.skills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-muted rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Verify Credential
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCert ? 'Edit Certification' : 'Add New Certification'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Certification Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., AWS Certified Cloud Practitioner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Issuing Organization *</label>
            <input
              type="text"
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              className="input-field"
              placeholder="e.g., Amazon Web Services"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Issue Date *</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Credential ID</label>
            <input
              type="text"
              value={formData.credentialId}
              onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
              className="input-field"
              placeholder="e.g., AWS-CCP-123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Verification URL</label>
            <input
              type="url"
              value={formData.credentialUrl}
              onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
              className="input-field"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="input-field"
              placeholder="Cloud, AWS, Infrastructure (comma separated)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCert ? 'Submit Changes' : 'Add Certification'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
