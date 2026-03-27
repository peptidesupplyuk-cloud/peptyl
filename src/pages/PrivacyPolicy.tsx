import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy"
        description="How Peptyl collects, uses, and protects your personal data under UK GDPR. Health data, wearable data, and genetic data rights explained."
        path="/privacy-policy"
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
              <strong className="text-foreground">Last Updated:</strong> March 27, 2026
            </div>

            <div className="space-y-10 text-muted-foreground leading-relaxed">
              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">1. Data Controller Information</h2>
                <p><strong className="text-foreground">Data Controller:</strong> Peptyl Ltd (peptyl.co.uk)</p>
                <p><strong className="text-foreground">Contact:</strong> Available via our contact page</p>
                <p><strong className="text-foreground">Jurisdiction:</strong> United Kingdom</p>
                <p><strong className="text-foreground">ICO Registration:</strong> In progress. Registration to be completed prior to paid services launching. ICO registration number will be added here upon completion.</p>
                <p className="mt-3">We are the data controller responsible for your personal data. If you have any questions about this privacy policy or our data practices, please contact us.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">2. Information We Collect</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.1 Account Information</h3>
                <p>When you create an account, we collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Personal details:</strong> Name, email address</li>
                  <li><strong className="text-foreground">Profile data:</strong> Age, weight, health goals, and biometric preferences you choose to provide</li>
                  <li><strong className="text-foreground">Authentication data:</strong> Login credentials (passwords are encrypted and never stored in plain text)</li>
                  <li><strong className="text-foreground">Communication:</strong> Content of contact form submissions or support messages</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.2 Health and Protocol Data</h3>
                <p>When you use personalised features, we collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Protocol data:</strong> Compounds, dosages, schedules, and adherence logs you enter</li>
                  <li><strong className="text-foreground">Bloodwork data:</strong> Biomarker values you manually enter from blood panel results</li>
                  <li><strong className="text-foreground">Wearable data:</strong> Recovery, HRV, sleep, and activity metrics synced from connected devices (Whoop, Fitbit)</li>
                  <li><strong className="text-foreground">Experience data:</strong> Votes, notes, and feedback you provide about compounds</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.3 Information Automatically Collected</h3>
                <p>When you visit the platform, we automatically collect:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Device information:</strong> IP address, browser type, operating system</li>
                  <li><strong className="text-foreground">Usage data:</strong> Pages visited, time spent, referring websites</li>
                  <li><strong className="text-foreground">Cookies:</strong> See our cookie policy below for details</li>
                  <li><strong className="text-foreground">Analytics data:</strong> Aggregated usage statistics</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.4 Information From Third Parties</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Wearable providers:</strong> Health and fitness data from connected Whoop or Fitbit accounts</li>
                  <li><strong className="text-foreground">Payment providers:</strong> Transaction confirmations and payment status (for subscription services)</li>
                  <li><strong className="text-foreground">Authentication providers:</strong> If you sign in via a third-party provider</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">3. Special Category Data - Genetic Information</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.1 What We Collect</h3>
                <p>When you use the DNA Analysis feature, you upload genetic data. This is classified as special category data under UK GDPR Article 9 due to its sensitive nature.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.2 How It Is Processed</h3>
                <p>Your genetic data is processed as follows:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>You upload raw genetic data (23andMe file, PDF report, image, or text)</li>
                  <li>Relevant genetic variants are extracted client-side in your browser</li>
                  <li>The extracted variant data is transmitted to our AI processing system for analysis</li>
                  <li>A personalised health report is generated and stored in your Peptyl account</li>
                  <li>Your raw genetic data is never stored on Peptyl's servers - only the processed report</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.3 Legal Basis</h3>
                <p>We process your genetic data under UK GDPR Article 9(2)(a): explicit consent. You provide this consent via the triple-checkbox consent form on the upload page. You may withdraw consent and request deletion of your report at any time.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.4 Third-Party Processing</h3>
                <p>Your genetic variant data is transmitted to our AI processing partner for analysis. This constitutes an international data transfer. Our AI processing partner operates under appropriate data processing agreements. We have assessed this transfer as necessary and proportionate for the service provided.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.5 Retention</h3>
                <p>Processed DNA reports are retained until you delete them or close your account. Consent records (not the genetic data itself) are retained for 7 years for legal compliance.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.6 Your Rights</h3>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Access your stored report via your DNA dashboard</li>
                  <li>Delete your report at any time (this is available directly in your dashboard)</li>
                  <li>Withdraw consent (delete your report - this removes the processed data)</li>
                  <li>Request a copy of the consent record we hold</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.7 Sensitive Nature</h3>
                <p>We recognise that genetic data is uniquely personal and potentially sensitive for you and your biological relatives. We do not share genetic data with third parties other than our AI partner for processing purposes. We do not use genetic data for advertising, profiling, or any purpose other than generating your personalised report.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">4. Legal Basis for Processing</h2>
                <p>Under UK GDPR, we process your personal data based on the following legal grounds:</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.1 Contract Performance</h3>
                <p>Processing necessary to provide our services to you, including:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Managing your account and subscriptions</li>
                  <li>Providing personalised health insights and protocol tracking</li>
                  <li>Processing payments for subscription services</li>
                  <li>Providing customer support</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.2 Legitimate Interests</h3>
                <p>Processing necessary for our legitimate business interests:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Fraud prevention and platform security</li>
                  <li>Improving our platform and services</li>
                  <li>Business analytics and reporting (using anonymised data)</li>
                  <li>Developing new features based on usage patterns</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.3 Legal Obligations</h3>
                <p>Processing required to comply with legal obligations:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Tax and accounting records</li>
                  <li>Responding to law enforcement requests</li>
                  <li>Data protection regulatory compliance</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">4.4 Consent</h3>
                <p>Where you have given explicit consent:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Genetic data processing for DNA reports</li>
                  <li>Marketing emails and newsletters</li>
                  <li>Non-essential cookies</li>
                  <li>Wearable data sync and storage</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">5. How We Use Your Information</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.1 Platform Services</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Generating personalised health insights and AI-driven recommendations</li>
                  <li>Tracking protocols, biomarkers, and adherence</li>
                  <li>Syncing and displaying wearable data alongside your protocols</li>
                  <li>Producing DNA health reports</li>
                  <li>Providing research-backed educational content</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.2 Platform Improvement</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Analysing anonymised usage patterns to improve features</li>
                  <li>Training and improving our AI models (using anonymised, aggregated data only)</li>
                  <li>Testing new features and experiences</li>
                  <li>Fixing technical issues</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.3 Communication</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Sending protocol reminders and adherence nudges (if enabled)</li>
                  <li>Responding to your support inquiries</li>
                  <li>Sending newsletters and product updates (with your consent)</li>
                  <li>Notifying you of changes to the platform or these terms</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.4 Legal and Security</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Preventing fraud and unauthorised access</li>
                  <li>Complying with legal obligations</li>
                  <li>Enforcing our terms and conditions</li>
                  <li>Protecting our rights and intellectual property</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">6. Data Sharing and Disclosure</h2>
                <p>We do not sell your personal data. We may share your information with:</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.1 Service Providers</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">AI processing partners:</strong> For generating health insights and DNA reports</li>
                  <li><strong className="text-foreground">Payment processors:</strong> For secure subscription payment processing</li>
                  <li><strong className="text-foreground">Email service providers:</strong> For sending transactional and marketing emails</li>
                  <li><strong className="text-foreground">Analytics providers:</strong> For platform analytics (anonymised where possible)</li>
                  <li><strong className="text-foreground">Hosting providers:</strong> For secure platform hosting and data storage</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.2 Legal Requirements</h3>
                <p>We may disclose your information if required by law or to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Comply with legal processes or government requests</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Prevent fraud or illegal activity</li>
                  <li>Enforce our terms and conditions</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.3 Business Transfers</h3>
                <p>If we are involved in a merger, acquisition, or sale of assets, your data may be transferred. You will be notified of any such change.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">7. International Data Transfers</h2>
                <p>Some of our service providers may be located outside the UK. When we transfer data internationally, we ensure appropriate safeguards are in place, including:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Standard contractual clauses approved by the UK ICO</li>
                  <li>Transfers to countries with adequate data protection laws</li>
                  <li>Ensuring service providers maintain equivalent data protection standards</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">8. Data Retention</h2>
                <p>We retain your personal data only for as long as necessary:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Account data:</strong> Until account deletion or 3 years of inactivity</li>
                  <li><strong className="text-foreground">Protocol and health data:</strong> Until account deletion</li>
                  <li><strong className="text-foreground">Bloodwork records:</strong> Until account deletion</li>
                  <li><strong className="text-foreground">Wearable data:</strong> Until you disconnect the integration or delete your account</li>
                  <li><strong className="text-foreground">DNA reports:</strong> Until you delete them or close your account</li>
                  <li><strong className="text-foreground">Genetic data consent records:</strong> 7 years (legal compliance)</li>
                  <li><strong className="text-foreground">Subscription and payment data:</strong> 7 years (for tax and accounting purposes)</li>
                  <li><strong className="text-foreground">Marketing data:</strong> Until you unsubscribe or request deletion</li>
                  <li><strong className="text-foreground">Website analytics:</strong> Up to 26 months</li>
                  <li><strong className="text-foreground">Support records:</strong> 3 years after last contact</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">9. Your Rights Under UK GDPR</h2>
                <p>You have the following rights regarding your personal data:</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.1 Right to Access</h3>
                <p>You can request a copy of the personal data we hold about you.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.2 Right to Rectification</h3>
                <p>You can ask us to correct inaccurate or incomplete data.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.3 Right to Erasure</h3>
                <p>You can request deletion of your data (subject to legal obligations).</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.4 Right to Restrict Processing</h3>
                <p>You can ask us to limit how we use your data in certain circumstances.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.5 Right to Data Portability</h3>
                <p>You can request your data in a structured, commonly used format.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.6 Right to Object</h3>
                <p>You can object to processing based on legitimate interests or for marketing purposes.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.7 Right to Withdraw Consent</h3>
                <p>Where processing is based on consent, you can withdraw it at any time.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.8 How to Exercise Your Rights</h3>
                <p>To exercise any of these rights, please contact us via our contact page. We will respond within one month. There is no charge unless your request is manifestly unfounded or excessive.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">10. Cookies and Tracking</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.1 What Are Cookies</h3>
                <p>Cookies are small text files stored on your device when you visit our platform. They help us provide a better user experience.</p>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.2 Types of Cookies We Use</h3>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">Essential cookies:</strong> Required for platform functionality (authentication, security, preferences)</li>
                  <li><strong className="text-foreground">Analytics cookies:</strong> Help us understand how visitors use our platform</li>
                  <li><strong className="text-foreground">Preference cookies:</strong> Remember your settings such as theme and language</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.3 Managing Cookies</h3>
                <p>You can control cookies through your browser settings. Blocking essential cookies may affect platform functionality. For analytics cookies, we obtain your consent before setting them.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">11. Security Measures</h2>
                <p>We implement appropriate technical and organisational measures to protect your data:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong className="text-foreground">SSL/TLS encryption:</strong> For secure data transmission</li>
                  <li><strong className="text-foreground">Encrypted storage:</strong> Personal and health data encrypted at rest</li>
                  <li><strong className="text-foreground">Access controls:</strong> Limited access to personal data on a need-to-know basis</li>
                  <li><strong className="text-foreground">Row-level security:</strong> Database-level isolation ensures users can only access their own data</li>
                  <li><strong className="text-foreground">Regular security audits:</strong> To identify and address vulnerabilities</li>
                  <li><strong className="text-foreground">Incident response:</strong> Procedures for handling data breaches</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">12. Children's Privacy</h2>
                <p>Our platform is not intended for individuals under 18 years of age. We do not knowingly collect data from minors. If you believe we have inadvertently collected data from a minor, please contact us immediately.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">13. Marketing Communications</h2>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">13.1 Email Marketing</h3>
                <p>We may send you marketing emails if:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>You have opted in to receive them</li>
                  <li>You are an existing user and we are communicating about similar services (soft opt-in)</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">13.2 Unsubscribe</h3>
                <p>You can unsubscribe from marketing emails at any time by:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Clicking the "unsubscribe" link in any marketing email</li>
                  <li>Contacting us directly</li>
                  <li>Updating your account preferences</li>
                </ul>
                <p className="mt-2">Note: You will still receive transactional emails (account confirmations, security alerts, protocol reminders) even if you unsubscribe from marketing.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">14. Third-Party Links</h2>
                <p>Our platform may contain links to third-party websites, including supplier sites and research databases. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies before providing any personal information.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">15. Data Breach Notification</h2>
                <p>In the event of a data breach that poses a risk to your rights and freedoms, we will:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Notify the UK Information Commissioner's Office (ICO) within 72 hours</li>
                  <li>Inform affected individuals without undue delay</li>
                  <li>Take immediate steps to mitigate any harm</li>
                  <li>Conduct a thorough investigation</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">16. Changes to This Policy</h2>
                <p>We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. We will:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Update the "Last Updated" date at the top</li>
                  <li>Notify you of significant changes via email or in-app notification</li>
                  <li>Continue to protect your data in accordance with UK GDPR</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">17. Contact Us</h2>
                <p>For privacy-related questions, concerns, or to exercise your data rights, please contact us:</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Via our contact page</li>
                  <li>By email (address provided on contact page)</li>
                </ul>
                <p className="mt-2">We aim to respond to all requests within one month.</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-4">18. Complaints</h2>
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
