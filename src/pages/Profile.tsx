import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { User, Calendar, Package, Trash2, AlertCircle, ShoppingCart } from 'lucide-react';

interface Booking {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  items: any[];
  total_price: number;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  proofOfPayment?: string;
  notes?: string;
  additional_payment?: number;
  issue_notes?: string;
  profiles?: {
    full_name: string;
  };
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      if (user.role !== 'admin') {
        fetchBookings();
      }
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${user?.id}`);
      const data = await res.json();
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings?userId=${user?.id}`);
      const data = await res.json();
      console.log('User bookings:', data);
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success('Booking cancelled successfully');
      setBookingToCancel(null);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`http://localhost:5000/api/profile/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.get('full_name'),
          phone: formData.get('phone'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
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

  const getPaymentStatusBadge = (paymentStatus?: string, paymentMethod?: string) => {
  if (paymentMethod === "cash") {
    return <Badge variant="outline" className="ml-2">Cash on Pickup</Badge>;
  }
  
  switch (paymentStatus) {
    case "paid":
      return <Badge className="bg-green-500 ml-2">Payment Verified</Badge>;
    case "pending_verification":
      return <Badge className="bg-yellow-500 ml-2">Payment Under Review</Badge>;
    case "rejected":
      return <Badge className="bg-red-500 ml-2">Payment Rejected</Badge>;
    case "unpaid":
      return <Badge variant="outline" className="ml-2">Unpaid</Badge>;
    default:
      return null;
  }
};

  const canCancelBooking = (status: string) => {
    return status === 'pending';
  };

  // Helper function to get booking title
  const getBookingTitle = (booking: any) => {
    if (!booking) return 'Unknown Item';
    
    if (booking.items && booking.items.length > 1) {
      return `Multi-Item Rental (${booking.items.length} types)`;
    } else if (booking.items && booking.items.length === 1) {
      const item = booking.items[0];
      return item.equipmentName || item.packageName || 'Unknown Item';
    } else if (booking.equipment?.name) {
      return booking.equipment.name;
    }
    return 'Unknown Item';
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin view
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <h1 className="text-4xl font-bold mb-8">My Profile</h1>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Admin Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" type="text" value={user?.role || 'user'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone || ''} />
                  </div>
                  <Button type="submit" variant="hero" className="w-full">
                    Update Profile
                  </Button>
                </form>
                <Separator className="my-6" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage bookings and equipment from the Admin Dashboard
                  </p>
                  <Button variant="outline" onClick={() => navigate('/admin')}>
                    Go to Admin Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // Regular user view
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8">My Profile</h1>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" type="text" value={user?.role || 'user'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone || ''} />
                  </div>
                  <Button type="submit" variant="hero" className="w-full">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Bookings */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  My Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No bookings yet</p>
                    <Button variant="hero" onClick={() => navigate('/equipment')}>
                      Browse Equipment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        
                        {/* Booking Title */}
                        <div className="flex items-start justify-between mb-3">
                          <div className='flex items-center gap-2 flex-wrap'>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">
                              {getBookingTitle(booking)}
                            </h3>
                            {/* Add payment status badge here */}
                              {booking.paymentMethod && (
                                <div className="mt-3 pt-3 border-t">
                                  <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">Payment Method:</p>
                                    <p className="text-sm font-medium">
                                      {booking.paymentMethod === 'gcash' ? 'GCash' : 'Cash on Pickup'}
                                    </p>
                                  </div>
                                  
                                  {booking.paymentMethod === 'gcash' && booking.paymentStatus === 'pending_verification' && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <p className="text-xs text-yellow-800">
                                        ⏳ Your GCash payment is under review. You'll receive a confirmation email once verified.
                                      </p>
                                    </div>
                                  )}
                                  
                                  {booking.paymentMethod === 'gcash' && booking.paymentStatus === 'paid' && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                      <p className="text-xs text-green-800">
                                        ✓ Payment verified! Check your email for the booking receipt.
                                      </p>
                                    </div>
                                  )}
                                  
                                  {booking.paymentMethod === 'gcash' && booking.paymentStatus === 'rejected' && (
                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                      <p className="text-xs text-red-800 font-semibold">
                                        ✗ Payment verification failed. Please contact support.
                                      </p>
                                    </div>
                                  )}
                                  
                                  {booking.proofOfPayment && (
                                    <div className="mt-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(`http://localhost:5000${booking.proofOfPayment}`, '_blank')}
                                      >
                                        View Payment Proof
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            {getPaymentStatusBadge(booking.paymentStatus, booking.paymentMethod)}
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>
                        
                        {/* Display individual items in the booking */}
                        {booking.items && booking.items.length > 0 && (
                          <div className="space-y-2 mb-3">
                            <h4 className="font-medium text-sm">Rented Items:</h4>
                            {booking.items.map((item: any, index: number) => (
                              <div 
                                key={index} 
                                className="flex justify-between text-sm text-muted-foreground pl-2 border-l-2 border-border"
                              >
                                <p className="font-medium">
                                  {item.equipmentName || item.packageName || 'Unknown Item'}
                                </p>
                                <div className="text-right">
                                  <p>x{item.quantity}</p>
                                  {item.type === 'equipment' && item.pricePerDay && (
                                    <p className="text-xs">(₱{item.pricePerDay.toFixed(2)}/day)</p>
                                  )}
                                  {item.type === 'package' && item.packagePrice && (
                                    <p className="text-xs">(₱{item.packagePrice.toFixed(2)} flat)</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <Separator className="my-3" />
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">
                              {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">
                              {booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Quantity</p>
                            <p className="font-medium">
                              {booking.items 
                                ? booking.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
                                : booking.quantity || 0
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-medium">₱{booking.total_price}</p>
                          </div>
                        </div>

                        {booking.additional_payment && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2 text-orange-600">
                              <AlertCircle className="h-4 w-4" />
                              <p className="text-sm font-semibold">
                                Additional Payment: ₱{booking.additional_payment}
                              </p>
                            </div>
                            {booking.issue_notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {booking.issue_notes}
                              </p>
                            )}
                          </div>
                        )}

                        {booking.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground">Notes:</p>
                            <p className="text-sm">{booking.notes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {canCancelBooking(booking.status) && (
                          <div className="mt-4 pt-3 border-t flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setBookingToCancel(booking)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel Booking
                            </Button>
                            <p className="text-xs text-muted-foreground self-center">
                              You can only cancel pending bookings
                            </p>
                          </div>
                        )}

                        {booking.status === 'cancelled' && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-red-500">This booking has been cancelled</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!bookingToCancel} onOpenChange={() => setBookingToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking for 
              <strong> {getBookingTitle(bookingToCancel)}</strong>?
              <br /><br />
              <span className="text-sm text-muted-foreground">
                Date: {bookingToCancel?.start_date && new Date(bookingToCancel.start_date).toLocaleDateString()} - {bookingToCancel?.end_date && new Date(bookingToCancel.end_date).toLocaleDateString()}
              </span>
              <br />
              <span className="text-sm text-muted-foreground">
                Total: ₱{bookingToCancel?.total_price}
              </span>
              <br /><br />
              This action cannot be undone. The equipment will be returned to the available inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelBooking(bookingToCancel?.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Profile;