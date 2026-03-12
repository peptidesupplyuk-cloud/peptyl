import { Droplets, Mail } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/** Standalone content for embedding inside Improve page */
export const TestingContent = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await supabase.from("contact_submissions").insert({
        name: "Testing Waitlist",
        email,
        message: "Interested in Blood Tests / Testing feature",
      });
      setSubmitted(true);
      toast({ title: "You're on the list!", description: "We'll notify you when Testing launches." });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-8">
      <Badge variant="secondary" className="mb-6 text-xs">Coming Soon</Badge>

      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Droplets className="h-8 w-8 text-primary" />
      </div>

      <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
        Blood Tests & <span className="text-gradient-teal">Biomarker Tracking</span>
      </h2>

      <p className="text-muted-foreground text-lg max-w-xl mb-8 leading-relaxed">
        Order blood tests directly through Peptyl, get results uploaded automatically, and see how your protocols are affecting your biomarkers, all in one place.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mb-12">
        {[
          { title: "Order Tests", desc: "Choose from curated panels matched to your protocol goals." },
          { title: "Auto-Import Results", desc: "Results flow straight into your biomarker dashboard." },
          { title: "Track Trends", desc: "See how your markers change over time with each cycle." },
        ].map((item) => (
          <div key={item.title} className="bg-card rounded-xl border border-border p-4 text-left">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {submitted ? (
        <div className="bg-primary/10 rounded-xl border border-primary/20 p-6 max-w-md">
          <p className="text-primary font-medium">🎉 You're on the waitlist! We'll email you when Testing launches.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
          <Button type="submit" className="shadow-brand">Join Waitlist</Button>
        </form>
      )}
    </div>
  );
};

/** Full page fallback (for direct /testing route) */
const TestingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Peptide Bloodwork Testing — Track Biomarkers Online"
        description="Integrated blood testing to track biomarkers alongside your peptide protocols. Order tests, log results, and monitor trends. Coming soon to Peptyl."
        path="/testing"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <TestingContent />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestingPage;
