import { useState } from "react";
import { motion } from "framer-motion";
import { useMentor } from "@/pages/admin/department-admin/context";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, Check, X } from "lucide-react";
import { menteeStudents } from "@/pages/admin/department-admin/data/menteeStudents";
import { MentorStudentSidebar } from "@/pages/admin/department-admin/components/mentor/MentorStudentSidebar";
import { EditableSection } from "@/pages/admin/department-admin/components/mentor/EditableSection";
import { SiblingsEditor } from "@/pages/admin/department-admin/components/mentor/SiblingsEditor";
import { AcademicsView } from "@/pages/admin/department-admin/components/mentor/AcademicsView";
import { RecordsView } from "@/pages/admin/department-admin/components/mentor/RecordsView";
import { ExtraCurricularView } from "@/pages/admin/department-admin/components/mentor/ExtraCurricularView";

type TabType = "basic" | "personal" | "parent" | "reference" | "photos";

const tabs: Array<{ id: TabType; label: string; icon: string }> = [
  { id: "basic", label: "BASIC INFO", icon: "" },
  { id: "personal", label: "PERSONAL INFO", icon: "" },
  { id: "parent", label: "PARENT INFO", icon: "" },
  { id: "reference", label: "REFERENCE", icon: "" },
  { id: "photos", label: "PHOTOS", icon: "" },
];

