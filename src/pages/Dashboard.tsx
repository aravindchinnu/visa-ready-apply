
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const Dashboard = () => {
  const [applications, setApplications] = useState([
    { 
      id: 1, 
      company: "Tech Innovations Inc", 
      position: "Senior Frontend Developer", 
      date: "2025-04-15", 
      status: "Applied", 
      h1bStatus: "Sponsors" 
    },
    { 
      id: 2, 
      company: "Global Systems", 
      position: "Full Stack Engineer", 
      date: "2025-04-14", 
      status: "Pending", 
      h1bStatus: "Sponsors" 
    },
    { 
      id: 3, 
      company: "Data Dynamics", 
      position: "React Developer", 
      date: "2025-04-12", 
      status: "Rejected", 
      h1bStatus: "Unknown" 
    },
  ]);

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
              <div className="text-3xl font-bold">24</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">H1B Eligible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="text-3xl font-bold">12%</div>
                <Progress value={12} className="h-2 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Applications */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="h1b">H1B Sponsors</TabsTrigger>
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
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">H1B Status</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
            <Card>
              <CardContent>
                <p>Pending applications will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="applied" className="mt-4">
            <Card>
              <CardContent>
                <p>Applied jobs will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="h1b" className="mt-4">
            <Card>
              <CardContent>
                <p>Jobs with H1B sponsorship will appear here.</p>
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
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Profile completeness</span>
                  <div className="flex items-center space-x-2">
                    <span>85%</span>
                    <Progress value={85} className="h-2 w-24" />
                  </div>
                </div>
                <Link to="/profile">
                  <Button variant="outline" className="w-full">Update Profile</Button>
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
                  <span>48</span>
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
