import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries, useAddJournalEntry } from "@/hooks/use-journal";
import { peptides as peptideData } from "@/data/peptides";
import { Send, Loader2, Bot, User, BookOpen, ChevronDown, ChevronUp, Sparkles, X, MessageCircle } from "lucide-react";

type Msg = { role: "user" | "system"; content: string };

const MIN_CHARS = 10;

const STARTERS = [
  "I've been running BPC-157 at 250mcg 2x daily for 4 weeks…",
  "My latest bloodwork after 8 weeks on CJC-1295 / Ipamorelin…",
  "Side effects I noticed on Tirzepatide 5mg weekly…",
];

// Build a flat list of known peptide/supplement names for matching
const KNOWN_NAMES = peptideData.map((p) => p.name.toLowerCase());

type PendingEntry = {
  content: string;
  extractedData: any;
  articleId: string | null;
};

const ExperienceChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Peptide confirmation state
  const [pendingEntry, setPendingEntry] = useState<PendingEntry | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: journal = [], isLoading: journalLoading } = useJournalEntries();
  const addEntry = useAddJournalEntry();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const saveEntry = async (
    content: string,
    peptides: string[],
    ex: any,
    articleId: string | null
  ) => {
    await addEntry.mutateAsync({
      content,
      peptides,
      summary: ex.summary || content.slice(0, 200),
      evidence_quality: ex.evidence_quality || null,
      findings_count: ex.findings_count || null,
      article_id: articleId,
    });

    const summary = [
      `📓 **Saved to your journal!**`,
      "",
      peptides.length ? `**Peptides logged:** ${peptides.join(", ")}` : "",
      ex.findings_count ? `**Data points extracted:** ${ex.findings_count}` : "",
      ex.evidence_quality ? `**Evidence quality:** ${ex.evidence_quality}` : "",
      "",
      `Your entry is saved and also contributes to our community knowledge base. 🙌`,
    ]
      .filter(Boolean)
      .join("\n");

    setMessages((prev) => [...prev, { role: "system", content: summary }]);
  };

  const handleConfirm = async (peptideName: string) => {
    if (!pendingEntry) return;
    setShowConfirm(false);
    const peptides = [peptideName];
    try {
      await saveEntry(
        pendingEntry.content,
        peptides,
        pendingEntry.extractedData,
        pendingEntry.articleId
      );
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `❌ **Error:** ${err.message}` },
      ]);
    }
    setPendingEntry(null);
    setConfirmInput("");
  };

  const submit = async (text: string) => {
    if (!text.trim() || text.trim().length < MIN_CHARS || isProcessing) {
      if (text.trim().length < MIN_CHARS && text.trim().length > 0) {
        toast({
          title: "Too short",
          description: `Please share at least ${MIN_CHARS} characters about your experience.`,
          variant: "destructive",
        });
      }
      return;
    }

    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-content`,
        {
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
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Submission failed (${resp.status})`);
      }

      const result = await resp.json();
      const ex = result.extracted || {};
      const peptides: string[] = (ex.peptides || []).filter(
        (p: string) => p && p.trim().length > 0
      );

      // Check if any recognized peptide was found — must match a known name from our data
      const hasKnownPeptide = peptides.some((p: string) =>
        KNOWN_NAMES.some(
          (known) =>
            known === p.toLowerCase() ||
            p.toLowerCase().includes(known) ||
            known.includes(p.toLowerCase())
        )
      );

      if (!hasKnownPeptide) {
        // Ask user to confirm which peptide/supplement this is for
        setPendingEntry({
          content: text.trim(),
          extractedData: {
            summary: ex.summary || text.trim().slice(0, 200),
            evidence_quality: ex.evidence_quality || null,
            findings_count: ex.findings_count || null,
          },
          articleId: result.article_id || null,
        });
        setShowConfirm(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: `🔍 **Which peptide or supplement is this entry about?** We couldn't identify one automatically. Please select or type the name below to save your entry.`,
          },
        ]);
      } else {
        // Known peptide found — save immediately
        await saveEntry(text.trim(), peptides, ex, result.article_id || null);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `❌ **Error:** ${err.message}` },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick-pick suggestions from known peptides
  const filteredSuggestions = confirmInput.trim()
    ? peptideData
        .filter((p) =>
          p.name.toLowerCase().includes(confirmInput.toLowerCase())
        )
        .slice(0, 6)
    : peptideData.slice(0, 6);

  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-heading font-semibold text-foreground">
              My Peptide Journal
            </p>
            <p className="text-[10px] text-muted-foreground">
              Log your results, side effects & progress. Persisted to your
              account
            </p>
          </div>
        </div>
        {journal.length > 0 && (
          <button
            onClick={() => setShowJournal(!showJournal)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <Sparkles className="h-3 w-3" />
            {journal.length} {journal.length === 1 ? "entry" : "entries"}
            {showJournal ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Journal History */}
      {showJournal && journal.length > 0 && (
        <div className="border-b border-border bg-muted/20 max-h-48 overflow-y-auto">
          {journal.map((entry) => (
            <div
              key={entry.id}
              className="px-4 py-2.5 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-foreground">
                  {new Date(entry.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {entry.evidence_quality && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {entry.evidence_quality}
                  </span>
                )}
              </div>
              {entry.peptides.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {entry.peptides.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {entry.summary || entry.content.slice(0, 200)}
              </p>
              {(entry.summary?.startsWith("Check-in Day") || entry.summary?.includes("via WhatsApp")) && (
                <div className="flex items-center gap-1 mt-1">
                  <MessageCircle className="h-3 w-3 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground/60 italic">via Pip</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[320px]"
      >
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <div className="bg-muted/50 rounded-xl rounded-tl-sm px-3 py-2">
                <p className="text-sm text-foreground">
                  Welcome to your peptide journal. Log your experiences here:
                  dosing, results, bloodwork changes, side effects. Each entry is{" "}
                  <strong>saved to your account</strong> and also helps build our
                  community knowledge base (anonymised).
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
          <div
            key={i}
            className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-3 w-3" />
              ) : (
                <Bot className="h-3 w-3 text-primary" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted/50 text-foreground rounded-tl-sm"
              }`}
            >
              {msg.role === "system" ? (
                <div className="text-sm whitespace-pre-wrap [&_strong]:font-semibold">
                  {msg.content
                    .split(/(\*\*.*?\*\*)/)
                    .map((part, j) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j}>{part.slice(2, -2)}</strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap line-clamp-6">
                  {msg.content.slice(0, 300)}
                  {msg.content.length > 300 ? "…" : ""}
                </p>
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
                <Loader2 className="h-4 w-4 animate-spin" /> Analysing your
                entry…
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Peptide confirmation picker */}
      {showConfirm && pendingEntry && (
        <div className="px-4 py-3 border-t border-border bg-muted/20 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground">
              Select or type a peptide/supplement name:
            </p>
            <button
              onClick={() => {
                setShowConfirm(false);
                setPendingEntry(null);
                setConfirmInput("");
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "system",
                    content: "Entry discarded. You can try again anytime.",
                  },
                ]);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && confirmInput.trim()) {
                handleConfirm(confirmInput.trim());
              }
            }}
            placeholder="e.g. Retatrutide, BPC-157, Tirzepatide…"
            className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
          />
          <div className="flex flex-wrap gap-1.5">
            {filteredSuggestions.map((p) => (
              <button
                key={p.name}
                onClick={() => handleConfirm(p.name)}
                className="text-[11px] px-2 py-1 rounded-lg bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      {!showConfirm && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="px-3 py-2 border-t border-border flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              placeholder="What did you observe today? Dosing, results, side effects…"
              disabled={isProcessing}
              rows={2}
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors disabled:opacity-50 resize-none"
            />
            <button
              type="submit"
              disabled={
                !input.trim() || input.trim().length < MIN_CHARS || isProcessing
              }
              className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0 mb-0.5"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-[10px] text-muted-foreground px-4 pb-2">
            {input.length} chars • min {MIN_CHARS} to submit
          </p>
        </>
      )}
    </div>
  );
};

export default ExperienceChat;
