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
        description="Terms and conditions for using Peptyl. Platform usage terms, data handling, and legal obligations under UK law."
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
            Please read these terms carefully before using Peptyl
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl px-5 py-3 mb-10 border border-border">
              <strong className="text-foreground">Last Updated:</strong> March 27, 2026
            </div>

            <div className="space-y-10 text-muted-foreground leading-relaxed">
              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">1. Agreement to Terms</h2>
                <p>By accessing and using Peptyl (peptyl.co.uk, "the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing the Platform.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">2. Company Information</h2>
                <p><strong className="text-foreground">Trading Name:</strong> Peptyl (peptyl.co.uk)</p>
                <p><strong className="text-foreground">Registered in:</strong> United Kingdom</p>
                <p><strong className="text-foreground">Contact:</strong> Available via our contact page</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">3. Nature of Service - Not Medical Professionals</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.1 Educational Platform Only</h3>
                <p>Peptyl is a health intelligence and educational platform. We are not a medical practice, clinic, or healthcare provider. No individual employed by or associated with Peptyl holds a position as a registered medical doctor, nurse, pharmacist, genetic counsellor, dietitian, or other regulated healthcare professional in connection with this platform.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.2 No Medical Advice</h3>
                <p>Nothing on this platform, including but not limited to: peptide information, DNA health reports, supplement recommendations, protocol suggestions, biomarker interpretations, AI-generated content, articles, calculators, or user dashboard features, constitutes medical advice. These services are provided for educational and research information purposes only.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.3 No Doctor-Patient Relationship</h3>
                <p>Use of Peptyl does not create a doctor-patient relationship, therapist-patient relationship, or any other professional-client healthcare relationship between you and Peptyl or any of its operators, employees, or contractors.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.4 Consult a Professional</h3>
                <p>Before making any changes to your health, medications, supplements, or lifestyle based on information obtained from Peptyl, you must consult a qualified and registered healthcare professional. This is not optional guidance - it is a condition of using the educational features of this platform.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">4. Platform Services</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.1 Core Services</h3>
                <p>Peptyl provides the following digital services:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>AI-powered health intelligence and personalised insights</li>
                  <li>Peptide and supplement research database with evidence grading</li>
                  <li>Protocol tracking and adherence monitoring</li>
                  <li>Bloodwork biomarker tracking and trend analysis</li>
                  <li>Wearable device integration (Whoop, Fitbit)</li>
                  <li>DNA analysis for personalised health reports</li>
                  <li>Reconstitution and dose calculators</li>
                  <li>Educational articles and research content</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.2 Research Compounds</h3>
                <p>All peptides and related compounds referenced on Peptyl are discussed in the context of published research literature. Information about these compounds, including GLP-1 agonists (semaglutide, tirzepatide), BPC-157, and others, is provided for educational purposes only. Peptyl does not encourage or endorse human consumption of unregulated research chemicals.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.3 Supplier Comparisons</h3>
                <p>Our supplier comparison and price tracking features are provided for informational purposes. Peptyl is not affiliated with any supplier and does not endorse specific vendors. Users are solely responsible for their purchasing decisions and for verifying supplier legitimacy and product legality in their jurisdiction.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.4 Future Commerce</h3>
                <p>Peptyl may introduce curated product offerings or marketplace features in the future. Any such services will be subject to additional terms and conditions published at the time of launch. The current Terms of Service govern use of the digital platform only.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">5. User Accounts and Subscriptions</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.1 Account Registration</h3>
                <p>To access personalised features, you must create an account. You agree to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your login credentials</li>
                  <li>Accept responsibility for all activity under your account</li>
                  <li>Notify us immediately of any unauthorised access</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.2 Age Requirement</h3>
                <p>You must be at least 18 years of age to create an account. By registering, you confirm that you meet this requirement.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.3 Subscription Tiers</h3>
                <p>Peptyl offers free and paid subscription tiers. Paid features, pricing, and billing cycles will be clearly displayed before purchase. You may cancel a paid subscription at any time; access continues until the end of the current billing period.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.4 Payment</h3>
                <p>Payments for subscription services are processed securely through our payment provider. All prices are listed in British Pounds (GBP) and include VAT where applicable.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">6. Intellectual Property</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.1 Platform Content</h3>
                <p>All content on this platform, including but not limited to text, graphics, logos, images, software, AI models, database structures, and proprietary algorithms, is the property of Peptyl Ltd or its content suppliers and is protected by UK and international copyright laws. Unauthorised use of any content may violate copyright, trademark, and other laws.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.2 Patent-Pending Research</h3>
                <p>Peptyl holds patent-pending intellectual property related to its BPC-157 formulation with increased half-life. Any reproduction, reverse engineering, or commercial use of this proprietary research is strictly prohibited and will be pursued under applicable patent and IP law.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.3 User Content</h3>
                <p>By submitting content (protocol data, experience reports, feedback), you grant Peptyl a non-exclusive, royalty-free licence to use anonymised and aggregated forms of this data to improve the platform and contribute to research insights. Your personal data remains protected under our Privacy Policy.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">7. Genetic Data Processing</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.1 Special Category Data</h3>
                <p>Genetic data is classified as special category data under UK GDPR Article 9 and the Data Protection Act 2018. We process this data only with your explicit consent, for the sole purpose of generating a personalised educational health report.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.2 ICO Registration</h3>
                <p>Peptyl is in the process of registering with the UK Information Commissioner's Office (ICO) as a data controller for special category data processing. Registration will be completed prior to any paid services being offered on this platform.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.3 AI Processing</h3>
                <p>Your genetic data is processed by our AI system. Our AI processing partner operates under appropriate data processing agreements. Raw genetic data is not stored by Peptyl - only the derived report is retained on our servers.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.4 Your Rights</h3>
                <p>You may delete your DNA report at any time from your account dashboard. Deletion removes the stored report from our servers. Consent records are retained for legal compliance purposes only.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">7.5 No Clinical Validity</h3>
                <p>DNA reports generated by Peptyl have not been validated in clinical settings and should not be used for clinical decision-making. They do not constitute a genetic test result as defined by the Human Genetics Commission or equivalent regulatory bodies.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">8. Limitation of Liability</h2>
                <div className="bg-destructive/10 border-l-4 border-destructive rounded-r-xl p-5 my-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h3 className="text-foreground font-semibold">Important Legal Notice</h3>
                  </div>
                  <p className="text-sm"><strong className="text-foreground">To the fullest extent permitted by law:</strong></p>
                  <ul className="list-disc pl-6 mt-2 space-y-2 text-sm">
                    <li>Peptyl shall not be liable for any damages arising from the use or misuse of information provided on this platform</li>
                    <li>We provide no warranties regarding the fitness of any information for any particular health or medical purpose</li>
                    <li>Our total liability shall not exceed the subscription fees paid by you in the preceding 12 months</li>
                    <li>We are not responsible for any health consequences resulting from actions taken based on platform content</li>
                    <li>AI-generated insights and reports are provided "as is" for educational purposes only</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">9. Indemnification</h2>
                <p>You agree to indemnify and hold harmless Peptyl, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Your use or misuse of the platform</li>
                  <li>Your violation of these Terms of Service</li>
                  <li>Your violation of any applicable laws or regulations</li>
                  <li>Any false representations made by you</li>
                  <li>Decisions you make based on information obtained from Peptyl</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">10. Privacy and Data Protection</h2>
                <p>We are committed to protecting your privacy in accordance with UK GDPR and the Data Protection Act 2018. Please review our Privacy Policy for detailed information on how we collect, use, and protect your personal data, including health data, wearable data, bloodwork records, and genetic information.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">11. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Use the platform for any unlawful purpose</li>
                  <li>Scrape, reproduce, or redistribute platform content without written permission</li>
                  <li>Attempt to reverse-engineer any proprietary algorithms, AI models, or database structures</li>
                  <li>Share your account credentials with third parties</li>
                  <li>Submit false or misleading information</li>
                  <li>Use the platform to provide medical advice to others</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">12. Termination</h2>
                <p>We reserve the right to terminate or suspend your access to the platform at any time, without notice, for any reason including but not limited to breach of these Terms of Service. You may delete your account at any time from your dashboard settings.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">13. Changes to Terms</h2>
                <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the platform. Your continued use of the platform after changes constitutes acceptance of the modified terms. We will notify users of material changes via email or in-app notification.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">14. Governing Law and Jurisdiction</h2>
                <p>These Terms of Service shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">15. Severability</h2>
                <p>If any provision of these Terms of Service is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">16. Entire Agreement</h2>
                <p>These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and Peptyl regarding your use of the platform.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">17. Contact Information</h2>
                <p>For questions about these Terms of Service, please contact us through our contact page or email us at the address provided on our website.</p>
              </div>

              <div className="bg-muted/50 rounded-xl p-5 border border-border text-center text-sm">
                <strong className="text-foreground">By creating an account or using the platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
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
