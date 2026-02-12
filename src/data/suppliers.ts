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
];

export const medicationProducts: Product[] = [
  {
    name: "Semaglutide (Wegovy) – 0.25mg/week starter",
    prices: [
      { supplier: "Simple Online Pharmacy", price: 149.99, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Boots Online Doctor", price: 169.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "LloydsDirect", price: 159.99, url: "https://onlinedoctor.lloydspharmacy.com", inStock: true },
      { supplier: "Asda Online Doctor", price: 155.00, url: "https://onlinedoctor.asda.com", inStock: false },
      { supplier: "MedExpress", price: 162.00, url: "https://www.medexpress.co.uk", inStock: true },
      { supplier: "Superdrug Online Doctor", price: 154.99, url: "https://onlinedoctor.superdrug.com", inStock: true },
      { supplier: "Oxford Online Pharmacy", price: 157.00, url: "https://www.oxfordonlinepharmacy.co.uk", inStock: true },
      { supplier: "Manual", price: 159.00, url: "https://www.manual.co", inStock: true },
    ],
  },
  {
    name: "Semaglutide (Wegovy) – 0.5mg/week",
    prices: [
      { supplier: "Simple Online Pharmacy", price: 199.99, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Boots Online Doctor", price: 219.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "Morrisons Clinic", price: 209.00, url: "https://clinic.morrisons.com", inStock: true },
      { supplier: "Click Pharmacy", price: 204.99, url: "https://www.clickpharmacy.co.uk", inStock: true },
      { supplier: "Pharmacy Planet", price: 195.00, url: "https://www.pharmacyplanet.com", inStock: false },
      { supplier: "Superdrug Online Doctor", price: 204.00, url: "https://onlinedoctor.superdrug.com", inStock: true },
      { supplier: "Numan", price: 199.00, url: "https://www.numan.com", inStock: true },
    ],
  },
  {
    name: "Semaglutide (Wegovy) – 1mg/week",
    prices: [
      { supplier: "Simple Online Pharmacy", price: 249.99, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Boots Online Doctor", price: 269.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "LloydsDirect", price: 259.00, url: "https://onlinedoctor.lloydspharmacy.com", inStock: true },
      { supplier: "Bolt Pharmacy", price: 245.00, url: "https://www.boltpharmacy.co.uk", inStock: true },
      { supplier: "Manual", price: 255.00, url: "https://www.manual.co", inStock: true },
      { supplier: "MedicSpot", price: 252.00, url: "https://www.medicspot.co.uk", inStock: true },
    ],
  },
  {
    name: "Tirzepatide (Mounjaro) – 2.5mg/week starter",
    prices: [
      { supplier: "Boots Online Doctor", price: 159.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 149.00, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "LloydsDirect", price: 155.00, url: "https://onlinedoctor.lloydspharmacy.com", inStock: true },
      { supplier: "MedExpress", price: 152.00, url: "https://www.medexpress.co.uk", inStock: true },
      { supplier: "Click Pharmacy", price: 148.99, url: "https://www.clickpharmacy.co.uk", inStock: true },
      { supplier: "Lotus Weight Loss", price: 139.00, url: "https://lotusweightloss.co.uk", inStock: true },
      { supplier: "Superdrug Online Doctor", price: 149.99, url: "https://onlinedoctor.superdrug.com", inStock: true },
      { supplier: "Oxford Online Pharmacy", price: 145.00, url: "https://www.oxfordonlinepharmacy.co.uk", inStock: true },
      { supplier: "Numan", price: 150.00, url: "https://www.numan.com", inStock: true },
    ],
  },
  {
    name: "Tirzepatide (Mounjaro) – 5mg/week",
    prices: [
      { supplier: "Boots Online Doctor", price: 199.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 189.00, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Asda Online Doctor", price: 195.00, url: "https://onlinedoctor.asda.com", inStock: true },
      { supplier: "Pharmacy Planet", price: 185.00, url: "https://www.pharmacyplanet.com", inStock: true },
      { supplier: "Lotus Weight Loss", price: 179.00, url: "https://lotusweightloss.co.uk", inStock: true },
      { supplier: "Manual", price: 189.00, url: "https://www.manual.co", inStock: true },
      { supplier: "MedicSpot", price: 192.00, url: "https://www.medicspot.co.uk", inStock: true },
    ],
  },
  {
    name: "Tirzepatide (Mounjaro) – 10mg/week",
    prices: [
      { supplier: "Boots Online Doctor", price: 259.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 249.00, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "LloydsDirect", price: 255.00, url: "https://onlinedoctor.lloydspharmacy.com", inStock: false },
      { supplier: "Morrisons Clinic", price: 245.00, url: "https://clinic.morrisons.com", inStock: true },
      { supplier: "Lotus Weight Loss", price: 235.00, url: "https://lotusweightloss.co.uk", inStock: true },
      { supplier: "Numan", price: 249.00, url: "https://www.numan.com", inStock: true },
      { supplier: "Oxford Online Pharmacy", price: 248.00, url: "https://www.oxfordonlinepharmacy.co.uk", inStock: true },
    ],
  },
  {
    name: "Tirzepatide (Mounjaro) – 15mg/week",
    prices: [
      { supplier: "Boots Online Doctor", price: 299.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 289.00, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Lotus Weight Loss", price: 275.00, url: "https://lotusweightloss.co.uk", inStock: false },
      { supplier: "Superdrug Online Doctor", price: 295.00, url: "https://onlinedoctor.superdrug.com", inStock: true },
      { supplier: "Manual", price: 285.00, url: "https://www.manual.co", inStock: true },
    ],
  },
  {
    name: "Liraglutide (Saxenda) – starter pack",
    prices: [
      { supplier: "Boots Online Doctor", price: 179.00, url: "https://onlinedoctor.boots.com", inStock: true },
      { supplier: "LloydsDirect", price: 175.00, url: "https://onlinedoctor.lloydspharmacy.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 169.99, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "PillTime", price: 172.00, url: "https://www.pilltime.co.uk", inStock: true },
      { supplier: "Superdrug Online Doctor", price: 174.99, url: "https://onlinedoctor.superdrug.com", inStock: true },
      { supplier: "Click Pharmacy", price: 168.00, url: "https://www.clickpharmacy.co.uk", inStock: true },
    ],
  },
  {
    name: "Orlistat 120mg – 84 capsules",
    prices: [
      { supplier: "Click Pharmacy", price: 34.99, url: "https://www.clickpharmacy.co.uk", inStock: true },
      { supplier: "Pharmacy Planet", price: 29.99, url: "https://www.pharmacyplanet.com", inStock: true },
      { supplier: "Simple Online Pharmacy", price: 32.00, url: "https://www.simpleonlinepharmacy.co.uk", inStock: true },
      { supplier: "Bolt Pharmacy", price: 31.50, url: "https://www.boltpharmacy.co.uk", inStock: true },
      { supplier: "MedExpress", price: 35.00, url: "https://www.medexpress.co.uk", inStock: true },
      { supplier: "Superdrug Online Doctor", price: 28.99, url: "https://onlinedoctor.superdrug.com", inStock: true },
      { supplier: "Oxford Online Pharmacy", price: 30.50, url: "https://www.oxfordonlinepharmacy.co.uk", inStock: true },
    ],
  },
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
];

export const bloodworkProducts: Product[] = [
  {
    name: "Basic Health Check (Full Blood Count, Liver, Kidney, Thyroid)",
    prices: [
      { supplier: "Medichecks", price: 69.00, url: "https://www.medichecks.com", inStock: true },
      { supplier: "Forth", price: 59.00, url: "https://www.forthwithlife.co.uk", inStock: true },
      { supplier: "Thriva", price: 55.00, url: "https://thriva.co", inStock: true },
      { supplier: "Monitor My Health", price: 49.00, url: "https://www.monitormyhealth.org.uk", inStock: true },
      { supplier: "London Medical Laboratory", price: 75.00, url: "https://www.londonmedicallaboratory.com", inStock: true },
    ],
  },
  {
    name: "Advanced Well Man / Well Woman",
    prices: [
      { supplier: "Medichecks", price: 99.00, url: "https://www.medichecks.com", inStock: true },
      { supplier: "Forth", price: 89.00, url: "https://www.forthwithlife.co.uk", inStock: true },
      { supplier: "Thriva", price: 85.00, url: "https://thriva.co", inStock: true },
      { supplier: "Blue Crest Wellness", price: 129.00, url: "https://www.bluecrestwellness.com", inStock: true },
      { supplier: "LetsGetChecked", price: 99.00, url: "https://www.letsgetchecked.com", inStock: true },
      { supplier: "London Medical Laboratory", price: 105.00, url: "https://www.londonmedicallaboratory.com", inStock: true },
    ],
  },
  {
    name: "Testosterone Panel",
    prices: [
      { supplier: "Medichecks", price: 59.00, url: "https://www.medichecks.com", inStock: true },
      { supplier: "Forth", price: 49.00, url: "https://www.forthwithlife.co.uk", inStock: true },
      { supplier: "Numan", price: 69.00, url: "https://www.numan.com", inStock: true },
      { supplier: "Manual", price: 59.00, url: "https://www.manual.co", inStock: true },
      { supplier: "LetsGetChecked", price: 69.00, url: "https://www.letsgetchecked.com", inStock: true },
      { supplier: "Monitor My Health", price: 45.00, url: "https://www.monitormyhealth.org.uk", inStock: true },
    ],
  },
  {
    name: "Thyroid Function (TSH, FT3, FT4)",
    prices: [
      { supplier: "Medichecks", price: 39.00, url: "https://www.medichecks.com", inStock: true },
      { supplier: "Forth", price: 35.00, url: "https://www.forthwithlife.co.uk", inStock: true },
      { supplier: "Thriva", price: 39.00, url: "https://thriva.co", inStock: true },
      { supplier: "Monitor My Health", price: 29.00, url: "https://www.monitormyhealth.org.uk", inStock: true },
      { supplier: "London Medical Laboratory", price: 42.00, url: "https://www.londonmedicallaboratory.com", inStock: true },
    ],
  },
  {
    name: "HbA1c (Diabetes Check)",
    prices: [
      { supplier: "Medichecks", price: 29.00, url: "https://www.medichecks.com", inStock: true },
      { supplier: "Forth", price: 29.00, url: "https://www.forthwithlife.co.uk", inStock: true },
      { supplier: "Monitor My Health", price: 25.00, url: "https://www.monitormyhealth.org.uk", inStock: true },
      { supplier: "Randox Health", price: 35.00, url: "https://www.randox.com", inStock: true },
      { supplier: "LetsGetChecked", price: 39.00, url: "https://www.letsgetchecked.com", inStock: true },
    ],
  },
  {
    name: "Comprehensive Hormone Panel (Male)",
    prices: [
      { supplier: "Medichecks", price: 149.00, url: "https://www.medichecks.com", inStock: true },
      { supplier: "Forth", price: 129.00, url: "https://www.forthwithlife.co.uk", inStock: true },
      { supplier: "Randox Health", price: 159.00, url: "https://www.randox.com", inStock: true },
      { supplier: "Numan", price: 139.00, url: "https://www.numan.com", inStock: true },
      { supplier: "London Medical Laboratory", price: 155.00, url: "https://www.londonmedicallaboratory.com", inStock: true },
    ],
  },
  {
    name: "Liver Function Test",
    prices: [
      { supplier: "Medichecks", price: 29.00, url: "https://www.medichecks.com", inStock: true },
      { supplier: "Forth", price: 25.00, url: "https://www.forthwithlife.co.uk", inStock: true },
      { supplier: "Monitor My Health", price: 22.00, url: "https://www.monitormyhealth.org.uk", inStock: true },
      { supplier: "Thriva", price: 29.00, url: "https://thriva.co", inStock: true },
      { supplier: "London Medical Laboratory", price: 32.00, url: "https://www.londonmedicallaboratory.com", inStock: true },
    ],
  },
  {
    name: "Full Body MOT / Ultimate Health Check",
    prices: [
      { supplier: "Medichecks", price: 199.00, url: "https://www.medichecks.com", inStock: true },
      { supplier: "Blue Crest Wellness", price: 349.00, url: "https://www.bluecrestwellness.com", inStock: true },
      { supplier: "Randox Health", price: 279.00, url: "https://www.randox.com", inStock: true },
      { supplier: "London Medical Laboratory", price: 215.00, url: "https://www.londonmedicallaboratory.com", inStock: true },
      { supplier: "Forth", price: 179.00, url: "https://www.forthwithlife.co.uk", inStock: true },
    ],
  },
];
