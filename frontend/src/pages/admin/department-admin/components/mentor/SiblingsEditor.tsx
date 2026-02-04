import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";

interface Sibling {
  id: string;
  name: string;
  age: string;
  phone: string;
  email: string;
  schoolCollege: string;
  classOrCourse: string;
  occupation: string;
}

interface SiblingsEditorProps {
  siblings: Sibling[];
  onUpdate: (siblings: Sibling[]) => void;
  isMentorMode: boolean;
}

export function SiblingsEditor({
  siblings,
  onUpdate,
  isMentorMode,
}: SiblingsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSiblings, setEditedSiblings] = useState<Sibling[]>(siblings);

  const handleAddSibling = () => {
    const newSibling: Sibling = {
      id: Date.now().toString(),
      name: "",
      age: "",
      phone: "",
      email: "",
      schoolCollege: "",
      classOrCourse: "",
      occupation: "",
    };
    setEditedSiblings([...editedSiblings, newSibling]);
  };

  const handleRemoveSibling = (id: string) => {
    setEditedSiblings(editedSiblings.filter((s) => s.id !== id));
  };

  const handleChangeSibling = (id: string, field: string, value: string) => {
    setEditedSiblings(
      editedSiblings.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSave = () => {
    onUpdate(editedSiblings);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSiblings(siblings);
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
        <h2 className="text-2xl font-bold text-gray-800">Siblings Information</h2>
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

      {/* Display Mode */}
      {!isEditing ? (
        <div className="space-y-4">
          {editedSiblings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No siblings information available
            </p>
          ) : (
            editedSiblings.map((sibling, idx) => (
              <motion.div
                key={sibling.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
              >
                <h3 className="font-bold text-gray-800 mb-3">{sibling.name || "Unnamed Sibling"}</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <p className="text-gray-800 font-medium">{sibling.age || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="text-gray-800 font-medium">{sibling.phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="text-gray-800 font-medium">{sibling.email || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">School/College:</span>
                    <p className="text-gray-800 font-medium">{sibling.schoolCollege || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Class/Course:</span>
                    <p className="text-gray-800 font-medium">{sibling.classOrCourse || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Occupation:</span>
                    <p className="text-gray-800 font-medium">{sibling.occupation || "N/A"}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {editedSiblings.map((sibling, idx) => (
            <motion.div
              key={sibling.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                className="border-2 border-[#01898d] rounded-lg p-6 bg-teal-50"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Sibling #{idx + 1}</h3>
                {editedSiblings.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemoveSibling(sibling.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Name" },
                  { key: "age", label: "Age", type: "number" },
                  { key: "phone", label: "Phone", type: "tel" },
                  { key: "email", label: "Email", type: "email" },
                  { key: "schoolCollege", label: "School/College" },
                  { key: "classOrCourse", label: "Class/Course" },
                  { key: "occupation", label: "Occupation" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      {field.label}
                    </label>
                    <input
                      type={field.type || "text"}
                      value={sibling[field.key as keyof Sibling] || ""}
                      onChange={(e) =>
                        handleChangeSibling(sibling.id, field.key, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01898d] focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Add Sibling Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddSibling}
            className="w-full py-3 border-2 border-dashed border-[#01898d] rounded-lg text-[#01898d] font-semibold hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Another Sibling
          </motion.button>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-[#01898d] text-white rounded-lg hover:bg-[#006b72] transition-colors"
            >
              <Save size={18} />
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
          </div>
        </div>
      )}
    </motion.div>
  );
}
