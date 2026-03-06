interface PersonalisationData {
  genetic_archetype?: string;
  priority_insight?: string;
  biggest_lever?: string;
  goal_alignment?: string;
  lifestyle_interactions?: Array<{
    factor: string;
    genetic_basis: string;
    recommendation: string;
  }>;
}

interface Props {
  data: PersonalisationData | undefined;
}

const PersonalisationCard = ({ data }: Props) => {
  if (!data || (!data.genetic_archetype && !data.priority_insight)) return null;

  return (
    <div className="bg-card border border-primary/20 rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-heading font-bold text-foreground">Your Genetic Profile</h2>
        {data.genetic_archetype && (
          <span className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
            {data.genetic_archetype}
          </span>
        )}
      </div>

      {/* Priority Insight */}
      {data.priority_insight && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Your #1 Insight</span>
          <p className="text-sm text-foreground mt-1.5 leading-relaxed">{data.priority_insight}</p>
        </div>
      )}

      {/* Two columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.biggest_lever && (
          <div className="bg-muted/30 border border-border rounded-xl p-4">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Biggest Lever</span>
            <p className="text-sm text-foreground mt-1.5">{data.biggest_lever}</p>
          </div>
        )}
        {data.goal_alignment && (
          <div className="bg-muted/30 border border-border rounded-xl p-4">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Goal Alignment</span>
            <p className="text-sm text-foreground mt-1.5">{data.goal_alignment}</p>
          </div>
        )}
      </div>

      {/* Lifestyle Interactions */}
      {Array.isArray(data.lifestyle_interactions) && data.lifestyle_interactions.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-foreground mb-3">Genetic Lifestyle Interactions</h3>
          <div className="space-y-3">
            {data.lifestyle_interactions.map((item, i) => (
              <div key={i} className="border border-border rounded-lg p-3">
                <p className="text-sm font-medium text-foreground">{item.factor}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.genetic_basis}</p>
                <p className="text-xs text-primary mt-1">{item.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalisationCard;
