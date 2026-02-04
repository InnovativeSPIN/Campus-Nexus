import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export function AcademicsPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-300 p-12 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center mb-6"
        >
          <div className="p-6 bg-white rounded-full shadow-lg">
            <BookOpen className="text-blue-500" size={40} />
          </div>
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Academic Details
        </h2>
        <p className="text-gray-600 text-lg mb-2">
          Academic details will be available here
        </p>
        <p className="text-gray-500 text-sm">
          This section will include grades, performance metrics, course details, and more.
        </p>
      </div>
    </motion.div>
  );
}
