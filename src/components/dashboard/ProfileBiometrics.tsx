import { useState, useEffect } from "react";
import { User, Loader2, Save, Bell, Mail, MessageCircle, Users, Calendar, ShieldCheck, Send, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface ProfileData {
  gender: string | null;
  age: number | null;
  username: string | null;
}

interface NotificationPrefs {
  notify_email: boolean;
  notify_whatsapp: boolean;
  whatsapp_number: string | null;
  whatsapp_verified: boolean;
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
    whatsapp_verified: false,
    notify_am_time: "08:00",
    notify_pm_time: "20:00",
  });

  // WhatsApp verification flow state
  const [verifyStep, setVerifyStep] = useState<"idle" | "number" | "code">("idle");
  const [verifyNumber, setVerifyNumber] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("gender, age, username, notify_email, notify_whatsapp, whatsapp_number, whatsapp_verified, notify_am_time, notify_pm_time")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            gender: (data as any).gender as string | null,
            age: (data as any).age as number | null,
            username: (data as any).username as string | null,
          });
          const prefs = {
            notify_email: (data as any).notify_email ?? true,
            notify_whatsapp: (data as any).notify_whatsapp ?? false,
            whatsapp_number: (data as any).whatsapp_number ?? null,
            whatsapp_verified: (data as any).whatsapp_verified ?? false,
            notify_am_time: (data as any).notify_am_time ?? "08:00",
            notify_pm_time: (data as any).notify_pm_time ?? "20:00",
          };
          setNotifPrefs(prefs);
          if (prefs.whatsapp_number) setVerifyNumber(prefs.whatsapp_number);
        }
        setLoading(false);
      });
  }, [user]);

  const handleWhatsAppToggle = (enabled: boolean) => {
    if (enabled) {
      if (notifPrefs.whatsapp_verified && notifPrefs.whatsapp_number) {
        // Already verified, just enable
        setNotifPrefs({ ...notifPrefs, notify_whatsapp: true });
      } else {
        // Start verification flow
        setVerifyStep("number");
        setNotifPrefs({ ...notifPrefs, notify_whatsapp: false });
      }
    } else {
      setNotifPrefs({ ...notifPrefs, notify_whatsapp: false });
      setVerifyStep("idle");
    }
  };

  const handleSendCode = async () => {
    if (!verifyNumber.trim()) {
      toast({ title: "Enter your number", description: "Please enter your WhatsApp number.", variant: "destructive" });
      return;
    }
    setSendingCode(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-verify", {
        body: { whatsapp_number: verifyNumber.trim() },
      });
      // Edge function returns non-2xx as an error with context in data
      if (error) {
        // Try to extract a user-friendly message from the response
        const msg = (data as any)?.error || error.message || "Failed to send code";
        toast({ title: "Could not send code", description: msg, variant: "destructive" });
      } else if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      } else {
        setVerifyStep("code");
        toast({ title: "Code sent", description: "Check your WhatsApp for a 6-digit code." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send code", variant: "destructive" });
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verifyCode.length !== 6) return;
    setVerifying(true);
    try {
      // Check code against profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("whatsapp_verify_code, whatsapp_verify_expires_at")
        .eq("user_id", user!.id)
        .single();

      if (!profileData) throw new Error("Profile not found");

      const code = (profileData as any).whatsapp_verify_code;
      const expiresAt = (profileData as any).whatsapp_verify_expires_at;

      if (!code || !expiresAt) {
        toast({ title: "Error", description: "No verification code found. Please request a new one.", variant: "destructive" });
        setVerifying(false);
        return;
      }

      if (new Date(expiresAt) < new Date()) {
        toast({ title: "Expired", description: "Code has expired. Please request a new one.", variant: "destructive" });
        setVerifyStep("number");
        setVerifying(false);
        return;
      }

      if (code !== verifyCode) {
        toast({ title: "Incorrect", description: "Incorrect code, please try again.", variant: "destructive" });
        setVerifying(false);
        return;
      }

      // Code is correct — mark verified
      await supabase
        .from("profiles")
        .update({
          whatsapp_verified: true,
          notify_whatsapp: true,
          whatsapp_verify_code: null,
          whatsapp_verify_expires_at: null,
        } as any)
        .eq("user_id", user!.id);

      setNotifPrefs({
        ...notifPrefs,
        notify_whatsapp: true,
        whatsapp_number: verifyNumber.trim(),
        whatsapp_verified: true,
      });
      setVerifyStep("idle");
      setVerifyCode("");
      toast({ title: "Verified ✓", description: "WhatsApp reminders are now active." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Verification failed", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

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

        <div className="relative">
          {/* Coming Soon overlay */}
          <div className="absolute inset-0 z-10 backdrop-blur-md bg-background/40 rounded-xl flex flex-col items-center justify-center gap-2">
            <div className="bg-primary/10 rounded-full p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-heading font-bold text-base text-foreground">Coming Soon</h4>
            <p className="text-xs text-muted-foreground text-center max-w-xs px-3">
              WhatsApp & email reminders are being finalised. Check back soon.
            </p>
          </div>

          <div className="pointer-events-none select-none space-y-3" aria-hidden="true">
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
            {notifPrefs.whatsapp_verified && notifPrefs.notify_whatsapp && (
              <span className="flex items-center gap-0.5 text-[10px] text-primary">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <Switch
            checked={notifPrefs.notify_whatsapp}
            onCheckedChange={handleWhatsAppToggle}
          />
        </div>

        {/* WhatsApp verification flow - Step 1: Enter number */}
        {verifyStep === "number" && (
          <div className="ml-6 space-y-2 p-3 rounded-xl bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground">
              We'll send a verification code via WhatsApp to confirm your number.
            </p>
            <input
              type="tel"
              value={verifyNumber}
              onChange={(e) => setVerifyNumber(e.target.value)}
              placeholder="+447XXXXXXXXX"
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
            />
            <p className="text-[10px] text-muted-foreground">Include country code (e.g. +447700900000) or UK format (07700900000)</p>
            <Button
              size="sm"
              onClick={handleSendCode}
              disabled={sendingCode || !verifyNumber.trim()}
              className="w-full"
            >
              {sendingCode ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
              Send Verification Code
            </Button>
          </div>
        )}

        {/* WhatsApp verification flow - Step 2: Enter code */}
        {verifyStep === "code" && (
          <div className="ml-6 space-y-3 p-3 rounded-xl bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to <strong>{verifyNumber}</strong>
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={verifyCode} onChange={setVerifyCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={() => { setVerifyStep("number"); setVerifyCode(""); }}
              >
                Back
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleVerifyCode}
                disabled={verifying || verifyCode.length !== 6}
              >
                {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1" />}
                Verify
              </Button>
            </div>
          </div>
        )}

        {/* Show current verified number when WhatsApp is active */}
        {notifPrefs.notify_whatsapp && notifPrefs.whatsapp_verified && verifyStep === "idle" && (
          <div className="ml-6">
            <p className="text-xs text-muted-foreground">
              Sending to <strong>{notifPrefs.whatsapp_number}</strong>
              <button
                className="text-primary ml-2 underline text-[10px]"
                onClick={() => setVerifyStep("number")}
              >
                Change number
              </button>
            </p>
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
