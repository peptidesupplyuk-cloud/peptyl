import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Activity, GitCompareArrows } from "lucide-react";

const PeptideActionBlock = () => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 mt-8">
      <h3 className="text-sm font-heading font-semibold text-foreground mb-1">
        Ready to act on this data?
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Move from research to protocol in one step.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard">
          <Button size="sm" className="text-xs">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add to My Protocol
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button size="sm" variant="outline" className="text-xs">
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            Track This Compound
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button size="sm" variant="outline" className="text-xs">
            <GitCompareArrows className="h-3.5 w-3.5 mr-1.5" />
            Compare to My Goal
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PeptideActionBlock;
