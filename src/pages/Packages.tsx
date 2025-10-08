// src/pages/Packages.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Eye, Users, Check, Package as PackageIcon } from "lucide-react";
import { toast } from "sonner";

interface PackageItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  pax?: number;
  category: string;
  image?: string;
  featured?: boolean;
  items?: string[];
  tableChairs?: string[];
  cateringEquipment?: string[];
  extras?: string[];
}

const Packages = () => {
  const { user } = useAuth();
  const { addItemToCart } = useCart();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [packageToAdd, setPackageToAdd] = useState<PackageItem | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/packages");
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();
      setPackages(data || []);
    } catch (err) {
      console.error("Error fetching packages:", err);
      toast.error("Could not load packages.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(packages.map(pkg => pkg.category)))];

  const filteredPackages = selectedCategory === "all" 
    ? packages 
    : packages.filter(pkg => pkg.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleAddToCartClick = (pkg: PackageItem) => {
    if (!user) {
      toast.error('Please sign in to add items to your cart.');
      navigate('/auth');
      return;
    }
    setPackageToAdd(pkg);
    setQuantity(1);
    setIsQuantityDialogOpen(true);
  };

  const handleFinalAddToCart = () => {
    if (!packageToAdd) return;

    addItemToCart(
      {
        packageId: packageToAdd._id,
        packageName: packageToAdd.name,
        packagePrice: packageToAdd.price,
      },
      quantity,
      'package'
    );
    
    setQuantity(1);
    setIsQuantityDialogOpen(false);
    setPackageToAdd(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <p className="text-center text-muted-foreground">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Event Packages
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl">
            Complete solutions for your special events
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-card border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="whitespace-nowrap"
              >
                {cat === "all" ? "All Packages" : cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredPackages.length === 0 ? (
            <div className="text-center py-20">
              <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No packages available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map(pkg => (
                <Card key={pkg._id} className="group overflow-hidden border-border bg-card hover:shadow-elegant transition-smooth">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={pkg.image ? `http://localhost:5000${pkg.image}` : '/placeholder.svg'}
                      alt={pkg.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    {pkg.featured && (
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                        Featured
                      </Badge>
                    )}
                    <Badge className="absolute top-3 right-3 bg-secondary">
                      {pkg.category}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-foreground">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {pkg.description || 'No description available'}
                    </p>
                    
                    {pkg.pax && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">Good for {pkg.pax} pax</span>
                      </div>
                    )}

                    <p className="text-2xl font-bold text-accent mb-3">
                      ₱{pkg.price.toLocaleString()}
                    </p>

                    {/* Preview items */}
                    {pkg.items && pkg.items.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {pkg.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Check className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{item}</span>
                          </div>
                        ))}
                        {pkg.items.length > 3 && (
                          <p className="text-xs text-accent font-medium ml-5">
                            +{pkg.items.length - 3} more items...
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Details
                    </Button>
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => handleAddToCartClick(pkg)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Package Details Modal */}
      {selectedPackage && (
        <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPackage.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Image */}
              {selectedPackage.image && (
                <img
                  src={`http://localhost:5000${selectedPackage.image}`}
                  alt={selectedPackage.name}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              )}

              {/* Price & Pax */}
              <div className="bg-muted rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Package Price</p>
                  <p className="text-3xl font-bold text-accent">₱{selectedPackage.price.toLocaleString()}</p>
                </div>
                {selectedPackage.pax && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="text-2xl font-bold">{selectedPackage.pax} pax</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-muted-foreground">{selectedPackage.description}</p>
              </div>

              {/* Main Items */}
              {selectedPackage.items && selectedPackage.items.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Package Includes:</h3>
                  <div className="grid gap-2">
                    {selectedPackage.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tables & Chairs */}
              {selectedPackage.tableChairs && selectedPackage.tableChairs.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Tables & Chairs:</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selectedPackage.tableChairs.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Catering Equipment */}
              {selectedPackage.cateringEquipment && selectedPackage.cateringEquipment.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Catering Equipment:</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selectedPackage.cateringEquipment.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extras */}
              {selectedPackage.extras && selectedPackage.extras.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3">Additional Services:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.extras.map((item, idx) => (
                      <Badge key={idx} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <Button 
                variant="hero" 
                className="w-full"
                onClick={() => {
                  setSelectedPackage(null);
                  handleAddToCartClick(selectedPackage);
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add Package to Cart
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Quantity Dialog */}
      <Dialog open={isQuantityDialogOpen} onOpenChange={setIsQuantityDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to Cart: {packageToAdd?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                required
              />
            </div>

            <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
              <span className="font-bold">Subtotal for {quantity} package(s):</span>
              <span className="font-bold text-xl text-primary">
                ₱{((packageToAdd?.price || 0) * quantity).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleFinalAddToCart}>
              <PackageIcon className="mr-2 h-4 w-4" />
              Done (Add to Cart)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Packages;