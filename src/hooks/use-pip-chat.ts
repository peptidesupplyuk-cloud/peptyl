import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PipMessage {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  message_type: string;
  structured_data?: any;
  is_proactive?: boolean;
  created_at: string;
}

export function usePipChat() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // Load conversation history
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["pip-chat", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("pip_conversations")
        .select("id, direction, content, message_type, structured_data, is_proactive, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as PipMessage[];
    },
  });

  // Realtime subscription for new messages (proactive)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("pip-chat-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pip_conversations",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["pip-chat", user.id] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, qc]);

  const sendMessage = useCallback(async (text: string) => {
    if (!user || sending || !text.trim()) return;
    setSending(true);
    setError(null);

    // Optimistic inbound message
    const optimistic: PipMessage = {
      id: crypto.randomUUID(),
      direction: "inbound",
      content: text.trim(),
      message_type: "text",
      created_at: new Date().toISOString(),
    };
    qc.setQueryData<PipMessage[]>(["pip-chat", user.id], (old = []) => [...old, optimistic]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pip-web`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ message: text.trim(), sessionId: sessionIdRef.current }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to reach Pip");
      }

      // Refetch to get DB-stored messages
      qc.invalidateQueries({ queryKey: ["pip-chat", user.id] });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      // Remove optimistic message on error
      qc.setQueryData<PipMessage[]>(["pip-chat", user.id], (old = []) =>
        old.filter((m) => m.id !== optimistic.id)
      );
    } finally {
      setSending(false);
    }
  }, [user, sending, qc]);

  return { messages, isLoading, sending, error, sendMessage, setError };
}
