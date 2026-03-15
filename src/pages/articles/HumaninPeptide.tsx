import ArticleLayout from "@/components/ArticleLayout";
import { Link } from "react-router-dom";

const HumaninPeptide = () => (
  <ArticleLayout
    category="Deep Dive"
    title="Humanin: The Mitochondrial Peptide Linked to Longevity and Neuroprotection"
    readTime="9 min read"
    date="March 2026"
    slug="humanin-longevity-peptide"
    description="Research overview of humanin, a mitochondrial-derived peptide linked to neuroprotection, insulin sensitivity, and longevity. Mechanisms, animal data, and clinical relevance."
    faqs={[
      { q: "What is humanin?", a: "Humanin is a 24-amino-acid peptide encoded by mitochondrial DNA (mtDNA). It was discovered in 2001 by Hashimoto et al. while studying surviving neurons in Alzheimer's disease patients. It acts as a cytoprotective signalling molecule, protecting cells against apoptosis and oxidative stress." },
      { q: "Does humanin decline with age?", a: "Yes. Circulating humanin levels decrease with age in both animal models and human studies. Lower humanin levels are correlated with increased risk of age-related diseases including Alzheimer's disease, type 2 diabetes, and cardiovascular disease." },
      { q: "Can you supplement humanin?", a: "Humanin analogues (such as HNGF6A and [Gly14]-humanin) have been used in animal studies. No humanin supplement is commercially available for human use. Research is focused on understanding its role as a biomarker and potential therapeutic target." }
    ]}
  >
    <p>
      Humanin was discovered in 2001 by a Japanese research group studying the brains of Alzheimer's disease patients (Hashimoto et al., <em>Proceedings of the National Academy of Sciences</em>, 2001). They found that surviving neurons in affected brain regions expressed a previously unknown peptide encoded by the 16S ribosomal RNA gene of mitochondrial DNA. This peptide, named humanin, protected neuronal cells against amyloid beta toxicity in vitro.
    </p>
    <p>
      Since its discovery, humanin has been recognised as the founding member of a class called mitochondrial-derived peptides (MDPs), which also includes <Link to="/education/mots-c-mitochondrial-peptide">MOTS-c</Link> and SHMOTs (small humanin-like peptides). These peptides are encoded by short open reading frames within mitochondrial DNA and function as systemic signalling molecules.
    </p>

    <h2>Mechanism of Action</h2>
    <p>
      Humanin exerts its effects through multiple pathways:
    </p>
    <ul>
      <li><strong>IGFBP-3 interaction:</strong> Humanin binds to insulin-like growth factor binding protein-3 (IGFBP-3), blocking IGFBP-3-induced apoptosis. This interaction influences cell survival in both neural and peripheral tissues (Ikonen et al., 2003).</li>
      <li><strong>STAT3 signalling:</strong> Humanin activates the STAT3 pathway through the CNTFR/WSX-1/gp130 receptor complex, promoting cell survival and reducing inflammation (Hashimoto et al., 2009).</li>
      <li><strong>BAX inhibition:</strong> Humanin directly interacts with the pro-apoptotic protein BAX, preventing it from forming pores in the mitochondrial outer membrane. This blocks the intrinsic apoptosis pathway.</li>
      <li><strong>AMPK activation:</strong> Humanin has been shown to activate AMP-activated protein kinase (AMPK) in peripheral tissues, improving glucose uptake and fatty acid oxidation (Lee et al., 2015).</li>
    </ul>

    <h2>Humanin and Ageing</h2>
    <p>
      Circulating humanin levels decline significantly with age. A study by Muzumdar et al. (2009) in <em>Aging Cell</em> found that plasma humanin levels in elderly humans (65-90 years) were approximately 50% lower than in younger adults (20-40 years). This decline correlates with:
    </p>
    <ul>
      <li>Reduced mitochondrial function</li>
      <li>Increased susceptibility to oxidative stress</li>
      <li>Higher rates of neurodegenerative disease</li>
      <li>Impaired insulin sensitivity</li>
    </ul>
    <p>
      Interestingly, children of centenarians have been found to have higher circulating humanin levels than age-matched controls (Yen et al., 2020), suggesting a genetic component to humanin production that may contribute to exceptional longevity.
    </p>

    <h2>Neuroprotection</h2>
    <p>
      Humanin's neuroprotective effects are the most extensively studied. In Alzheimer's disease models, humanin and its analogues have been shown to:
    </p>
    <ul>
      <li>Protect against amyloid beta-induced neurotoxicity (Hashimoto et al., 2001)</li>
      <li>Reduce tau phosphorylation in vivo (Tajima et al., 2005)</li>
      <li>Improve cognitive performance in transgenic AD mouse models</li>
      <li>Reduce neuronal apoptosis following ischaemic stroke models</li>
    </ul>
    <p>
      These findings have not yet been replicated in human clinical trials.
    </p>

    <h2>Metabolic Effects</h2>
    <p>
      Beyond neuroprotection, humanin influences metabolic health:
    </p>
    <ul>
      <li><strong>Insulin sensitivity:</strong> Exogenous humanin administration improved insulin sensitivity in high-fat-diet mice (Lee et al., <em>Cell Metabolism</em>, 2015)</li>
      <li><strong>Visceral fat reduction:</strong> Humanin-treated mice showed reduced adiposity without changes in food intake</li>
      <li><strong>Cardiac protection:</strong> Humanin protected cardiomyocytes against oxidative stress-induced apoptosis in ischaemia-reperfusion models (Thummasorn et al., 2016)</li>
    </ul>

    <h2>Humanin vs MOTS-c</h2>
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Humanin</th>
          <th>MOTS-c</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Origin</td><td>16S rRNA gene (mtDNA)</td><td>12S rRNA gene (mtDNA)</td></tr>
        <tr><td>Size</td><td>24 amino acids</td><td>16 amino acids</td></tr>
        <tr><td>Primary effects</td><td>Anti-apoptotic, neuroprotective</td><td>Exercise mimetic, AMPK activator</td></tr>
        <tr><td>Decline with age</td><td>Yes</td><td>Yes</td></tr>
        <tr><td>Clinical trials</td><td>None completed</td><td>None completed</td></tr>
      </tbody>
    </table>
    <p>
      Both peptides represent the emerging field of "mitochondrial medicine" and are central to the thesis that mitochondrial dysfunction is a root driver of ageing. For more on MOTS-c, see our <Link to="/education/mots-c-mitochondrial-peptide">dedicated guide</Link>.
    </p>

    <h2>Current Research Status</h2>
    <p>
      As of March 2026, humanin research remains predominantly preclinical. No commercially available humanin supplements exist. The peptide's primary value currently lies as a biomarker for mitochondrial health and longevity potential, and as a therapeutic target for neurodegenerative disease.
    </p>
    <p>
      Synthetic humanin analogues with improved stability and potency (such as HNG, HNGF6A, and S14G-humanin) are used in research settings. These analogues have 1000x greater potency than native humanin in some assays.
    </p>

    <h2>Key References</h2>
    <ul>
      <li>Hashimoto, Y. et al. (2001). "A rescue factor abolishing neuronal cell death by a wide spectrum of familial Alzheimer's disease genes and Abeta." <em>PNAS</em>, 98(11), 6336-6341.</li>
      <li>Lee, C. et al. (2015). "The mitochondrial-derived peptide MOTS-c promotes metabolic homeostasis and reduces obesity and insulin resistance." <em>Cell Metabolism</em>, 21(3), 443-454.</li>
      <li>Muzumdar, R.H. et al. (2009). "Humanin: a novel central regulator of peripheral insulin action." <em>PLoS ONE</em>, 4(7), e6334.</li>
      <li>Yen, K. et al. (2020). "The mitochondrial derived peptide humanin is a regulator of lifespan and healthspan." <em>Aging</em>, 12(12), 11185-11199.</li>
    </ul>
  </ArticleLayout>
);

export default HumaninPeptide;
