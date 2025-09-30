import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Sparkles, Eye } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 gradient-hero opacity-90" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              Premium Event Equipment
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Elevate Your{" "}
            <span className="text-accent">
              Events
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            From elegant weddings to corporate galas, discover premium event styling and catering equipment rentals. Experience our collection through immersive 360° virtual tours.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link to="/equipment">
              <Button variant="hero" size="xl" className="group">
                Browse Equipment
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/tours">
              <Button variant="outline" size="xl" className="bg-card/30 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-card/50">
                <Eye className="mr-2 h-5 w-5" />
                Virtual Tours
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-primary-foreground/20 animate-in fade-in duration-700 delay-500">
            <div>
              <div className="text-3xl font-bold text-accent mb-1">500+</div>
              <div className="text-sm text-primary-foreground/80">Premium Items</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">1000+</div>
              <div className="text-sm text-primary-foreground/80">Events Styled</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">24/7</div>
              <div className="text-sm text-primary-foreground/80">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
