import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { blogPosts } from "@/data/blog-posts";

const LatestArticlesSection = () => {
  const featured = blogPosts.slice(0, 3);
  const { t } = useTranslation();

  const renderTitle = () => {
    const raw = t("articles.title");
    const parts = raw.split(/<1>|<\/1>/);
    if (parts.length === 3) return <>{parts[0]}<span className="text-gradient-teal">{parts[1]}</span>{parts[2]}</>;
    return raw;
  };

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
            {renderTitle()}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg">
            {t("articles.subtitle")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {featured.map((post, i) => (
            <motion.div key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link to={`/education/${post.slug}`} className="group block h-full bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-all">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-4">{post.category}</span>
                <h3 className="font-heading font-semibold text-foreground text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />{post.readTime}</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">{t("articles.read")} <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/education" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-brand hover:opacity-90 transition-opacity">
            <BookOpen className="h-4 w-4" />
            {t("articles.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestArticlesSection;
