import { Link } from "react-router-dom";
import ArticleLayout from "@/components/ArticleLayout";

const BeginnersGuide = () => (
  <ArticleLayout
    category="Beginner Guide"
    title="Complete Beginner's Guide to Research Peptides"
    readTime="8 min read"
    date="February 2026"
    slug="beginners-guide-peptides"
    description="Everything you need to know before starting peptide research. Storage, reconstitution, dosing, and safety guidelines for beginners."
  >
    <p>Starting your first peptide research project can feel overwhelming. With hundreds of peptides available and conflicting information online, where do you even begin?</p>
    <p>This comprehensive guide will walk you through everything you need to know as a complete beginner, from understanding what peptides are to safely handling and storing them.</p>

    <h2>What Are Peptides?</h2>
    <p>Peptides are short chains of amino acids, the building blocks of proteins. While proteins can contain hundreds or thousands of amino acids, peptides typically contain between 2 and 50 amino acids.</p>
    <p>Think of peptides as <strong>"biological messengers"</strong> that tell your cells what to do. Different peptides trigger different cellular responses, which is why they're so valuable in research.</p>

    <h3>Common Categories of Research Peptides</h3>
    <ul>
      <li><strong>Healing & Recovery:</strong> BPC-157, TB-500, GHK-Cu (researched for tissue repair and wound healing)</li>
      <li><strong>Metabolic:</strong> Semaglutide, Tirzepatide, Retatrutide (GLP-1 agonists studied for metabolic effects)</li>
      <li><strong>Growth Hormone Secretagogues:</strong> Ipamorelin, CJC-1295 (stimulate natural GH release)</li>
      <li><strong>Cognitive:</strong> Semax, Selank (nootropic peptides researched for cognitive enhancement)</li>
      <li><strong>Longevity:</strong> Epithalon, MOTS-c (studied for anti-aging properties)</li>
    </ul>

    <h2>Understanding Peptide Forms</h2>
    <h3>Lyophilized (Freeze-Dried) Powder</h3>
    <p>Most research peptides come as lyophilized powder in sealed vials. This form is:</p>
    <ul>
      <li>Extremely stable when stored properly</li>
      <li>Long shelf life (often 2 to 3 years unreconstituted)</li>
      <li>Requires reconstitution with bacteriostatic water before use</li>
      <li>Should be white or off-white in colour</li>
    </ul>

    <h3>Pre-Filled Pens</h3>
    <p>Some suppliers now offer pre-filled peptide pens (like Quick Pens™) which are:</p>
    <ul>
      <li>Already reconstituted and ready to use</li>
      <li>More convenient but shorter shelf life</li>
      <li>Must be refrigerated immediately</li>
      <li>Popular for GLP-1 agonists (Semaglutide, Tirzepatide)</li>
    </ul>

    <h2>Essential Equipment & Supplies</h2>
    <p>Before starting any peptide research, you'll need proper equipment:</p>
    <ul>
      <li>Bacteriostatic water (BAC water) for reconstitution</li>
      <li>Insulin syringes (typically 0.3ml, 0.5ml, or 1ml)</li>
      <li>Alcohol swabs for sterilization</li>
      <li>Refrigerator (2-8°C) for storage</li>
      <li>Sharps container for safe needle disposal</li>
    </ul>

    <h2>How to Reconstitute Peptides</h2>
    <p>Reconstitution is the process of adding bacteriostatic water to lyophilized peptide powder. This is a critical skill for any peptide researcher.</p>
    <ol>
      <li>Clean your workspace with alcohol wipes</li>
      <li>Gather supplies: peptide vial, BAC water, syringes, alcohol swabs</li>
      <li>Wipe vial tops with alcohol swabs</li>
      <li>Calculate amount using our <Link to="/calculators">Reconstitution Calculator</Link></li>
      <li>Draw BAC water into syringe</li>
      <li>Inject slowly down the SIDE of the vial, not onto powder</li>
      <li>Swirl gently (never shake vigorously)</li>
      <li>Inspect: solution should be clear with no particles</li>
      <li>Label and store refrigerated</li>
    </ol>
    <p><strong>💡 Pro Tip:</strong> Adding water slowly down the side of the vial prevents foaming and preserves peptide integrity.</p>

    <h2>Storage Guidelines</h2>
    <h3>Unreconstituted (Powder)</h3>
    <ul>
      <li><strong>Temperature:</strong> -20°C (freezer) for long-term, or 2-8°C (fridge) for short-term</li>
      <li><strong>Light:</strong> Keep in original vial, away from light</li>
      <li><strong>Shelf life:</strong> Typically 2 to 3 years when properly stored</li>
    </ul>

    <h3>Reconstituted (Mixed)</h3>
    <ul>
      <li><strong>Temperature:</strong> Always refrigerate at 2-8°C</li>
      <li><strong>Duration:</strong> Use within 28 to 30 days</li>
      <li><strong>Never freeze:</strong> Freezing can damage peptide structure</li>
      <li><strong>Protect from light:</strong> Store in fridge, not on door</li>
    </ul>

    <h2>Dosing Fundamentals</h2>
    <p>Dosing varies significantly between peptides. Some require micrograms (mcg), others milligrams (mg). Always:</p>
    <ul>
      <li>Research the specific peptide's common protocols</li>
      <li>Use our <Link to="/calculators">Dosing Calculator</Link> for guidance</li>
      <li>Start with lower doses and adjust based on response</li>
      <li>Follow proper cycle lengths and off periods</li>
      <li>Keep detailed records of your research protocols</li>
    </ul>

    <h3>Example Dosing Ranges (Research Protocols)</h3>
    <table>
      <thead><tr><th>Peptide</th><th>Dose</th></tr></thead>
      <tbody>
        <tr><td>BPC-157</td><td>200-500mcg, 1-2x daily</td></tr>
        <tr><td>TB-500</td><td>2-5mg, 2x per week</td></tr>
        <tr><td>Semaglutide</td><td>Start 0.25mg weekly, titrate up</td></tr>
        <tr><td>Ipamorelin</td><td>200-300mcg, 1-2x daily</td></tr>
      </tbody>
    </table>

    <h2>Safety Considerations</h2>
    <h3>Sterile Technique</h3>
    <p>Always use proper sterile technique when handling peptides. This includes clean workspaces, alcohol swabs, and fresh syringes for every use.</p>

    <h3>Quality Assurance</h3>
    <p>Only source peptides from reputable suppliers who provide:</p>
    <ul>
      <li>Third-party lab testing (COAs)</li>
      <li>Purity verification (typically 98%+)</li>
      <li>Proper packaging and labelling</li>
      <li>Clear research disclaimers</li>
    </ul>

    <h2>Common Beginner Mistakes</h2>
    <ul>
      <li><strong>Shaking vials:</strong> Denatures peptides. Always swirl gently</li>
      <li><strong>Wrong water type:</strong> Use bacteriostatic water, not sterile saline</li>
      <li><strong>Improper storage:</strong> Reconstituted peptides MUST be refrigerated</li>
      <li><strong>Reusing needles:</strong> Always use fresh, sterile syringes</li>
      <li><strong>Not calculating doses:</strong> Use calculators, don't guess</li>
      <li><strong>Ignoring stability:</strong> Check for cloudiness or particles before use</li>
      <li><strong>Not keeping records:</strong> Document dates, doses, and observations</li>
    </ul>

    <h2>Best Starter Peptides</h2>
    <ul>
      <li><strong>BPC-157:</strong> Well-studied, straightforward dosing, stable</li>
      <li><strong>GHK-Cu:</strong> Forgiving, multiple research applications</li>
      <li><strong>Ipamorelin:</strong> Predictable, well-documented protocols</li>
    </ul>

    <h2>Next Steps</h2>
    <ol>
      <li>Choose your first peptide based on research goals</li>
      <li>Gather all necessary supplies and equipment</li>
      <li>Calculate your reconstitution and dosing using our <Link to="/calculators">calculators</Link></li>
      <li>Set up proper storage (refrigerator space)</li>
      <li>Start with conservative doses</li>
      <li>Keep detailed records</li>
      <li>Join research communities for shared knowledge</li>
    </ol>
  </ArticleLayout>
);

export default BeginnersGuide;
