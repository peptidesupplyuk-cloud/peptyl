export type SupplierEntry = {
  id: string;
  name: string;
  url: string;
  logo: string;
};

export type PriceEntry = {
  supplier: string;
  price: number;
  url: string;
  inStock: boolean;
};

export type Product = {
  name: string;
  prices: PriceEntry[];
};

// ── Medication Suppliers ──
export const medicationSuppliers: SupplierEntry[] = [
  { id: "simple", name: "Simple Online Pharmacy", url: "https://www.simpleonlinepharmacy.co.uk", logo: "💊" },
  { id: "morrisons", name: "Morrisons Clinic", url: "https://clinic.morrisons.com", logo: "🏪" },
  { id: "click", name: "Click Pharmacy", url: "https://www.clickpharmacy.co.uk", logo: "💊" },
  { id: "medexpress", name: "MedExpress", url: "https://www.medexpress.co.uk", logo: "💊" },
  { id: "bolt", name: "Bolt Pharmacy", url: "https://www.boltpharmacy.co.uk", logo: "⚡" },
  { id: "boots", name: "Boots Online Doctor", url: "https://onlinedoctor.boots.com", logo: "🏥" },
  { id: "pharmacyplanet", name: "Pharmacy Planet", url: "https://www.pharmacyplanet.com", logo: "🌍" },
  { id: "asda", name: "Asda Online Doctor", url: "https://onlinedoctor.asda.com", logo: "🏪" },
  { id: "lloyds", name: "LloydsDirect", url: "https://onlinedoctor.lloydspharmacy.com", logo: "💊" },
  { id: "pilltime", name: "PillTime", url: "https://www.pilltime.co.uk", logo: "⏰" },
  { id: "oxford", name: "Oxford Online Pharmacy", url: "https://www.oxfordonlinepharmacy.co.uk", logo: "🎓" },
  { id: "medicspot", name: "MedicSpot", url: "https://www.medicspot.co.uk", logo: "📍" },
  { id: "lotus", name: "Lotus Weight Loss", url: "https://lotusweightloss.co.uk", logo: "🌸" },
  { id: "manual", name: "Manual", url: "https://www.manual.co", logo: "💪" },
  { id: "numan", name: "Numan", url: "https://www.numan.com", logo: "🧬" },
  { id: "superdrug", name: "Superdrug Online Doctor", url: "https://onlinedoctor.superdrug.com", logo: "🏥" },
  { id: "zava", name: "Zava", url: "https://www.zavamed.com/uk", logo: "💊" },
  { id: "treated", name: "Treated.com", url: "https://www.treated.com", logo: "💊" },
  { id: "juniper", name: "Juniper", url: "https://www.juniper.clinic", logo: "🌿" },
  { id: "ukmeds", name: "UK Meds", url: "https://www.ukmedication.co.uk", logo: "💊" },
  { id: "pharmacy2u", name: "Pharmacy2U", url: "https://www.pharmacy2u.co.uk", logo: "💊" },
  { id: "hey-pharmacist", name: "Hey Pharmacist", url: "https://www.heypharmacist.co.uk", logo: "👋" },
  { id: "healthexpress", name: "HealthExpress", url: "https://www.healthexpress.co.uk", logo: "🏥" },
  { id: "pharmica", name: "Pharmica", url: "https://www.pharmica.co.uk", logo: "💊" },
];

// ── Bloodwork Suppliers ──
export const bloodworkSuppliers: SupplierEntry[] = [
  { id: "medichecks", name: "Medichecks", url: "https://www.medichecks.com", logo: "🩸" },
  { id: "forthwithlife", name: "Forth", url: "https://www.forthwithlife.co.uk", logo: "📊" },
  { id: "thriva", name: "Thriva", url: "https://thriva.co", logo: "💉" },
  { id: "bluecrest", name: "Blue Crest Wellness", url: "https://www.bluecrestwellness.com", logo: "🔵" },
  { id: "randox", name: "Randox Health", url: "https://www.randox.com", logo: "🧪" },
  { id: "numan-bw", name: "Numan", url: "https://www.numan.com", logo: "🧬" },
  { id: "manual-bw", name: "Manual", url: "https://www.manual.co", logo: "💪" },
  { id: "letsgetchecked", name: "LetsGetChecked", url: "https://www.letsgetchecked.com", logo: "✅" },
  { id: "london-medical-lab", name: "London Medical Laboratory", url: "https://www.londonmedicallaboratory.com", logo: "🏛️" },
  { id: "monitor-my-health", name: "Monitor My Health", url: "https://www.monitormyhealth.org.uk", logo: "📈" },
  { id: "bluehorizon", name: "Blue Horizon", url: "https://bluehorizonbloodtests.co.uk", logo: "🔵" },
  { id: "home2lab", name: "Home2Lab", url: "https://home2lab.co.uk", logo: "🏠" },
  { id: "vitall", name: "Vitall", url: "https://www.vitall.co.uk", logo: "💚" },
  { id: "melio", name: "Melio", url: "https://www.melio.co.uk", logo: "🔬" },
];

// No hardcoded prices — all pricing comes exclusively from the database.
// Use the supplier_prices table to manage all pricing data.
