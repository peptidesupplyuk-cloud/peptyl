import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => (
  <footer className="bg-navy text-primary-foreground/80">
    <div className="container mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <Logo size="sm" inverted />
          <p className="mt-4 text-sm text-primary-foreground/50 leading-relaxed">
            The UK's trusted source for peptide education, tools, and community-driven insights. Brought to you by Peptide Supply.
          </p>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-sm text-primary-foreground mb-4">Platform</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/peptides" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Peptide Database</Link>
            <Link to="/calculators" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Calculators</Link>
            <Link to="/education" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Education</Link>
            <Link to="/shop" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Shop</Link>
          </div>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-sm text-primary-foreground mb-4">Tools</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/calculators" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Reconstitution Calculator</Link>
            <Link to="/calculators" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Dose Calculator</Link>
            <Link to="/peptides" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Community Feedback</Link>
          </div>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-sm text-primary-foreground mb-4">Legal</h4>
          <div className="flex flex-col gap-2.5">
            <span className="text-sm text-primary-foreground/50">For research purposes only</span>
            <Link to="/about" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">About Us</Link>
            <Link to="/privacy-policy" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-sm text-primary-foreground/50 hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-primary-foreground/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <p className="text-xs text-primary-foreground/40">© 2026 Peptyl. All rights reserved.</p>
          <p className="text-xs text-primary-foreground/40">
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms</Link>
            {" · "}
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
          </p>
        </div>
        <p className="text-[11px] text-primary-foreground/30 text-center leading-relaxed max-w-3xl mx-auto">
          All products and compounds referenced are for in-vitro research and laboratory use only — not for human consumption. This platform does not provide medical advice. Use of this site is subject to our Terms of Service and UK regulations including the Human Medicines Regulations 2012.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
