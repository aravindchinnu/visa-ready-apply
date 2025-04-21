
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import JobBot from "@/components/JobBot";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import StatsCards from "@/components/dashboard/StatsCards";
import ApplicationsTable from "@/components/dashboard/ApplicationsTable";
import QuickActions from "@/components/dashboard/QuickActions";
import { useNavigate } from "react-router-dom";

interface Application {
  id: string;
  company: string;
  position: string;
  date: string;
  status: string;
  h1bStatus: string | boolean;
  atsScore?: number | null;
}

// Define a more complete type that matches what's coming from Supabase
interface ApplicationData {
  id: string;
  company_name: string;
  job_title: string;
  created_at: string;
  status: string;
  h1b_status: boolean | null;
  ats_score?: number | null; // Make this property optional to match database
  user_id: string;
  applied_at: string | null;
  updated_at: string | null;
  job_url: string | null;
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
  const [session, setSession] = useState<any>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [profileComplete, setProfileComplete] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Set up auth state listener first
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        setUserId(newSession?.user?.id || null);
        
        if (!newSession) {
          // User is not logged in, redirect to login page
          navigate('/login');
        }
      }
    );

    // Then check for existing session
    const fetchUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Current session:", data.session?.user?.id);
      setSession(data.session);
      setUserId(data.session?.user?.id || null);
      
      if (data.session?.user?.id) {
        fetchApplications(data.session.user.id);
        checkProfileStatus(data.session.user.id);
      } else {
        // User is not logged in, redirect to login page
        navigate('/login');
      }
    };

    fetchUserSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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

      // Safely cast the data to our more comprehensive type
      const applicationData = data as unknown as ApplicationData[];

      const formattedApplications = applicationData.map(app => ({
        id: app.id,
        company: app.company_name,
        position: app.job_title,
        date: new Date(app.created_at).toISOString().split('T')[0],
        status: app.status,
        h1bStatus: app.h1b_status ? "Sponsors" : "Unknown",
        atsScore: app.ats_score !== undefined ? app.ats_score : null, // Safely handle the ats_score property
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

  console.log("Dashboard rendering, userId:", userId); // Debug log

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <StatsCards stats={stats} />
        
        {/* JobBot Component - Prominently displayed with debug info */}
        {userId ? (
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">Job Search & Auto-Apply</h2>
            <p className="text-sm text-gray-600 mb-4">Use this tool to search for jobs and automatically apply based on your profile settings.</p>
            <JobBot 
              userId={userId} 
              onJobsFound={handleJobsFound}
            />
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
        
        <QuickActions
          resumeUploaded={resumeUploaded}
          profileComplete={profileComplete}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
