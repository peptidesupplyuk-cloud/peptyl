import ArticleLayout from "@/components/ArticleLayout";
import { Link } from "react-router-dom";

const Fgf21Longevity = () => (
  <ArticleLayout
    category="Deep Dive"
    title="FGF21: The Fasting Hormone That Could Reshape Longevity Medicine"
    readTime="9 min read"
    date="March 2026"
    slug="fgf21-metabolic-longevity"
    description="Research overview of FGF21 (fibroblast growth factor 21): the fasting-activated hormone linked to metabolic flexibility, fat oxidation, liver health, and extended lifespan in animal models."
    faqs={[
      { q: "What is FGF21?", a: "FGF21 is a hormone primarily produced by the liver in response to fasting, carbohydrate restriction, and metabolic stress. It activates pathways that promote fat oxidation, improve insulin sensitivity, and may extend lifespan based on animal studies." },
      { q: "Can you supplement FGF21?", a: "There is no commercially available FGF21 supplement. Pharmaceutical FGF21 analogues (pegbelfermin, efruxifermin) are in clinical trials for NASH/MASH. The Chinese candidate ZT003 (GLP-1/FGF21 dual agonist) entered FDA Phase I in 2025." },
      { q: "How do you naturally increase FGF21?", a: "Prolonged fasting (24-48 hours), protein restriction, cold exposure, and exercise all increase FGF21 levels. Chronic alcohol consumption also raises FGF21, though this is a stress response rather than a health benefit." }
    ]}
  >
    <p>
      Fibroblast growth factor 21 (FGF21) has emerged as one of the most important hormones in metabolic and longevity research. First characterised in 2000, FGF21 is primarily produced by the liver and acts as a systemic metabolic regulator. It is activated by fasting, protein restriction, and metabolic stress, and it coordinates a whole-body response that shifts fuel utilisation from glucose to fat.
    </p>
    <p>
      Transgenic mice that overexpress FGF21 live 30-40% longer than wild-type controls (Zhang et al., <em>eLife</em>, 2012). This lifespan extension is comparable to caloric restriction, making FGF21 one of the strongest pharmacological targets for longevity intervention.
    </p>

    <h2>Mechanism of Action</h2>
    <p>
      FGF21 signals through a receptor complex composed of FGFR1c and the co-receptor beta-klotho. This receptor system is expressed in the liver, adipose tissue, pancreas, and brain. Key downstream effects:
    </p>
    <ul>
      <li><strong>Fat oxidation:</strong> FGF21 activates PPARalpha in the liver, increasing fatty acid beta-oxidation and ketone body production</li>
      <li><strong>Insulin sensitisation:</strong> FGF21 enhances adiponectin secretion from adipose tissue, improving systemic insulin sensitivity (Lin et al., <em>Cell Metabolism</em>, 2013)</li>
      <li><strong>Hepatoprotection:</strong> FGF21 reduces hepatic lipogenesis and steatosis, making it a therapeutic target for NASH/MASH</li>
      <li><strong>Brown fat activation:</strong> FGF21 stimulates thermogenesis through UCP1 upregulation in brown and beige adipose tissue</li>
      <li><strong>Appetite modulation:</strong> FGF21 acts on the hypothalamus to reduce sugar and alcohol preference (von Holstein-Rathlou et al., <em>Cell Metabolism</em>, 2016)</li>
    </ul>

    <h2>FGF21 and Longevity</h2>
    <p>
      The longevity effects of FGF21 overexpression in mice are well-established:
    </p>
    <ul>
      <li>30-40% lifespan extension in FGF21-transgenic mice (Zhang et al., 2012)</li>
      <li>Reduced insulin and IGF-1 signalling (mimicking caloric restriction)</li>
      <li>Improved mitochondrial function in aged tissues</li>
      <li>Reduced age-related inflammation and fibrosis</li>
    </ul>
    <p>
      FGF21 appears to replicate many of the metabolic benefits of caloric restriction and intermittent fasting without requiring actual food deprivation. This positions it as a potential "caloric restriction mimetic" alongside compounds like rapamycin, metformin, and <Link to="/education/mots-c-mitochondrial-peptide">MOTS-c</Link>.
    </p>

    <h2>Pharmaceutical FGF21 Analogues</h2>
    <table>
      <thead>
        <tr>
          <th>Compound</th>
          <th>Developer</th>
          <th>Stage</th>
          <th>Target</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Efruxifermin (EFX)</td><td>Akero Therapeutics</td><td>Phase III</td><td>NASH/MASH</td></tr>
        <tr><td>Pegbelfermin</td><td>Bristol-Myers Squibb</td><td>Phase II (discontinued)</td><td>NASH</td></tr>
        <tr><td>ZT003</td><td>Beijing Zhitai Bio</td><td>Phase I (FDA IND, 2025)</td><td>MASH (GLP-1/FGF21 dual)</td></tr>
        <tr><td>LY3463251</td><td>Eli Lilly</td><td>Phase I</td><td>Obesity/metabolic disease</td></tr>
      </tbody>
    </table>
    <p>
      Efruxifermin is the most advanced candidate. Phase II data showed a 72% improvement in liver fibrosis in NASH patients (Harrison et al., <em>NEJM</em>, 2023). Phase III results are expected in 2026-2027.
    </p>
    <p>
      ZT003 is particularly interesting because it combines GLP-1 receptor agonism with FGF21 activity, potentially addressing obesity, liver disease, and metabolic longevity in a single molecule.
    </p>

    <h2>Natural Ways to Increase FGF21</h2>
    <p>
      While pharmaceutical FGF21 analogues are not yet available, several interventions naturally elevate FGF21 levels:
    </p>
    <ul>
      <li><strong>Extended fasting (24-48 hours):</strong> The most potent natural FGF21 stimulus. Plasma FGF21 levels increase 5-10 fold during prolonged fasting (Galman et al., <em>Cell Metabolism</em>, 2008).</li>
      <li><strong>Protein restriction:</strong> Diets low in protein (especially low in methionine) increase FGF21 independently of total caloric intake (Laeger et al., 2014).</li>
      <li><strong>Cold exposure:</strong> Cold activates brown adipose tissue, which secretes FGF21 as part of the thermogenic response.</li>
      <li><strong>High-intensity exercise:</strong> Acute bouts of intense exercise transiently increase FGF21 levels (Kim et al., 2013).</li>
      <li><strong>Ketogenic diet:</strong> Sustained nutritional ketosis elevates FGF21 through hepatic PPARalpha activation.</li>
    </ul>

    <h2>FGF21 in Context</h2>
    <p>
      FGF21 sits alongside other emerging longevity targets including NAD+ restoration (<Link to="/education/nad-longevity-stack">NMN/NR supplementation</Link>), AMPK activation (<Link to="/education/mots-c-mitochondrial-peptide">MOTS-c</Link>), and mTOR inhibition (rapamycin). The convergence of these pathways suggests that the next generation of longevity interventions will combine multiple mechanisms rather than relying on single targets.
    </p>

    <h2>Key References</h2>
    <ul>
      <li>Zhang, Y. et al. (2012). "The starvation hormone, fibroblast growth factor-21, extends lifespan in mice." <em>eLife</em>, 1, e00065.</li>
      <li>Lin, Z. et al. (2013). "Adiponectin mediates the metabolic effects of FGF21 on glucose homeostasis and insulin sensitivity." <em>Cell Metabolism</em>, 17(5), 779-789.</li>
      <li>Harrison, S.A. et al. (2023). "Efruxifermin in non-alcoholic steatohepatitis." <em>NEJM</em>, 389(23), 2150-2161.</li>
      <li>Galman, C. et al. (2008). "The circulating metabolic regulator FGF21 is induced by prolonged fasting." <em>Cell Metabolism</em>, 8(2), 169-174.</li>
    </ul>
  </ArticleLayout>
);

export default Fgf21Longevity;
