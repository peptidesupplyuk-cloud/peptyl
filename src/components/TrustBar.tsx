import { motion } from "framer-motion";
import { FlaskConical, Dna, Watch, FileText } from "lucide-react";

const TrustBar = () => {
  const stats = [
    { icon: FlaskConical, value: "54+", label: "Compounds tracked" },
    { icon: Dna, value: "AI", label: "Patent-pending research" },
    { icon: Watch, value: "4+", label: "Wearable integrations" },
    { icon: FileText, value: "30+", label: "Research articles" },
  ];

  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
