import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Save, X, Check } from "lucide-react";
import { StudentProfile } from "@/pages/admin/department-admin/data/menteeStudents";

interface EditableSectionProps {
  title: string;
  fields: Array<{
    key: string;
    label: string;
    value: string;
    type?: "text" | "email" | "tel" | "number" | "date" | "select";
    options?: string[];
  }>;
  isMentorMode: boolean;
  onSave: (updatedFields: Record<string, string>) => void;
}

export function EditableSection({
  title,
  fields,
  isMentorMode,
  onSave,
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.value]))
  );

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(editedValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedValues(Object.fromEntries(fields.map((f) => [f.key, f.value])));
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-8 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {isMentorMode && !isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#01898d] text-white rounded-lg hover:bg-[#006b72] transition-colors"
          >
            <Edit2 size={16} />
            Edit
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field, idx) => (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
          >
            <label className="text-sm font-semibold text-gray-600 block mb-1">
              {field.label}
            </label>

            {isEditing ? (
              <input
                type={field.type || "text"}
                value={editedValues[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-[#01898d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01898d] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">
                {editedValues[field.key] || "N/A"}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mt-6 pt-6 border-t"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-[#01898d] text-white rounded-lg hover:bg-[#006b72] transition-colors"
          >
            <Check size={18} />
            Save Changes
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancel}
            className="flex items-center gap-2 px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            <X size={18} />
            Cancel
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

