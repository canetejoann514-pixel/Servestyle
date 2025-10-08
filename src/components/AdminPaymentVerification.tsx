// src/components/AdminPaymentVerification.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Clock, AlertCircle } from "lucide-react";

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
  profiles?: {
    full_name: string;
  };
}

const AdminPaymentVerification = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showProof, setShowProof] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/bookings");
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("All bookings:", data); // Debug log
      
      // Filter bookings with pending GCash payment verification
      const pendingPayments = data.filter(
        (booking: Booking) => {
          const isPending = booking.paymentMethod === "gcash" && 
                           booking.paymentStatus === "pending_verification";
          console.log(`Booking ${booking.id}:`, {
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            isPending
          });
          return isPending;
        }
      );
      
      console.log("Filtered pending payments:", pendingPayments); // Debug log
      setBookings(pendingPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load pending payments");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (bookingId: string, approved: boolean) => {
    if (!approved && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/verify-payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved,
          rejectionReason: !approved ? rejectionReason : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(data.message);
      setSelectedBooking(null);
      setShowProof(false);
      setRejectionReason("");
      fetchPendingPayments(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to verify payment");
    } finally {
      setActionLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending_verification":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending Verification</Badge>;
      case "paid":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "rejected":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading payment verifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>GCash Payment Verification</span>
            <Badge variant="outline" className="ml-2">
              {bookings.length} Pending
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and verify GCash payments from customers
          </p>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No pending payment verifications</p>
              <p className="text-sm text-muted-foreground mt-2">All GCash payments have been processed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.profiles?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(booking.start_date).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">to {new Date(booking.end_date).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.items?.length || 0} item(s)
                      </TableCell>
                      <TableCell className="font-bold">₱{booking.total_price}</TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(booking.paymentStatus || "unknown")}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowProof(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Review Dialog */}
      <Dialog open={showProof} onOpenChange={(open) => {
        setShowProof(open);
        if (!open) {
          setRejectionReason("");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review GCash Payment</DialogTitle>
            <DialogDescription>
              Verify the payment proof and approve or reject the booking
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p><strong>Name:</strong> {selectedBooking.profiles?.full_name}</p>
                <p><strong>Booking ID:</strong> {selectedBooking.id}</p>
                <p><strong>Rental Period:</strong> {new Date(selectedBooking.start_date).toLocaleDateString()} - {new Date(selectedBooking.end_date).toLocaleDateString()}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-2">Rented Items</h3>
                <div className="space-y-2">
                  {selectedBooking.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm border-b pb-2">
                      <span>{item.equipmentName || item.packageName}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">₱{selectedBooking.total_price}</span>
                </div>
              </div>

              {/* Proof of Payment */}
              <div>
                <h3 className="font-semibold mb-2">Proof of Payment</h3>
                {selectedBooking.proofOfPayment ? (
                  <div className="border rounded-lg overflow-hidden bg-muted p-2">
                    <img
                      src={`http://localhost:5000${selectedBooking.proofOfPayment}`}
                      alt="Proof of Payment"
                      className="w-full h-auto max-h-96 object-contain"
                      onError={(e) => {
                        console.error("Image load error:", selectedBooking.proofOfPayment);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 text-center bg-muted">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No proof of payment uploaded</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason (required if rejecting)</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection (e.g., Invalid payment proof, incorrect amount, unclear screenshot)"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowProof(false);
                setRejectionReason("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => verifyPayment(selectedBooking!.id, false)}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {actionLoading ? "Processing..." : "Reject Payment"}
            </Button>
            <Button
              variant="default"
              onClick={() => verifyPayment(selectedBooking!.id, true)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {actionLoading ? "Processing..." : "Approve Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPaymentVerification;