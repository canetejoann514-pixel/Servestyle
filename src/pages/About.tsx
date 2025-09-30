import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, Users, Sparkles } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards in equipment quality and service delivery",
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Every event is an opportunity to create unforgettable memories",
    },
    {
      icon: Users,
      title: "Community",
      description: "Building lasting relationships with clients, partners, and our team",
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "Embracing new technologies to enhance the event planning experience",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="gradient-hero py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            About Remrose
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl">
            Transforming events into extraordinary experiences since 2010
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Remrose Event Styling was founded with a simple vision: to make exceptional event equipment
              accessible to everyone planning special occasions. What started as a small rental service has
              grown into a comprehensive event solutions provider.
            </p>
            <p>
              We pride ourselves on offering an extensive collection of premium equipment, from elegant
              seating and luxury linens to sophisticated tableware and stunning decor pieces. Each item
              in our inventory is carefully selected and meticulously maintained to ensure your event
              looks nothing short of spectacular.
            </p>
            <p>
              Today, we serve hundreds of clients annually, from intimate gatherings to grand celebrations,
              and we're continuously expanding our services to include innovative features like 360° virtual
              tours and real-time booking management.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-border bg-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Equipment Items</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Events Styled</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">10+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
