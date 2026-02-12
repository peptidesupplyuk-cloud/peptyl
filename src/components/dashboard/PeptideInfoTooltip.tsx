import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { peptides } from "@/data/peptides";

interface Props {
  peptideName: string;
}

const PeptideInfoTooltip = ({ peptideName }: Props) => {
  const peptide = peptides.find(
    (p) => p.name.toLowerCase() === peptideName.toLowerCase()
  );

  if (!peptide) return null;

  // Get first sentence of description
  const shortDesc = peptide.description.split(". ")[0] + ".";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors flex-shrink-0"
          aria-label={`Info about ${peptideName}`}
        >
          <Info className="h-2.5 w-2.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-64 p-3 space-y-2" align="start">
        <div className="flex items-center gap-2">
          <span className="font-heading font-semibold text-foreground text-sm">{peptide.name}</span>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">{peptide.category}</Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{shortDesc}</p>
        {peptide.doseRange && (
          <p className="text-[10px] text-muted-foreground">
            Typical: {peptide.doseRange} · {peptide.frequency}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default PeptideInfoTooltip;
