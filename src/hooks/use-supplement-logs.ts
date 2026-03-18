import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export type SupplementLog = {
  id: string;
  item: string;
  completed: boolean;
  date: string;
  protocol_id: string | null;
};

const todayStr = () => format(new Date(), "yyyy-MM-dd");

export const supplementLogKey = (item: string, protocolId?: string | null) => `${protocolId ?? "none"}::${item}`;

export const useDateSupplementLogs = (date: Date) => {
  const { user } = useAuth();
  const dateStr = format(date, "yyyy-MM-dd");
  return useQuery({
    queryKey: ["supplement-logs", user?.id, dateStr],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("supplement_logs")
        .select("id, item, completed, date, protocol_id")
        .eq("user_id", user.id)
        .eq("date", dateStr);
      if (error) throw error;
      return (data || []) as SupplementLog[];
    },
    enabled: !!user,
  });
};

export const useTodaySupplementLogs = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["supplement-logs", user?.id, todayStr()],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("supplement_logs")
        .select("id, item, completed, date, protocol_id")
        .eq("user_id", user.id)
        .eq("date", todayStr());
      if (error) throw error;
      return (data || []) as SupplementLog[];
    },
    enabled: !!user,
  });
};

export const useToggleSupplement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ item, protocolId, completed }: { item: string; protocolId?: string | null; completed: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      const date = todayStr();

      const existingQuery = supabase
        .from("supplement_logs")
        .select("id")
        .eq("user_id", user.id)
        .eq("item", item)
        .eq("date", date);

      const { data: existing, error: selectError } = protocolId
        ? await existingQuery.eq("protocol_id", protocolId).maybeSingle()
        : await existingQuery.is("protocol_id", null).maybeSingle();

      if (selectError) throw selectError;

      if (existing) {
        const { error } = await supabase
          .from("supplement_logs")
          .update({ completed })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("supplement_logs")
          .insert({ user_id: user.id, item, date, completed, protocol_id: protocolId ?? null });
        if (error) throw error;
      }
    },
    onMutate: async ({ item, protocolId, completed }) => {
      const key = ["supplement-logs", user?.id, todayStr()];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SupplementLog[]>(key);
      queryClient.setQueryData<SupplementLog[]>(key, (old = []) => {
        const matchKey = supplementLogKey(item, protocolId);
        const exists = old.find((l) => supplementLogKey(l.item, l.protocol_id) === matchKey);
        if (exists) {
          return old.map((l) =>
            supplementLogKey(l.item, l.protocol_id) === matchKey ? { ...l, completed } : l
          );
        }
        return [
          ...old,
          { id: `temp-${matchKey}`, item, completed, date: todayStr(), protocol_id: protocolId ?? null },
        ];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["supplement-logs", user?.id, todayStr()], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["supplement-logs", user?.id, todayStr()] });
      queryClient.invalidateQueries({ queryKey: ["supplement-logs"] });
    },
  });
};

export const useBatchCompleteSupplement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ item: string; protocolId?: string | null }>) => {
      if (!user) throw new Error("Not authenticated");
      const date = todayStr();

      const { data: existing, error: existingError } = await supabase
        .from("supplement_logs")
        .select("id, item, protocol_id")
        .eq("user_id", user.id)
        .eq("date", date);

      if (existingError) throw existingError;

      const existingMap = new Map(
        (existing || []).map((entry) => [supplementLogKey(entry.item, entry.protocol_id), entry.id])
      );

      const toInsert = items.filter(({ item, protocolId }) => !existingMap.has(supplementLogKey(item, protocolId)));
      const updateIds = items
        .map(({ item, protocolId }) => existingMap.get(supplementLogKey(item, protocolId)))
        .filter((id): id is string => Boolean(id));

      if (toInsert.length > 0) {
        const { error } = await supabase
          .from("supplement_logs")
          .insert(
            toInsert.map(({ item, protocolId }) => ({
              user_id: user.id,
              item,
              date,
              completed: true,
              protocol_id: protocolId ?? null,
            }))
          );
        if (error) throw error;
      }

      if (updateIds.length > 0) {
        const { error } = await supabase
          .from("supplement_logs")
          .update({ completed: true })
          .in("id", updateIds);
        if (error) throw error;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["supplement-logs"] });
    },
  });
};