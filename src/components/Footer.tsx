import { Link } from "react-router-dom";
import { Sparkles, Facebook, Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="gradient-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold">Remrose</span>
            </div>
            <p className="text-primary-foreground/80 text-sm mb-4">
              Elevating events with premium styling and catering equipment rentals.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-smooth"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-smooth"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/equipment" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  Browse Equipment
                </Link>
              </li>
              <li>
                <Link to="/tours" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  Virtual Tours
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>Event Styling</li>
              <li>Catering Equipment</li>
              <li>Wedding Rentals</li>
              <li>Corporate Events</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="h-4 w-4 text-accent" />
                <a href="mailto:info@remrose.com" className="hover:text-accent transition-smooth">
                  info@remrose.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="h-4 w-4 text-accent" />
                <a href="tel:+1234567890" className="hover:text-accent transition-smooth">
                  (123) 456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {currentYear} Remrose Event Styling. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
