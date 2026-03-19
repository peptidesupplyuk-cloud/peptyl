import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Gift, Users, Star, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import SEO from "@/components/SEO";

const JoinReferral = () => {
  const { code } = useParams<{ code: string }>();

  const { data: referral, isLoading } = useQuery({
    queryKey: ["referral", code],
    enabled: !!code,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("id, referral_code, referred_name, status, expires_at")
        .eq("referral_code", code!)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <SEO title="Invite Expired — Peptyl" description="This referral invite has expired." path={`/join/${code}`} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center space-y-4"
        >
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-heading font-bold text-foreground">This invite has expired</h1>
          <p className="text-sm text-muted-foreground">The referral link is no longer valid, but you can still sign up.</p>
          <Link to="/auth">
            <Button className="w-full mt-2">Sign up →</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const inviterName = referral.referred_name || "Your friend";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEO title="You're Invited to Peptyl" description="Join Peptyl and get a free month of premium." path={`/join/${code}`} />
      
      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-15 blur-[120px]"
        style={{ background: "radial-gradient(ellipse, hsl(var(--primary) / 0.4), transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-card rounded-2xl border border-border p-8 space-y-6 relative"
      >
        <div className="text-center space-y-3">
          <Logo size="sm" hideTagline />
          <h1 className="text-2xl font-heading font-bold text-foreground mt-4">
            {inviterName} invited you to <span className="text-[#00d4aa]">Peptyl</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Your personal AI-powered health optimisation companion.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { icon: Star, text: "Personalised peptide & supplement protocols" },
            { icon: Users, text: "AI companion Pip for daily health coaching" },
            { icon: Gift, text: "Both get a month of premium when you sign up" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
              <Icon className="h-4 w-4 text-[#00d4aa] shrink-0" />
              <span className="text-sm text-foreground/80">{text}</span>
            </div>
          ))}
        </div>

        <Link to={`/auth?ref=${code}`} className="block">
          <Button className="w-full h-11 text-sm font-semibold gap-2 bg-[#00d4aa] hover:bg-[#00d4aa]/90 text-background">
            Join Peptyl <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <p className="text-[10px] text-muted-foreground text-center">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default JoinReferral;
