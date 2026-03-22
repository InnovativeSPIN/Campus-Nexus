import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Search as SearchIcon,
  ChevronDown,
} from 'lucide-react';
import { MainLayout } from '@/pages/admin/department-admin/components/layout/MainLayout';
import { Button } from '@/pages/admin/department-admin/components/ui/button';
import { Input } from '@/pages/admin/department-admin/components/ui/input';
import { Card } from '@/pages/admin/department-admin/components/ui/card';
import { Badge } from '@/pages/admin/department-admin/components/ui/badge';
import { Textarea } from '@/pages/admin/department-admin/components/ui/textarea';

const apiFetch = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('authToken');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
  return res.json();
};

interface CoursePlanApprovalBatch {
  batch_id: string;
  faculty: {
    Name: string;
    faculty_college_code: string;
    email: string;
  };
  subject: {
    subject_name: string;
    subject_code: string;
    id: number;
  };
  class: {
    name: string;
    section: string;
  };
  academic_year: string;
  semester: number;
  batch_submission_date: string;
  topics_count: number;
  topics: Array<{
    id: number;
    sno: number;
    unit_label: string;
    topic: string;
    periods_required: number;
    co_number?: string;
    btl?: string;
  }>;
}

export default function CourseLessonPlanApprovalsPage() {
  const [batches, setBatches] = useState<CoursePlanApprovalBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<CoursePlanApprovalBatch | null>(null);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/v1/department-admin/academics/course-plans/pending');
      if (response.success && response.data) {
        setBatches(response.data);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      alert('Failed to load pending course plan approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async () => {
    if (!selectedBatch || !modalAction) return;

    try {
      setIsSubmitting(true);
      let endpoint = '';

      if (modalAction === 'approve') {
        endpoint = `/api/v1/department-admin/academics/course-plans/batch/${selectedBatch.batch_id}/approve`;
      } else if (modalAction === 'reject') {
        endpoint = `/api/v1/department-admin/academics/course-plans/batch/${selectedBatch.batch_id}/reject`;
      }

      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ remarks: remarks || null }),
      });

      if (response.success) {
        setBatches(batches.filter(b => b.batch_id !== selectedBatch.batch_id));
        setShowModal(false);
        setRemarks('');
        setSelectedBatch(null);
        setModalAction(null);
        setExpandedBatchId(null);
        alert(`Course plan batch ${modalAction}ed successfully! (${selectedBatch.topics_count} topics)`);
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Error processing approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBatches = batches.filter(b =>
    searchTerm === '' ||
    b.faculty.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.topics.some(t => t.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainLayout hideHeader={false}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Course Lesson Plan Approvals</h1>
        </div>
        <p className="text-muted-foreground">Review and approve course lesson plan batches submitted by faculty</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Batches</p>
              <p className="text-3xl font-bold text-amber-600">{batches.length}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Topics</p>
              <p className="text-3xl font-bold text-blue-600">{batches.reduce((sum, b) => sum + b.topics_count, 0)}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-purple-500/5 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unique Subjects</p>
              <p className="text-3xl font-bold text-purple-600">
                {new Set(batches.map(b => b.subject.id)).size}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by faculty name, subject, or topic..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Batch List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading approvals...</Card>
        ) : filteredBatches.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {batches.length === 0 ? 'No pending course plan approvals' : 'No matching course plan batches found'}
          </Card>
        ) : (
          filteredBatches.map((batch) => (
            <motion.div
              key={batch.batch_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              {/* Batch Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-foreground">
                      {batch.faculty.Name}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {batch.faculty.faculty_college_code}
                    </Badge>
                    <Badge className="text-xs bg-amber-500/20 text-amber-700 border-amber-500/30">
                      <Clock className="w-3 h-3 mr-1" />
                      {batch.topics_count} topics
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    <p className="font-semibold">{batch.subject.subject_name} ({batch.subject.subject_code})</p>
                    <p>{batch.class.name} • Semester {batch.semester} • {batch.academic_year}</p>
                    <p className="text-xs mt-1">
                      Submitted: {new Date(batch.batch_submission_date).toLocaleDateString()} at{' '}
                      {new Date(batch.batch_submission_date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-success hover:text-success hover:bg-success/10"
                    onClick={() => {
                      setSelectedBatch(batch);
                      setModalAction('approve');
                      setShowModal(true);
                      setRemarks('');
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedBatch(batch);
                      setModalAction('reject');
                      setShowModal(true);
                      setRemarks('');
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setExpandedBatchId(expandedBatchId === batch.batch_id ? null : batch.batch_id)
                    }
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedBatchId === batch.batch_id ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </div>
              </div>

              {/* Expanded Topics */}
              {expandedBatchId === batch.batch_id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border pt-4 mt-4"
                >
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {batch.topics.map((topic) => (
                      <div key={topic.id} className="p-3 bg-muted/30 rounded-lg border border-border/50 text-sm">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div>
                            <p className="font-semibold text-foreground">
                              {topic.sno}. {topic.topic}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {topic.unit_label && `Unit: ${topic.unit_label} • `}
                              Periods: {topic.periods_required}
                              {topic.co_number && ` • CO: ${topic.co_number}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Approval Modal */}
      {showModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border border-border rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold mb-2">
              {modalAction === 'approve' ? '✅ Approve' : '❌ Reject'} Course Plan Batch
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedBatch.topics_count} topics from {selectedBatch.subject.subject_name} by{' '}
              {selectedBatch.faculty.Name}
            </p>

            <Textarea
              placeholder={
                modalAction === 'approve'
                  ? 'Optional approval remarks...'
                  : 'Rejection reason (required)...'
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mb-4"
              rows={3}
            />

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setModalAction(null);
                  setRemarks('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprovalAction}
                disabled={isSubmitting || (modalAction === 'reject' && !remarks.trim())}
                className={modalAction === 'approve' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Processing...' : modalAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </MainLayout>
  );
}
