import { useMemo, useState } from 'react';
import PageHeader from '@/pages/student/components/layout/PageHeader';
import SectionCard from '@/pages/student/components/common/SectionCard';
import Badge from '@/pages/student/components/common/Badge';
import { AlertCircle, Info, Trash2, BookOpen } from 'lucide-react';

type AnnouncementType = 'important' | 'info' | 'update';

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  date: string; // ISO
  type: AnnouncementType;
  isRead: boolean;
  category: string;
}

const initialAnnouncements: AnnouncementItem[] = [
  {
    id: 'a1',
    title: 'Semester Exam Schedule Released',
    message: 'The schedule for Semester 5 examinations has been released. Please check the examination timetable for your exam dates and venues.',
    date: '2024-03-15',
    type: 'important',
    isRead: false,
    category: 'Academics',
  },
  {
    id: 'a2',
    title: 'Library Timings Updated',
    message: 'The library will now remain open until 8 PM on weekdays. Weekend timings remain unchanged.',
    date: '2024-03-12',
    type: 'update',
    isRead: false,
    category: 'Campus',
  },
  {
    id: 'a3',
    title: 'New Scholarship Opportunity',
    message: 'A new merit-based scholarship program is now open for applications. Interested students can apply through the student portal before March 31st.',
    date: '2024-03-10',
    type: 'info',
    isRead: true,
    category: 'Financial Aid',
  },
  {
    id: 'a4',
    title: 'Course Registration for Next Semester',
    message: 'Course registration for the next semester will begin on March 20th. All students must register by March 31st to avoid late fee penalties.',
    date: '2024-03-08',
    type: 'important',
    isRead: true,
    category: 'Academics',
  },
  {
    id: 'a5',
    title: 'Campus Maintenance Notice',
    message: 'The main building will undergo maintenance on March 18th. Classes have been rescheduled accordingly.',
    date: '2024-03-05',
    type: 'update',
    isRead: true,
    category: 'Campus',
  },
];

function getIcon(type: AnnouncementType) {
  switch (type) {
    case 'important':
      return AlertCircle;
    case 'update':
      return BookOpen;
    case 'info':
      return Info;
    default:
      return AlertCircle;
  }
}

function getVariant(type: AnnouncementType): 'info' | 'warning' | 'success' {
  switch (type) {
    case 'important':
      return 'warning';
    case 'update':
      return 'info';
    case 'info':
      return 'success';
    default:
      return 'info';
  }
}

export default function Announcements() {
  const [items, setItems] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const filtered = useMemo(() => {
    if (filter === 'unread') return items.filter((n) => !n.isRead);
    if (filter === 'read') return items.filter((n) => n.isRead);
    return items;
  }, [items, filter]);


  const clearAll = () => setItems([]);
  const toggleRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)));
  const deleteAnnouncement = (id: string) =>
    setItems((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="animate-fade-in max-w-5xl">
      <PageHeader
        title="Announcements"
        subtitle="Stay updated with the latest announcements"
        breadcrumbs={[
          { label: 'Dashboard', path: '/student/dashboard' },
          { label: 'Announcements' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="input-field py-2 pr-8"
              aria-label="Filter announcements"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            <button
              onClick={clearAll}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        }
      />

      <SectionCard
        title={`Inbox (${unreadCount} unread)`}
        subtitle={`${filtered.length} announcement${filtered.length !== 1 ? 's' : ''} to review`}
      >
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No announcements to display</p>
            </div>
          ) : (
            filtered.map((announcement) => {
              const IconComponent = getIcon(announcement.type);
              return (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-lg border transition-all ${announcement.isRead
                    ? 'border-border/50 bg-muted/30'
                    : 'border-primary/30 bg-primary/5'
                    } hover:border-border`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${announcement.isRead ? 'bg-muted' : 'bg-primary/10'
                        }`}
                    >
                      <IconComponent
                        className={`w-5 h-5 ${announcement.isRead ? 'text-muted-foreground' : 'text-primary'
                          }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${announcement.isRead ? 'text-foreground/70' : 'text-foreground'}`}>
                            {announcement.title}
                          </h3>
                          <p className={`text-sm mb-3 ${announcement.isRead ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                            {announcement.message}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={getVariant(announcement.type)}>{announcement.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(announcement.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleRead(announcement.id)}
                            className="px-3 py-1 text-xs rounded-md border border-border hover:bg-muted transition-colors"
                            title={announcement.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            {announcement.isRead ? 'Unread' : 'Read'}
                          </button>
                          <button
                            onClick={() => deleteAnnouncement(announcement.id)}
                            className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>
    </div>
  );
}


