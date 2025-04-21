
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface JobBotTriggerProps {
  userId: string;
  onJobsFound?: (count: number) => void;
}

const JobBotTrigger = ({ userId, onJobsFound }: JobBotTriggerProps) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const { toast } = useToast();
  
  console.log("JobBotTrigger rendering with userId:", userId); // Debug log

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
          jobTitles: settings.job_type,
          locations: settings.work_mode === 'Remote' ? 'Remote' : undefined,
          h1bOnly: settings.h1b === 'Required',
          salary: settings.salary || undefined,
          autoApply: true,
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
    <Button
      onClick={triggerJobBotFromSettings}
      disabled={isTriggering}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg shadow-lg animate-pulse border-2 border-green-400 rounded-lg"
      size="lg"
      data-testid="trigger-job-bot"
    >
      {isTriggering ? (
        "Hunting for Jobs..."
      ) : (
        <>
          <Rocket className="mr-2 h-6 w-6" />
          TRIGGER JOB HUNT (Using Your Settings)
        </>
      )}
    </Button>
  );
};

export default JobBotTrigger;
