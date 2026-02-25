import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ReportReviewProps {
  reportId: string;
  existingReview?: { rating: number; note: string | null } | null;
}

const ReportReview = ({ reportId, existingReview }: ReportReviewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [note, setNote] = useState(existingReview?.note ?? "");
  const [submitted, setSubmitted] = useState(!!existingReview);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSaving(true);

    const payload = {
      report_id: reportId,
      user_id: user.id,
      rating,
      note: note.trim() || null,
    };

    const { error } = existingReview
      ? await supabase
          .from("dna_reviews" as any)
          .update({ rating, note: note.trim() || null } as any)
          .eq("report_id", reportId)
          .eq("user_id", user.id)
      : await supabase.from("dna_reviews" as any).insert(payload as any);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Could not save review.", variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Thanks!", description: "Your feedback helps us improve." });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 text-center"
    >
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-2"
          >
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-5 w-5 ${s <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
          </motion.div>
        ) : (
          <motion.div key="form" className="space-y-4">
            <div>
              <p className="text-foreground font-heading font-semibold text-base mb-1">How was your report?</p>
              <p className="text-xs text-muted-foreground">Rate your experience and help us improve</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      s <= (hoveredStar || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                <Textarea
                  placeholder="Quick thoughts? (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                  maxLength={500}
                />
                <Button onClick={handleSubmit} disabled={saving} size="sm" className="shadow-brand">
                  {saving ? "Saving…" : "Submit Review"}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReportReview;
