// src/components/CartCheckout.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, XCircle, Upload, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Separator } from "@/components/ui/separator";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BookingCalendar from "@/components/BookingCalendar";

const CartCheckout = () => {
  const { user } = useAuth();
  const {
    cart,
    removeItemFromCart,
    clearCart,
    cartStartDate,
    cartEndDate,
  } = useCart();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "cash">("cash");
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    startDate: cartStartDate || "",
    endDate: cartEndDate || "",
    notes: "",
  });

  // Calculate rental days
  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const rentalDays = calculateDays();

  // Compute total for equipment (per day * days) and packages (flat)
  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      if (item.type === "equipment") {
        return sum + (item.pricePerDay || 0) * item.quantity * rentalDays;
      } else {
        return sum + (item.packagePrice || 0) * item.quantity;
      }
    }, 0);
  };

  const handleDateSelect = (startDate: string | null, endDate: string | null) => {
    setFormData({
      ...formData,
      startDate: startDate || "",
      endDate: endDate || ""
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setProofOfPayment(file);
    }
  };

  // Handle checkout
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to complete checkout.");
      navigate("/auth");
      return;
    }

    if (cart.length === 0 || rentalDays <= 0 || !formData.startDate || !formData.endDate) {
      toast.error("Please add items to your cart and select valid dates.");
      return;
    }

    // Validate GCash payment proof
    if (paymentMethod === "gcash" && !proofOfPayment) {
      toast.error("Please upload proof of GCash payment.");
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    
    // Add basic booking data
    formDataToSend.append("userId", user.id);
    formDataToSend.append("startDate", formData.startDate);
    formDataToSend.append("endDate", formData.endDate);
    formDataToSend.append("notes", formData.notes);
    formDataToSend.append("paymentMethod", paymentMethod);
    formDataToSend.append("totalAmount", calculateTotal().toFixed(2));

    // Add cart items
    const cartItemsPayload = cart.map((item) => {
      if (item.type === "equipment") {
        return {
          type: "equipment",
          equipmentId: String(item.equipmentId),
          quantity: item.quantity,
        };
      } else {
        return {
          type: "package",
          packageId: String(item.packageId),
          quantity: item.quantity,
        };
      }
    });
    formDataToSend.append("cartItems", JSON.stringify(cartItemsPayload));

    // Add proof of payment if GCash
    if (paymentMethod === "gcash" && proofOfPayment) {
      formDataToSend.append("proofOfPayment", proofOfPayment);
    }

    try {
      const res = await fetch("http://localhost:5000/api/book", {
        method: "POST",
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Server error during checkout.");
      }

      const data = await res.json();
      
      if (paymentMethod === "gcash") {
        toast.success("Booking submitted! Payment is pending admin verification. You'll receive a receipt via email once approved.");
      } else {
        toast.success(data.message || "Booking request submitted successfully!");
      }
      
      clearCart();
      navigate("/profile");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Checkout failed. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Complete Your Rental</DialogTitle>
        <DialogDescription>
          Review your items, select rental dates, and complete your booking.
        </DialogDescription>
      </DialogHeader>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT COLUMN - CART ITEMS */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Items in Cart ({cart.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {cart.length === 0 ? (
              <p className="text-muted-foreground">Your cart is empty.</p>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="w-6 justify-center">
                      {item.quantity}
                    </Badge>
                    <div>
                      {item.type === "equipment" ? (
                        <>
                          <p className="font-medium text-sm">{item.equipmentName}</p>
                          <p className="text-xs text-muted-foreground">₱{item.pricePerDay} / day</p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-sm">{item.packageName}</p>
                          <p className="text-xs text-muted-foreground">₱{item.packagePrice} (flat)</p>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeItemFromCart(
                        item.type === "equipment" ? String(item.equipmentId) : String(item.packageId),
                        item.type
                      )
                    }
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - BOOKING FORM */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Rental Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Calendar for date selection */}
            <div className="space-y-2">
              <Label>Select Rental Dates</Label>
              <BookingCalendar
                onDateSelect={handleDateSelect}
                selectedStartDate={formData.startDate}
                selectedEndDate={formData.endDate}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">Cash on Pickup</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Pay when you pick up the items</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="gcash" id="gcash" />
                  <Label htmlFor="gcash" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-blue-600 rounded flex items-center justify-center text-white text-[8px] font-bold">G</div>
                      <span className="font-medium">GCash</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Pay via GCash and upload proof</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* GCash Instructions */}
            {paymentMethod === "gcash" && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">GCash Payment Instructions:</p>
                    <ol className="text-sm space-y-1 ml-4 list-decimal">
                      <li>Send payment to: <strong>09123456789</strong></li>
                      <li>Account Name: <strong>Remrose Rentals</strong></li>
                      <li>Amount: <strong>₱{calculateTotal().toFixed(2)}</strong></li>
                      <li>Take a screenshot of the payment confirmation</li>
                      <li>Upload the screenshot below</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Proof of Payment Upload */}
            {paymentMethod === "gcash" && (
              <div className="space-y-2">
                <Label htmlFor="proofOfPayment">Upload Proof of Payment *</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Input
                    id="proofOfPayment"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="proofOfPayment" className="cursor-pointer">
                    {proofOfPayment ? (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-green-600" />
                        <p className="text-sm font-medium text-green-600">{proofOfPayment.name}</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm">Click to upload screenshot</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </Label>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Special Requirements (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requirements or notes..."
                rows={3}
              />
            </div>

            {/* Summary */}
            {rentalDays > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between text-base mb-2">
                  <span>Rental Days:</span>
                  <span className="font-medium">{rentalDays} {rentalDays === 1 ? "Day" : "Days"}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total Amount:</span>
                  <span className="text-primary">₱{calculateTotal().toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Equipment charged per day × rental duration. Packages are flat-rate.
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={loading || cart.length === 0 || rentalDays <= 0}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {loading ? "Submitting..." : paymentMethod === "gcash" ? "Submit Booking with Payment" : "Proceed to Checkout"}
            </Button>
          </form>
        </div>
      </div>
    </DialogContent>
  );
};

export default CartCheckout;