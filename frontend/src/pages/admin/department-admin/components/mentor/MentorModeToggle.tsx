import { motion } from "framer-motion";
import { useMentor } from "@/pages/admin/department-admin/context";
import { useNavigate } from "react-router-dom";

export function MentorModeToggle() {
  const { isMentorMode, toggleMentorMode } = useMentor();
  const navigate = useNavigate();

  const handleToggle = () => {
    toggleMentorMode();
    if (!isMentorMode) {
      navigate("/admin/department-admin/mentor");
    } else {
      navigate("/admin/department-admin/dashboard");
    }
  };

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={handleToggle}
        className={`relative w-14 h-8 rounded-full transition-colors ${isMentorMode ? "bg-gradient-to-r from-[#790c0c] to-[#01898d]" : "bg-gray-300"
          }`}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow effect */}
        {isMentorMode && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#790c0c] to-[#01898d] rounded-full blur-lg opacity-50"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Sliding knob */}
        <motion.div
          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
          animate={{ x: isMentorMode ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        {/* Ripple effect on toggle */}
        {isMentorMode && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white"
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.button>

      {/* Label */}
      <motion.span
        className={`text-sm font-semibold transition-colors ${isMentorMode ? "text-purple-600" : "text-gray-600"
          }`}
        animate={{ color: isMentorMode ? "#790c0c" : "#4b5563" }}
      >
        {isMentorMode ? "HOD Mode" : "Mentor Mode"}
      </motion.span>
    </motion.div>
  );
}



