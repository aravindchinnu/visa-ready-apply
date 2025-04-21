
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Application {
  id: string;
  company: string;
  position: string;
  date: string;
  status: string;
  h1bStatus: string | boolean;
  atsScore?: number | null;
}

// Supabase structure:
interface ApplicationData {
  id: string;
  company_name: string;
  job_title: string;
  created_at: string;
  status: string;
  h1b_status: boolean | null;
  ats_score?: number | null; // Optional
  user_id: string;
  applied_at: string | null;
  updated_at: string | null;
  job_url: string | null;
}

export function useDashboardData() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    interviews: 0,
    h1bEligible: 0,
    successRate: 0,
  });
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [profileComplete, setProfileComplete] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const toastShownRef = useRef(false);

  const fetchApplications = async (userId: string) => {
    // If already loading or we've already shown an error toast, don't try again
    if (isLoading || (hasError && toastShownRef.current)) return;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const applicationData = data as unknown as ApplicationData[];

      const formattedApplications = applicationData.map(app => ({
        id: app.id,
        company: app.company_name,
        position: app.job_title,
        date: new Date(app.created_at).toISOString().split('T')[0],
        status: app.status,
        h1bStatus: app.h1b_status ? "Sponsors" : "Unknown",
        atsScore: app.ats_score !== undefined ? app.ats_score : null,
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
      
      // Reset error state if successful
      setHasError(false);
      toastShownRef.current = false;
      
    } catch (error) {
      setHasError(true);
      // Only show the toast once to prevent multiple notifications
      if (!toastShownRef.current) {
        toast({
          variant: "destructive",
          title: "Failed to load applications",
          description: "Please try refreshing the page",
        });
        toastShownRef.current = true;
      }
    } finally {
      setIsLoading(false);
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
      if (data.first_name) completeness += 25;
      if (data.resume_url) completeness += 50;
      setProfileComplete(completeness);
    } catch (error) {
      // Silent error on status
    }
  };

  return {
    applications,
    stats,
    resumeUploaded,
    profileComplete,
    isLoading,
    hasError,
    fetchApplications,
    checkProfileStatus,
    setApplications,
    setStats,
    setResumeUploaded,
    setProfileComplete,
  };
}
