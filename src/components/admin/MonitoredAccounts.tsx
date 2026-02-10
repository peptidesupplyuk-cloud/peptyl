import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Twitter, Plus, Loader2, Trash2, RefreshCw, Clock,
} from "lucide-react";

const MonitoredAccounts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newHandle, setNewHandle] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["monitored-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monitored_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addAccount = useMutation({
    mutationFn: async (handle: string) => {
      const clean = handle.replace("@", "").trim();
      if (!clean) throw new Error("Handle is required");
      const { error } = await supabase.from("monitored_accounts").insert({
        handle: clean,
        added_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitored-accounts"] });
      setNewHandle("");
      toast({ title: "Account added" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const toggleAccount = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("monitored_accounts").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["monitored-accounts"] }),
  });

  const removeAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("monitored_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitored-accounts"] });
      toast({ title: "Account removed" });
    },
  });

  const handleScanAll = async () => {
    setIsScanning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-twitter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({}),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Scan failed");
      toast({
        title: "Scan complete",
        description: `Scanned ${result.scanned} accounts. Check the Review tab for new findings.`,
      });
      queryClient.invalidateQueries({ queryKey: ["monitored-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    } catch (err: any) {
      toast({ title: "Scan failed", description: err.message, variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Twitter className="h-5 w-5 text-primary" /> Monitored X Accounts ({accounts.length})
        </h2>
        <Button size="sm" variant="outline" onClick={handleScanAll} disabled={isScanning || accounts.length === 0}>
          {isScanning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
          Scan Now
        </Button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); addAccount.mutate(newHandle); }}
        className="flex gap-2"
      >
        <Input
          placeholder="@handle (e.g. PeptideScience)"
          value={newHandle}
          onChange={(e) => setNewHandle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={addAccount.isPending || !newHandle.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : accounts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <Twitter className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No accounts being monitored. Add X handles above to start scanning for peptide content.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((acc) => (
            <div key={acc.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
              <Switch
                checked={acc.is_active}
                onCheckedChange={(checked) => toggleAccount.mutate({ id: acc.id, is_active: checked })}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-foreground">@{acc.handle}</span>
                  {acc.display_name && <span className="text-xs text-muted-foreground">({acc.display_name})</span>}
                  <Badge variant="outline" className={`text-[10px] ${acc.is_active ? "text-green-600" : "text-muted-foreground"}`}>
                    {acc.is_active ? "active" : "paused"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <Clock className="h-3 w-3" />
                  {acc.last_scanned_at
                    ? `Last scanned ${new Date(acc.last_scanned_at).toLocaleString()}`
                    : "Never scanned"}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive h-8 w-8 p-0"
                onClick={() => removeAccount.mutate(acc.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-muted/30 border border-border rounded-lg p-3 space-y-1">
        <p className="text-xs font-medium text-foreground">Suggested accounts to monitor:</p>
        <div className="flex flex-wrap gap-1.5">
          {["PeptideSciences", "Nootropic", "AndrewHuberman", "FoundMyFitness", "PeterAttiaMD", "hubaborhidi"].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setNewHandle(h)}
              className="text-[11px] px-2 py-1 rounded-md bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-colors"
            >
              @{h}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonitoredAccounts;
