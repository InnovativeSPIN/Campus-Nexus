import { useState } from 'react';
import Modal from '@/pages/student/components/common/Modal';
import Badge from '@/pages/student/components/common/Badge';
import { Plus, ExternalLink, Github, Edit2, Trash2, Image } from 'lucide-react';
import { useToast } from '@/pages/student/hooks/use-toast';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  image?: string;
  status: 'completed' | 'in-progress' | 'planned';
  createdAt: string;
  approvalStatus?: ApprovalStatus;
}

const initialProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce application with user authentication, product catalog, and payment integration.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    githubUrl: 'https://github.com/example/ecommerce',
    demoUrl: 'https://demo.example.com',
    status: 'completed',
    createdAt: '2024-01-15',
    approvalStatus: 'approved',
  },
  {
    id: '2',
    title: 'Weather Dashboard',
    description: 'Real-time weather application using OpenWeather API with location-based forecasts.',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    githubUrl: 'https://github.com/example/weather',
    status: 'completed',
    createdAt: '2024-02-20',
    approvalStatus: 'approved',
  },
  {
    id: '3',
    title: 'Machine Learning Classifier',
    description: 'Image classification model using TensorFlow for identifying objects in photos.',
    technologies: ['Python', 'TensorFlow', 'Flask'],
    status: 'in-progress',
    createdAt: '2024-03-10',
    approvalStatus: 'approved',
  },
];

interface ProjectsProps {
  onPendingChange?: (hasPending: boolean) => void;
}

export default function Projects({ onPendingChange }: ProjectsProps) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    demoUrl: '',
    status: 'in-progress' as Project['status'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and description are required.',
        variant: 'destructive',
      });
      return;
    }

    const newProject: Project = {
      id: editingProject?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
      githubUrl: formData.githubUrl || undefined,
      demoUrl: formData.demoUrl || undefined,
      status: formData.status,
      createdAt: editingProject?.createdAt || new Date().toISOString().split('T')[0],
      approvalStatus: 'pending',
    };

    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...newProject, approvalStatus: 'pending' } : p));
      toast({ title: 'Request Submitted', description: 'Your changes have been submitted to faculty for approval.' });
    } else {
      setProjects([newProject, ...projects]);
      toast({ title: 'Request Submitted', description: 'Your changes have been submitted to faculty for approval.' });
    }

    if (onPendingChange) onPendingChange(true);
    closeModal();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(', '),
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      status: project.status,
    });
    setIsModalOpen(true);
    if (onPendingChange) onPendingChange(true);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    toast({ title: 'Project deleted successfully' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      technologies: '',
      githubUrl: '',
      demoUrl: '',
      status: 'in-progress',
    });
  };

  const getStatusVariant = (status: Project['status']): 'success' | 'warning' | 'info' => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      default: return 'info';
    }
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
          Add Project
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="section-card overflow-hidden group">
            {/* Project Image Placeholder */}
            <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Image className="w-12 h-12 text-muted-foreground/50" />
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <Badge variant={getStatusVariant(project.status)} className="mt-1">
                    {project.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies.map((tech) => (
                  <span key={tech} className="px-2 py-1 bg-muted rounded text-xs font-medium">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Demo
                    </a>
                  )}
                </div>
                <Badge variant={getApprovalBadgeVariant(project.approvalStatus)}>
                  {project.approvalStatus || 'approved'}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="Project title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px]"
              placeholder="Describe your project..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Technologies</label>
            <input
              type="text"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              className="input-field"
              placeholder="React, Node.js, MongoDB (comma separated)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">GitHub URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="input-field"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Demo URL</label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
              className="input-field"
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingProject ? 'Submit Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
