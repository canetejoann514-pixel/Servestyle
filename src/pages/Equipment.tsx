import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import EquipmentCard from "@/components/EquipmentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import equipmentHero from "@/assets/equipment-hero.jpg";

const Equipment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample equipment data
  const equipment = [
    {
      id: "1",
      name: "Gold Chiavari Chairs",
      category: "Seating",
      price: 12,
      image: equipmentHero,
      available: true,
      featured: true,
    },
    {
      id: "2",
      name: "Crystal Glassware Set",
      category: "Tableware",
      price: 8,
      image: equipmentHero,
      available: true,
      featured: true,
    },
    {
      id: "3",
      name: "White Linen Tablecloths",
      category: "Linens",
      price: 15,
      image: equipmentHero,
      available: true,
    },
    {
      id: "4",
      name: "Silver Serving Platters",
      category: "Tableware",
      price: 10,
      image: equipmentHero,
      available: true,
    },
    {
      id: "5",
      name: "Crystal Centerpieces",
      category: "Decor",
      price: 25,
      image: equipmentHero,
      available: false,
    },
    {
      id: "6",
      name: "Velvet Table Runners",
      category: "Linens",
      price: 18,
      image: equipmentHero,
      available: true,
    },
  ];

  const categories = ["all", "Seating", "Tableware", "Linens", "Decor"];

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Equipment Catalog
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl">
            Browse our extensive collection of premium event equipment
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-card border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredEquipment.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((item) => (
                <EquipmentCard key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                No equipment found matching your criteria
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Equipment;
