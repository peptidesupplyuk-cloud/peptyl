import ArticleLayout from "@/components/ArticleLayout";
import { Link } from "react-router-dom";

const WhatIsPeptyl = () => (
  <ArticleLayout
    category="Platform"
    title="What Is Peptyl? The Free Research Platform Built for the Global Peptide Community"
    readTime="5 min read"
    date="February 2026"
    slug="what-is-peptyl"
    description="Peptyl is a free health optimisation platform combining AI tools, biomarker tracking, supplement and peptide protocols, dosing calculators, and community-driven data."
  >
    <p>
      If you've ever searched for reliable peptide information online, you know the struggle. Scattered Reddit threads, dubious forums, paywalled studies, and zero practical tools. That's exactly why we built <strong>Peptyl</strong>.
    </p>

    <h2>The Problem We Solve</h2>
    <p>
      The peptide research space is exploding — compounds like BPC-157, Semaglutide, GHK-Cu, and Retatrutide are generating massive interest from researchers worldwide. But there was no single platform that combined:
    </p>
    <ul>
      <li>A comprehensive, research-verified peptide database</li>
      <li>Practical dosing and reconstitution calculators</li>
      <li>Biomarker tracking tied to real peptide protocols</li>
      <li>Transparent supplier comparisons with eligibility checks</li>
      <li>Community-driven experience data</li>
    </ul>
    <p>So we built one. And made it completely free.</p>

    <h2>What You Get — For Free</h2>

    <h3>📚 Peptide Database (56+ Compounds)</h3>
    <p>
      Every compound includes research-backed summaries, typical dosing ranges, mechanisms of action, and related studies. From healing peptides like <Link to="/education/bpc157-vs-tb500">BPC-157 and TB-500</Link> to next-gen weight management compounds like <Link to="/education/retatrutide-triple-agonist-review">Retatrutide</Link>.
    </p>

    <h3>🧮 Dosing & Reconstitution Calculators</h3>
    <p>
      Our <Link to="/calculators">free calculators</Link> handle reconstitution maths, syringe unit conversions, and cycle order planning — with visual syringe diagrams so you never second-guess a measurement.
    </p>

    <h3>📊 Biomarker Dashboard</h3>
    <p>
      Upload your bloodwork results and track markers over time. The dashboard highlights out-of-range values, shows trends across panels, and connects your biomarker data to your active research protocols.
    </p>

    <h3>🏪 Supplier Comparison</h3>
    <p>
      Our <Link to="/suppliers">supplier directory</Link> compares verified UK suppliers side-by-side — pricing, eligibility requirements, consultation types, and available compounds. No affiliate bias, just transparent data.
    </p>

    <h3>🤖 AI Research Assistant</h3>
    <p>
      Ask questions about any peptide and get answers grounded in our curated research database. The AI assistant draws from verified studies and clinical data — not random internet content.
    </p>

    <h3>🧬 Stack Builder</h3>
    <p>
      Explore community-voted peptide stacks for specific goals — healing, cognitive enhancement, longevity, body composition. See what real researchers are combining and why.
    </p>

    <h2>Who Built This?</h2>
    <p>
      Peptyl was created by a team combining <strong>10+ years in global manufacturing and supply chain</strong> for Fortune 500 companies, <strong>6+ years scaling AI-driven startups</strong>, and hands-on experience in the <strong>biohacking and peptide research space</strong>.
    </p>
    <p>
      We're not a supplement brand or a clinic. We're researchers who got tired of the fragmented, unreliable landscape and decided to build something better. <Link to="/about">Read our full story</Link>.
    </p>

    <h2>Our Principles</h2>
    <table>
      <thead>
        <tr>
          <th>Principle</th>
          <th>What It Means</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Research Verified</strong></td>
          <td>Every compound is backed by cited research. Clinical evidence over anecdote.</td>
        </tr>
        <tr>
          <td><strong>Biomarker Driven</strong></td>
          <td>Your biology should inform your research, not generic protocols.</td>
        </tr>
        <tr>
          <td><strong>Community First</strong></td>
          <td>Transparent, crowd-sourced data with honest guidance.</td>
        </tr>
        <tr>
          <td><strong>Always Free</strong></td>
          <td>Core tools, education, and database access will always be free.</td>
        </tr>
      </tbody>
    </table>

    <h2>What's Coming Next</h2>
    <p>
      We're actively building protocol sharing, weekly research digests, expanded bloodwork integrations, and deeper AI-powered recommendations. Peptyl is evolving fast — and the community is shaping every feature.
    </p>

    <h2>Get Started</h2>
    <p>
      <Link to="/auth">Create a free account</Link> to unlock the full database, calculators, biomarker tracking, and AI assistant. Or start exploring — our <Link to="/education">education hub</Link> and <Link to="/suppliers">supplier directory</Link> are open to everyone.
    </p>
  </ArticleLayout>
);

export default WhatIsPeptyl;
