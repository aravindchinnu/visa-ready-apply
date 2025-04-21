
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardRealtime(userId: string | null, onApplicationsChange: () => void) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('public:applications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onApplicationsChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onApplicationsChange]);
}
