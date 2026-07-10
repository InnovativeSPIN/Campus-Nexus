import { useState } from "react";
import { MainLayout } from "@/pages/admin/department-admin/components/layout/MainLayout";
import { Button } from "@/pages/admin/department-admin/components/ui/button";
import { Input } from "@/pages/admin/department-admin/components/ui/input";
import { Textarea } from "@/pages/admin/department-admin/components/ui/textarea";
import { Badge } from "@/pages/admin/department-admin/components/ui/badge";
import {
  Send,
  Search,
} from "lucide-react";
import { cn } from "@/pages/admin/department-admin/lib/utils";

interface Query {
  id: string;
  student: string;
  rollNo: string;
  subject: string;
  message: string;
  date: string;
  status: "pending" | "replied";
  reply?: string;
}

const mockQueries: Query[] = [
  {
    id: "1",
    student: "Aditya Kumar",
    rollNo: "CSE001",
    subject: "Data Structures",
    message: "Sir, I have doubt in the time complexity analysis of QuickSort. Can you please explain the worst case scenario?",
    date: "2024-01-19",
    status: "pending",
  },
  {
    id: "2",
    student: "Priya Sharma",
    rollNo: "CSE002",
    subject: "Algorithms",
    message: "When will the assignment 3 solutions be uploaded?",
    date: "2024-01-18",
    status: "replied",
    reply: "The solutions will be uploaded by this weekend.",
  },
];

export default function Communication() {
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQueries = mockQueries.filter(
    (q) =>
      q.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-header font-serif text-2xl font-bold">Student Queries</h1>
          <p className="text-muted-foreground mt-1">
            Manage departmental queries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search queries..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          {filteredQueries.map(q => (
            <div
              key={q.id}
              className={cn("widget-card cursor-pointer p-4 border rounded-xl transition-all", selectedQuery?.id === q.id && "ring-2 ring-primary bg-primary/5")}
              onClick={() => setSelectedQuery(q)}
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-bold">{q.student}</h5>
                <Badge variant={q.status === 'pending' ? 'warning' : 'success' as any} className={cn(q.status === 'pending' ? 'bg-warning text-white' : 'bg-success text-white')}>{q.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{q.message}</p>
            </div>
          ))}
        </div>

        <div className="widget-card h-fit sticky top-6 p-4 border rounded-xl">
          {selectedQuery ? (
            <div className="space-y-4">
              <h4 className="font-bold border-b pb-2">{selectedQuery.subject}</h4>
              <p className="text-sm bg-muted p-4 rounded-xl">{selectedQuery.message}</p>
              {selectedQuery.reply && (
                <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl">
                  <p className="text-xs font-bold text-primary mb-1">Response:</p>
                  <p className="text-sm">{selectedQuery.reply}</p>
                </div>
              )}
              <div className="space-y-2">
                <Textarea placeholder="Type reply..." value={replyText} onChange={e => setReplyText(e.target.value)} />
                <Button className="w-full gap-2"><Send className="w-4 h-4" /> Send Reply</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">Select a query to respond</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
