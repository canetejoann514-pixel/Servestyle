import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';

interface BookingFormProps {
  equipmentId: string;
  equipmentName: string;
  pricePerDay: number;
  onSuccess?: () => void;
}

const BookingForm = ({ equipmentId, equipmentName, pricePerDay, onSuccess }: BookingFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    startDate: '',
    endDate: '',
    notes: '',
  });

  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return days * pricePerDay * formData.quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to book equipment');
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const totalPrice = calculateTotal();
      
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        equipment_id: equipmentId,
        quantity: formData.quantity,
        start_date: formData.startDate,
        end_date: formData.endDate,
        total_price: totalPrice,
        notes: formData.notes,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Booking request submitted successfully!');
      setFormData({ quantity: 1, startDate: '', endDate: '', notes: '' });
      onSuccess?.();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Book {equipmentName}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          ${pricePerDay.toFixed(2)} per day
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            min={formData.startDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>

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

      {formData.startDate && formData.endDate && (
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      )}

      <Button type="submit" variant="hero" className="w-full" disabled={loading}>
        <Calendar className="mr-2 h-4 w-4" />
        {loading ? 'Submitting...' : 'Submit Booking Request'}
      </Button>
    </form>
  );
};

export default BookingForm;
