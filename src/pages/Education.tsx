import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blog-posts";
import SEO from "@/components/SEO";

const EducationPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Peptide Education Hub — Science-Backed Guides"
        description="Learn about peptide reconstitution, storage, GLP-1 protocols, BPC-157 vs TB-500, and more. Free, science-backed educational resources."
        path="/education"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Peptide Education Articles",
          "itemListElement": blogPosts.map((post, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "url": `https://peptyl.co.uk/education/${post.slug}`,
            "name": post.title,
          })),
        }}
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
              Education <span className="text-gradient-teal">Hub</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Simple, science-backed guides to understanding peptides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/education/${post.slug}`}
                  className="block bg-card rounded-2xl border border-border p-6 sm:p-8 hover:border-primary/20 hover:shadow-md transition-all group h-full"
                >
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground">
                    {post.category}
                  </span>
                  <h2 className="text-lg font-heading font-bold text-foreground mt-4 mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                      <span>{post.date}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                      Read <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EducationPage;
