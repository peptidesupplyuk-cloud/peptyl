import { ArrowRight } from "lucide-react";

interface Props {
  supplements?: any[];
  peptides?: any[];
  reportId: string;
}

const CreateProtocolCTA = ({ supplements, peptides, reportId }: Props) => {
  const hasItems = (supplements?.length ?? 0) > 0 || (peptides?.length ?? 0) > 0;
  if (!hasItems) return null;

  const scrollToProtocol = () => {
    const el = document.getElementById("create-protocol-section");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-bold text-foreground text-base">Ready to start?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your personalised protocol from this report.
        </p>
      </div>
      <button
        onClick={scrollToProtocol}
        className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors active:scale-[0.97]"
      >
        Create Protocol
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CreateProtocolCTA;
