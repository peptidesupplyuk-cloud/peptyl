interface Props {
  title: string;
  subtitle?: string;
}

const SectionDivider = ({ title, subtitle }: Props) => (
  <div className="relative py-2">
    <div className="absolute inset-0 flex items-center" aria-hidden="true">
      <div className="w-full border-t border-border" />
    </div>
    <div className="relative flex justify-center">
      <div className="bg-background px-4 text-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

export default SectionDivider;
