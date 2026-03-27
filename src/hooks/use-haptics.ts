import { Capacitor } from "@capacitor/core";

const IS_NATIVE = Capacitor.isNativePlatform();

let HapticsPlugin: typeof import("@capacitor/haptics").Haptics | null = null;

async function getHaptics() {
  if (!IS_NATIVE) return null;
  if (!HapticsPlugin) {
    const mod = await import("@capacitor/haptics");
    HapticsPlugin = mod.Haptics;
  }
  return HapticsPlugin;
}

export async function hapticLight() {
  const h = await getHaptics();
  if (!h) return;
  const { ImpactStyle } = await import("@capacitor/haptics");
  await h.impact({ style: ImpactStyle.Light });
}

export async function hapticMedium() {
  const h = await getHaptics();
  if (!h) return;
  const { ImpactStyle } = await import("@capacitor/haptics");
  await h.impact({ style: ImpactStyle.Medium });
}

export async function hapticSuccess() {
  const h = await getHaptics();
  if (!h) return;
  const { NotificationType } = await import("@capacitor/haptics");
  await h.notification({ type: NotificationType.Success });
}

export async function hapticWarning() {
  const h = await getHaptics();
  if (!h) return;
  const { NotificationType } = await import("@capacitor/haptics");
  await h.notification({ type: NotificationType.Warning });
}

export async function hapticSelection() {
  const h = await getHaptics();
  if (!h) return;
  await h.selectionStart();
  await h.selectionChanged();
  await h.selectionEnd();
}
