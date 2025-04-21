
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function useDashboardAuth(onAuth: (userId: string) => void, onLogout?: () => void) {
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
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
  }, [navigate]);

  return { session, userId };
}
