import { Sparkles, MessageCircle, TrendingUp, Settings, Pause, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { usePipConversations, usePipWellnessNotes, useTrajectoryScore, usePipSettings } from "@/hooks/use-pip-data";

const directionColors: Record<string, string> = {
  improving: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  stable: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  declining: "bg-red-500/15 text-red-400 border-red-500/30",
};

const PipMemoryCard = () => {
  const { data: conversations = [] } = usePipConversations();
  const { data: notes = [] } = usePipWellnessNotes();
  const { data: trajectory } = useTrajectoryScore();
  const { data: settings, updateFrequency, togglePause } = usePipSettings();

  const isPaused = settings?.pip_paused_until && new Date(settings.pip_paused_until) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-card rounded-2xl border border-border p-5 space-y-5"
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-[#00d4aa]/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-[#00d4aa]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-heading font-semibold text-foreground">Pip AI Companion</h3>
          <p className="text-xs text-muted-foreground">Your WhatsApp health assistant</p>
        </div>
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Coming Soon</Badge>
      </div>

      {/* Section 1: What Pip is watching */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-[#00d4aa] uppercase tracking-wider">What Pip is watching</h4>
        {notes.length > 0 ? (
          <ul className="space-y-1.5">
            {notes.slice(0, 3).map((n) => (
              <li key={n.id} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="text-[#00d4aa] mt-0.5">•</span>
                <span>{n.context || n.note_type}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No patterns flagged yet — Pip starts learning once you connect on WhatsApp.
          </p>
        )}
      </div>

      {/* Section 2: Health trajectory */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-[#00d4aa] uppercase tracking-wider">Health trajectory</h4>
        {trajectory ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl font-heading font-bold text-foreground">{trajectory.score}</span>
            <Badge className={`text-xs border ${directionColors[trajectory.direction] || directionColors.stable}`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {trajectory.direction}
            </Badge>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Not enough data yet — add bloodwork and connect a wearable to unlock.
          </p>
        )}
      </div>

      {/* Section 3: Recent conversations */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-[#00d4aa] uppercase tracking-wider">Recent conversations</h4>
        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-foreground/80 truncate">{c.message.slice(0, 80)}{c.message.length > 80 ? "…" : ""}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </span>
                    {c.trigger_type && (
                      <span className="text-[10px] text-muted-foreground/60">{c.trigger_type}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No conversations yet — verify your WhatsApp number in Profile to start chatting with Pip.
          </p>
        )}
      </div>

      {/* Section 4: Settings */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <h4 className="text-xs font-semibold text-[#00d4aa] uppercase tracking-wider flex items-center gap-1.5">
          <Settings className="h-3 w-3" /> Settings
        </h4>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {isPaused
              ? `Paused until ${new Date(settings!.pip_paused_until!).toLocaleDateString()}`
              : "Pip is active"}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => togglePause.mutate(!!isPaused ? false : true)}
            disabled={togglePause.isPending}
          >
            {isPaused ? <><Play className="h-3 w-3" /> Resume</> : <><Pause className="h-3 w-3" /> Pause 30d</>}
          </Button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Message frequency</span>
          <Select
            value={settings?.pip_frequency || "normal"}
            onValueChange={(v) => updateFrequency.mutate(v)}
          >
            <SelectTrigger className="w-28 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High (daily)</SelectItem>
              <SelectItem value="normal">Normal (2x/wk)</SelectItem>
              <SelectItem value="low">Low (weekly)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
};

export default PipMemoryCard;
