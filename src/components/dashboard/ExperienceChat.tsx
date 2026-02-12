import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries, useAddJournalEntry } from "@/hooks/use-journal";
import { Send, Loader2, Bot, User, BookOpen, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

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
  const [showJournal, setShowJournal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: journal = [], isLoading: journalLoading } = useJournalEntries();
  const addEntry = useAddJournalEntry();

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

      // Save to database
      await addEntry.mutateAsync({
        content: text.trim(),
        peptides: ex.peptides || [],
        summary: ex.summary || text.trim().slice(0, 200),
        evidence_quality: ex.evidence_quality || null,
        findings_count: ex.findings_count || null,
        article_id: result.article_id || null,
      });

      const summary = [
        `📓 **Saved to your journal!**`,
        "",
        ex.peptides?.length ? `**Peptides logged:** ${ex.peptides.join(", ")}` : "",
        ex.findings_count ? `**Data points extracted:** ${ex.findings_count}` : "",
        ex.evidence_quality ? `**Evidence quality:** ${ex.evidence_quality}` : "",
        "",
        `Your entry is saved and also contributes to our community knowledge base. You can review your journal history below. 🙌`,
      ].filter(Boolean).join("\n");

      setMessages((prev) => [...prev, { role: "system", content: summary }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "system", content: `❌ **Error:** ${err.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-heading font-semibold text-foreground">My Peptide Journal</p>
            <p className="text-[10px] text-muted-foreground">Log your results, side effects & progress — persisted to your account</p>
          </div>
        </div>
        {journal.length > 0 && (
          <button
            onClick={() => setShowJournal(!showJournal)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <Sparkles className="h-3 w-3" />
            {journal.length} {journal.length === 1 ? "entry" : "entries"}
            {showJournal ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Journal History */}
      {showJournal && journal.length > 0 && (
        <div className="border-b border-border bg-muted/20 max-h-48 overflow-y-auto">
          {journal.map((entry) => (
            <div key={entry.id} className="px-4 py-2.5 border-b border-border/50 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-foreground">
                  {new Date(entry.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {entry.evidence_quality && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{entry.evidence_quality}</span>
                )}
              </div>
              {entry.peptides.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {entry.peptides.map((p) => (
                    <span key={p} className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">{p}</span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground line-clamp-2">{entry.summary || entry.content.slice(0, 200)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[320px]">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <div className="bg-muted/50 rounded-xl rounded-tl-sm px-3 py-2">
                <p className="text-sm text-foreground">
                  Welcome to your peptide journal. Log your experiences here — dosing, results, bloodwork changes, side effects. Each entry is <strong>saved to your account</strong> and also helps build our community knowledge base (anonymised).
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
                <Loader2 className="h-4 w-4 animate-spin" /> Analysing your entry…
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
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
          placeholder="What did you observe today? Dosing, results, side effects…"
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
