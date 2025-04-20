
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobBotProps {
  userId: string;
  onJobsFound?: (count: number) => void;
}

const JobBot = ({ userId, onJobsFound }: JobBotProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [jobTitles, setJobTitles] = useState("Software Developer, Frontend Engineer, React Developer");
  const [locations, setLocations] = useState("San Francisco, New York, Remote");
  const [h1bOnly, setH1bOnly] = useState(true);
  const { toast } = useToast();

  const handleStartSearch = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "Please log in to use the job bot.",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("job-scraper", {
        body: {
          userId,
          jobTitles,
          locations,
          h1bOnly,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Job search successful",
        description: `Found ${data.jobsFound} jobs matching your criteria. Auto-applying now...`,
      });

      if (onJobsFound) {
        onJobsFound(data.jobsFound);
      }
    } catch (error: any) {
      console.error("Job search error:", error);
      toast({
        variant: "destructive",
        title: "Job search failed",
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Bot Control Center</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="job-titles">Job Titles</Label>
          <Input
            id="job-titles"
            value={jobTitles}
            onChange={(e) => setJobTitles(e.target.value)}
            placeholder="e.g., Software Developer, Frontend Engineer"
          />
          <p className="text-xs text-gray-500">
            Comma-separated list of job titles to search for
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="locations">Locations</Label>
          <Input
            id="locations"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            placeholder="e.g., San Francisco, Remote, New York"
          />
          <p className="text-xs text-gray-500">
            Comma-separated list of locations to search in
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="h1b-only">Only H1B sponsoring companies</Label>
          <Switch
            id="h1b-only"
            checked={h1bOnly}
            onCheckedChange={setH1bOnly}
          />
        </div>

        <Button
          onClick={handleStartSearch}
          disabled={isSearching}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSearching ? "Searching for jobs..." : "Start Job Search & Auto-Apply"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobBot;
