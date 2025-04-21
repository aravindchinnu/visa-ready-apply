
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardMain from "./dashboard/DashboardMain";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check for access_token in URL (Supabase redirect after email confirmation)
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    
    if (accessToken) {
      console.log("Detected access_token in URL, handling authentication...");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");
      
      if (refreshToken && type) {
        // Set the session with the tokens from the URL
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          if (error) {
            console.error("Error setting session:", error);
            toast({
              variant: "destructive",
              title: "Authentication error",
              description: error.message,
            });
            navigate("/login", { replace: true });
          } else if (data.session) {
            toast({
              title: "Authentication successful",
              description: "You have been successfully authenticated.",
            });
            // Redirect to dashboard without the query parameters
            navigate("/dashboard", { replace: true });
          }
        });
      } else {
        // If we have accessToken but missing other required params
        toast({
          variant: "destructive",
          title: "Incomplete authentication parameters",
          description: "Some required authentication parameters are missing.",
        });
        navigate("/login", { replace: true });
      }
    }
  }, [location, navigate, toast]);

  return <DashboardMain />;
};

export default Dashboard;
