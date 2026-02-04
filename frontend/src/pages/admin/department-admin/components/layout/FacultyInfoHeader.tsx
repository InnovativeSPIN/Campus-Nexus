import { motion } from "framer-motion";
import { Badge } from "@/pages/admin/department-admin/components/ui/badge";
import { User, Briefcase, Hash, Building2 } from "lucide-react";

interface FacultyInfo {
  name: string;
  facultyId: string;
  employeeId: string;
  designation: string;
  department: string;
}

// Faculty data - In production, this would come from login session/context
const facultyData: FacultyInfo = {
  name: "Dr. Rajesh Kumar Sharma",
  facultyId: "FAC001",
  employeeId: "EMP12345",
  designation: "Associate Professor",
  department: "Computer Science and Engineering",
};

export function FacultyInfoHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-lg p-4 sticky top-0 z-40"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Faculty Name */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Faculty Name</p>
            <p className="text-sm font-semibold text-foreground truncate">
              {facultyData.name}
            </p>
          </div>
        </div>

        {/* Faculty ID */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Hash className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Faculty ID</p>
            <p className="text-sm font-semibold text-foreground font-mono">
              {facultyData.facultyId}
            </p>
          </div>
        </div>

        {/* Employee ID */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <Badge className="bg-success/20 text-success border-0 p-0 w-8 h-8 flex items-center justify-center text-xs">
              ID
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Employee ID</p>
            <p className="text-sm font-semibold text-foreground font-mono">
              {facultyData.employeeId}
            </p>
          </div>
        </div>

        {/* Designation */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warning/10 rounded-lg">
            <Briefcase className="w-4 h-4 text-warning" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Designation</p>
            <Badge variant="outline" className="text-xs bg-warning/5 text-warning border-warning/30">
              {facultyData.designation}
            </Badge>
          </div>
        </div>

        {/* Department */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-info/10 rounded-lg">
            <Building2 className="w-4 h-4 text-info" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="text-sm font-semibold text-foreground truncate">
              {facultyData.department}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}




