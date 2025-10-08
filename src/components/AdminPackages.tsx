// src/components/AdminPackages.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const AdminPackages = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/packages`);
      const data = await res.json();
      setPackages(data || []);
    } catch (error: any) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load packages");
    }
  };

  const addPackage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("http://localhost:5000/api/packages", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Package added successfully");
      setIsAddOpen(false);
      e.currentTarget.reset();
      fetchPackages();
    } catch (error: any) {
      toast.error(error.message || "Failed to add package");
    }
  };

  const updatePackage = async (e: React.FormEvent<HTMLFormElement>, packageId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`http://localhost:5000/api/packages/${packageId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Package updated successfully");
      setEditingPackage(null);
      fetchPackages();
    } catch (error: any) {
      toast.error(error.message || "Failed to update package");
    }
  };

  const deletePackage = async (packageId: string, packageName: string) => {
    if (!confirm(`Are you sure you want to delete "${packageName}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/packages/${packageId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete package");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Packages Management</CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Package</DialogTitle>
            </DialogHeader>
            <form onSubmit={addPackage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name</Label>
                <Input id="name" name="name" placeholder="e.g., Wedding Package 1" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g., Wedding, Birthday, Corporate" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pax">Good for (Pax)</Label>
                <Input id="pax" name="pax" type="number" placeholder="100" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₱)</Label>
                <Input id="price" name="price" type="number" step="0.01" placeholder="20000" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea id="description" name="description" placeholder="Brief overview of the package" rows={2} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="items">Main Package Items (one per line)</Label>
                <Textarea 
                  id="items" 
                  name="items" 
                  placeholder="Venue Elegant Design&#10;Backdrop Design&#10;Tiffany Chairs&#10;Stage Backdrop"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">List the main items included in this package</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tableChairs">Tables & Chairs (one per line)</Label>
                <Textarea 
                  id="tableChairs" 
                  name="tableChairs" 
                  placeholder="Bride Table&#10;Parent Table&#10;Presidential Table&#10;Ordinary Tables"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cateringEquipment">Catering Equipment (one per line)</Label>
                <Textarea 
                  id="cateringEquipment" 
                  name="cateringEquipment" 
                  placeholder="Presidential Utensils&#10;3pcs Big Cooking Wok&#10;2pcs Blower"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extras">Additional Services (one per line)</Label>
                <Textarea 
                  id="extras" 
                  name="extras" 
                  placeholder="Sounds and Lights&#10;Waiter Service"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <Input id="image" name="image" type="file" accept="image/*" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured">Featured</Label>
                <Select name="featured" defaultValue="false">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" variant="hero" className="w-full">
                Add Package
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Pax</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg._id}>
                <TableCell>
                  <img
                    src={`http://localhost:5000${pkg.image}`}
                    alt={pkg.name}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>{pkg.category}</TableCell>
                <TableCell>{pkg.pax} pax</TableCell>
                <TableCell>₱{pkg.price?.toLocaleString()}</TableCell>
                <TableCell>{pkg.featured ? "Yes" : "No"}</TableCell>
                <TableCell className="flex gap-2">
                  {/* Edit Dialog */}
                  <Dialog
                    open={editingPackage?._id === pkg._id}
                    onOpenChange={(open) => !open && setEditingPackage(null)}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setEditingPackage(pkg)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Package</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => updatePackage(e, pkg._id)} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Package Name</Label>
                          <Input name="name" defaultValue={pkg.name} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Input name="category" defaultValue={pkg.category} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Good for (Pax)</Label>
                          <Input name="pax" type="number" defaultValue={pkg.pax} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Price (₱)</Label>
                          <Input type="number" step="0.01" name="price" defaultValue={pkg.price} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Short Description</Label>
                          <Textarea name="description" defaultValue={pkg.description} rows={2} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Main Package Items</Label>
                          <Textarea 
                            name="items" 
                            defaultValue={pkg.items?.join('\n') || ''} 
                            rows={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tables & Chairs</Label>
                          <Textarea 
                            name="tableChairs" 
                            defaultValue={pkg.tableChairs?.join('\n') || ''} 
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Catering Equipment</Label>
                          <Textarea 
                            name="cateringEquipment" 
                            defaultValue={pkg.cateringEquipment?.join('\n') || ''} 
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Additional Services</Label>
                          <Textarea 
                            name="extras" 
                            defaultValue={pkg.extras?.join('\n') || ''} 
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Replace Image (Optional)</Label>
                          <Input name="image" type="file" accept="image/*" />
                          <p className="text-xs text-muted-foreground">Leave empty to keep current image</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Featured</Label>
                          <Select name="featured" defaultValue={pkg.featured ? "true" : "false"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" variant="hero" className="w-full">
                          Save Changes
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Delete */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deletePackage(pkg._id, pkg.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminPackages;