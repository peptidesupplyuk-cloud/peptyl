import ArticleLayout from "@/components/ArticleLayout";
import { Link } from "react-router-dom";

const PeptideStackingGuide = () => (
  <ArticleLayout
    category="Guide"
    title="Peptide Stacking Guide: How to Combine Compounds Safely"
    readTime="8 min read"
    date="March 2026"
    slug="peptide-stacking-guide"
    description="Evidence-based guide to peptide stacking: which compounds synergise, how to structure multi-peptide protocols, timing considerations, and safety guidelines."
    faqs={[
      { q: "Is it safe to stack multiple peptides?", a: "Many peptides have complementary mechanisms and can be combined safely. However, stacking increases complexity and the potential for unexpected interactions. Start with one compound, establish a baseline response, then add a second. Monitor biomarkers throughout." },
      { q: "How many peptides can you take at once?", a: "There is no strict limit, but most experienced researchers run 2-3 peptides simultaneously. Running more than 3 makes it difficult to attribute effects (positive or negative) to specific compounds. Simplicity aids troubleshooting." },
      { q: "Can you mix peptides in the same syringe?", a: "Some peptides can be mixed in the same syringe for a single injection (e.g., CJC-1295 + Ipamorelin). However, mixing peptides with different pH stability requirements can cause degradation. When in doubt, use separate injections." }
    ]}
  >
    <p>
      Peptide stacking refers to the practice of using two or more peptides simultaneously to achieve complementary or synergistic effects. Unlike pharmaceutical polypharmacy, peptide stacking in the research community is typically goal-oriented: a healing stack, a longevity stack, a body composition stack, or a cognitive stack. This guide covers the principles, common combinations, and safety considerations.
    </p>

    <h2>Principles of Effective Stacking</h2>
    <h3>1. Complementary Mechanisms</h3>
    <p>
      The most effective stacks combine peptides that work through different pathways targeting the same outcome. Example: BPC-157 (growth factor modulation, tissue repair) + TB-500 (anti-inflammatory, actin regulation) for healing. Both promote recovery but through distinct molecular mechanisms, creating potential synergy.
    </p>

    <h3>2. One Variable at a Time</h3>
    <p>
      Start with a single peptide for 2-4 weeks to establish baseline response and identify any side effects. Then add the second compound. This approach allows you to attribute changes (positive or negative) to specific peptides.
    </p>

    <h3>3. Shared Timing Windows</h3>
    <p>
      Many peptides perform best when administered fasted. Growth hormone secretagogues (CJC-1295, Ipamorelin) should be taken on an empty stomach, as food intake (especially carbohydrates and fats) blunts GH release. Stacking peptides with compatible timing requirements simplifies protocols.
    </p>

    <h2>Common Peptide Stacks</h2>

    <h3>Healing Stack</h3>
    <table>
      <thead>
        <tr><th>Peptide</th><th>Dose</th><th>Frequency</th><th>Role</th></tr>
      </thead>
      <tbody>
        <tr><td>BPC-157</td><td>250-500 mcg</td><td>Daily (SC or oral)</td><td>Local tissue repair, growth factor activation</td></tr>
        <tr><td>TB-500</td><td>2-5 mg</td><td>2x/week (loading), 1x/week (maintenance)</td><td>Systemic anti-inflammatory, actin regulation</td></tr>
      </tbody>
    </table>
    <p>
      The most widely used peptide stack globally. See our detailed <Link to="/education/bpc157-vs-tb500">BPC-157 vs TB-500 comparison</Link>.
    </p>

    <h3>Growth Hormone Stack</h3>
    <table>
      <thead>
        <tr><th>Peptide</th><th>Dose</th><th>Frequency</th><th>Role</th></tr>
      </thead>
      <tbody>
        <tr><td>CJC-1295 (no DAC)</td><td>100-200 mcg</td><td>2-3x daily</td><td>GHRH analogue, amplifies GH pulse</td></tr>
        <tr><td>Ipamorelin</td><td>200-300 mcg</td><td>2-3x daily</td><td>Ghrelin mimetic, triggers GH release</td></tr>
      </tbody>
    </table>
    <p>
      GHRH + GHRP combination is the standard approach for GH optimisation. CJC-1295 amplifies the pulse, Ipamorelin initiates it. Administered together before sleep for maximum nocturnal GH elevation.
    </p>

    <h3>Longevity Stack</h3>
    <table>
      <thead>
        <tr><th>Compound</th><th>Dose</th><th>Frequency</th><th>Role</th></tr>
      </thead>
      <tbody>
        <tr><td>NAD+ precursor (NMN)</td><td>500-1000 mg</td><td>Daily (oral)</td><td>NAD+ restoration, sirtuin activation</td></tr>
        <tr><td>GHK-Cu</td><td>1-2 mg</td><td>Daily (SC or topical)</td><td>Gene expression reset, tissue remodelling</td></tr>
        <tr><td>BPC-157</td><td>250 mcg</td><td>Daily (oral)</td><td>Gut protection, systemic healing</td></tr>
      </tbody>
    </table>
    <p>
      Combines NAD+ pathway support with tissue-level repair. See our <Link to="/education/nad-longevity-stack">NAD+ longevity stack</Link> and <Link to="/education/ghk-cu-pretty-peptide">GHK-Cu guide</Link>.
    </p>

    <h3>Cognitive Stack</h3>
    <table>
      <thead>
        <tr><th>Compound</th><th>Dose</th><th>Frequency</th><th>Role</th></tr>
      </thead>
      <tbody>
        <tr><td>Semax</td><td>200-600 mcg</td><td>Daily (intranasal)</td><td>BDNF upregulation, neuroprotection</td></tr>
        <tr><td>Selank</td><td>250-500 mcg</td><td>Daily (intranasal)</td><td>Anxiolytic, GABA modulation</td></tr>
      </tbody>
    </table>
    <p>
      Both are approved medications in Russia. See our <Link to="/education/russia-cognitive-peptides">cognitive peptides deep dive</Link>.
    </p>

    <h2>What Not to Stack</h2>
    <ul>
      <li><strong>Peptides with opposing mechanisms:</strong> e.g., combining a potent appetite stimulant (MK-677) with a GLP-1 agonist (semaglutide) creates contradictory signalling</li>
      <li><strong>Multiple GH secretagogues at high doses:</strong> Stacking MK-677 + CJC-1295 + Ipamorelin + Hexarelin risks excessive GH elevation, insulin resistance, and water retention</li>
      <li><strong>Too many compounds at once:</strong> Beyond 3 peptides, it becomes impossible to identify which compound is responsible for observed effects</li>
    </ul>

    <h2>Monitoring Your Stack</h2>
    <p>
      Bloodwork before and during any multi-peptide protocol is essential. Key markers:
    </p>
    <ul>
      <li>IGF-1 (growth hormone axis)</li>
      <li>Fasting glucose and insulin (metabolic impact)</li>
      <li>hsCRP (inflammatory status)</li>
      <li>Liver function (ALT, AST, GGT)</li>
      <li>Complete blood count</li>
    </ul>
    <p>
      Use our <Link to="/education/bloodwork-comes-first">bloodwork guide</Link> for full panel recommendations and our <Link to="/calculators">reconstitution calculator</Link> for accurate dosing.
    </p>
  </ArticleLayout>
);

export default PeptideStackingGuide;
