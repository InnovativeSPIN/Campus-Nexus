import { motion } from "framer-motion";
import { useMentor } from "@/pages/admin/department-admin/context";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { MentorModeToggle } from "@/pages/admin/department-admin/components/mentor/MentorModeToggle";
import { NotificationBell } from "@/pages/admin/department-admin/components/notifications/NotificationBell";

export function MentorDashboard() {
  const { setSelectedYear } = useMentor();
  const navigate = useNavigate();

  const years = [
    { id: "2nd", label: "2nd Year", color: "from-[#790c0c] to-[#01898d]" },
    { id: "3rd", label: "3rd Year", color: "from-[#01898d] to-[#790c0c]" },
    { id: "Final", label: "Final Year", color: "from-[#790c0c] via-[#01898d] to-[#790c0c]" },
  ];

  const handleYearClick = (year: "2nd" | "3rd" | "Final") => {
    setSelectedYear(year);
    navigate(`/faculty/mentor/${year.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#790c0c] via-[#01898d] to-[#790c0c] p-8">
      {/* Top Bar with Toggle and Notification */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-12"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/faculty/dashboard")}
          className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </motion.button>

        <div className="flex items-center gap-4">
          <MentorModeToggle />
          <NotificationBell />
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold text-white mb-3">
          Welcome to Mentor Dashboard
        </h1>
        <p className="text-gray-300 text-lg">
          Manage and guide your mentees through their academic journey
        </p>
      </motion.div>

      {/* Year Cards Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {years.map((year, index) => (
          <motion.div
            key={year.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => handleYearClick(year.id as "2nd" | "3rd" | "Final")}
            className="group cursor-pointer"
          >
            {/* Card */}
            <motion.div
              className={`bg-gradient-to-br ${year.color} rounded-2xl p-8 shadow-2xl relative overflow-hidden h-64 flex flex-col justify-between`}
              whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* Content */}
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-2">{year.label}</h2>
                <p className="text-white/90 text-sm">10 Mentees</p>
              </div>

              {/* Bottom action */}
              <div className="relative z-10 flex items-center gap-2 text-white font-semibold">
                <span>View Mentees</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </div>

              {/* Animated gradient border */}
              <motion.div
                className="absolute inset-0 border-2 border-white/30 rounded-2xl"
                animate={{ borderColor: ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0.3)"] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Decorative elements */}
      <motion.div
        className="fixed bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="fixed top-20 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
}


