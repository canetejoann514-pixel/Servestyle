import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

interface EquipmentCardProps {
  id: string;
  featured?: boolean;
}

const EquipmentCard = ({
  id,
  featured = false,
}: EquipmentCardProps) => {
  const { user } = useAuth();
  const { addItemToCart } = useCart();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/equipment/${id}`);
        const data = await res.json();
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        setEquipment(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id]);

  if (loading) {
    return (
      <Card className="group overflow-hidden border-border bg-card">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted animate-pulse" />
        <CardContent className="p-4 space-y-3">
          <div className="h-4 bg-muted animate-pulse rounded" />
          <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!equipment) return null;

  const imageUrl = equipment.image 
    ? `http://localhost:5000${equipment.image}` 
    : '/placeholder.svg';

  const itemSubtotal = equipment.price_per_day * quantity;

  // ADDED: Handler for when user clicks Add to Cart but is not logged in
  const handleAddToCartClick = () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart.');
      navigate('/auth');
      return;
    }
    setIsQuantityDialogOpen(true);
  };

  const handleFinalAddToCart = () => {
    const parsedQuantity = parseInt(quantity.toString());
    
    if (parsedQuantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    
    if (parsedQuantity > equipment.available_quantity) {
        toast.error(`Cannot add more than ${equipment.available_quantity} of this equipment.`);
        return;
    }
    
    addItemToCart(
      {
        equipmentId: id,
        equipmentName: equipment.name,
        pricePerDay: equipment.price_per_day,
        availableQuantity: equipment.available_quantity,
      },
      parsedQuantity
    );
    setQuantity(1); 
    setIsQuantityDialogOpen(false); 
  };

  return (
    <>
      <Card className="group overflow-hidden border-border bg-card hover:shadow-elegant transition-smooth">
        
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={equipment.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          {featured && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
          {equipment.available_quantity <= 0 && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="secondary">Currently Unavailable</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              {equipment.category}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">{equipment.name}</h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {equipment.description || 'No description available'}
          </p>
          <p className="text-2xl font-bold text-accent">
            ₱{equipment.price_per_day}
            <span className="text-sm font-normal text-muted-foreground">/day</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Available: {equipment.available_quantity}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          {equipment.available_quantity > 0 ? (
            <Dialog open={isQuantityDialogOpen} onOpenChange={setIsQuantityDialogOpen}>
              <Button 
                variant="default" 
                className="w-full"
                onClick={handleAddToCartClick}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add to Cart: {equipment.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity (Max: {equipment.available_quantity})</Label>
                      <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={equipment.available_quantity}
                          value={quantity}
                          onChange={(e) => 
                              setQuantity(Math.min(equipment.available_quantity, Math.max(1, parseInt(e.target.value) || 1)))
                          }
                          required
                      />
                  </div>
                  
                  <div className="bg-secondary p-3 rounded-md flex justify-between items-center">
                      <span className="font-medium text-sm">Price per item:</span>
                      <span className="font-bold text-lg text-accent">₱{equipment.price_per_day} / day</span>
                  </div>

                  <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                    <span className="font-bold">Subtotal for {quantity} item(s):</span>
                    <span className="font-bold text-xl text-primary">₱{itemSubtotal.toFixed(2)} / day</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleFinalAddToCart} disabled={quantity < 1 || quantity > equipment.available_quantity}>
                      <Package className="mr-2 h-4 w-4" />
                      Done (Add to Cart)
                  </Button>
                </div>
              </DialogContent>

            </Dialog>
          ) : (
            <Button disabled className="w-full bg-muted text-muted-foreground">
              Currently Unavailable
            </Button>

          )}
        </CardFooter>
      </Card>
    </>
  );
};

export default EquipmentCard;