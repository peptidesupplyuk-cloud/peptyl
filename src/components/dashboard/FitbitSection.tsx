import { useState } from "react";
import { Watch, RefreshCw, Trash2, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const FitbitSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const { data: connection, isLoading } = useQuery({
    queryKey: ["fitbit-connection-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("fitbit_connections_safe" as any)
        .select("id, last_sync_at, fitbit_user_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as unknown as {
        id: string;
        last_sync_at: string | null;
        fitbit_user_id: string | null;
      } | null;
    },
  });

  const isConnected = !!connection;

  const handleConnect = async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
      }
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fitbit-authorize?token=${encodeURIComponent(session.access_token)}`;
      window.open(functionUrl, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to connect", variant: "destructive" });
    }
  };

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke("fitbit-sync", {
        body: { user_id: user.id },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["fitbit-connection-profile"] });
      queryClient.invalidateQueries({ queryKey: ["fitbit-metrics"] });
      toast({ title: "Synced", description: "Latest Fitbit data has been pulled." });
    } catch (err: any) {
      toast({ title: "Sync failed", description: err?.message || "Try again later.", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteData = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { error: metricsErr } = await supabase
        .from("fitbit_daily_metrics" as any)
        .delete()
        .eq("user_id", user.id);
      if (metricsErr) throw metricsErr;

      const { error: connErr } = await (supabase as any)
        .from("fitbit_connections")
        .delete()
        .eq("user_id", user.id);
      if (connErr) throw connErr;

      queryClient.invalidateQueries({ queryKey: ["fitbit-connection-profile"] });
      queryClient.invalidateQueries({ queryKey: ["fitbit-connection"] });
      queryClient.invalidateQueries({ queryKey: ["fitbit-metrics"] });
      toast({ title: "Data deleted", description: "All your Fitbit data has been removed and the connection has been disconnected." });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete data.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
        <Watch className="h-4 w-4 text-primary" /> Fitbit Integration
      </h3>

      {isConnected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm text-foreground">Connected</span>
            {connection.last_sync_at && (
              <span className="text-xs text-muted-foreground ml-auto">
                Last sync: {new Date(connection.last_sync_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Your heart rate, HRV, sleep, steps, and activity data syncs automatically every morning at 06:00 UTC.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="flex-1">
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
              Sync now
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete Fitbit data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all Fitbit data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove all your synced Fitbit metrics (heart rate, HRV, sleep, steps, activity) and disconnect your Fitbit account. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteData}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Connect your Fitbit to automatically sync heart rate, HRV, sleep, steps, and activity data to your dashboard.
          </p>
          <Button size="sm" onClick={handleConnect} className="w-full">
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Connect Fitbit
          </Button>
        </div>
      )}
    </div>
  );
};

export default FitbitSection;
