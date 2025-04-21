
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function useDashboardAuth(onAuth: (userId: string) => void, onLogout?: () => void) {
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for redirect error parameters in the URL
    const handleRedirectErrors = () => {
      const params = new URLSearchParams(window.location.search);
      const errorCode = params.get("error_code");
      const errorDescription = params.get("error_description");
      
      if (errorCode || errorDescription) {
        console.log("Auth redirect error:", { errorCode, errorDescription });
        navigate(`/login?error_code=${errorCode || ''}&error_description=${errorDescription || ''}`);
        return true;
      }
      return false;
    };

    // Handle redirect errors first
    if (handleRedirectErrors()) {
      return; // Exit early if there was a redirect error
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state change:", event);
        setSession(newSession);
        setUserId(newSession?.user?.id || null);
        if (!newSession) {
          navigate('/login');
          onLogout && onLogout();
        }
      }
    );

    const fetchUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUserId(data.session?.user?.id || null);

      if (data.session?.user?.id) {
        onAuth(data.session.user.id);
      } else {
        navigate('/login');
        onLogout && onLogout();
      }
    };

    fetchUserSession();

    return () => {
      subscription.unsubscribe();
    };
    // Only dependency should be navigate (onAuth/onLogout are stable from parent)
  }, [navigate, onAuth, onLogout]);

  return { session, userId };
}
