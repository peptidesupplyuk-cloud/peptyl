import { useState, useEffect } from "react";
import { User, Loader2, Save, Bell, Mail, MessageCircle, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface ProfileData {
  gender: string | null;
  age: number | null;
  username: string | null;
}

interface NotificationPrefs {
  notify_email: boolean;
  notify_whatsapp: boolean;
  whatsapp_number: string | null;
  notify_am_time: string;
  notify_pm_time: string;
}

const ProfileBiometrics = ({ onUpdate }: { onUpdate?: (bio: any) => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    gender: null,
    age: null,
    username: null,
  });
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    notify_email: true,
    notify_whatsapp: false,
    whatsapp_number: null,
    notify_am_time: "08:00",
    notify_pm_time: "20:00",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("gender, age, username, notify_email, notify_whatsapp, whatsapp_number, notify_am_time, notify_pm_time")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            gender: (data as any).gender as string | null,
            age: (data as any).age as number | null,
            username: (data as any).username as string | null,
          });
          setNotifPrefs({
            notify_email: (data as any).notify_email ?? true,
            notify_whatsapp: (data as any).notify_whatsapp ?? false,
            whatsapp_number: (data as any).whatsapp_number ?? null,
            notify_am_time: (data as any).notify_am_time ?? "08:00",
            notify_pm_time: (data as any).notify_pm_time ?? "20:00",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        gender: profile.gender,
        age: profile.age,
        username: profile.username,
        notify_email: notifPrefs.notify_email,
        notify_whatsapp: notifPrefs.notify_whatsapp,
        whatsapp_number: notifPrefs.whatsapp_number,
        notify_am_time: notifPrefs.notify_am_time,
        notify_pm_time: notifPrefs.notify_pm_time,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Your profile has been updated." });
      onUpdate?.(profile);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-center h-40">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
        <User className="h-4 w-4 text-primary" /> Your Profile
      </h2>

      <p className="text-xs text-muted-foreground">
        Body measurements (weight, BP, body fat etc.) are tracked in the <strong>Bloodwork</strong> tab so you can see changes over time.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Name</label>
          <input
            type="text"
            value={profile.username ?? ""}
            onChange={(e) => setProfile({ ...profile, username: e.target.value || null })}
            placeholder="Your name"
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <Users className="h-3 w-3" /> Gender
          </label>
          <select
            value={profile.gender ?? ""}
            onChange={(e) => setProfile({ ...profile, gender: e.target.value || null })}
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/40"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Age
          </label>
          <input
            type="number"
            value={profile.age ?? ""}
            onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="30"
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="border-t border-border pt-4 space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Reminder Alerts
        </h3>
        <p className="text-xs text-muted-foreground">Get consolidated AM/PM reminders across all active protocols.</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-foreground">Email reminders</span>
          </div>
          <Switch
            checked={notifPrefs.notify_email}
            onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, notify_email: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-foreground">WhatsApp reminders</span>
          </div>
          <Switch
            checked={notifPrefs.notify_whatsapp}
            onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, notify_whatsapp: v })}
          />
        </div>

        {notifPrefs.notify_whatsapp && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">WhatsApp number (with country code)</label>
            <input
              type="tel"
              value={notifPrefs.whatsapp_number ?? ""}
              onChange={(e) => setNotifPrefs({ ...notifPrefs, whatsapp_number: e.target.value || null })}
              placeholder="+447XXXXXXXXX"
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Include country code, no spaces (e.g. +447700900000)</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">AM reminder</label>
            <input
              type="time"
              value={notifPrefs.notify_am_time}
              onChange={(e) => setNotifPrefs({ ...notifPrefs, notify_am_time: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">PM reminder</label>
            <input
              type="time"
              value={notifPrefs.notify_pm_time}
              onChange={(e) => setNotifPrefs({ ...notifPrefs, notify_pm_time: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/40"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-brand hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Profile
      </button>
    </div>
  );
};

export default ProfileBiometrics;
