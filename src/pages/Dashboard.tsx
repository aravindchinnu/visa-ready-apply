
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardMain from "./dashboard/DashboardMain";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for access_token in URL (Supabase redirect after email confirmation)
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    
    if (accessToken) {
      console.log("Detected access_token in URL, handling authentication...");
      // We will redirect to the dashboard without the query parameters
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate]);

  return <DashboardMain />;
};

export default Dashboard;
