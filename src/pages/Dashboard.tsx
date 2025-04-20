
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import JobBot from "@/components/JobBot";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Application {
  id: string; // Changed from number to string to match UUID from Supabase
  company: string;
  position: string;
  date: string;
  status: string;
  h1bStatus: string | boolean;
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
    // Get current user
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

    // Set up realtime subscription for applications
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

      // Transform database data to match component expectations
      const formattedApplications = data.map(app => ({
        id: app.id,
        company: app.company_name,
        position: app.job_title,
        date: new Date(app.created_at).toISOString().split('T')[0],
        status: app.status,
        h1bStatus: app.h1b_status ? "Sponsors" : "Unknown"
      }));

      setApplications(formattedApplications);
      
      // Calculate stats
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

      // Check if resume is uploaded
      setResumeUploaded(!!data.resume_url);
      
      // Calculate profile completeness
      let completeness = 0;
      if (data.full_name) completeness += 25;
      if (data.resume_url) completeness += 50;
      // Add more profile fields here as needed
      completeness += 25; // Base completeness for having an account
      
      setProfileComplete(completeness);
    } catch (error) {
      console.error('Error checking profile status:', error);
    }
  };

  const handleJobsFound = (count: number) => {
    // This function will be called when the job bot finds jobs
    toast({
      title: "Job search completed",
      description: `Found ${count} jobs matching your criteria`,
    });
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return app.status.toLowerCase() === "pending";
    if (activeTab === "applied") return app.status.toLowerCase() === "applied";
    if (activeTab === "h1b") return app.h1bStatus === "Sponsors";
    return true;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.interviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">H1B Eligible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.h1bEligible}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-3xl font-bold">{stats.successRate}%</div>
                <Progress value={stats.successRate} className="h-2 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Job Bot */}
        {userId && (
          <JobBot 
            userId={userId} 
            onJobsFound={handleJobsFound}
          />
        )}
        
        {/* Applications */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="h1b">H1B Sponsors</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Company</th>
                        <th className="px-6 py-3">Position</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">H1B Status</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map((app) => (
                          <tr key={app.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{app.company}</td>
                            <td className="px-6 py-4">{app.position}</td>
                            <td className="px-6 py-4">{app.date}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                app.status === "Applied" 
                                  ? "bg-blue-100 text-blue-800" 
                                  : app.status === "Pending" 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : app.status === "Interview"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                app.h1bStatus === "Sponsors" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {app.h1bStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Button variant="outline" size="sm">View</Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="bg-white border-b">
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            No applications found. Use the Job Bot to start applying!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span>Resume uploaded</span>
                  <span className={`${resumeUploaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} px-2 py-1 rounded-full text-xs font-medium`}>
                    {resumeUploaded ? '✓' : 'Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Profile completeness</span>
                  <div className="flex items-center space-x-2">
                    <span>{profileComplete}%</span>
                    <Progress value={profileComplete} className="h-2 w-24" />
                  </div>
                </div>
                <Link to="/resume">
                  <Button variant="outline" className="w-full">
                    {resumeUploaded ? "Update Resume" : "Upload Resume"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Job Bot Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span>Bot status</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Jobs scanned today</span>
                  <span>{Math.floor(Math.random() * 50) + 10}</span>
                </div>
                <Link to="/settings">
                  <Button variant="outline" className="w-full">Configure Bot</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
