
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, Zap } from "lucide-react";

interface JobBotProps {
  userId: string;
  onJobsFound?: (count: number) => void;
}

const JobBot = ({ userId, onJobsFound }: JobBotProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [jobTitles, setJobTitles] = useState("Software Developer, Frontend Engineer, React Developer");
  const [locations, setLocations] = useState("San Francisco, New York, Remote");
  const [h1bOnly, setH1bOnly] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
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

  const triggerJobBotFromSettings = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "Please log in to use the job bot.",
      });
      return;
    }

    setIsTriggering(true);
    try {
      // Fetch job settings from settings page
      const { data: settings, error: settingsError } = await supabase
        .from('profiles')
        .select('job_type, work_mode, h1b, salary')
        .eq('id', userId)
        .single();

      if (settingsError) {
        throw new Error("Failed to fetch your job preferences. Please update your settings.");
      }

      // Use the job settings to search for jobs
      const { data, error } = await supabase.functions.invoke("job-scraper", {
        body: {
          userId,
          jobTitles: settings.job_type || jobTitles,
          locations: settings.work_mode === 'Remote' ? 'Remote' : locations,
          h1bOnly: settings.h1b === 'Required',
          salary: settings.salary || undefined,
          autoApply: true, // Specifically tell the function to auto-apply
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Job hunt initiated!",
        description: `Found ${data.jobsFound} jobs matching your settings. Auto-applying to all H1B-sponsoring companies.`,
      });

      if (onJobsFound) {
        onJobsFound(data.jobsFound);
      }
    } catch (error: any) {
      console.error("Job bot trigger error:", error);
      toast({
        variant: "destructive",
        title: "Job bot failed",
        description: error.message || "Please check your settings and try again later.",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Bot Control Center</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Button
            onClick={triggerJobBotFromSettings}
            disabled={isTriggering}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
            size="lg"
          >
            {isTriggering ? (
              "Hunting for Jobs..."
            ) : (
              <>
                <Rocket className="mr-2" /> 
                TRIGGER JOB HUNT (Using Your Settings)
              </>
            )}
          </Button>
        </div>

        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">OR CUSTOMIZE SEARCH</span>
          </div>
        </div>

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
          {isSearching ? "Searching for jobs..." : (
            <>
              <Zap className="mr-2" />
              Start Custom Job Search & Apply
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobBot;
