import { useState, useCallback, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

const IS_NATIVE = Capacitor.isNativePlatform();

interface HealthKitMetrics {
  steps: number | null;
  restingHeartRate: number | null;
  hrv: number | null;
  sleepMinutes: number | null;
  activeCalories: number | null;
}

type PermissionStatus = "undetermined" | "granted" | "denied" | "unavailable";

const EMPTY_METRICS: HealthKitMetrics = {
  steps: null,
  restingHeartRate: null,
  hrv: null,
  sleepMinutes: null,
  activeCalories: null,
};

const PERMISSIONS = [
  "READ_STEPS",
  "READ_ACTIVE_CALORIES",
  "READ_HEART_RATE",
] as const;

export function useHealthKit() {
  const [status, setStatus] = useState<PermissionStatus>(
    IS_NATIVE ? "undetermined" : "unavailable"
  );
  const [metrics, setMetrics] = useState<HealthKitMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    if (!IS_NATIVE) return;
    try {
      const { Health } = await import("capacitor-health");
      const available = await Health.isHealthAvailable();
      if (!available.available) {
        setStatus("unavailable");
        return;
      }
      const result = await Health.requestHealthPermissions({
        permissions: [...PERMISSIONS] as any,
      });
      // Check if at least steps permission was granted
      const hasGrant = result.permissions?.some(
        (p) => Object.values(p).some(Boolean)
      );
      setStatus(hasGrant ? "granted" : "denied");
    } catch (err) {
      console.error("[HealthKit] Permission request failed:", err);
      setStatus("denied");
    }
  }, []);

  const fetchMetrics = useCallback(async (dateStr?: string) => {
    if (!IS_NATIVE || status !== "granted") return;
    setLoading(true);
    try {
      const { Health } = await import("capacitor-health");
      const today = dateStr || new Date().toISOString().slice(0, 10);
      const startDate = `${today}T00:00:00.000Z`;
      const endDate = `${today}T23:59:59.999Z`;

      const [stepsResult, caloriesResult] = await Promise.all([
        Health.queryAggregated({
          dataType: "steps",
          bucket: "day",
          startDate,
          endDate,
        }).catch(() => null),
        Health.queryAggregated({
          dataType: "calories",
          bucket: "day",
          startDate,
          endDate,
        }).catch(() => null),
      ]);

      const steps = stepsResult?.data?.[0]?.steps ?? null;
      const activeCalories = caloriesResult?.data?.[0]?.calories ?? null;

      setMetrics({
        steps,
        restingHeartRate: null,
        hrv: null,
        sleepMinutes: null,
        activeCalories,
      });
    } catch (err) {
      console.error("[HealthKit] Fetch metrics failed:", err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "granted") {
      fetchMetrics();
    }
  }, [status, fetchMetrics]);

  return { status, metrics, loading, requestPermission, fetchMetrics };
}
