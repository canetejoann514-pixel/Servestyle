import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/AdminSidebar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminCalendarView from '@/components/AdminCalendarView';
import AdminPaymentVerification from '@/components/AdminPaymentVerification';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Package, Calendar, Pencil, Trash2, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react';
import AdminPackages from '@/components/AdminPackages';

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, totalRevenue: 0, overdueBookings: 0 });
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [additionalPayment, setAdditionalPayment] = useState('');
  const [issueNotes, setIssueNotes] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (user.role !== "admin") {
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]); 

  const fetchData = async () => {
    await Promise.all([fetchBookings(), fetchEquipment(), fetchStats(), fetchUsers()]);
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
      const data = await res.json();
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/equipment');
      const data = await res.json();
      setEquipment(data || []);
    } catch (error: any) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
      const data = await res.json();

      const totalBookings = data?.length || 0;
      const pendingBookings = data?.filter((b: any) => b.status === 'pending').length || 0;
      const overdueBookings = data?.filter((b: any) => b.status === 'overdue').length || 0;
      const totalRevenue = data?.reduce((sum: number, b: any) => {
        const bookingTotal = parseFloat(b.total_price || 0);
        const additional = parseFloat(b.additional_payment || 0);
        return sum + bookingTotal + additional;
      }, 0) || 0;

      setStats({ totalBookings, pendingBookings, totalRevenue, overdueBookings });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      const data = await res.json();
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Booking status updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update booking');
    }
  };

  const handleIssueResolution = async () => {
    if (!selectedBooking) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${selectedBooking.id}/resolve-issue`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additional_payment: parseFloat(additionalPayment) || 0,
          issue_notes: issueNotes,
          status: 'resolved'
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success('Issue resolved and payment recorded');
      setSelectedBooking(null);
      setAdditionalPayment('');
      setIssueNotes('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve issue');
    }
  };

  const addEquipment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('http://localhost:5000/api/equipment', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success('Equipment added successfully');
      setIsAddEquipmentOpen(false);
      e.currentTarget.reset();
      fetchEquipment();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add equipment');
    }
  };

  const updateEquipment = async (e: React.FormEvent<HTMLFormElement>, equipmentId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`http://localhost:5000/api/equipment/${equipmentId}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success('Equipment updated successfully');
      setEditingEquipment(null);
      fetchEquipment();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update equipment');
    }
  };

  const deleteEquipment = async (equipmentId: string, equipmentName: string) => {
    if (!confirm(`Are you sure you want to delete "${equipmentName}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/equipment/${equipmentId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success('Equipment deleted successfully');
      fetchEquipment();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete equipment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      case 'in-progress': return 'bg-purple-500';
      case 'overdue': return 'bg-orange-500';
      case 'returned-with-issues': return 'bg-pink-500';
      case 'resolved': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in-progress': return 'In Progress';
      case 'returned-with-issues': return 'Returned with Issues';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="container mx-auto px-4 py-20">
            <p className="text-center">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{stats.overdueBookings}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'bookings' && (
                <Card>
                  <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No bookings yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead>Items/Details</TableHead>
                              <TableHead>Dates</TableHead>
                              <TableHead>Total Qty</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Add. Payment</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bookings.map((booking) => (
                              <TableRow key={booking.id}>
                                <TableCell>{booking.profiles?.full_name || 'N/A'}</TableCell>
                                
                                <TableCell>
                                  {booking.items && booking.items.length > 1 ? (
                                    <>
                                      <div className="font-medium flex items-center gap-1">
                                        <ShoppingCart className="h-3 w-3" />
                                        Multi-Item ({booking.items.length} types)
                                      </div>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="link" size="sm" className="h-4 p-0 text-xs font-normal">
                                            View Details
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Items in Booking ID: {booking.id}</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                            {booking.items.map((item: any, idx: number) => (
                                              <div key={idx} className="flex justify-between border-b pb-2 text-sm">
                                                <span>{item.equipmentName}</span>
                                                <span className="font-semibold">
                                                  x{item.quantity} (₱{item.pricePerDay?.toFixed(2) || 'N/A'}/day)
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </>
                                  ) : (
                                    booking.items ? booking.items[0]?.equipmentName : 'Unknown'
                                  )}
                                </TableCell>
                                
                                <TableCell className="text-sm">
                                  {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'}<br/>
                                  {booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                
                                <TableCell>
                                  {booking.items
                                    ? booking.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
                                    : booking.quantity}
                                </TableCell>
                                
                                <TableCell>₱{booking.total_price}</TableCell>
                                <TableCell>
                                  {booking.additional_payment ? (
                                    <span className="text-orange-600 font-semibold">
                                      +₱{booking.additional_payment}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(booking.status)}>
                                    {getStatusLabel(booking.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Select
                                      value={booking.status}
                                      onValueChange={(value) => updateBookingStatus(booking.id, value)}
                                    >
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                        <SelectItem value="returned-with-issues">Returned with Issues</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    
                                    {booking.status === 'returned-with-issues' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedBooking(booking);
                                          setIssueNotes(booking.issue_notes || '');
                                          setAdditionalPayment(booking.additional_payment || '');
                                        }}
                                      >
                                        Resolve
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Verification */}
              {activeTab === 'payments' && (
                <AdminPaymentVerification />
              )}
              {/* View Calendar */}
              {activeTab === 'calendar' && (
                  <AdminCalendarView />
                )}

              {activeTab === 'equipment' && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Equipment Inventory</CardTitle>
                    <Dialog open={isAddEquipmentOpen} onOpenChange={setIsAddEquipmentOpen}>
                      <DialogTrigger asChild>
                        <Button variant="hero">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Equipment
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Equipment</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={addEquipment} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" name="category" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price_per_day">Price per Day (₱)</Label>
                            <Input id="price_per_day" name="price_per_day" type="number" step="0.01" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="available_quantity">Available Quantity</Label>
                            <Input id="available_quantity" name="available_quantity" type="number" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="image">Upload Image</Label>
                            <Input id="image" name="image" type="file" accept="image/*" />
                            <p className="text-xs text-muted-foreground">Optional: Max 5MB, JPG/PNG/GIF</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="featured">Featured</Label>
                            <Select name="featured" defaultValue="false">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" variant="hero" className="w-full">
                            Add Equipment
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
                          <TableHead>Price/Day</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipment.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              <img 
                                src={`http://localhost:5000${item.image}`} 
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>₱{item.price_per_day}</TableCell>
                            <TableCell>{item.available_quantity}</TableCell>
                            <TableCell>
                              <Badge variant={item.featured ? 'default' : 'secondary'}>
                                {item.featured ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell className="flex gap-2">
                              <Dialog open={editingEquipment?._id === item._id} onOpenChange={(open) => !open && setEditingEquipment(null)}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => setEditingEquipment(item)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Equipment</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={(e) => updateEquipment(e, item._id)} className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Name</Label>
                                      <Input name="name" defaultValue={item.name} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Category</Label>
                                      <Input name="category" defaultValue={item.category} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Description</Label>
                                      <Textarea name="description" defaultValue={item.description} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Price per Day (₱)</Label>
                                      <Input type="number" step="0.01" name="price_per_day" defaultValue={item.price_per_day} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Available Quantity</Label>
                                      <Input type="number" name="available_quantity" defaultValue={item.available_quantity} required />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Replace Image (Optional)</Label>
                                      <Input name="image" type="file" accept="image/*" />
                                      <p className="text-xs text-muted-foreground">
                                        Current: {item.image} - Leave empty to keep
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Featured</Label>
                                      <Select name="featured" defaultValue={item.featured ? "true" : "false"}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
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

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteEquipment(item._id, item.name)}
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
              )}

              {activeTab === 'packages' && (
                <AdminPackages />
              )}

              {activeTab === 'users' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Verified</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell className="max-w-xs truncate">{user.address}</TableCell>
                            <TableCell>
                              <Badge variant={user.email_verified ? 'default' : 'secondary'}>
                                {user.email_verified ? 'Verified' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge>{user.role}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Issue Resolution Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Booking Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Customer: <span className="font-semibold text-foreground">{selectedBooking?.profiles?.full_name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Equipment: 
                <span className="font-semibold text-foreground">
                  {selectedBooking?.items && selectedBooking.items.length > 1
                      ? ` Multi-Item Rental (${selectedBooking.items.length} types)`
                      : (selectedBooking?.items ? ` ${selectedBooking.items[0]?.equipmentName}` : 'Unknown Equipment')}
                </span>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additional_payment">Additional Payment (₱)</Label>
              <Input
                id="additional_payment"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={additionalPayment}
                onChange={(e) => setAdditionalPayment(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                For damaged or missing equipment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_notes">Issue Notes</Label>
              <Textarea
                id="issue_notes"
                placeholder="Describe the issue and resolution..."
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedBooking(null)}>
                Cancel
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleIssueResolution}>
                Mark as Resolved
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
                