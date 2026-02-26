import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms of Service"
        description="Terms and conditions for using Peptyl. Research platform usage terms, data handling, and legal obligations under UK law."
        path="/terms-of-service"
      />
      <Header />

      <section className="dark-section pt-28 pb-16 bg-hero relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-teal/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-heading font-bold text-primary-foreground"
          >
            Terms of <span className="text-primary">Service</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-primary-foreground/60"
          >
            Please read these terms carefully before purchasing
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl px-5 py-3 mb-10 border border-border">
              <strong className="text-foreground">Last Updated:</strong> February 26, 2026
            </div>

            <div className="space-y-10 text-muted-foreground leading-relaxed">
              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">1. Agreement to Terms</h2>
                <p>By accessing and using Peptyl (peptyl.co.uk, "the Website"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">2. Company Information</h2>
                <p><strong className="text-foreground">Trading Name:</strong> Peptyl (peptyl.co.uk)</p>
                <p><strong className="text-foreground">Registered in:</strong> United Kingdom</p>
                <p><strong className="text-foreground">Contact:</strong> Available via our contact page</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">3. Nature of Service — Not Medical Professionals</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.1 Educational Platform Only</h3>
                <p>Peptyl is an educational and research information platform. We are not a medical practice, clinic, or healthcare provider. No individual employed by or associated with Peptyl holds a position as a registered medical doctor, nurse, pharmacist, genetic counsellor, dietitian, or other regulated healthcare professional in connection with this platform.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.2 No Medical Advice</h3>
                <p>Nothing on this website, including but not limited to: peptide information, DNA health reports, supplement recommendations, protocol suggestions, biomarker interpretations, AI-generated content, articles, calculators, or user dashboard features, constitutes medical advice. These services are provided for educational and research information purposes only.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.3 No Doctor-Patient Relationship</h3>
                <p>Use of Peptyl does not create a doctor-patient relationship, therapist-patient relationship, or any other professional-client healthcare relationship between you and Peptyl or any of its operators, employees, or contractors.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.4 Consult a Professional</h3>
                <p>Before making any changes to your health, medications, supplements, or lifestyle based on information obtained from Peptyl, you must consult a qualified and registered healthcare professional. This is not optional guidance — it is a condition of using the educational features of this platform.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">4. Products and Research Use Only</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.1 Research Chemicals</h3>
                <p>All peptides and related products referenced on Peptyl are <strong className="text-foreground">research chemicals intended for in-vitro research and laboratory use only</strong>. These products are:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>NOT intended for human consumption or use</li>
                  <li>NOT intended for veterinary use</li>
                  <li>NOT intended for dietary supplementation</li>
                  <li>NOT approved as drugs, food additives, or supplements by any regulatory authority</li>
                  <li>NOT intended to diagnose, treat, cure, or prevent any disease</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.2 Purchaser Representations</h3>
                <p>By placing an order, you represent and warrant that:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>You are at least 18 years of age</li>
                  <li>You are purchasing products for legitimate research purposes only</li>
                  <li>You have appropriate laboratory facilities and training to handle research chemicals safely</li>
                  <li>You understand the products are not for human or animal consumption</li>
                  <li>You will comply with all applicable laws and regulations in your jurisdiction</li>
                  <li>You will not resell products as dietary supplements or for human consumption</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.3 Product Information</h3>
                <p>Product descriptions, specifications, and purity information are provided for research reference only. While we strive for accuracy, we do not guarantee that product descriptions or other content is error-free, complete, or current. Certificates of Analysis (COAs) are available upon request for all products.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">5. Ordering and Payment</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.1 Order Acceptance</h3>
                <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason, including but not limited to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Product unavailability</li>
                  <li>Pricing or product description errors</li>
                  <li>Suspected fraudulent activity</li>
                  <li>Concerns about intended use of products</li>
                  <li>Inability to verify billing or shipping information</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.2 Pricing</h3>
                <p>All prices are listed in British Pounds (GBP) and include VAT where applicable. Prices are subject to change without notice. The price charged will be the price displayed at the time of order confirmation.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.3 Payment</h3>
                <p>Payment is processed securely through our payment provider. We accept major credit cards and other payment methods as displayed at checkout. Full payment must be received before orders are dispatched.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">6. Shipping and Delivery</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.1 UK Shipping</h3>
                <p>Orders placed before 2:00 PM (UK time) on business days will be dispatched the same day. Orders placed after this time will be dispatched the next business day. Delivery times are estimates and not guaranteed.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.2 International Shipping</h3>
                <p>International shipping may be available for certain destinations. Customers are responsible for:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Ensuring products can be legally imported to their country</li>
                  <li>All customs duties, taxes, and import fees</li>
                  <li>Understanding their local regulations regarding research chemicals</li>
                </ul>
                <p className="mt-2">We are not responsible for packages seized by customs or delayed due to customs processing.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.3 Shipping Restrictions</h3>
                <p>We reserve the right to refuse shipping to any location where we believe delivery may violate local laws or regulations.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">7. Returns and Refunds</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.1 Return Policy</h3>
                <p>Due to the nature of research chemicals and health and safety regulations, we cannot accept returns of opened products or products that have been shipped. Please see our full Refund Policy for detailed information.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.2 Damaged or Incorrect Orders</h3>
                <p>If you receive damaged or incorrect products, you must contact us within 48 hours of delivery with photographic evidence. We will replace damaged items or correct errors at our discretion.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.3 Refunds</h3>
                <p>Refunds may be issued for:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Orders cancelled before dispatch</li>
                  <li>Products that fail to meet stated purity specifications (verified by COA)</li>
                  <li>Non-delivery of orders (after investigation)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">8. Intellectual Property</h2>
                <p>All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Peptyl or its content suppliers and is protected by UK and international copyright laws. Unauthorized use of any content may violate copyright, trademark, and other laws.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">9. Limitation of Liability</h2>
                <div className="bg-destructive/10 border-l-4 border-destructive rounded-r-xl p-5 my-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h3 className="text-foreground font-semibold">Important Legal Notice</h3>
                  </div>
                  <p className="text-sm"><strong className="text-foreground">To the fullest extent permitted by law:</strong></p>
                  <ul className="list-disc pl-6 mt-2 space-y-2 text-sm">
                    <li>Peptyl shall not be liable for any damages arising from the use or misuse of products</li>
                    <li>We provide no warranties regarding product fitness for any particular purpose</li>
                    <li>Our total liability shall not exceed the purchase price of the product in question</li>
                    <li>We are not responsible for any health consequences resulting from misuse of research chemicals</li>
                    <li>Products are sold "as is" for research purposes only</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">10. Indemnification</h2>
                <p>You agree to indemnify and hold harmless Peptyl, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Your use or misuse of products purchased from us</li>
                  <li>Your violation of these Terms of Service</li>
                  <li>Your violation of any applicable laws or regulations</li>
                  <li>Any false representations made by you</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">11. Privacy and Data Protection</h2>
                <p>We are committed to protecting your privacy in accordance with UK GDPR and the Data Protection Act 2018. Please review our Privacy Policy for detailed information on how we collect, use, and protect your personal data.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">12. Genetic Data Processing</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">12.1 Special Category Data</h3>
                <p>Genetic data is classified as special category data under UK GDPR Article 9 and the Data Protection Act 2018. We process this data only with your explicit consent, for the sole purpose of generating a personalised educational health report.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">12.2 ICO Registration</h3>
                <p>Peptyl is in the process of registering with the UK Information Commissioner's Office (ICO) as a data controller for special category data processing. Registration will be completed prior to any paid services being offered on this platform.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">12.3 AI Processing</h3>
                <p>Your genetic data is processed by our AI system. Our AI processing partner operates under appropriate data processing agreements. Raw genetic data is not stored by Peptyl — only the derived report is retained on our servers.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">12.4 Your Rights</h3>
                <p>You may delete your DNA report at any time from your account dashboard. Deletion removes the stored report from our servers. Consent records are retained for legal compliance purposes only.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">12.5 No Clinical Validity</h3>
                <p>DNA reports generated by Peptyl have not been validated in clinical settings and should not be used for clinical decision-making. They do not constitute a genetic test result as defined by the Human Genetics Commission or equivalent regulatory bodies.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">13. Age Restriction</h2>
                <p>You must be at least 18 years of age to purchase from this website. By placing an order, you confirm that you meet this age requirement.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">14. Compliance with Laws</h2>
                <p>You are solely responsible for ensuring that your purchase and use of our products complies with all applicable laws in your jurisdiction, including but not limited to import/export regulations, controlled substances legislation, and workplace safety requirements.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">15. Termination</h2>
                <p>We reserve the right to terminate or suspend your access to our website and refuse service at any time, without notice, for any reason including but not limited to breach of these Terms of Service.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">16. Changes to Terms</h2>
                <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes constitutes acceptance of the modified terms.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">17. Governing Law and Jurisdiction</h2>
                <p>These Terms of Service shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these terms or your use of our website shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">18. Severability</h2>
                <p>If any provision of these Terms of Service is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">19. Entire Agreement</h2>
                <p>These Terms of Service, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and Peptyl regarding your use of the website.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">20. Contact Information</h2>
                <p>For questions about these Terms of Service, please contact us through our contact page or email us at the address provided on our website.</p>
              </div>

              <div className="bg-muted/50 rounded-xl p-5 border border-border text-center text-sm">
                <strong className="text-foreground">By completing a purchase, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService;
