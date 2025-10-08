import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, ArrowRight, X } from "lucide-react";
import equipmentHero from "@/assets/equipment-hero.jpg";
import Tour360Viewer from "@/components/Tour360Viewer";
import { useState } from "react";
import  designPic from "@/assets/design1.jpg"

const Tours = () => {
  const [selectedTour, setSelectedTour] = useState<string | null>(null);

  const tours = [
    {
      id: "1",
      title: "Elegant Wedding Setup",
      description: "Experience a luxurious wedding venue setup with gold accents and crystal details",
      image: designPic,
      panoramaUrl: designPic,
      duration: "360° Interactive Tour",
    },
    {
      id: "2",
      title: "Corporate Gala Event",
      description: "Professional corporate event styling with modern aesthetics and premium furnishings",
      image: equipmentHero,
      panoramaUrl: equipmentHero, 
      duration: "360° Interactive Tour",
    },
    {
      id: "3",
      title: "Garden Party Collection",
      description: "Outdoor event setup featuring elegant outdoor furniture and decorative elements",
      image: equipmentHero,
      panoramaUrl: equipmentHero, 
      duration: "360° Interactive Tour",
    },
  ];

  const handleTourClick = (tourId: string) => {
    setSelectedTour(tourId);
  };

  const activeTour = tours.find(tour => tour.id === selectedTour);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              360° Virtual Tours
            </h1>
            <p className="text-lg text-primary-foreground/90">
              Explore our event setups in immersive 360° detail. Get inspired and visualize
              how our equipment will transform your venue before you book.
            </p>
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden border-border bg-card hover:shadow-elegant transition-smooth group">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-6">
                    <Eye className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{tour.title}</CardTitle>
                  <CardDescription>{tour.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={() => handleTourClick(tour.id)}
                  >
                    Launch Tour
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Experience Before You Book
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our 360° virtual tours let you explore event setups from every angle.
            Navigate through the space, zoom in on details, and get a true sense
            of how our equipment will look at your venue.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Interactive</h3>
              <p className="text-sm text-muted-foreground">
                Click and drag to explore the entire space
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Detailed</h3>
              <p className="text-sm text-muted-foreground">
                Zoom in to see equipment up close
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Convenient</h3>
              <p className="text-sm text-muted-foreground">
                View on any device, anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* 360° Tour Dialog */}
      <Dialog open={!!selectedTour} onOpenChange={(open) => !open && setSelectedTour(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="absolute top-4 left-4 right-4 z-10 flex flex-row items-center justify-between bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border">
            <DialogTitle className="text-xl font-bold">{activeTour?.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedTour(null)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          {activeTour && (
            <div className="w-full h-full">
              <Tour360Viewer imageUrl={activeTour.panoramaUrl} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tours;
