import { AlertTriangle, FileDown, Info } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const tierStyles: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-400 border-red-500/30",
  gp_week: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  next_appt: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

const tierLabels: Record<string, string> = {
  urgent: "Urgent",
  gp_week: "This week",
  next_appt: "Next appointment",
};

const GpSummarySection = () => {
  const { user } = useAuth();

  const { data: flags = [] } = useQuery({
    queryKey: ["gp-flags", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_conversations")
        .select("id, message, trigger_type, created_at")
        .eq("user_id", user!.id)
        .eq("direction", "outbound")
        .like("trigger_type", "clinical_flag%")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Extract clinical_tier from trigger_type like "clinical_flag:urgent"
  const parseTier = (trigger: string | null) => {
    if (!trigger) return "next_appt";
    const parts = trigger.split(":");
    return parts[1] || "next_appt";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-card rounded-2xl border border-border p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-semibold text-foreground">GP Summary</h3>
          <p className="text-xs text-muted-foreground">Clinical flags from Pip</p>
        </div>
      </div>

      {flags.length > 0 ? (
        <div className="space-y-3">
          {flags.map((f) => {
            const tier = parseTier(f.trigger_type);
            return (
              <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(f.created_at), "dd MMM yyyy")}
                    </span>
                    <Badge className={`text-[10px] border ${tierStyles[tier] || tierStyles.next_appt}`}>
                      {tierLabels[tier] || tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/80">
                    {f.message.slice(0, 120)}{f.message.length > 120 ? "…" : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" disabled title="Coming soon">
                  <FileDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/30">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            GP summaries are automatically generated when Pip detects something in your health data worth discussing with a doctor.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default GpSummarySection;