export function StudentProfileView() {
  const { studentId } = useParams<{ studentId: string }>();
  const { approvePendingChange, rejectPendingChange } = useMentor();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [activeMenu, setActiveMenu] = useState("profile");
  const [isMentorMode] = useState(true);

  const student = menteeStudents.find((s) => s.id === studentId);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Student not found</p>
      </div>
    );
  }

  const handleSaveSection = (sectionName: string, updatedFields: Record<string, string>) => {
    // Simulate save - in real app, this would update state and call API
    console.log(`Saved ${sectionName}:`, updatedFields);
    // You could add toast notification here
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <MentorStudentSidebar activeSection={activeMenu} onSectionChange={setActiveMenu} />

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {(activeMenu === "profile" || activeMenu === "academics" || activeMenu === "records" || activeMenu === "activities") && (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-b sticky top-0 z-40"
            >
              <div className="p-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-[#790c0c] hover:text-[#600909] mb-4 font-semibold"
                >
                  <ArrowLeft size={20} />
                  Back to Students
                </motion.button>

                <div className="flex items-center gap-6">
                  <motion.img
                    src={student.photos.studentPhoto}
                    alt={student.basicInfo.name}
                    className="w-24 h-24 rounded-full border-4 border-[#790c0c]"
                    whileHover={{ scale: 1.05 }}
                  />
                  <div>
                    <h1 className="text-4xl font-bold text-gray-800">
                      {student.basicInfo.name}
                    </h1>
                    <p className="text-gray-600">
                      {student.basicInfo.department} | {student.basicInfo.year} Year
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {student.id} Roll: {student.basicInfo.rollNumber}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content Based on Active Section */}
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
              {activeMenu === "profile" && (
                <>
                  {/* Profile Tabs */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border-b sticky top-32 z-30"
                  >
                    <div className="px-6 flex gap-1 overflow-x-auto">
                      {tabs.map((tab) => (
                        <motion.button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all relative ${activeTab === tab.id
                              ? "text-[#790c0c]"
                              : "text-gray-600 hover:text-gray-800"
                            }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="mr-2">{tab.icon}</span>
                          {tab.label}
                          {activeTab === tab.id && (
                            <motion.div
                              layoutId="underline"
                              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#790c0c] to-[#01898d]"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Tab Content */}
                  <div className="p-6">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeTab === "basic" && (
                        <EditableSection
                          title="Basic Information"
                          fields={[
                            { key: "name", label: "Name", value: student.basicInfo.name },
                            { key: "admissionNumber", label: "Admission Number", value: student.basicInfo.admissionNumber },
                            { key: "rollNumber", label: "Roll Number", value: student.basicInfo.rollNumber },
                            { key: "registerNumber", label: "Register Number", value: student.basicInfo.registerNumber },
                            { key: "fullName", label: "Full Name", value: student.basicInfo.fullName },
                            { key: "department", label: "Department", value: student.basicInfo.department },
                            { key: "year", label: "Year", value: student.basicInfo.year },
                            { key: "semester", label: "Semester", value: student.basicInfo.semester },
                            { key: "batch", label: "Batch", value: student.basicInfo.batch },
                            { key: "admissionDate", label: "Admission Date", value: student.basicInfo.admissionDate },
                            { key: "natureOfResidence", label: "Nature of Residence", value: student.basicInfo.natureOfResidence },
                          ]}
                          isMentorMode={isMentorMode}
                          onSave={(fields) => handleSaveSection("Basic Info", fields)}
                        />
                      )}

                      {activeTab === "personal" && (
                        <>
                          <EditableSection
                            title="Personal Information"
                            fields={[
                              { key: "dob", label: "Date of Birth", value: student.personalInfo.dob, type: "date" },
                              { key: "gender", label: "Gender", value: student.personalInfo.gender },
                              { key: "bloodGroup", label: "Blood Group", value: student.personalInfo.bloodGroup },
                              { key: "motherTongue", label: "Mother Tongue", value: student.personalInfo.motherTongue },
                              { key: "email", label: "Email", value: student.personalInfo.email, type: "email" },
                              { key: "linkedin", label: "LinkedIn", value: student.personalInfo.linkedin },
                              { key: "mobile", label: "Mobile", value: student.personalInfo.mobile, type: "tel" },
                              { key: "alternateMobile", label: "Alternate Mobile", value: student.personalInfo.alternateMobile, type: "tel" },
                              { key: "address", label: "Address", value: student.personalInfo.address },
                              { key: "city", label: "City", value: student.personalInfo.city },
                              { key: "state", label: "State", value: student.personalInfo.state },
                              { key: "pincode", label: "Pincode", value: student.personalInfo.pincode },
                              { key: "nationality", label: "Nationality", value: student.personalInfo.nationality },
                              { key: "religion", label: "Religion", value: student.personalInfo.religion },
                              { key: "category", label: "Category", value: student.personalInfo.category },
                              { key: "aadharNumber", label: "Aadhar Number", value: student.personalInfo.aadharNumber },
                            ]}
                            isMentorMode={isMentorMode}
                            onSave={(fields) => handleSaveSection("Personal Info", fields)}
                          />

                          {/* Pending Changes */}
                          {student.pendingChanges.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-yellow-50 border-2 border-yellow-200 rounded-xl shadow-lg p-8"
                            >
                              <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
                                <AlertCircle size={20} />
                                Pending Changes for Approval
                              </h3>
                              <div className="space-y-4">
                                {student.pendingChanges.map((change, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white p-4 rounded-lg flex items-center justify-between border border-yellow-200"
                                  >
                                    <div>
                                      <p className="font-semibold text-gray-800">{change.field}</p>
                                      <p className="text-sm text-gray-600">
                                        <span className="line-through">{change.oldValue}</span> <span className="text-blue-600 font-semibold">{change.newValue}</span>
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => approvePendingChange(student.id, change.field)}
                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                      >
                                        <Check size={18} />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => rejectPendingChange(student.id, change.field)}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                      >
                                        <X size={18} />
                                      </motion.button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </>
                      )}

                      {activeTab === "parent" && (
                        <div className="space-y-6">
                          <EditableSection
                            title="Father's Information"
                            fields={[
                              { key: "fatherName", label: "Name", value: student.parentInfo.fatherName },
                              { key: "fatherOccupation", label: "Occupation", value: student.parentInfo.fatherOccupation },
                              { key: "fatherPhone", label: "Phone", value: student.parentInfo.fatherPhone, type: "tel" },
                            ]}
                            isMentorMode={isMentorMode}
                            onSave={(fields) => handleSaveSection("Father Info", fields)}
                          />

                          <EditableSection
                            title="Mother's Information"
                            fields={[
                              { key: "motherName", label: "Name", value: student.parentInfo.motherName },
                              { key: "motherOccupation", label: "Occupation", value: student.parentInfo.motherOccupation },
                              { key: "motherPhone", label: "Phone", value: student.parentInfo.motherPhone, type: "tel" },
                            ]}
                            isMentorMode={isMentorMode}
                            onSave={(fields) => handleSaveSection("Mother Info", fields)}
                          />

                          <SiblingsEditor
                            siblings={student.parentInfo.siblings}
                            onUpdate={(siblings) => handleSaveSection("Siblings", { siblings: JSON.stringify(siblings) })}
                            isMentorMode={isMentorMode}
                          />
                        </div>
                      )}

                      {activeTab === "reference" && (
                        <EditableSection
                          title="Reference Information"
                          fields={[
                            { key: "name", label: "Name", value: student.referenceInfo.name },
                            { key: "phone", label: "Phone", value: student.referenceInfo.phone, type: "tel" },
                            { key: "address", label: "Address", value: student.referenceInfo.address },
                            { key: "occupation", label: "Occupation", value: student.referenceInfo.occupation },
                          ]}
                          isMentorMode={isMentorMode}
                          onSave={(fields) => handleSaveSection("Reference", fields)}
                        />
                      )}

                      {activeTab === "photos" && (
                        <div className="grid md:grid-cols-2 gap-6">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                          >
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Student Photo</h3>
                            <motion.img
                              src={student.photos.studentPhoto}
                              alt="Student"
                              className="w-full h-96 object-cover rounded-lg mb-4"
                              whileHover={{ scale: 1.05 }}
                            />
                            {isMentorMode && (
                              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Replace Photo
                              </button>
                            )}
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                          >
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Family Photo</h3>
                            <motion.img
                              src={student.photos.familyPhoto}
                              alt="Family"
                              className="w-full h-96 object-cover rounded-lg mb-4"
                              whileHover={{ scale: 1.05 }}
                            />
                            {isMentorMode && (
                              <button className="w-full px-4 py-2 bg-[#01898d] text-white rounded-lg hover:bg-[#006b72] transition-colors">
                                Replace Photo
                              </button>
                            )}
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </>
              )}

              {activeMenu === "academics" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <AcademicsView studentName={student.basicInfo.name} />
                </motion.div>
              )}

              {activeMenu === "records" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Records</h2>
                  <RecordsView />
                </motion.div>
              )}

              {activeMenu === "activities" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Extra Curricular Activities</h2>
                  <ExtraCurricularView />
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


