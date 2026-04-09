import { useState } from "react";
import { MainLayout } from "@/pages/faculty/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/pages/faculty/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import SubstituteApprovalPanel from "./SubstituteApprovalPanel";
import InchargeAlterationQueue from "./InchargeAlterationQueue";
import { CheckCircle2, ListChecks, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function AlterationApproval() {
  const { user } = useAuth();
  const isTimetableIncharge = user?.is_timetable_incharge || false;
  const [activeTab, setActiveTab] = useState(isTimetableIncharge ? "incharge" : "substitute");

  return (
    <MainLayout hideHeader={true}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold font-serif">Alteration Management</h1>
          <p className="text-muted-foreground">Manage substitution requests and timetable alterations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="substitute" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              My Requests
            </TabsTrigger>
            {isTimetableIncharge && (
              <TabsTrigger value="incharge" className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                Incharge Queue
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="substitute" className="mt-6">
            {/* We might need to modify SubstituteApprovalPanel to remove its own MainLayout or use its core logic */}
            <SubstituteApprovalPanel isNested={true} />
          </TabsContent>

          {isTimetableIncharge && (
            <TabsContent value="incharge" className="mt-6">
              <InchargeAlterationQueue isNested={true} />
            </TabsContent>
          )}
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
