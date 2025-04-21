
import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobBot from "@/components/JobBot";
import StatsCards from "@/components/dashboard/StatsCards";
import ApplicationsTable from "@/components/dashboard/ApplicationsTable";
import QuickActions from "@/components/dashboard/QuickActions";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { useDashboardAuth } from "./useDashboardAuth";
import { useDashboardRealtime } from "./useDashboardRealtime";
import { useDashboardData } from "./useDashboardData";

// Re-exported Application type for local use
interface Application {
  id: string;
  company: string;
  position: string;
  date: string;
  status: string;
  h1bStatus: string | boolean;
  atsScore?: number | null;
}

const DashboardMain = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { applications, stats, resumeUploaded, profileComplete, fetchApplications, checkProfileStatus } = useDashboardData();
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Auth and Init handlers
  const authHandler = useCallback(
    (uid: string) => {
      setUserId(uid);
    },
    []
  );

  useDashboardAuth(
    uid => {
      setUserId(uid);
      fetchApplications(uid);
      checkProfileStatus(uid);
    },
    () => setUserId(null)
  );

  // Subscribe to realtime updates
  useDashboardRealtime(userId, () => {
    if (userId) {
      fetchApplications(userId);
    }
  });

  const handleJobsFound = (count: number) => {
    toast({
      title: "Job search completed",
      description: `Found ${count} jobs matching your criteria`,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <StatsCards stats={stats} />

        {/* JobBot Component - Prominently displayed */}
        {userId ? (
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              Job Search & Auto-Apply
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Use this tool to search for jobs and automatically apply based on your profile settings.
            </p>
            <JobBot userId={userId} onJobsFound={handleJobsFound} />
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300 mb-6">
            <h2 className="text-xl font-semibold mb-2">User ID not available</h2>
            <p>Please make sure you're logged in to access the Job Bot.</p>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="h1b">H1B Sponsors</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            <ApplicationsTable applications={applications} activeTab={activeTab} />
          </TabsContent>
        </Tabs>

        <QuickActions resumeUploaded={resumeUploaded} profileComplete={profileComplete} />
      </div>
    </DashboardLayout>
  );
};

export default DashboardMain;
