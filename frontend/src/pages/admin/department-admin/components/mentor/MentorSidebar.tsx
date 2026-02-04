import { motion } from "framer-motion";
import { Menu, X, User, BookOpen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface MentorSidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

export function MentorSidebar({ activeMenu, onMenuChange }: MentorSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "academics", label: "Academics", icon: BookOpen },
  ];

  const handleMenuClick = (id: string) => {
    onMenuChange(id);
    setIsOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <motion.button
        className="fixed bottom-6 right-6 z-40 md:hidden p-3 bg-gradient-to-r from-[#790c0c] to-[#01898d] text-white rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-30 md:relative md:translate-x-0 md:shadow-none"
      >
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-[#790c0c] to-[#01898d] rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <h2 className="text-lg font-bold text-gray-800">Mentor Mode</h2>
          </motion.div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                        ? "bg-gradient-to-r from-[#790c0c] to-[#01898d] text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                  <span className="font-semibold">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1 h-6 bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-6 left-6 right-6 p-4 bg-gradient-to-br from-red-50 to-teal-50 rounded-lg border border-red-200"
        >
          <p className="text-xs text-gray-600">
            <span className="font-semibold text-red-600">Mentor Mode Active</span>
            <br />
            You can edit all student information
          </p>
        </motion.div>
      </motion.div>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
        />
      )}
    </>
  );
}
