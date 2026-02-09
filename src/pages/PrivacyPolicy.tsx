import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy"
        description="How Peptyl by PeptideSupplyUK collects, uses, and protects your personal data under UK GDPR. Your data rights explained."
        path="/privacy-policy"
      />
      <Header />

      <section className="pt-28 pb-16 bg-hero relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-teal/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-heading font-bold text-primary-foreground"
          >
            Privacy <span className="text-primary">Policy</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-primary-foreground/60"
          >
            Your privacy and data protection rights under UK GDPR
          </motion.p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-xl px-5 py-3 mb-10 border border-border">
              <strong className="text-foreground">Last Updated:</strong> February 5, 2026
            </div>

            <div className="space-y-10 text-muted-foreground leading-relaxed">
              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">1. Data Controller Information</h2>
                <p><strong className="text-foreground">Data Controller:</strong> PeptideSupplyUK.co.uk</p>
                <p><strong className="text-foreground">Contact:</strong> Available via our contact page</p>
                <p><strong className="text-foreground">Jurisdiction:</strong> United Kingdom</p>
                <p className="mt-3">We are the data controller responsible for your personal data. If you have any questions about this privacy policy or our data practices, please contact us.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">2. Information We Collect</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.1 Information You Provide</h3>
                <p>When you place an order or create an account, we collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Personal details:</strong> Name, email address, phone number</li>
                  <li><strong className="text-foreground">Delivery information:</strong> Shipping address, billing address</li>
                  <li><strong className="text-foreground">Payment information:</strong> Processed securely by our payment provider (we do not store full card details)</li>
                  <li><strong className="text-foreground">Account information:</strong> Username, password (encrypted), order history</li>
                  <li><strong className="text-foreground">Communication:</strong> Content of emails, contact form submissions, or chat messages</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.2 Information Automatically Collected</h3>
                <p>When you visit our website, we automatically collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Device information:</strong> IP address, browser type, operating system</li>
                  <li><strong className="text-foreground">Usage data:</strong> Pages visited, time spent, referring websites</li>
                  <li><strong className="text-foreground">Cookies:</strong> See our cookie policy below for details</li>
                  <li><strong className="text-foreground">Analytics data:</strong> Aggregated usage statistics</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.3 Information From Third Parties</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Payment providers:</strong> Transaction confirmations and payment status</li>
                  <li><strong className="text-foreground">Delivery services:</strong> Shipping updates and delivery confirmations</li>
                  <li><strong className="text-foreground">Fraud prevention services:</strong> Verification data to prevent fraudulent transactions</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">3. Legal Basis for Processing</h2>
                <p>Under UK GDPR, we process your personal data based on the following legal grounds:</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.1 Contract Performance</h3>
                <p>Processing necessary to fulfill our contract with you, including:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Processing and delivering your orders</li>
                  <li>Providing customer service</li>
                  <li>Managing your account</li>
                  <li>Processing payments and refunds</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.2 Legitimate Interests</h3>
                <p>Processing necessary for our legitimate business interests:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Fraud prevention and security</li>
                  <li>Improving our website and services</li>
                  <li>Marketing communications (where you haven't opted out)</li>
                  <li>Business analytics and reporting</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.3 Legal Obligations</h3>
                <p>Processing required to comply with legal obligations:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Tax and accounting records</li>
                  <li>Responding to law enforcement requests</li>
                  <li>Regulatory compliance for research chemical sales</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.4 Consent</h3>
                <p>Where you have given explicit consent:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Marketing emails and newsletters</li>
                  <li>Non-essential cookies</li>
                  <li>Third-party data sharing (where applicable)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">4. How We Use Your Information</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.1 Order Processing and Fulfillment</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Processing and dispatching your orders</li>
                  <li>Sending order confirmations and shipping updates</li>
                  <li>Handling returns and refunds</li>
                  <li>Verifying your identity and preventing fraud</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.2 Customer Service</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Responding to your inquiries</li>
                  <li>Providing technical support</li>
                  <li>Handling complaints</li>
                  <li>Improving our customer service</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.3 Website Improvement</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Analyzing website usage and performance</li>
                  <li>Improving user experience</li>
                  <li>Testing new features</li>
                  <li>Fixing technical issues</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.4 Marketing (with your consent)</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Sending newsletters and product updates</li>
                  <li>Informing you about special offers</li>
                  <li>Conducting customer surveys</li>
                  <li>Personalizing your shopping experience</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.5 Legal and Security</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Preventing fraud and unauthorized transactions</li>
                  <li>Complying with legal obligations</li>
                  <li>Enforcing our terms and conditions</li>
                  <li>Protecting our rights and property</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">5. Data Sharing and Disclosure</h2>
                <p>We do not sell your personal data. We may share your information with:</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.1 Service Providers</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Payment processors:</strong> For secure payment processing</li>
                  <li><strong className="text-foreground">Shipping companies:</strong> For order delivery</li>
                  <li><strong className="text-foreground">Email service providers:</strong> For sending transactional and marketing emails</li>
                  <li><strong className="text-foreground">Analytics providers:</strong> For website analytics (anonymized where possible)</li>
                  <li><strong className="text-foreground">Hosting providers:</strong> For website hosting</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.2 Legal Requirements</h3>
                <p>We may disclose your information if required by law or to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Comply with legal processes or government requests</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Prevent fraud or illegal activity</li>
                  <li>Enforce our terms and conditions</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.3 Business Transfers</h3>
                <p>If we are involved in a merger, acquisition, or sale of assets, your data may be transferred. You will be notified of any such change.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">6. International Data Transfers</h2>
                <p>Some of our service providers may be located outside the UK. When we transfer data internationally, we ensure appropriate safeguards are in place, including:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Standard contractual clauses approved by the UK ICO</li>
                  <li>Transfers to countries with adequate data protection laws</li>
                  <li>Ensuring service providers maintain equivalent data protection standards</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">7. Data Retention</h2>
                <p>We retain your personal data only for as long as necessary:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Order data:</strong> 7 years (for tax and accounting purposes)</li>
                  <li><strong className="text-foreground">Marketing data:</strong> Until you unsubscribe or request deletion</li>
                  <li><strong className="text-foreground">Website analytics:</strong> Up to 26 months</li>
                  <li><strong className="text-foreground">Customer service records:</strong> 3 years after last contact</li>
                  <li><strong className="text-foreground">Account data:</strong> Until account deletion or 3 years of inactivity</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">8. Your Rights Under UK GDPR</h2>
                <p>You have the following rights regarding your personal data:</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.1 Right to Access</h3>
                <p>You can request a copy of the personal data we hold about you.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.2 Right to Rectification</h3>
                <p>You can ask us to correct inaccurate or incomplete data.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.3 Right to Erasure</h3>
                <p>You can request deletion of your data (subject to legal obligations).</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.4 Right to Restrict Processing</h3>
                <p>You can ask us to limit how we use your data in certain circumstances.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.5 Right to Data Portability</h3>
                <p>You can request your data in a structured, commonly used format.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.6 Right to Object</h3>
                <p>You can object to processing based on legitimate interests or for marketing purposes.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.7 Right to Withdraw Consent</h3>
                <p>Where processing is based on consent, you can withdraw it at any time.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">8.8 How to Exercise Your Rights</h3>
                <p>To exercise any of these rights, please contact us via our contact page. We will respond within one month. There is no charge unless your request is manifestly unfounded or excessive.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">9. Cookies and Tracking</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.1 What Are Cookies</h3>
                <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.2 Types of Cookies We Use</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Essential cookies:</strong> Required for website functionality (shopping cart, security)</li>
                  <li><strong className="text-foreground">Analytics cookies:</strong> Help us understand how visitors use our site</li>
                  <li><strong className="text-foreground">Marketing cookies:</strong> Used to deliver relevant advertisements</li>
                  <li><strong className="text-foreground">Preference cookies:</strong> Remember your settings and preferences</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.3 Managing Cookies</h3>
                <p>You can control cookies through your browser settings. Blocking essential cookies may affect website functionality. For analytics and marketing cookies, we obtain your consent before setting them.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">10. Security Measures</h2>
                <p>We implement appropriate technical and organizational measures to protect your data:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">SSL/TLS encryption:</strong> For secure data transmission</li>
                  <li><strong className="text-foreground">Secure payment processing:</strong> PCI DSS compliant payment providers</li>
                  <li><strong className="text-foreground">Access controls:</strong> Limited access to personal data on a need-to-know basis</li>
                  <li><strong className="text-foreground">Regular security audits:</strong> To identify and address vulnerabilities</li>
                  <li><strong className="text-foreground">Staff training:</strong> All staff trained in data protection</li>
                  <li><strong className="text-foreground">Incident response:</strong> Procedures for handling data breaches</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">11. Children's Privacy</h2>
                <p>Our website and products are not intended for individuals under 18 years of age. We do not knowingly collect data from minors. If you believe we have inadvertently collected data from a minor, please contact us immediately.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">12. Marketing Communications</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">12.1 Email Marketing</h3>
                <p>We may send you marketing emails if:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>You have opted in to receive them</li>
                  <li>You are an existing customer and we are marketing similar products (soft opt-in)</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">12.2 Unsubscribe</h3>
                <p>You can unsubscribe from marketing emails at any time by:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Clicking the "unsubscribe" link in any marketing email</li>
                  <li>Contacting us directly</li>
                  <li>Updating your account preferences</li>
                </ul>
                <p className="mt-2">Note: You will still receive transactional emails (order confirmations, shipping updates) even if you unsubscribe from marketing.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">13. Third-Party Links</h2>
                <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies before providing any personal information.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">14. Data Breach Notification</h2>
                <p>In the event of a data breach that poses a risk to your rights and freedoms, we will:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Notify the UK Information Commissioner's Office (ICO) within 72 hours</li>
                  <li>Inform affected individuals without undue delay</li>
                  <li>Take immediate steps to mitigate any harm</li>
                  <li>Conduct a thorough investigation</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">15. Changes to This Policy</h2>
                <p>We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. We will:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Update the "Last Updated" date at the top</li>
                  <li>Notify you of significant changes via email or website notice</li>
                  <li>Continue to protect your data in accordance with UK GDPR</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">16. Contact Us</h2>
                <p>For privacy-related questions, concerns, or to exercise your data rights, please contact us:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Via our contact page</li>
                  <li>By email (address provided on contact page)</li>
                </ul>
                <p className="mt-2">We aim to respond to all requests within one month.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">17. Complaints</h2>
                <p>If you are unhappy with how we have handled your personal data, you have the right to lodge a complaint with the supervisory authority:</p>
                <p className="mt-2">
                  <strong className="text-foreground">Information Commissioner's Office (ICO)</strong><br />
                  Website: ico.org.uk<br />
                  Tel: 0303 123 1113
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
