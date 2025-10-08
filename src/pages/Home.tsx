import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import EquipmentCard from "@/components/EquipmentCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [featuredEquipment, setFeaturedEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/equipment");
        const data = await res.json();
        // Only show featured equipment
        setFeaturedEquipment(data.filter((item: any) => item.featured));
      } catch (error) {
        setFeaturedEquipment([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <FeaturesSection />

      {/* Featured Equipment Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Featured Equipment
              </h2>
              <p className="text-lg text-muted-foreground">
                Discover our most popular rental items
              </p>
            </div>
            <Link to="/equipment" className="hidden md:block">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {loading ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">Loading equipment...</p>
              </div>
            ) : featuredEquipment.length > 0 ? (
              featuredEquipment.map((item) => (
                <EquipmentCard key={item._id} id={item._id} featured={item.featured} />
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">
                  No featured equipment found
                </p>
              </div>
            )}
          </div>

          <div className="text-center md:hidden">
            <Link to="/equipment">
              <Button variant="outline" className="w-full">
                View All Equipment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Plan Your Event?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get started today and let us help you create an unforgettable experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/equipment">
              <Button variant="hero" size="xl">
                Browse Equipment
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="xl" className="bg-card/30 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-card/50">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
