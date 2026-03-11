import ArticleLayout from "@/components/ArticleLayout";

const faqs = [
  { q: "What is SS-31 (Elamipretide)?", a: "SS-31, also known as Elamipretide or Bendavia, is a mitochondria-targeted tetrapeptide that binds to cardiolipin on the inner mitochondrial membrane to stabilise electron transport and reduce oxidative damage." },
  { q: "Is SS-31 FDA approved?", a: "No. SS-31 has been granted Fast Track and Orphan Drug designation by the FDA for Barth syndrome, but it has not received full approval for any condition as of March 2026." },
  { q: "How does SS-31 differ from other mitochondrial peptides?", a: "Unlike MOTS-c which acts as a metabolic signalling peptide, SS-31 physically targets the inner mitochondrial membrane and stabilises the lipid cardiolipin, directly improving electron transport chain efficiency and reducing reactive oxygen species." },
  { q: "Can SS-31 reverse ageing?", a: "SS-31 has reversed age-related mitochondrial dysfunction in animal models, restoring cardiac function, muscle performance, and kidney function. However, it has not been tested as an anti-ageing intervention in humans." },
  { q: "What is Barth syndrome?", a: "Barth syndrome is a rare X-linked genetic disorder caused by mutations in the tafazzin gene, leading to abnormal cardiolipin remodelling. It causes cardiomyopathy, muscle weakness, and immune dysfunction. SS-31 is being studied as a treatment for this condition." },
];

