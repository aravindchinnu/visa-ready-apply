
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import JobBot from "@/components/JobBot";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import StatsCards from "@/components/dashboard/StatsCards";
import ApplicationsTable from "@/components/dashboard/ApplicationsTable";
import QuickActions from "@/components/dashboard/QuickActions";

interface Application {
  id: string;
  company: string;
  position: string;
  date: string;
  status: string;
  h1bStatus: string | boolean;
  atsScore?: number | null;
}

const Dashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    interviews: 0,
    h1bEligible: 0,
    successRate: 0,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [profileComplete, setProfileComplete] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchApplications(user.id);
        checkProfileStatus(user.id);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('public:applications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchApplications(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedApplications = data.map(app => ({
        id: app.id,
        company: app.company_name,
        position: app.job_title,
        date: new Date(app.created_at).toISOString().split('T')[0],
        status: app.status,
        h1bStatus: app.h1b_status ? "Sponsors" : "Unknown",
        atsScore: typeof app.ats_score === "number" ? app.ats_score : null, // ATS score per application (may be undefined)
      }));

      setApplications(formattedApplications);

      const total = data.length;
      const interviews = data.filter(app => app.status === "Interview").length;
      const h1bEligible = data.filter(app => app.h1b_status === true).length;
      const successRate = total > 0 ? Math.round((interviews / total) * 100) : 0;

      setStats({
        total,
        interviews,
        h1bEligible,
        successRate
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        variant: "destructive",
        title: "Failed to load applications",
        description: "Please try refreshing the page",
      });
    }
  };

  const checkProfileStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setResumeUploaded(!!data.resume_url);
      
      let completeness = 0;
      // Fix here - use first_name instead of full_name
      if (data.first_name) completeness += 25;
      if (data.resume_url) completeness += 50;
      setProfileComplete(completeness);
    } catch (error) {
      console.error('Error checking profile status:', error);
    }
  };

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
        
        {userId && (
          <JobBot 
            userId={userId} 
            onJobsFound={handleJobsFound}
          />
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
        
        <QuickActions
          resumeUploaded={resumeUploaded}
          profileComplete={profileComplete}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
