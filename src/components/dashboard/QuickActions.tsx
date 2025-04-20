
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface QuickActionsProps {
  resumeUploaded: boolean;
  profileComplete: number;
}

const QuickActions = ({ resumeUploaded, profileComplete }: QuickActionsProps) => {
  return (
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
  );
};

export default QuickActions;
