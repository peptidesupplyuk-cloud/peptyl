import ArticleLayout from "@/components/ArticleLayout";
import { Link } from "react-router-dom";

const TirzepatideVsSemaglutide = () => (
  <ArticleLayout
    category="Comparison"
    title="Tirzepatide vs Semaglutide: Head-to-Head Comparison (2026)"
    readTime="9 min read"
    date="March 2026"
    slug="tirzepatide-vs-semaglutide"
    description="Detailed comparison of tirzepatide (Mounjaro) and semaglutide (Wegovy/Ozempic): weight loss data, mechanisms, side effects, UK availability, and pricing."
    faqs={[
      { q: "Is tirzepatide more effective than semaglutide?", a: "Clinical data suggests tirzepatide produces greater weight loss on average. The SURMOUNT-1 trial showed 22.5% weight loss with tirzepatide 15 mg vs 14.9% with semaglutide 2.4 mg in STEP 1. However, direct head-to-head trial data (SURPASS-2 for diabetes) also showed tirzepatide superiority for HbA1c reduction." },
      { q: "Is tirzepatide available in the UK?", a: "Tirzepatide (Mounjaro) received MHRA approval for type 2 diabetes in 2023. NICE approved it for weight management in late 2024. Private prescriptions are available; NHS access is expanding through specialist weight management services." },
      { q: "Which has fewer side effects?", a: "Both drugs share similar GI side effects (nausea, vomiting, diarrhoea). Some clinical data suggests tirzepatide may cause slightly less nausea at equivalent efficacy doses, possibly due to the GIP receptor component. Individual response varies significantly." }
    ]}
  >
    <p>
      Semaglutide and tirzepatide are the two most important peptide-based drugs in metabolic medicine. Both target GLP-1 receptors, but tirzepatide adds GIP (glucose-dependent insulinotropic polypeptide) receptor agonism, creating a dual mechanism. This comparison covers efficacy, safety, access, and cost in the UK context.
    </p>

    <h2>Mechanism Comparison</h2>
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Semaglutide</th>
          <th>Tirzepatide</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Drug class</td><td>GLP-1 receptor agonist</td><td>Dual GIP/GLP-1 receptor agonist</td></tr>
        <tr><td>Brand names</td><td>Wegovy (obesity), Ozempic (T2D)</td><td>Mounjaro (T2D), Zepbound (obesity, US)</td></tr>
        <tr><td>Manufacturer</td><td>Novo Nordisk</td><td>Eli Lilly</td></tr>
        <tr><td>Administration</td><td>Weekly subcutaneous injection</td><td>Weekly subcutaneous injection</td></tr>
        <tr><td>Maintenance dose</td><td>2.4 mg (obesity) / 1.0 mg (T2D)</td><td>15 mg (max) / 5, 10, 15 mg</td></tr>
      </tbody>
    </table>

    <h2>Weight Loss Efficacy</h2>
    <p>
      No direct head-to-head trial for weight management has been completed, but cross-trial comparison of the major obesity studies provides useful context:
    </p>
    <table>
      <thead>
        <tr>
          <th>Trial</th>
          <th>Drug</th>
          <th>Average Weight Loss</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>STEP 1 (NEJM, 2021)</td><td>Semaglutide 2.4 mg</td><td>14.9%</td><td>68 weeks</td></tr>
        <tr><td>SURMOUNT-1 (NEJM, 2022)</td><td>Tirzepatide 15 mg</td><td>22.5%</td><td>72 weeks</td></tr>
        <tr><td>SURMOUNT-1</td><td>Tirzepatide 10 mg</td><td>19.5%</td><td>72 weeks</td></tr>
        <tr><td>SURMOUNT-1</td><td>Tirzepatide 5 mg</td><td>15.0%</td><td>72 weeks</td></tr>
      </tbody>
    </table>
    <p>
      Even the lowest tirzepatide dose (5 mg) matched semaglutide's highest dose (2.4 mg) for weight loss. The 15 mg dose produced approximately 50% more weight loss. These are cross-trial comparisons and carry methodological caveats, but the difference is consistently observed.
    </p>

    <h2>Diabetes Control (HbA1c)</h2>
    <p>
      The SURPASS-2 trial directly compared tirzepatide with semaglutide 1.0 mg in type 2 diabetes patients. Tirzepatide at all doses (5, 10, 15 mg) produced significantly greater HbA1c reductions than semaglutide 1.0 mg (Frias et al., <em>NEJM</em>, 2021).
    </p>

    <h2>Side Effect Comparison</h2>
    <table>
      <thead>
        <tr>
          <th>Side Effect</th>
          <th>Semaglutide 2.4 mg</th>
          <th>Tirzepatide 15 mg</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Nausea</td><td>44%</td><td>31%</td></tr>
        <tr><td>Diarrhoea</td><td>30%</td><td>23%</td></tr>
        <tr><td>Vomiting</td><td>24%</td><td>17%</td></tr>
        <tr><td>Constipation</td><td>24%</td><td>19%</td></tr>
      </tbody>
    </table>
    <p>
      Tirzepatide appears to have a somewhat better GI tolerability profile at equivalent or superior efficacy, possibly because the GIP receptor component counterbalances some of the GLP-1-mediated nausea pathways.
    </p>

    <h2>Muscle Loss Concerns</h2>
    <p>
      Both drugs cause significant lean mass loss alongside fat loss. Approximately 25-39% of total weight lost is lean mass across both drug classes. This is a growing concern, particularly for older adults and those without a structured resistance training programme. Strategies for <Link to="/education/glp1-muscle-loss-prevention">preventing muscle loss on GLP-1 therapy</Link> are becoming a critical part of treatment planning.
    </p>

    <h2>UK Availability and Pricing</h2>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Semaglutide (Wegovy)</th>
          <th>Tirzepatide (Mounjaro)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>NHS availability</td><td>Yes (NICE TA875, 2023)</td><td>Yes (NICE TA, late 2024)</td></tr>
        <tr><td>Private cost (approx.)</td><td>£150-300/month</td><td>£200-350/month</td></tr>
        <tr><td>Oral form</td><td>US launch Jan 2026; UK pending</td><td>Phase III trials ongoing</td></tr>
      </tbody>
    </table>

    <h2>Which Should You Choose?</h2>
    <p>
      For patients focused primarily on maximum weight loss, tirzepatide appears to have a clear efficacy advantage based on available data. For those already established on semaglutide with good results and tolerability, switching may not be necessary. Cost, availability, and prescriber preference also influence the decision.
    </p>
    <p>
      For the broader context of GLP-1 peptides, including Retatrutide and oral formulations, see our <Link to="/education/understanding-glp1-peptides">complete GLP-1 guide</Link>.
    </p>

    <h2>Key References</h2>
    <ul>
      <li>Wilding, J.P.H. et al. (2021). "Once-weekly semaglutide in adults with overweight or obesity (STEP 1)." <em>NEJM</em>, 384, 989-1002.</li>
      <li>Jastreboff, A.M. et al. (2022). "Tirzepatide once weekly for the treatment of obesity (SURMOUNT-1)." <em>NEJM</em>, 387, 205-216.</li>
      <li>Frias, J.P. et al. (2021). "Tirzepatide versus semaglutide once weekly in patients with type 2 diabetes (SURPASS-2)." <em>NEJM</em>, 385, 503-515.</li>
    </ul>
  </ArticleLayout>
);

export default TirzepatideVsSemaglutide;
