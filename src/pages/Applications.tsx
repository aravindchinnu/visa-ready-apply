
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Application {
  id: string;
  company: string;
  position: string;
  date: string;
  location: string;
  status: string;
  h1bStatus: string;
  salary: string;
  atsScore?: number | null;
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID and applications on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchApplications(user.id);
      }
    };
    fetchUserData();
  }, []);

  // Realtime updates for this user's applications
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('public:applications_page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchApplications(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Fetch applications from Supabase
  const fetchApplications = async (userId: string) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      setApplications([]);
      return;
    }
    // Convert DB rows to the Application type needed for display
    const formatted = (data || []).map((app: any) => ({
      id: app.id,
      company: app.company_name,
      position: app.job_title,
      date: app.created_at ? new Date(app.created_at).toISOString().split('T')[0] : "",
      location: "-", // Supabase does not currently store location directly
      status: app.status || "Pending",
      h1bStatus: app.h1b_status === true ? "Sponsors" : "Unknown",
      salary: "-", // Supabase does not store salary currently
      atsScore: typeof app.ats_score === "number" ? app.ats_score : null,
    }));
    setApplications(formatted);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Interview":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-gray-500 mt-2">Track all your job applications (Realtime updates)</p>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="w-full md:w-80">
              <Input placeholder="Search applications..." />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="H1B Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sponsors">H1B Sponsors</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
                <SelectItem value="no">No Sponsorship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="bg-blue-600 hover:bg-blue-700">
            + Add Manual Application
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Company</th>
                        <th className="px-6 py-3">Position</th>
                        <th className="px-6 py-3">Location</th>
                        <th className="px-6 py-3">Date Applied</th>
                        <th className="px-6 py-3">Salary Range</th>
                        <th className="px-6 py-3">ATS Score</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">H1B</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{app.company}</td>
                          <td className="px-6 py-4">{app.position}</td>
                          <td className="px-6 py-4">{app.location}</td>
                          <td className="px-6 py-4">{app.date}</td>
                          <td className="px-6 py-4">{app.salary}</td>
                          <td className="px-6 py-4">
                            {app.atsScore !== null && app.atsScore !== undefined
                              ? <span>{app.atsScore}</span>
                              : <span className="text-gray-400">N/A</span>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(app.status)}`}>
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
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="active" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Active applications (Applied and Interview stages) will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="interviews" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Interview Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Applications with scheduled interviews will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Rejected applications will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {applications.length === 0
              ? "No applications found"
              : `Showing ${applications.length} application(s)`}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Applications;

