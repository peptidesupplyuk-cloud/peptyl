interface Supplement {
  supplement: string;
  dose: string;
  timing: string;
  evidence_grade: string;
  driven_by: string[];
  caution: string;
  peptyl_product_tag?: string;
}

interface Props {
  supplements?: Supplement[];
}

const gradeColor = (g: string) => {
  if (g === "A") return "bg-primary/10 text-primary";
  if (g === "B") return "bg-blue-500/10 text-blue-600";
  if (g === "C") return "bg-yellow-500/10 text-yellow-600";
  return "bg-muted text-muted-foreground";
};

const SupplementTable = ({ supplements }: Props) => {
  if (!supplements?.length) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Supplement Protocol</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 text-muted-foreground font-medium">Supplement</th>
              <th className="text-left py-3 px-3 text-muted-foreground font-medium">Dose / Timing</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-medium">Grade</th>
              <th className="text-left py-3 px-3 text-muted-foreground font-medium hidden md:table-cell">Caution</th>
            </tr>
          </thead>
          <tbody>
            {supplements.map((s, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-3">
                  <p className="font-medium text-foreground">{s.supplement}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.driven_by?.map((d) => (
                      <span key={d} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{d}</span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3 text-muted-foreground">
                  <p>{s.dose}</p>
                  <p className="text-xs">{s.timing}</p>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${gradeColor(s.evidence_grade)}`}>
                    {s.evidence_grade}
                  </span>
                </td>
                <td className="py-3 px-3 text-xs text-muted-foreground hidden md:table-cell max-w-[200px]">
                  {s.caution}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplementTable;
