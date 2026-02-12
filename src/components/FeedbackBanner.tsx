import { useState, useEffect } from "react";
import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

const DISMISSED_KEY = "peptyl_feedback_dismissed";

const FeedbackBanner = () => {
  const [dismissed, setDismissed] = useState(true);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const stored = sessionStorage.getItem(DISMISSED_KEY);
    setDismissed(stored === "true");
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "true");
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("feedback" as any).insert({
        message: message.trim(),
        page: location.pathname,
        user_id: user?.id || null,
      } as any);
      if (error) throw error;
      toast({ title: "Thanks for your feedback! 🙏" });
      setMessage("");
      setOpen(false);
      handleDismiss();
    } catch {
      toast({ title: "Couldn't submit", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (dismissed) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border">
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <p className="text-sm text-foreground">
            <span className="text-primary font-semibold">We just launched!</span>
            <span className="text-muted-foreground ml-2">Got 30 seconds?</span>
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
              <MessageSquare className="h-3.5 w-3.5" /> Give Feedback
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Quick Feedback
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">What could we do better? Bug reports, feature ideas, anything goes.</p>
            <Textarea
              placeholder="Type your feedback…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSubmit} disabled={submitting || !message.trim()}>
                {submitting ? "Sending…" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackBanner;
