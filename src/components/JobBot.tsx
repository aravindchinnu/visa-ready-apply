
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JobBotTrigger from "@/components/JobBotTrigger";
import CustomJobSearchForm from "@/components/CustomJobSearchForm";

interface JobBotProps {
  userId: string;
  onJobsFound?: (count: number) => void;
}

const JobBot = ({ userId, onJobsFound }: JobBotProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Bot Control Center</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <JobBotTrigger userId={userId} onJobsFound={onJobsFound} />
        </div>

        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">OR CUSTOMIZE SEARCH</span>
          </div>
        </div>

        <CustomJobSearchForm userId={userId} onJobsFound={onJobsFound} />
      </CardContent>
    </Card>
  );
};

export default JobBot;
