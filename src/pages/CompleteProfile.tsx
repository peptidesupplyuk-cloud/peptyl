import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { User, Globe, Target, Zap, ArrowRight, Loader2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia", "Germany", "France",
  "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Ireland", "Belgium", "Austria", "Switzerland", "Portugal", "Poland", "Czech Republic",
  "Greece", "Romania", "Hungary", "New Zealand", "Japan", "South Korea", "Singapore",
  "India", "Brazil", "Mexico", "South Africa", "United Arab Emirates", "Other",
];

const GOALS = [
  { value: "weight_loss", label: "Weight Loss / GLP-1" },
  { value: "longevity", label: "Longevity & Anti-Ageing" },
  { value: "healing", label: "Healing & Recovery" },
  { value: "performance", label: "Performance & Fitness" },
  { value: "cognitive", label: "Cognitive Enhancement" },
  { value: "general", label: "General Health" },
];

const EXPERIENCE = [
  { value: "none", label: "Complete beginner" },
  { value: "beginner", label: "Some research, not started" },
  { value: "intermediate", label: "Currently using peptides" },
  { value: "advanced", label: "Experienced researcher" },
];

const CompleteProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState("");

  // Mandatory
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [researchGoal, setResearchGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  // Optional (prompted)
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  // Pre-fill from existing profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, country, research_goal, experience_level, age, gender, height_cm, weight_kg")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          if (data.first_name) setFirstName(data.first_name);
          if (data.last_name) setLastName(data.last_name);
          if (data.country) setCountry(data.country);
          if (data.research_goal) setResearchGoal(data.research_goal);
          if (data.experience_level) setExperienceLevel(data.experience_level);
          if (data.age) setAge(String(data.age));
          if (data.gender) setGender(data.gender);
          if (data.height_cm) setHeightCm(String(data.height_cm));
          if (data.weight_kg) setWeightKg(String(data.weight_kg));
        }
        setProfileLoading(false);
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) { setError("First name is required."); return; }
    if (!lastName.trim()) { setError("Last name is required."); return; }
    if (!country) { setError("Please select your country."); return; }
    if (!researchGoal) { setError("Please select a research interest."); return; }
    if (!experienceLevel) { setError("Please select your experience level."); return; }

    setLoading(true);
    const updates: Record<string, any> = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      country,
      research_goal: researchGoal,
      experience_level: experienceLevel,
    };
    if (age) updates.age = parseInt(age);
    if (gender) updates.gender = gender;
    if (heightCm) updates.height_cm = parseFloat(heightCm);
    if (weightKg) updates.weight_kg = parseFloat(weightKg);

    const { error: dbError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user!.id);

    if (dbError) {
      setError("Failed to save profile. Please try again.");
      setLoading(false);
      return;
    }

    // Clear any stale onboarding data
    sessionStorage.removeItem("onboarding_answers");
    navigate("/dashboard", { replace: true });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors";
  const selectClass = "w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/40 transition-colors appearance-none";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <SEO title="Complete Your Profile" description="Complete your profile to access Peptyl's personalised tools." path="/complete-profile" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <Logo size="md" />
          </div>
          <h1 className="text-xl font-heading font-bold text-foreground mb-1">Complete Your Profile</h1>
          <p className="text-sm text-muted-foreground">
            We need a few details to personalise your experience.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mandatory Section */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">First Name <span className="text-destructive">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className={inputClass} required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Last Name <span className="text-destructive">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className={inputClass} required />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Country <span className="text-destructive">*</span></label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select value={country} onChange={e => setCountry(e.target.value)} className={selectClass} required>
                  <option value="">Select country…</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Research Interest <span className="text-destructive">*</span></label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select value={researchGoal} onChange={e => setResearchGoal(e.target.value)} className={selectClass} required>
                  <option value="">Select goal…</option>
                  {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Experience Level <span className="text-destructive">*</span></label>
              <div className="relative">
                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className={selectClass} required>
                  <option value="">Select experience…</option>
                  {EXPERIENCE.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
            </div>

            {/* Optional Section */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Heart className="h-3 w-3" /> Optional — helps personalise recommendations
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Age</label>
                  <input type="number" min="16" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 35" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Biological Sex</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/40 appearance-none">
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Height (cm)</label>
                  <input type="number" min="100" max="250" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="e.g. 175" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Weight (kg)</label>
                  <input type="number" min="30" max="300" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="e.g. 80" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40" />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full shadow-brand">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              Continue to Dashboard
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
