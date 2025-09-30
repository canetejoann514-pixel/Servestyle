import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye } from "lucide-react";

interface EquipmentCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  available: boolean;
  featured?: boolean;
}

const EquipmentCard = ({
  id,
  name,
  category,
  price,
  image,
  available,
  featured = false,
}: EquipmentCardProps) => {
  return (
    <Card className="group overflow-hidden border-border bg-card hover:shadow-elegant transition-smooth">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {featured && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            Featured
          </Badge>
        )}
        {!available && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="secondary">Currently Unavailable</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg mb-2 text-foreground">{name}</h3>
        <p className="text-2xl font-bold text-accent">
          ${price}
          <span className="text-sm font-normal text-muted-foreground">/day</span>
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link to={`/equipment/${id}`} className="flex-1">
          <Button variant="default" className="w-full" disabled={!available}>
            <Calendar className="mr-2 h-4 w-4" />
            Book Now
          </Button>
        </Link>
        <Link to={`/equipment/${id}`}>
          <Button variant="outline" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;
