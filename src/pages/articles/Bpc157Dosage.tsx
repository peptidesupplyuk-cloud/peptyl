import ArticleLayout from "@/components/ArticleLayout";
import { Link } from "react-router-dom";

const Bpc157Dosage = () => (
  <ArticleLayout
    category="Dosing Guide"
    title="BPC-157 Dosage Guide: Research Protocols, Timing & Safety"
    readTime="8 min read"
    date="March 2026"
    slug="bpc-157-dosage-guide"
    description="Evidence-based BPC-157 dosage guide covering subcutaneous and oral protocols, typical research ranges (250-500mcg), timing, and safety considerations."
    faqs={[
      { q: "What is the standard BPC-157 research dose?", a: "Most published studies use 250-500mcg per day administered subcutaneously. Some protocols split this into two daily doses of 125-250mcg. Oral studies in rodents have used body-weight-scaled equivalents." },
      { q: "How long should a BPC-157 cycle last?", a: "Typical research protocols run 4-6 weeks. Some injury-focused protocols extend to 8 weeks. Most researchers cycle off for an equal duration before repeating." },
      { q: "Can BPC-157 be taken orally?", a: "Yes. BPC-157 was originally discovered as a gastric peptide and demonstrates oral bioavailability. Oral capsules are now sold as supplements in the UK and EU. Oral doses are typically higher than subcutaneous doses due to first-pass metabolism." },
      { q: "What time of day should BPC-157 be administered?", a: "There is no definitive evidence favouring a specific time. Common practice is morning administration on an empty stomach, or split dosing (morning and evening). Injury-targeted protocols sometimes administer close to the injury site." }
    ]}
  >
    <p>
      BPC-157 (Body Protection Compound-157) is a synthetic pentadecapeptide derived from a protective protein found in human gastric juice. Since its discovery in the early 1990s, it has been studied extensively in animal models for tissue healing, gut protection, and anti-inflammatory effects. This guide covers the dosing protocols most commonly referenced in published research.
    </p>

    <h2>What Is BPC-157?</h2>
    <p>
      BPC-157 is a 15-amino-acid peptide with the sequence Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val. It was first isolated and characterised by Professor Predrag Sikiric at the University of Zagreb in 1993. Unlike many synthetic peptides, BPC-157 is stable in gastric acid, which makes oral administration viable.
    </p>
    <p>
      Over 100 peer-reviewed studies have examined BPC-157 in animal models, covering tendon healing (Staresinic et al., 2003), muscle repair (Pevec et al., 2010), gut cytoprotection (Sikiric et al., 2018), and neuroprotection (Klicek et al., 2013). No completed human clinical trials have been published as of March 2026, though several are reportedly underway.
    </p>

    <h2>Typical Research Dosages</h2>
    <p>
      Human dosing ranges are extrapolated from animal studies using standard allometric scaling. The most commonly cited research doses are:
    </p>
    <table>
      <thead>
        <tr>
          <th>Route</th>
          <th>Dose Range</th>
          <th>Frequency</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Subcutaneous injection</td>
          <td>250-500 mcg/day</td>
          <td>Once or twice daily</td>
          <td>4-6 weeks</td>
        </tr>
        <tr>
          <td>Oral (capsule)</td>
          <td>500-1000 mcg/day</td>
          <td>Once daily, fasted</td>
          <td>4-8 weeks</td>
        </tr>
        <tr>
          <td>Intramuscular (near injury)</td>
          <td>250-500 mcg/day</td>
          <td>Once daily</td>
          <td>2-4 weeks</td>
        </tr>
      </tbody>
    </table>
    <p>
      These figures are drawn from community research reports and extrapolations from rodent studies using a 10 mcg/kg body weight baseline (Sikiric et al., 1999). For a 75 kg individual, this translates to approximately 750 mcg/day, though most protocols use the lower end (250-500 mcg) based on reported efficacy at these levels.
    </p>

    <h2>Administration Routes Compared</h2>
    <h3>Subcutaneous Injection</h3>
    <p>
      The most common route in peptide research. Subcutaneous injection provides direct systemic absorption with high bioavailability. Injection sites are typically rotated between the abdomen, thigh, and upper arm. Our <Link to="/calculators">reconstitution calculator</Link> can help determine the correct volume to draw based on your vial concentration.
    </p>

    <h3>Oral Administration</h3>
    <p>
      BPC-157 is unusually stable in gastric acid (Sikiric et al., 2018), making oral delivery feasible. This route is particularly relevant for gut-targeted applications such as inflammatory bowel conditions, gastric ulcers, and intestinal permeability. Oral BPC-157 capsules are now available as supplements in the UK market. Read our detailed <Link to="/education/bpc-157-oral-vs-injection">oral vs injection comparison</Link>.
    </p>

    <h3>Local Injection (Near Injury Site)</h3>
    <p>
      Some protocols inject BPC-157 subcutaneously near the site of injury. The rationale is higher local peptide concentration at the target tissue. This approach is referenced in tendon and ligament healing studies (Staresinic et al., 2003), though systemic administration also shows efficacy in animal models.
    </p>

    <h2>Timing and Frequency</h2>
    <p>
      BPC-157 has a relatively short half-life (estimated 4-6 hours based on pharmacokinetic modelling). Common timing approaches include:
    </p>
    <ul>
      <li><strong>Once daily:</strong> Full dose in the morning on an empty stomach. Simplest protocol.</li>
      <li><strong>Twice daily:</strong> Split dose (e.g., 250 mcg morning + 250 mcg evening). May maintain more stable peptide levels.</li>
      <li><strong>Pre-workout/near injury:</strong> Some protocols time administration 30-60 minutes before physical activity for recovery-focused goals.</li>
    </ul>
    <p>
      There is no clinical evidence establishing superiority of one timing protocol over another. Most researchers default to morning fasted administration for consistency.
    </p>

    <h2>Cycling Protocols</h2>
    <p>
      While BPC-157 has not shown tolerance or receptor desensitisation in published studies, standard practice in the peptide research community is to cycle compounds. A typical cycle structure is:
    </p>
    <ul>
      <li>4 weeks on, 4 weeks off</li>
      <li>6 weeks on, 4 weeks off</li>
      <li>8 weeks on, 6 weeks off (extended protocols)</li>
    </ul>
    <p>
      For more detail on cycling rationale, see our <Link to="/education/peptide-cycling-guide">peptide cycling guide</Link>.
    </p>

    <h2>Reconstitution</h2>
    <p>
      BPC-157 is typically supplied as a lyophilised (freeze-dried) powder in 5 mg vials. Reconstitution with bacteriostatic water is required before injection. The standard approach:
    </p>
    <ul>
      <li>Add 2 mL bacteriostatic water to a 5 mg vial = 2,500 mcg/mL concentration</li>
      <li>250 mcg dose = 0.1 mL (10 units on an insulin syringe)</li>
      <li>500 mcg dose = 0.2 mL (20 units on an insulin syringe)</li>
    </ul>
    <p>
      Use our <Link to="/calculators">reconstitution calculator</Link> for precise measurements with visual syringe diagrams.
    </p>

    <h2>Safety Considerations</h2>
    <p>
      BPC-157 has demonstrated a strong safety profile in animal studies. Rodent toxicity studies have shown no adverse effects at doses up to 10 mg/kg (Sikiric et al., 2006), which is orders of magnitude above typical research doses.
    </p>
    <p>
      Commonly reported effects in community research reports include mild nausea (particularly with oral administration), injection site redness, and temporary fatigue. These are generally transient and resolve within hours.
    </p>
    <p>
      BPC-157 influences growth factor signalling pathways including VEGF, NO, and FAK-paxillin. Individuals with a history of cancer or active malignancy should exercise caution, as upregulation of angiogenic pathways could theoretically influence tumour vascularisation. This is a precautionary note; no direct evidence of tumour promotion has been published.
    </p>

    <h2>Stacking</h2>
    <p>
      BPC-157 is frequently combined with <Link to="/education/bpc157-vs-tb500">TB-500 (Thymosin Beta-4)</Link> in healing-focused protocols. The rationale is complementary mechanisms: BPC-157 promotes local tissue repair via growth factor modulation, while TB-500 reduces inflammation systemically through actin regulation.
    </p>
    <p>
      Other common stack combinations include BPC-157 with GHK-Cu (for skin and tissue regeneration) and BPC-157 with <Link to="/education/gut-health-peptides">KPV</Link> (for gut health protocols).
    </p>

    <h2>Key References</h2>
    <ul>
      <li>Sikiric, P. et al. (2018). "Brain-gut axis and pentadecapeptide BPC 157." <em>Current Neuropharmacology</em>, 16(5), 512-533.</li>
      <li>Staresinic, M. et al. (2003). "Gastric pentadecapeptide BPC 157 accelerates healing of transected rat Achilles tendon." <em>Journal of Orthopaedic Research</em>, 21(6), 976-983.</li>
      <li>Pevec, D. et al. (2010). "Impact of pentadecapeptide BPC 157 on muscle healing." <em>Journal of Physiology and Pharmacology</em>, 61(2), 177-183.</li>
      <li>Sikiric, P. et al. (2006). "Toxicity by NSAIDs. Counteraction by stable gastric pentadecapeptide BPC 157." <em>Current Pharmaceutical Design</em>, 12(30), 4051-4067.</li>
    </ul>
  </ArticleLayout>
);

export default Bpc157Dosage;
