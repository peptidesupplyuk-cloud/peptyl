import { useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type ScheduleOptions } from "@capacitor/local-notifications";
import { useTodayInjections } from "@/hooks/use-injections";

const IS_NATIVE = Capacitor.isNativePlatform();

/**
 * Schedules local notifications for today's protocol doses:
 * - 30 minutes BEFORE scheduled time: "Time to prep your dose"
 * - 15 minutes AFTER scheduled time: "Did you complete this dose?"
 *
 * Actionable buttons: ✓ Done / ✗ Skip
 */
export function useProtocolNotifications() {
  const { data: injections = [] } = useTodayInjections();

  const scheduleNotifications = useCallback(async () => {
    if (!IS_NATIVE) return;

    try {
      // Request permission
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== "granted") {
        console.warn("Notification permission not granted");
        return;
      }

      // Cancel all existing scheduled notifications to avoid duplicates
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

        // 30 min before reminder
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

        // 15 min after follow-up
        const afterTime = new Date(scheduledTime.getTime() + 15 * 60 * 1000);
        if (afterTime > now) {
          notifications.push({
            id: hashId(`after-${inj.id}`),
            title: "💉 Did you complete your dose?",
            body: `${inj.peptide_name} (${inj.dose_mcg}mcg) was due 15 minutes ago. Tap to log.`,
            schedule: { at: afterTime },
            actionTypeId: "DOSE_ACTIONS",
            extra: { injectionId: inj.id, type: "after" },
          });
        }
      }

      if (notifications.length === 0) return;

      // Register action types (Done / Skip)
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: "DOSE_ACTIONS",
            actions: [
              { id: "done", title: "✓ Done" },
              { id: "skip", title: "✗ Skip" },
            ],
          },
        ],
      });

      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled ${notifications.length} protocol notifications`);
    } catch (err) {
      console.error("Failed to schedule notifications:", err);
    }
  }, [injections]);

  // Schedule whenever injections change
  useEffect(() => {
    scheduleNotifications();
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

        if (action.actionId === "done") {
          onDone(injectionId);
        } else if (action.actionId === "skip") {
          onSkip(injectionId);
        }
      }
    );

    return () => {
      listener.then((l) => l.remove());
    };
  }, [onDone, onSkip]);
}

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
