import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { SupplierEntry } from "@/data/suppliers";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

const SupplierList = ({ suppliers }: { suppliers: SupplierEntry[] }) => (
  <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
    {suppliers.map((s, i) => (
      <motion.a
        key={s.id}
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        custom={i}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors text-sm font-medium text-foreground"
      >
        <span className="text-lg">{s.logo}</span>
        {s.name}
        <ExternalLink className="h-3 w-3 text-muted-foreground" />
      </motion.a>
    ))}
  </div>
);

export default SupplierList;
