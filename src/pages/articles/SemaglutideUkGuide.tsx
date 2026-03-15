import ArticleLayout from "@/components/ArticleLayout";
import { Link } from "react-router-dom";

const SemaglutideUkGuide = () => (
  <ArticleLayout
    category="GLP-1 Guide"
    title="Semaglutide in the UK: Access, Cost, Dosing & What You Need to Know"
    readTime="10 min read"
    date="March 2026"
    slug="semaglutide-uk-guide"
    description="Complete UK guide to semaglutide (Wegovy/Ozempic): NHS access, private prescription costs, dosing schedules, side effects, and how it compares to tirzepatide."
    faqs={[
      { q: "Can I get semaglutide on the NHS?", a: "Yes. Wegovy (semaglutide 2.4 mg) was approved by NICE for weight management in March 2023 for adults with BMI 35+ (or 30+ with a weight-related condition) who have tried diet and exercise. Ozempic is available on the NHS for type 2 diabetes. Availability varies by area; specialist weight management services handle most prescriptions." },
      { q: "How much does private semaglutide cost in the UK?", a: "Private prescriptions for Wegovy typically cost between £150-300 per month depending on the dose and provider. Online clinics and telehealth services offer subscriptions. Compounded semaglutide is not legally available in the UK." },
      { q: "What is the semaglutide dosing schedule?", a: "Wegovy follows a 16-week titration: 0.25 mg weeks 1-4, 0.5 mg weeks 5-8, 1.0 mg weeks 9-12, 1.7 mg weeks 13-16, then 2.4 mg maintenance. Ozempic for diabetes uses a separate schedule: 0.25 mg for 4 weeks, then 0.5 mg, with optional increase to 1.0 mg." }
    ]}
  >
    <p>
      Semaglutide is a GLP-1 receptor agonist that has transformed the treatment of obesity and type 2 diabetes globally. In the UK, it is available as Wegovy (for weight management) and Ozempic (for type 2 diabetes), both manufactured by Novo Nordisk. This guide covers the UK-specific landscape: how to access it, what it costs, dosing protocols, and practical considerations.
    </p>

    <h2>What Is Semaglutide?</h2>
    <p>
      Semaglutide is a synthetic analogue of human glucagon-like peptide-1 (GLP-1), a hormone produced in the gut that regulates appetite, blood sugar, and gastric emptying. It binds to GLP-1 receptors in the brain and pancreas, producing three primary effects:
    </p>
    <ul>
      <li>Reduced appetite and food intake via hypothalamic satiety signalling</li>
      <li>Improved insulin secretion and reduced glucagon release (glucose-dependent)</li>
      <li>Delayed gastric emptying, which prolongs the feeling of fullness after eating</li>
    </ul>
    <p>
      The STEP clinical trial programme (published in the <em>New England Journal of Medicine</em>, 2021) demonstrated average weight loss of 14.9% of body weight over 68 weeks with semaglutide 2.4 mg compared to 2.4% with placebo.
    </p>

    <h2>UK Access Routes</h2>
    <h3>NHS Prescriptions</h3>
    <p>
      NICE approved Wegovy for NHS use in March 2023 (Technology Appraisal TA875). Eligibility criteria:
    </p>
    <ul>
      <li>BMI of 35 or above (or 30+ with a weight-related comorbidity such as type 2 diabetes, hypertension, or sleep apnoea)</li>
      <li>Previous engagement with diet and exercise programmes</li>
      <li>Referral through a specialist weight management service</li>
      <li>Maximum treatment duration of 2 years</li>
    </ul>
    <p>
      In practice, NHS supply has been limited by availability. Novo Nordisk implemented supply restrictions in 2023-2024 to prioritise existing patients. As of early 2026, supply has improved but waiting times vary by region.
    </p>

    <h3>Private Prescriptions</h3>
    <p>
      Multiple UK telehealth platforms and private clinics now prescribe Wegovy. Typical costs range from £150-300 per month depending on dose. Most providers include an initial consultation, ongoing monitoring, and dose adjustments. Compare pricing on our <Link to="/suppliers">supplier directory</Link>.
    </p>

    <h2>Dosing Schedule</h2>
    <h3>Wegovy (Weight Management)</h3>
    <table>
      <thead>
        <tr>
          <th>Phase</th>
          <th>Dose</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Titration 1</td><td>0.25 mg/week</td><td>Weeks 1-4</td></tr>
        <tr><td>Titration 2</td><td>0.5 mg/week</td><td>Weeks 5-8</td></tr>
        <tr><td>Titration 3</td><td>1.0 mg/week</td><td>Weeks 9-12</td></tr>
        <tr><td>Titration 4</td><td>1.7 mg/week</td><td>Weeks 13-16</td></tr>
        <tr><td>Maintenance</td><td>2.4 mg/week</td><td>Ongoing</td></tr>
      </tbody>
    </table>
    <p>
      The slow titration exists to minimise gastrointestinal side effects. Patients who cannot tolerate a dose increase may remain at the previous dose for an additional 4 weeks before reattempting.
    </p>

    <h3>Oral Semaglutide</h3>
    <p>
      In January 2026, Novo Nordisk launched oral Wegovy in the US market. UK approval is expected but not yet confirmed as of March 2026. The oral form uses the SNAC (sodium N-[8-(2-hydroxybenzoyl)amino] caprylate) absorption enhancer to achieve peptide absorption through the stomach lining. Read our full analysis of the <Link to="/education/oral-glp1-boom-2026">oral GLP-1 revolution</Link>.
    </p>

    <h2>Common Side Effects</h2>
    <p>
      Data from the STEP trial programme and post-marketing surveillance:
    </p>
    <table>
      <thead>
        <tr>
          <th>Side Effect</th>
          <th>Incidence</th>
          <th>Typical Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Nausea</td><td>~44%</td><td>First 4-8 weeks, usually improves</td></tr>
        <tr><td>Diarrhoea</td><td>~30%</td><td>Intermittent, dose-dependent</td></tr>
        <tr><td>Vomiting</td><td>~24%</td><td>First 4-8 weeks</td></tr>
        <tr><td>Constipation</td><td>~24%</td><td>Ongoing for some patients</td></tr>
        <tr><td>Headache</td><td>~14%</td><td>Transient</td></tr>
        <tr><td>Fatigue</td><td>~11%</td><td>First few weeks</td></tr>
      </tbody>
    </table>
    <p>
      Serious adverse events are rare but include pancreatitis (incidence &lt;0.3%), gallbladder disease, and thyroid C-cell concerns (observed in rodents; no confirmed human cases). Semaglutide carries a boxed warning for medullary thyroid carcinoma risk based on animal data.
    </p>

    <h2>Muscle Loss on GLP-1 Drugs</h2>
    <p>
      A significant concern with all GLP-1 receptor agonists is loss of lean body mass alongside fat loss. The STEP 1 trial reported that approximately 39% of total weight lost was lean mass. This has driven growing interest in muscle-protective strategies during GLP-1 therapy, including resistance training, adequate protein intake (1.6-2.2 g/kg/day), and emerging compounds targeting <Link to="/education/glp1-muscle-loss-prevention">muscle preservation</Link>.
    </p>

    <h2>Semaglutide vs Tirzepatide</h2>
    <p>
      Tirzepatide (Mounjaro) is a dual GIP/GLP-1 receptor agonist that has shown greater weight loss in head-to-head comparisons. The SURMOUNT-1 trial demonstrated 22.5% weight loss with tirzepatide 15 mg compared to semaglutide's 14.9% in STEP 1. For a detailed comparison, see our <Link to="/education/tirzepatide-vs-semaglutide">tirzepatide vs semaglutide analysis</Link>.
    </p>

    <h2>Monitoring and Bloodwork</h2>
    <p>
      We recommend baseline and follow-up bloodwork for anyone starting GLP-1 therapy. Key markers to track include HbA1c, fasting insulin, lipid panel, liver function (ALT, AST, GGT), thyroid function (TSH, free T4), and inflammatory markers (hsCRP). Use our <Link to="/education/bloodwork-comes-first">bloodwork guide</Link> for a complete panel recommendation.
    </p>

    <h2>Key References</h2>
    <ul>
      <li>Wilding, J.P.H. et al. (2021). "Once-weekly semaglutide in adults with overweight or obesity." <em>New England Journal of Medicine</em>, 384(11), 989-1002.</li>
      <li>NICE Technology Appraisal TA875. "Semaglutide for managing overweight and obesity." March 2023.</li>
      <li>Davies, M. et al. (2022). "Semaglutide 2.4 mg once a week in adults with overweight or obesity (STEP 2)." <em>The Lancet</em>, 397(10278), 971-984.</li>
    </ul>
  </ArticleLayout>
);

export default SemaglutideUkGuide;