const Ss31Elamipretide = () => (
  <ArticleLayout
    category="Deep Dive"
    title="SS-31 (Elamipretide): The Mitochondrial Peptide Targeting the Root of Cellular Ageing"
    readTime="10 min read"
    date="March 2026"
    slug="ss31-elamipretide-mitochondrial-ageing"
    description="SS-31 (Elamipretide) is a mitochondria-targeted peptide that stabilises cardiolipin and restores electron transport chain efficiency. We explore its role in ageing, heart failure, and rare disease."
    faqs={faqs}
  >
    <div className="bg-accent/50 border border-primary/20 rounded-xl p-4 mb-8">
      <p className="text-sm font-semibold text-foreground mb-1">Quick Answer</p>
      <p className="text-sm text-muted-foreground">
        SS-31 is a four-amino acid peptide that penetrates cells and binds to cardiolipin on the inner mitochondrial membrane. By stabilising electron transport, it reduces oxidative stress and has reversed age-related organ dysfunction in animal studies. It holds FDA Fast Track status for Barth syndrome.
      </p>
    </div>

    <p>
      If mitochondrial dysfunction is the engine failure behind ageing, SS-31 might be the mechanic. Developed in the early 2000s by Hazel Szeto and Peter Bhatt at Weill Cornell Medical College, SS-31 (also called Elamipretide, MTP-131, or Bendavia) is a cell-permeable tetrapeptide designed to accumulate at the inner mitochondrial membrane. It does not simply support mitochondrial function in a general sense. It targets a specific structural component, cardiolipin, that is essential for energy production and that deteriorates with age.
    </p>

    <h2>Why Cardiolipin Matters</h2>
    <p>
      Cardiolipin is a phospholipid found almost exclusively in the inner mitochondrial membrane. It is essential for the structural integrity and function of the electron transport chain (ETC) complexes, particularly Complex III and Complex IV. Cardiolipin also anchors cytochrome c, the electron carrier that shuttles electrons between complexes.
    </p>
    <p>
      When cardiolipin is oxidised or structurally altered (which happens progressively with ageing, and acutely in conditions like ischaemia-reperfusion injury), the ETC becomes less efficient. Electron leak increases, superoxide production rises, and a destructive cycle begins: oxidative damage to cardiolipin causes more electron leak, which causes more oxidative damage. This is one of the most well-characterised mechanisms of mitochondrial ageing.
    </p>

    <h2>How SS-31 Works</h2>
    <p>
      SS-31 is a synthetic Szeto-Schiller peptide with the sequence D-Arg-Dmt-Lys-Phe-NH2 (where Dmt is 2',6'-dimethyltyrosine). Its mechanism is direct and structural:
    </p>
    <ul>
      <li><strong>Cardiolipin Binding:</strong> SS-31 binds selectively to cardiolipin via electrostatic and hydrophobic interactions. This stabilises the lipid's structure and prevents oxidative peroxidation.</li>
      <li><strong>ETC Optimisation:</strong> By maintaining cardiolipin integrity, SS-31 restores efficient electron flow through Complexes I, III, and IV, reducing superoxide generation at source rather than scavenging free radicals after the fact.</li>
      <li><strong>Cytochrome c Stabilisation:</strong> SS-31 prevents cytochrome c from converting into a peroxidase (a transformation triggered by oxidised cardiolipin), which would otherwise amplify mitochondrial damage and trigger apoptosis.</li>
      <li><strong>Mitochondrial Membrane Potential:</strong> Restores normal membrane potential in aged and damaged mitochondria, improving ATP synthesis efficiency.</li>
    </ul>
    <p>
      Critically, SS-31 is not an antioxidant in the traditional sense. It does not scavenge reactive oxygen species after they form. Instead, it prevents their excessive generation by maintaining mitochondrial architecture. This upstream approach distinguishes it from compounds like MitoQ or CoQ10.
    </p>

    <h2>Preclinical Evidence in Ageing</h2>
    <p>
      The ageing data on SS-31 is some of the most compelling in mitochondrial medicine. In multiple animal models:
    </p>
    <ul>
      <li><strong>Heart:</strong> SS-31 reversed age-related diastolic dysfunction in old mice within hours of administration. Cardiac mitochondria from treated animals showed restored ETC complex activity and reduced ROS production (Dai et al., 2014, Journal of the American Heart Association).</li>
      <li><strong>Skeletal Muscle:</strong> Eight weeks of SS-31 treatment in aged mice reversed the decline in exercise tolerance, restored mitochondrial energetics, and improved redox balance in skeletal muscle (Siegel et al., 2013).</li>
      <li><strong>Kidney:</strong> SS-31 attenuated age-related glomerulosclerosis and preserved renal function in aged rats, with effects linked to improved mitochondrial morphology in proximal tubular cells.</li>
      <li><strong>Brain:</strong> In models of neurodegenerative disease, SS-31 reduced amyloid-beta-induced mitochondrial dysfunction and protected synaptic integrity, though human neurological trials have not yet been conducted.</li>
    </ul>
    <p>
      A particularly striking finding was that many of these age-related changes were reversed within days to weeks, not just slowed. This suggests that mitochondrial architecture can be restored even in aged tissue, challenging the assumption that mitochondrial decline is irreversible.
    </p>

    <h2>Clinical Trials and Barth Syndrome</h2>
    <p>
      SS-31 has been most advanced clinically in Barth syndrome, a rare X-linked genetic disorder caused by mutations in the tafazzin (TAZ) gene. Tafazzin is the enzyme responsible for cardiolipin remodelling, so Barth syndrome patients have fundamentally abnormal cardiolipin, leading to cardiomyopathy, skeletal myopathy, neutropenia, and growth failure.
    </p>
    <p>
      The TAZPOWER Phase II trial showed that SS-31 improved six-minute walk distance and reduced cardiac strain biomarkers in Barth syndrome patients. The FDA granted Fast Track designation and Orphan Drug designation for this indication. A Phase III trial (TAZPOWER3) is ongoing as of 2026.
    </p>
    <p>
      Beyond Barth syndrome, clinical trials have explored SS-31 in:
    </p>
    <ul>
      <li><strong>Heart failure with preserved ejection fraction (HFpEF):</strong> The PROGRESS-HF trial showed improvements in left ventricular volumes but did not meet its primary endpoint in the broader population.</li>
      <li><strong>Primary mitochondrial myopathy:</strong> Phase II data showed trends in improved six-minute walk performance.</li>
      <li><strong>Acute kidney injury:</strong> Early-stage trials in ischaemia-reperfusion contexts during cardiac surgery.</li>
    </ul>

    <h2>SS-31 and the Longevity Field</h2>
    <p>
      SS-31 sits at the intersection of longevity science and mitochondrial medicine. Its relevance to ageing research is grounded in the mitochondrial theory of ageing, which holds that progressive mitochondrial dysfunction drives many hallmarks of ageing: genomic instability, cellular senescence, stem cell exhaustion, and chronic inflammation.
    </p>
    <p>
      Compared to other mitochondrial interventions:
    </p>
    <ul>
      <li><strong>NAD+ precursors (NMN/NR)</strong> support mitochondrial function by replenishing a critical cofactor. SS-31 works structurally on the membrane itself. The two approaches are complementary.</li>
      <li><strong>MOTS-c</strong> is an endogenous mitochondrial signalling peptide that activates AMPK. SS-31 is a synthetic peptide that targets mitochondrial ultrastructure. Together, they represent signalling and structural approaches to mitochondrial health.</li>
      <li><strong>Urolithin A</strong> promotes mitophagy (clearance of damaged mitochondria). SS-31 rescues existing mitochondria. One removes the broken, the other repairs the salvageable.</li>
      <li><strong>CoQ10 and MitoQ</strong> act as electron carriers and antioxidants. SS-31 prevents the need for downstream antioxidant defence by maintaining efficient electron transport upstream.</li>
    </ul>

    <h2>Administration and Research Use</h2>
    <p>
      In clinical trials, SS-31 is administered via subcutaneous injection or intravenous infusion. The peptide has high cell permeability due to its alternating aromatic-cationic motif, which allows it to cross lipid bilayers and concentrate in mitochondria at 1,000-5,000x cytoplasmic concentration within minutes.
    </p>
    <p>
      Research-grade SS-31 is available through peptide suppliers, but it is not approved for therapeutic use. No oral formulation exists due to rapid enzymatic degradation in the GI tract, though research into stabilised analogs is ongoing.
    </p>

    <h2>Safety Profile</h2>
    <p>
      Clinical trial data in over 200 patients has shown SS-31 to be generally well-tolerated. The most common adverse events in trials were injection site reactions and mild headache. No serious adverse events attributable to SS-31 have been reported in published data. However, long-term safety data beyond 12 months of continuous use is limited.
    </p>

    <h2>The Bottom Line</h2>
    <p>
      SS-31 is one of the most mechanistically precise peptides in the longevity space. Rather than broadly supporting mitochondrial health, it targets a specific structural vulnerability, cardiolipin degradation, that sits at the root of age-related mitochondrial dysfunction. The preclinical data showing reversal (not just prevention) of age-related organ decline is remarkable, and clinical development in Barth syndrome provides a pathway to human validation. For researchers tracking the intersection of peptide science and ageing biology, SS-31 is one to watch closely.
    </p>
  </ArticleLayout>
);

export default Ss31Elamipretide;
