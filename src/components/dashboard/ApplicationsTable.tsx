
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Application {
  id: string;
  company: string;
  position: string;
  date: string;
  status: string;
  h1bStatus: string | boolean;
}

interface ApplicationsTableProps {
  applications: Application[];
  activeTab: string;
}

const ApplicationsTable = ({ applications, activeTab }: ApplicationsTableProps) => {
  const filteredApplications = applications.filter(app => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return app.status.toLowerCase() === "pending";
    if (activeTab === "applied") return app.status.toLowerCase() === "applied";
    if (activeTab === "h1b") return app.h1bStatus === "Sponsors";
    return true;
  });

  return (
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
  );
};

export default ApplicationsTable;
