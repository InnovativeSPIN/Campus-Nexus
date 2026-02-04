import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Check, X } from "lucide-react";

interface Certificate {
  id: string;
  name: string;
  issuedBy: string;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
}

const dummyCertificates: Certificate[] = [
  {
    id: "1",
    name: "NPTEL Certificate - Python for Data Science",
    issuedBy: "NPTEL, IIT Bombay",
    date: "2024-01-15",
    status: "Approved",
  },
  {
    id: "2",
    name: "Hackathon Participation - Smart India Hackathon",
    issuedBy: "Ministry of Education",
    date: "2024-02-20",
    status: "Pending",
  },
  {
    id: "3",
    name: "Workshop Certificate - Cloud Computing",
    issuedBy: "AWS Academy",
    date: "2024-03-10",
    status: "Approved",
  },
  {
    id: "4",
    name: "Internship Completion - Web Development",
    issuedBy: "TechCorp Solutions",
    date: "2024-04-05",
    status: "Approved",
  },
  {
    id: "5",
    name: "Google Cloud Skills Badge - Data Engineering",
    issuedBy: "Google Cloud",
    date: "2024-05-12",
    status: "Pending",
  },
];

export function RecordsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>(dummyCertificates);

  const filteredCertificates = useMemo(() => {
    return certificates.filter(
      (cert) =>
        cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.issuedBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, certificates]);

  const handleApproveCertificate = (id: string) => {
    setCertificates(
      certificates.map((cert) =>
        cert.id === id ? { ...cert, status: "Approved" } : cert
      )
    );
  };

  const handleRejectCertificate = (id: string) => {
    setCertificates(
      certificates.map((cert) =>
        cert.id === id ? { ...cert, status: "Rejected" } : cert
      )
    );
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
