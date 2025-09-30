import { Calendar, MessageCircle, Eye, Shield, Sparkles, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Easy Booking",
    description: "Book your equipment online with real-time availability tracking",
  },
  {
    icon: Eye,
    title: "360° Virtual Tours",
    description: "Explore event setups with immersive virtual tours before you book",
  },
  {
    icon: MessageCircle,
    title: "Live Chat Support",
    description: "Get instant help from our event styling experts anytime",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "Premium equipment maintained to the highest standards",
  },
  {
    icon: Clock,
    title: "Flexible Rentals",
    description: "Rent for a day, week, or longer with flexible terms",
  },
  {
    icon: Sparkles,
    title: "Styled Events",
    description: "Professional styling services to bring your vision to life",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Remrose?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We make event planning effortless with premium equipment and exceptional service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-border bg-card hover:shadow-elegant transition-smooth hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
