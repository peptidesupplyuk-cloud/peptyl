import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export type SupplementLog = {
  id: string;
  item: string;
  completed: boolean;
  date: string;
};

const todayStr = () => format(new Date(), "yyyy-MM-dd");

export const useTodaySupplementLogs = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["supplement-logs", user?.id, todayStr()],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("supplement_logs")
        .select("id, item, completed, date")
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
    mutationFn: async ({ item, completed }: { item: string; completed: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      const date = todayStr();

      // Check if a log already exists for this item + date
      const { data: existing } = await supabase
        .from("supplement_logs")
        .select("id")
        .eq("user_id", user.id)
        .eq("item", item)
        .eq("date", date)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("supplement_logs")
          .update({ completed })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("supplement_logs")
          .insert({ user_id: user.id, item, date, completed });
        if (error) throw error;
      }
    },
    onMutate: async ({ item, completed }) => {
      const key = ["supplement-logs", user?.id, todayStr()];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SupplementLog[]>(key);
      queryClient.setQueryData<SupplementLog[]>(key, (old = []) => {
        const exists = old.find((l) => l.item === item);
        if (exists) return old.map((l) => l.item === item ? { ...l, completed } : l);
        return [...old, { id: "temp-" + item, item, completed, date: todayStr() }];
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
    },
  });
};

export const useBatchCompleteSupplement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: string[]) => {
      if (!user) throw new Error("Not authenticated");
      const date = todayStr();

      // Fetch existing logs for today
      const { data: existing } = await supabase
        .from("supplement_logs")
        .select("id, item")
        .eq("user_id", user.id)
        .eq("date", date);

      const existingItems = new Set((existing || []).map((e) => e.item));
      const toInsert = items.filter((i) => !existingItems.has(i));
      const toUpdate = items.filter((i) => existingItems.has(i));

      if (toInsert.length > 0) {
        const { error } = await supabase
          .from("supplement_logs")
          .insert(toInsert.map((item) => ({ user_id: user.id, item, date, completed: true })));
        if (error) throw error;
      }
      if (toUpdate.length > 0) {
        const updateIds = (existing || []).filter((e) => toUpdate.includes(e.item)).map((e) => e.id);
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
