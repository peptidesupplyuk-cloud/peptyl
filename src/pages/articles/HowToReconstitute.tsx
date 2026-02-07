import { Link } from "react-router-dom";
import ArticleLayout from "@/components/ArticleLayout";

const HowToReconstitute = () => (
  <ArticleLayout
    category="How-To Guide"
    title="How to Reconstitute Peptides: Step-by-Step Guide"
    readTime="6 min read"
    date="February 2026"
  >
    <p>Reconstitution is one of the most important skills in peptide research. Done correctly, it ensures maximum peptide stability and accurate dosing. Done incorrectly, it can render your expensive peptides useless.</p>

    <h2>What is Reconstitution?</h2>
    <p>Reconstitution is the process of adding bacteriostatic water to lyophilized (freeze-dried) peptide powder to create a liquid solution suitable for research use.</p>
    <p>Most peptides are sold as stable, freeze-dried powder because this form has the longest shelf life. However, to use them in research protocols, you must first dissolve them in solution.</p>

    <h2>Supplies You'll Need</h2>
    <ul>
      <li><strong>Lyophilized peptide vial</strong> — Your freeze-dried peptide</li>
      <li><strong>Bacteriostatic water (BAC water)</strong> — NOT regular sterile water</li>
      <li><strong>Sterile syringes</strong> — 1ml or 3ml insulin syringes work well</li>
      <li><strong>Alcohol swabs</strong> — For sanitizing vial tops</li>
      <li><strong>Marker or label</strong> — To mark reconstitution date</li>
    </ul>
    <p>Before you start, use our <Link to="/calculators">Reconstitution Calculator</Link> to determine exactly how much BAC water to add.</p>

    <h2>Why Bacteriostatic Water?</h2>
    <p>Bacteriostatic water contains 0.9% benzyl alcohol as a preservative. This is crucial because:</p>
    <ul>
      <li>It prevents bacterial growth in your reconstituted peptide</li>
      <li>Allows multiple draws from the same vial over weeks</li>
      <li>Maintains peptide stability longer than regular sterile water</li>
    </ul>
    <p><strong>⚠ Never use regular sterile water</strong> — it will allow bacteria to grow. Your peptide will only be stable for 24-48 hours and risks contamination.</p>

    <h2>Step-by-Step Reconstitution Process</h2>

    <h3>1. Prepare Your Workspace</h3>
    <p>Clean your work surface with disinfectant. Wash your hands thoroughly. Lay out all your supplies within easy reach. Work in a quiet area where you won't be rushed or interrupted.</p>

    <h3>2. Let Vials Come to Room Temperature</h3>
    <p>If your peptide and BAC water have been refrigerated, let them sit at room temperature for 15-20 minutes. Cold liquids can create bubbles and make reconstitution more difficult.</p>

    <h3>3. Sanitize Both Vial Tops</h3>
    <p>Use alcohol swabs to thoroughly clean the rubber stoppers on both the peptide vial and BAC water vial. Let them air dry for 30 seconds.</p>

    <h3>4. Draw the Bacteriostatic Water</h3>
    <p>Using a sterile syringe, draw the calculated amount of BAC water. Remove any air bubbles by tapping the syringe and gently pushing the plunger until only liquid remains.</p>

    <h3>5. Add Water to Peptide Vial — SLOWLY</h3>
    <p>This is the most critical step. Insert the needle into the peptide vial at an angle, aiming for the glass wall rather than the powder. Inject the water very slowly (30-60 seconds for 1-2ml) down the side of the vial. <strong>DO NOT inject directly onto the powder.</strong></p>

    <h3>6. Swirl Gently — DO NOT SHAKE</h3>
    <p>Once all water is added, remove the syringe. Gently swirl the vial in small circular motions. The powder should dissolve within 1-3 minutes. If it doesn't completely dissolve, let it sit for a few minutes then swirl again.</p>

    <h3>7. Inspect the Solution</h3>
    <p>Hold the vial up to light. The solution should be clear (possibly with a slight tint depending on the peptide). There should be no visible particles floating. If you see cloudiness or particles, do not use.</p>

    <h3>8. Label and Refrigerate</h3>
    <p>Use a permanent marker or label to write: peptide name, reconstitution date, concentration (e.g., "BPC-157, 2/6/26, 250mcg/0.1ml"). Store immediately in refrigerator at 2-8°C.</p>

    <h2>Common Reconstitution Mistakes</h2>
    <ul>
      <li><strong>Shaking the vial vigorously</strong> — Denatures the peptide structure. Always swirl gently.</li>
      <li><strong>Injecting directly onto the powder</strong> — Creates excessive foaming. Always aim for the side of the vial.</li>
      <li><strong>Using the wrong water type</strong> — Sterile water without preservative leads to contamination risk.</li>
      <li><strong>Adding too much water</strong> — Makes accurate dosing difficult. Use a calculator.</li>
      <li><strong>Adding too little water</strong> — Peptide may not fully dissolve.</li>
      <li><strong>Not sanitizing vial tops</strong> — Introduces contamination risk.</li>
      <li><strong>Rushing the process</strong> — Take your time, especially when injecting water.</li>
    </ul>

    <h2>Calculating Water Amount</h2>
    <p>The amount of BAC water you add determines your concentration:</p>
    <p><strong>Concentration = Total Peptide Amount ÷ Total Water Added</strong></p>
    <p>Example: 5mg peptide + 2ml water = 2.5mg/ml (or 2500mcg/ml)</p>
    <p>Our <Link to="/calculators">Reconstitution Calculator</Link> does this math for you and tells you exactly how much to draw for your desired dose.</p>

    <h3>Common Reconstitution Volumes</h3>
    <ul>
      <li><strong>2ml BAC water</strong> — Most common, easy math for dosing</li>
      <li><strong>1ml BAC water</strong> — Higher concentration, less injection volume</li>
      <li><strong>3ml BAC water</strong> — Lower concentration, more forgiving for precise dosing</li>
    </ul>

    <h2>Dealing with Foaming</h2>
    <ul>
      <li><strong>Don't panic</strong> — Some foaming can occur even with proper technique</li>
      <li><strong>Let it sit</strong> — Place in refrigerator and let foam settle for 1-2 hours</li>
      <li><strong>Don't shake to remove foam</strong> — This makes it worse</li>
      <li><strong>Avoid excessive foam</strong> — Inject water very slowly to minimise bubbles</li>
    </ul>

    <h2>Pro Tips from Experienced Researchers</h2>
    <ul>
      <li>Draw slightly more water than needed — makes it easier to get exact amount</li>
      <li>Use 3ml syringe for more control — easier to inject slowly and precisely</li>
      <li>Write concentration on vial cap — quick reference without picking up vial</li>
      <li>Keep BAC water refrigerated — extends its shelf life</li>
      <li>Consider amber vials — protects light-sensitive peptides</li>
      <li>Take photos of labels — digital backup of batch numbers and dates</li>
    </ul>

    <h2>After Reconstitution</h2>
    <h3>Storage</h3>
    <ul>
      <li>Refrigerate immediately at 2-8°C</li>
      <li>Store upright, not on refrigerator door</li>
      <li>Keep away from light if possible</li>
      <li>Never freeze reconstituted peptides</li>
    </ul>

    <h3>Shelf Life</h3>
    <ul>
      <li>Most peptides: 28-30 days when refrigerated</li>
      <li>Some stable peptides: up to 60 days</li>
      <li>Check for cloudiness before each use</li>
      <li>When in doubt, discard and reconstitute fresh</li>
    </ul>

    <h2>Troubleshooting</h2>
    <h3>Peptide Won't Dissolve</h3>
    <p>Let sit for 5-10 minutes at room temperature. Swirl very gently every few minutes. If still not dissolved after 20 minutes, contact supplier.</p>

    <h3>Solution is Cloudy</h3>
    <p>Some peptides have natural slight cloudiness. If significantly cloudy or has particles, do not use. Check if peptide was stored properly before reconstitution.</p>

    <h3>Added Wrong Amount of Water</h3>
    <p>If you haven't used any yet, you can draw out excess carefully. Or recalculate concentration based on actual amount added. Use calculator to adjust your dose accordingly.</p>
  </ArticleLayout>
);

export default HowToReconstitute;
