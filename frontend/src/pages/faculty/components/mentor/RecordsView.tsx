import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Certificate {
  id: string;
  name: string;
  issuedBy: string;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
}

interface RecordsViewProps {
  student: any;
  onSave: (section: string, data: any) => void;
  isMentorMode?: boolean;
}

export function RecordsView({ student, onSave, isMentorMode }: RecordsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Local state for adding a new record
  const [isAdding, setIsAdding] = useState(false);
  const [newRecord, setNewRecord] = useState({ name: "", issuedBy: "", date: "" });
  
  // records come from student.records
  const certificates: Certificate[] = student?.records || [];

  const filteredCertificates = useMemo(() => {
    return certificates.filter(
      (cert) =>
        cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.issuedBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, certificates]);

  const handleAddRecord = () => {
    if (!newRecord.name) return;
    const cert: Certificate = {
      id: Date.now().toString(),
      name: newRecord.name,
      issuedBy: newRecord.issuedBy,
      date: newRecord.date || new Date().toISOString().split('T')[0],
      status: "Approved", // Mentor added records are pre-approved
    };
    const updatedRecords = [...certificates, cert];
    onSave("Records", { records: updatedRecords });
    setIsAdding(false);
    setNewRecord({ name: "", issuedBy: "", date: "" });
  };

  const handleApproveCertificate = (id: string) => {
    const updatedRecords = certificates.map((cert) =>
      cert.id === id ? { ...cert, status: "Approved" as const } : cert
    );
    onSave("Records", { records: updatedRecords });
  };

  const handleRejectCertificate = (id: string) => {
    const updatedRecords = certificates.map((cert) =>
      cert.id === id ? { ...cert, status: "Rejected" as const } : cert
    );
    onSave("Records", { records: updatedRecords });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Student Records</h2>
        {isMentorMode && !isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="outline">
            <Plus size={16} className="mr-2" /> Add Record
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4 mb-4">
          <h3 className="font-semibold text-gray-900">Add New Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Record Name" value={newRecord.name} onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
            <input type="text" placeholder="Issued By" value={newRecord.issuedBy} onChange={(e) => setNewRecord({ ...newRecord, issuedBy: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
            <input type="date" value={newRecord.date} onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={handleAddRecord}>Save Record</Button>
          </div>
        </div>
      )}
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search certificates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01898d] focus:border-transparent transition-all"
        />
      </motion.div>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-500"
        >
          <p>No certificates found</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCertificates.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Issued By:</span> {cert.issuedBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Date:</span> {new Date(cert.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      cert.status
                    )}`}
                  >
                    {cert.status}
                  </span>

                  {cert.status === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveCertificate(cert.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#01898d] text-white rounded-lg hover:bg-[#006b72] transition-colors text-xs font-medium"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectCertificate(cert.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
