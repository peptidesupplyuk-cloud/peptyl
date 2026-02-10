import { useState, useEffect } from "react";
import { User, Ruler, Weight, Heart, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Biometrics {
  height_cm: number | null;
  weight_kg: number | null;
  bp_systolic: number | null;
  bp_diastolic: number | null;
}

const ProfileBiometrics = ({ onUpdate }: { onUpdate?: (bio: Biometrics) => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState<Biometrics>({
    height_cm: null,
    weight_kg: null,
    bp_systolic: null,
    bp_diastolic: null,
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("height_cm, weight_kg, bp_systolic, bp_diastolic")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setBio({
            height_cm: data.height_cm as number | null,
            weight_kg: data.weight_kg as number | null,
            bp_systolic: data.bp_systolic as number | null,
            bp_diastolic: data.bp_diastolic as number | null,
          });
        }
        setLoading(false);
      });
  }, [user]);

  const bmi = bio.height_cm && bio.weight_kg
    ? (bio.weight_kg / Math.pow(bio.height_cm / 100, 2)).toFixed(1)
    : null;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-info" };
    if (bmi < 25) return { label: "Normal", color: "text-success" };
    if (bmi < 30) return { label: "Overweight", color: "text-warm" };
    return { label: "Obese", color: "text-destructive" };
  };

  const getBpCategory = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { label: "Normal", color: "text-success" };
    if (sys < 130 && dia < 80) return { label: "Elevated", color: "text-warm" };
    if (sys < 140 || dia < 90) return { label: "High (Stage 1)", color: "text-destructive" };
    return { label: "High (Stage 2)", color: "text-destructive" };
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        height_cm: bio.height_cm,
        weight_kg: bio.weight_kg,
        bp_systolic: bio.bp_systolic,
        bp_diastolic: bio.bp_diastolic,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save biometrics.", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Your biometrics have been updated." });
      onUpdate?.(bio);
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
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Your Profile
        </h2>
        {bmi && (
          <div className="text-right">
            <span className="text-xs text-muted-foreground">BMI</span>
            <p className={`text-lg font-heading font-bold ${getBmiCategory(parseFloat(bmi)).color}`}>
              {bmi} <span className="text-xs font-normal">{getBmiCategory(parseFloat(bmi)).label}</span>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <Ruler className="h-3 w-3" /> Height (cm)
          </label>
          <input
            type="number"
            value={bio.height_cm ?? ""}
            onChange={(e) => setBio({ ...bio, height_cm: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="175"
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <Weight className="h-3 w-3" /> Weight (kg)
          </label>
          <input
            type="number"
            value={bio.weight_kg ?? ""}
            onChange={(e) => setBio({ ...bio, weight_kg: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="75"
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <Heart className="h-3 w-3" /> Systolic (mmHg)
          </label>
          <input
            type="number"
            value={bio.bp_systolic ?? ""}
            onChange={(e) => setBio({ ...bio, bp_systolic: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="120"
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
            <Heart className="h-3 w-3" /> Diastolic (mmHg)
          </label>
          <input
            type="number"
            value={bio.bp_diastolic ?? ""}
            onChange={(e) => setBio({ ...bio, bp_diastolic: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="80"
            className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
      </div>

      {bio.bp_systolic && bio.bp_diastolic && (
        <div className="text-xs text-muted-foreground">
          Blood Pressure:{" "}
          <span className={`font-medium ${getBpCategory(bio.bp_systolic, bio.bp_diastolic).color}`}>
            {bio.bp_systolic}/{bio.bp_diastolic} mmHg — {getBpCategory(bio.bp_systolic, bio.bp_diastolic).label}
          </span>
        </div>
      )}

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
