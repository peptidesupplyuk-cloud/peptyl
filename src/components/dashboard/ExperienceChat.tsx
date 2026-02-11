import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Bot, User, MessageSquarePlus } from "lucide-react";

type Msg = { role: "user" | "system"; content: string };

const STARTERS = [
  "I've been running BPC-157 at 250mcg 2x daily for 4 weeks…",
  "My latest bloodwork after 8 weeks on CJC-1295 / Ipamorelin…",
  "Side effects I noticed on Tirzepatide 5mg weekly…",
];

const ExperienceChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const submit = async (text: string) => {
    if (!text.trim() || text.trim().length < 50 || isProcessing) {
      if (text.trim().length < 50 && text.trim().length > 0) {
        toast({ title: "Too short", description: "Please share at least 50 characters about your experience.", variant: "destructive" });
      }
      return;
    }

    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          content: text.trim(),
          content_type: "text",
          source_name: "User Experience Report",
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Submission failed (${resp.status})`);
      }

      const result = await resp.json();
      const ex = result.extracted || {};

      const summary = [
        `✅ **Thank you!** Your experience has been recorded.`,
        "",
        ex.peptides?.length ? `**Peptides detected:** ${ex.peptides.join(", ")}` : "",
        ex.findings_count ? `**Data points extracted:** ${ex.findings_count}` : "",
        ex.evidence_quality ? `**Evidence quality:** ${ex.evidence_quality}` : "",
        "",
        `Your report helps build our community knowledge base. Keep sharing! 🙌`,
      ].filter(Boolean).join("\n");

      setMessages((prev) => [...prev, { role: "system", content: summary }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "system", content: `❌ **Error:** ${err.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col h-[420px] overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquarePlus className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-heading font-semibold text-foreground">Share Your Experience</p>
          <p className="text-[10px] text-muted-foreground">Report results, side effects & dosing to help the community</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <div className="bg-muted/50 rounded-xl rounded-tl-sm px-3 py-2">
                <p className="text-sm text-foreground">
                  Share your peptide experiences — results, side effects, dosing, bloodwork changes. Your reports are anonymised and help build our community knowledge base.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pl-8">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10"
            }`}>
              {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-primary" />}
            </div>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted/50 text-foreground rounded-tl-sm"
            }`}>
              {msg.role === "system" ? (
                <div className="text-sm whitespace-pre-wrap [&_strong]:font-semibold">
                  {msg.content.split(/(\*\*.*?\*\*)/).map((part, j) =>
                    part.startsWith("**") && part.endsWith("**")
                      ? <strong key={j}>{part.slice(2, -2)}</strong>
                      : <span key={j}>{part}</span>
                  )}
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap line-clamp-6">{msg.content.slice(0, 300)}{msg.content.length > 300 ? "…" : ""}</p>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-start gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5">
              <Bot className="h-3 w-3 text-primary" />
            </div>
            <div className="bg-muted/50 rounded-xl rounded-tl-sm px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing your report…
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(input); }}
        className="px-3 py-2 border-t border-border flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); }
          }}
          placeholder="Share your peptide experience, results, or side effects…"
          disabled={isProcessing}
          rows={2}
          className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors disabled:opacity-50 resize-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || input.trim().length < 50 || isProcessing}
          className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0 mb-0.5"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <p className="text-[10px] text-muted-foreground px-4 pb-2">{input.length} chars • min 50 to submit</p>
    </div>
  );
};

export default ExperienceChat;
