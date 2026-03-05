import { useEffect, useCallback, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type ScheduleOptions } from "@capacitor/local-notifications";
import { useTodayInjections } from "@/hooks/use-injections";

const IS_NATIVE = Capacitor.isNativePlatform();

/** Deterministic hash to generate numeric notification ID from string */
function hashId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function scheduleWebNotification(
  title: string,
  body: string,
  tag: string,
  delayMs: number,
  requireInteraction = false
): ReturnType<typeof setTimeout> | null {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  if (Notification.permission !== "granted") return null;
  if (delayMs <= 0) return null;
  return setTimeout(() => {
    try {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag,
        requireInteraction,
      });
    } catch (e) {
      console.warn("Web notification failed:", e);
    }
  }, delayMs);
}

export function useProtocolNotifications() {
  const { data: injections = [] } = useTodayInjections();
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scheduleNotifications = useCallback(async () => {
    if (IS_NATIVE) {
      try {
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== "granted") return;
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }
        const scheduled = injections.filter((i) => i.status === "scheduled");
        if (scheduled.length === 0) return;
        const notifications: ScheduleOptions["notifications"] = [];
        for (const inj of scheduled) {
          const scheduledTime = new Date(inj.scheduled_time);
          const now = new Date();
          const beforeTime = new Date(scheduledTime.getTime() - 30 * 60 * 1000);
          if (beforeTime > now) {
            notifications.push({
              id: hashId(`before-${inj.id}`),
              title: "⏰ Protocol Reminder",
              body: `${inj.peptide_name} (${inj.dose_mcg}mcg) is due in 30 minutes.`,
              schedule: { at: beforeTime },
              actionTypeId: "DOSE_ACTIONS",
              extra: { injectionId: inj.id, type: "before" },
            });
          }
          const afterTime = new Date(scheduledTime.getTime() + 15 * 60 * 1000);
          if (afterTime > now) {
            notifications.push({
              id: hashId(`after-${inj.id}`),
              title: "💊 Did you complete your dose?",
              body: `${inj.peptide_name} (${inj.dose_mcg}mcg) was due 15 minutes ago. Tap to log.`,
              schedule: { at: afterTime },
              actionTypeId: "DOSE_ACTIONS",
              extra: { injectionId: inj.id, type: "after" },
            });
          }
        }
        if (notifications.length === 0) return;
        await LocalNotifications.registerActionTypes({
          types: [{
            id: "DOSE_ACTIONS",
            actions: [
              { id: "done", title: "✓ Done" },
              { id: "skip", title: "✗ Skip" },
            ],
          }],
        });
        await LocalNotifications.schedule({ notifications });
      } catch (err) {
        console.error("Failed to schedule native notifications:", err);
      }
      return;
    }

    // WEB / PWA PATH
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const scheduled = injections.filter((i) => i.status === "scheduled");
    for (const inj of scheduled) {
      const scheduledTime = new Date(inj.scheduled_time).getTime();
      const now = Date.now();
      const t1 = scheduleWebNotification(
        "⏰ Protocol Reminder",
        `${inj.peptide_name} (${inj.dose_mcg}mcg) is due in 30 minutes.`,
        `before-${inj.id}`,
        scheduledTime - 30 * 60 * 1000 - now
      );
      if (t1) timeoutRefs.current.push(t1);
      const t2 = scheduleWebNotification(
        "💊 Did you complete your dose?",
        `${inj.peptide_name} (${inj.dose_mcg}mcg) was due 15 minutes ago. Tap to log.`,
        `after-${inj.id}`,
        scheduledTime + 15 * 60 * 1000 - now,
        true
      );
      if (t2) timeoutRefs.current.push(t2);
    }
  }, [injections]);

  useEffect(() => {
    scheduleNotifications();
    return () => { timeoutRefs.current.forEach(clearTimeout); };
  }, [scheduleNotifications]);

  return { scheduleNotifications };
}

/**
 * Listen for notification action responses (Done / Skip).
 * Call this once at app root level.
 */
export function useNotificationActions(
  onDone: (injectionId: string) => void,
  onSkip: (injectionId: string) => void
) {
  useEffect(() => {
    if (!IS_NATIVE) return;
    const listener = LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (action) => {
        const injectionId = action.notification.extra?.injectionId;
        if (!injectionId) return;
        if (action.actionId === "done") onDone(injectionId);
        else if (action.actionId === "skip") onSkip(injectionId);
      }
    );
    return () => { listener.then((l) => l.remove()); };
  }, [onDone, onSkip]);
}

export function useRequestNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);
  const shouldAsk =
    !IS_NATIVE &&
    permission === "default" &&
    typeof window !== "undefined" &&
    "Notification" in window;
  return { shouldAsk, permission, requestPermission };
}