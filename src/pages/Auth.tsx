import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, Globe, Target } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import Logo from "@/components/Logo";
import SEO from "@/components/SEO";

const emailSchema = z.string().trim().email("Please enter a valid email address").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(128);

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia", "Germany", "France",
  "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Finland",
  "Ireland", "Belgium", "Austria", "Switzerland", "Portugal", "Poland", "Czech Republic",
  "Greece", "Romania", "Hungary", "New Zealand", "Japan", "South Korea", "Singapore",
  "India", "Brazil", "Mexico", "South Africa", "United Arab Emirates", "Other",
];

const RESEARCH_GOALS = [
  { value: "weight_loss", label: "Weight Loss / Metabolic Health" },
  { value: "longevity", label: "Longevity / Anti-Ageing" },
  { value: "healing", label: "Healing / Recovery" },
  { value: "performance", label: "Performance / Muscle" },
  { value: "cognitive", label: "Cognitive / Nootropic" },
  { value: "general", label: "General Research" },
];

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [researchGoal, setResearchGoal] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/peptides", { replace: true });
    return null;
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailResult.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setForgotSuccess("Check your email for a password reset link.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.errors[0].message);
      return;
    }

    if (isSignUp && !country) {
      setError("Please select your country.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(emailResult.data, password, {
          country,
          research_goal: researchGoal || undefined,
        });
        if (error) {
          if (error.message.includes("already registered")) {
            setError("This email is already registered. Try signing in instead.");
          } else {
            setError(error.message);
          }
        } else {
          setSuccess("Check your email for a confirmation link, then sign in.");
        }
      } else {
        const { error } = await signIn(emailResult.data, password);
        if (error) {
          if (error.message.includes("Invalid login")) {
            setError("Invalid email or password.");
          } else {
            setError(error.message);
          }
        } else {
          navigate("/peptides", { replace: true });
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setError(error.message || "Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const selectClass = "w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary/40 transition-colors appearance-none";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <SEO
        title="Sign In"
        description="Sign in or create your free Peptyl account to access precision calculators, protocol tracking, and community tools."
        path="/auth"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp
              ? "Join the community to save stacks and share feedback."
              : "Sign in to access the peptide database and stack builder."}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 mb-4"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {forgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              {forgotSuccess && (
                <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                  <p className="text-xs text-success">{forgotSuccess}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-brand hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setError(""); setForgotSuccess(""); }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Country <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select your country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Research Interest <span className="text-muted-foreground">(optional)</span></label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      value={researchGoal}
                      onChange={(e) => setResearchGoal(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select a research interest</option>
                      {RESEARCH_GOALS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <p className="text-xs text-success">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-brand hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {!isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setError(""); setSuccess(""); }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
                setForgotMode(false);
                setForgotSuccess("");
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
