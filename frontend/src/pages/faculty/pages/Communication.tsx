import { useState } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/pages/faculty/components/ui/button";
import { Input } from "@/pages/faculty/components/ui/input";
import { Textarea } from "@/pages/faculty/components/ui/textarea";
import { Badge } from "@/pages/faculty/components/ui/badge";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { cn } from "@/pages/faculty/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────
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

// ─── Mock student queries (replace with API when backend is ready) ──────────
const MOCK_QUERIES: Query[] = [
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
    reply: "The solutions will be uploaded by this weekend. Please check the study materials section.",
  },
  {
    id: "3",
    student: "Rahul Verma",
    rollNo: "CSE003",
    subject: "OOP",
    message: "Is there any reference book you would recommend for understanding design patterns better?",
    date: "2024-01-17",
    status: "pending",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
export default function FacultyCommunication() {
  // ── Query / reply state ─────────────────────────────────────────────────
  const [queries, setQueries]         = useState<Query[]>(MOCK_QUERIES);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [replyText, setReplyText]     = useState("");
  const [searchTerm, setSearchTerm]   = useState("");

  // ── Filtered queries ────────────────────────────────────────────────────
  const filteredQueries = queries.filter(
    (q) =>
      q.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-header font-serif text-2xl font-bold">Student Queries</h1>
          <p className="text-muted-foreground mt-1">
            View and respond to student queries
          </p>
        </div>
      </div>

      {/* ── Student queries ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query list */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search queries…" className="pl-10"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {filteredQueries.map((query, idx) => (
            <motion.div key={query.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => setSelectedQuery(query)}
              className={cn(
                "widget-card cursor-pointer transition-all hover:border-primary/30 p-4 border rounded-xl",
                selectedQuery?.id === query.id && "border-primary bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                    {query.student.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{query.student}</p>
                    <p className="text-xs text-muted-foreground">{query.rollNo} · {query.subject}</p>
                  </div>
                </div>
                {query.status === "pending" ? (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    <AlertCircle className="w-3 h-3 mr-1" /> Pending
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Replied
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{query.message}</p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {query.date}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Reply panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="widget-card h-fit sticky top-6 p-4 border rounded-xl">
          {selectedQuery ? (
            <>
              <div className="flex items-center gap-3 pb-4 border-b mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {selectedQuery.student.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedQuery.student}</p>
                  <p className="text-sm text-muted-foreground">{selectedQuery.rollNo} · {selectedQuery.subject}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground">{selectedQuery.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{selectedQuery.date}</p>
              </div>
              {selectedQuery.reply && (
                <div className="bg-secondary/10 rounded-lg p-4 mb-4 border-l-4 border-secondary">
                  <p className="text-xs font-medium text-secondary mb-2">Your Reply</p>
                  <p className="text-sm text-foreground">{selectedQuery.reply}</p>
                </div>
              )}
              <div className="space-y-3">
                <Textarea placeholder="Type your reply here…" rows={4}
                  value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" /> Send Reply
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">Select a Query</p>
              <p className="text-sm text-muted-foreground">Click on a query to view details and reply</p>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
