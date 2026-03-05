import { useState, useEffect } from 'react';
import Modal from '@/pages/student/components/common/Modal';
import Badge from '@/pages/student/components/common/Badge';
import { Plus, ExternalLink, Github, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';
import {
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/pages/student/services/studentApi';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface Project {
  id: string;
  title: string;
  description: string;
  techStack?: string[] | string;
  repoUrl?: string;
  demoUrl?: string;
  status: 'completed' | 'in-progress' | 'planned' | 'paused';
  createdAt: string;
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


interface ProjectsProps {
  onPendingChange?: (hasPending: boolean) => void;
}

const emptyForm = {
  title: '',
  description: '',
  technologies: '',
  githubUrl: '',
  demoUrl: '',
  status: 'in-progress' as Project['status'],
};

export default function Projects({ onPendingChange }: ProjectsProps) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    setLoading(true);
    getMyProjects()
      .then((res: any) => setProjects(res.data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData(emptyForm);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      technologies: ensureArray(project.techStack).join(', '),
      githubUrl: project.repoUrl || '',
      demoUrl: project.demoUrl || '',
      status: project.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: 'Error', description: 'Title is required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      title: formData.title,
      description: formData.description,
      techStack: formData.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      repoUrl: formData.githubUrl || null,
      demoUrl: formData.demoUrl || null,
      status: formData.status,
    };

    try {
      if (editingProject) {
        const res: any = await updateProject(editingProject.id, payload);
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? res.data : p)));
        toast({ title: 'Request Submitted', description: 'Changes submitted for faculty approval.' });
      } else {
        const res: any = await createProject(payload);
        setProjects((prev) => [res.data, ...prev]);
        toast({ title: 'Request Submitted', description: 'Project submitted for faculty approval.' });
      }
      if (onPendingChange) onPendingChange(true);
      closeModal();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save project.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Project deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete.', variant: 'destructive' });
    }
  };

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'danger' => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'planned': return 'warning';
      default: return 'danger';
    }
  };

  const getApprovalVariant = (status?: ApprovalStatus): 'success' | 'warning' | 'danger' | 'info' => {
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
          Add Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No projects yet. Add your first project!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <div key={project.id} className="section-card p-6 group animate-slide-in" style={{ animationDelay: `${index * 60}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{project.title}</h3>
                {project.approvalStatus !== 'pending' && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(project)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {ensureArray(project.techStack).map((tech) => (
                  <span key={tech} className="px-2 py-0.5 bg-muted rounded text-xs font-medium">{tech}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                <Badge variant={getApprovalVariant(project.approvalStatus)}>{project.approvalStatus || 'pending'}</Badge>
              </div>

              <div className="flex gap-3">
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="w-3.5 h-3.5" />
                    Repo
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProject ? 'Edit Project' : 'Add New Project'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="e.g., E-Commerce Platform" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field min-h-[80px]" placeholder="Brief description of the project" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Technologies</label>
            <input type="text" value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} className="input-field" placeholder="React, Node.js, MongoDB (comma separated)" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">GitHub / Repo URL</label>
              <input type="url" value={formData.githubUrl} onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })} className="input-field" placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Demo URL</label>
              <input type="url" value={formData.demoUrl} onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })} className="input-field" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })} className="input-field">
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingProject ? 'Submit Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
