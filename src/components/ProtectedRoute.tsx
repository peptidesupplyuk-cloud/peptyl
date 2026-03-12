import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const MANDATORY_FIELDS = ["first_name", "last_name", "country", "research_goal", "experience_level"] as const;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const { data: profileComplete, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-complete", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, country, research_goal, experience_level")
        .eq("user_id", user!.id)
        .single();
      if (!data) return false;
      return MANDATORY_FIELDS.every((f) => !!(data as any)[f]);
    },
  });

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Allow the complete-profile page itself to render
  if (location.pathname === "/complete-profile") {
    return <>{children}</>;
  }

  if (profileComplete === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
