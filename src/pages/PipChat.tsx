import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Mic, Sparkles, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import CompoundLink from "@/components/compound/CompoundLink";
import { usePipChat, type PipMessage } from "@/hooks/use-pip-chat";
import { Skeleton } from "@/components/ui/skeleton";

const QUICK_ACTIONS = [
  { label: "My Score", query: "What's my current health score?" },
  { label: "My Protocol", query: "Show me my current protocol" },
  { label: "Action Plan", query: "Give me an action plan based on my latest results" },
  { label: "Ask about a gene", query: "Tell me about my MTHFR gene status" },
  { label: "Check interactions", query: "Are there any interactions in my current stack?" },
];

// Regex patterns for inline highlighting
const GENE_PATTERN = /\b(MTHFR|COMT|CYP1A2|CYP2D6|APOE|BDNF|VDR|FTO|SOD2|GSTP1|NOS3|TNF|IL6|FOXO3|CLOCK|PER2|ACTN3|PPARG|HFE|CBS)\b/g;
const EVIDENCE_BADGE = /\[([ABCD])\]/g;

const badgeColors: Record<string, string> = {
  A: "bg-primary text-primary-foreground",
  B: "border border-primary text-primary",
  C: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  D: "bg-muted text-muted-foreground",
};

const PipChat = () => {
  const navigate = useNavigate();
  const { messages, isLoading, sending, error, sendMessage, setError } = usePipChat();
  const [input, setInput] = useState("");
  const [showChips, setShowChips] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Hide chips when typing
  useEffect(() => {
    setShowChips(input.length === 0);
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || sending) return;
    sendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (query: string) => {
    sendMessage(query);
    setShowChips(false);
  };

  const renderContent = (content: string) => {
    // Replace gene names and evidence badges with styled spans
    const processed = content
      .replace(GENE_PATTERN, "**`$1`**")
      .replace(EVIDENCE_BADGE, (_, grade: string) => `<span class="evidence-${grade}">[${grade}]</span>`);

    return (
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>,
          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
          code: ({ children }) => {
            const text = String(children);
            if (GENE_PATTERN.test(text)) {
              return <span className="text-primary font-mono font-semibold text-xs">{text}</span>;
            }
            return <code className="bg-muted px-1 rounded text-xs">{text}</code>;
          },
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              {children}
            </a>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <SEO title="Pip – Your Health AI | Peptyl" description="Chat with Pip, your personal AI health companion." />
      <Header />

      {/* Chat Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[680px] mx-auto flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-heading font-semibold text-foreground leading-tight">Pip</h1>
            <p className="text-xs text-muted-foreground">Your personal health AI</p>
          </div>
          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${sending ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto" role="log" aria-live="polite">
        <div className="max-w-[680px] mx-auto px-4 py-6 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className="h-16 w-3/4 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground">Hey, I'm Pip 👋</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Your AI health companion. Ask me about peptides, supplements, bloodwork, or your protocol.
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <MessageBubble key={msg.id} msg={msg} renderContent={renderContent} delay={idx === messages.length - 1 ? 0.15 : 0} />
              ))}
            </AnimatePresence>
          )}

          {/* Typing indicator */}
          {sending && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-amber-500/10 border-t border-amber-500/30 px-4 py-2">
          <div className="max-w-[680px] mx-auto flex items-center gap-2 text-xs text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setError(null)}>Dismiss</Button>
          </div>
        </div>
      )}

      {/* Quick action chips */}
      {showChips && messages.length <= 2 && (
        <div className="border-t border-border/50 bg-card/50">
          <div className="max-w-[680px] mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {QUICK_ACTIONS.map((a, i) => (
              <motion.button
                key={a.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleChip(a.query)}
                className="shrink-0 px-3 py-1.5 rounded-full border border-primary/30 text-xs text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
                role="button"
                aria-label={a.label}
              >
                {a.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border bg-card" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="max-w-[680px] mx-auto px-4 py-3 flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask Pip anything about your health..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none border-0 bg-muted/50 rounded-xl px-4 py-2.5 text-sm focus-visible:ring-1 focus-visible:ring-primary/50"
            rows={1}
          />
          <Button
            size="icon"
            disabled={!input.trim() || sending}
            onClick={handleSend}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground shrink-0"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled
            className="h-10 w-10 rounded-full shrink-0 opacity-30"
            aria-label="Voice input (coming soon)"
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/** Individual message bubble */
const MessageBubble = ({
  msg,
  renderContent,
  delay,
}: {
  msg: PipMessage;
  renderContent: (c: string) => React.ReactNode;
  delay: number;
}) => {
  const isUser = msg.direction === "inbound";
  const isProactive = msg.is_proactive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: isUser ? 0 : delay }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary/10 text-foreground rounded-2xl rounded-br-md"
            : isProactive
            ? "bg-card border border-border border-l-2 border-l-amber-500 rounded-2xl rounded-bl-md"
            : "bg-card border border-border rounded-2xl rounded-bl-md"
        }`}
      >
        {isProactive && (
          <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider block mb-1">
            Proactive insight
          </span>
        )}

        <div className="prose-sm prose-invert max-w-none">
          {renderContent(msg.content)}
        </div>

        {/* Disclaimer for Pip messages */}
        {!isUser && (
          <p className="text-[10px] italic text-muted-foreground/60 mt-2">
            This is a wellness assessment, not medical advice.
          </p>
        )}

        <span className="text-[10px] text-muted-foreground block mt-1">
          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
};

export default PipChat;
