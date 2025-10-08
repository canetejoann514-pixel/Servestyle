// src/components/AdminCalendarView.tsx
// ✅ Updated to show only confirmed bookings in calendar

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Booking {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  items: any[];
  total_price: number;
  status: string;
  profiles?: {
    full_name: string;
  };
}

interface DayBooking {
  date: Date;
  bookings: Booking[];
}

const AdminCalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayBooking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`);
      const data = await res.json();
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDate = (date: Date): Booking[] => {
    return bookings.filter(booking => {
      // ✅ ONLY show confirmed bookings in calendar
      // Exclude: pending, cancelled, pending_verification, etc.
      if (booking.status !== 'confirmed' && 
          booking.status !== 'in-progress' && 
          booking.status !== 'completed' &&
          booking.status !== 'overdue' &&
          booking.status !== 'returned-with-issues' &&
          booking.status !== 'resolved') {
        return false;
      }
      
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      
      // Reset time to compare only dates
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(0, 0, 0, 0);
      
      return checkDate >= bookingStart && checkDate <= bookingEnd;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'in-progress': return 'bg-purple-500';
      case 'overdue': return 'bg-orange-500';
      case 'returned-with-issues': return 'bg-pink-500';
      case 'resolved': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'overdue': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'returned-with-issues': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'resolved': return 'bg-teal-100 text-teal-800 border-teal-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDayColor = (date: Date): string => {
    const dayBookings = getBookingsForDate(date);
    if (dayBookings.length === 0) return 'bg-white border-gray-200';

    // Priority: overdue > in-progress > confirmed > completed
    const hasOverdue = dayBookings.some(b => b.status === 'overdue');
    const hasInProgress = dayBookings.some(b => b.status === 'in-progress');
    const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');

    if (hasOverdue) return 'bg-orange-100 border-orange-300';
    if (hasInProgress) return 'bg-purple-100 border-purple-300';
    if (hasConfirmed) return 'bg-green-100 border-green-300';
    return 'bg-blue-100 border-blue-300';
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const handleDayClick = (date: Date) => {
    const dayBookings = getBookingsForDate(date);
    if (dayBookings.length > 0) {
      setSelectedDay({ date, bookings: dayBookings });
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100" />);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayBookings = getBookingsForDate(date);
      const dayColor = getDayColor(date);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(date)}
          className={`
            h-24 border p-2 text-left transition-all hover:shadow-md relative
            ${dayColor}
            ${isToday ? 'ring-2 ring-purple-600' : ''}
            ${dayBookings.length > 0 ? 'cursor-pointer' : 'cursor-default'}
          `}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-semibold ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>
              {day}
            </span>
            {dayBookings.length > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {dayBookings.length}
              </Badge>
            )}
          </div>
          
          {dayBookings.length > 0 && (
            <div className="mt-1 space-y-1">
              {dayBookings.slice(0, 2).map((booking, idx) => (
                <div
                  key={idx}
                  className={`text-[10px] px-1.5 py-0.5 rounded truncate ${getStatusBadgeColor(booking.status)}`}
                >
                  {booking.profiles?.full_name || 'Unknown'}
                </div>
              ))}
              {dayBookings.length > 2 && (
                <div className="text-[10px] text-gray-600 font-medium">
                  +{dayBookings.length - 2} more
                </div>
              )}
            </div>
          )}
        </button>
      );
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Booking Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold px-4">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading bookings...</div>
        ) : (
          <>
            {/* Info Alert */}
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This calendar shows only <strong>confirmed and active bookings</strong>. 
                Pending bookings will appear here after payment verification is approved.
              </AlertDescription>
            </Alert>

            {/* Legend */}
            <div className="mb-4 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
                <span>Overdue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                <span>Confirmed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
                <span>Completed</span>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-0 mb-0">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2 bg-gray-50 border border-gray-200">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0">
              {renderCalendar()}
            </div>
          </>
        )}
      </CardContent>

      {/* Day Details Dialog */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bookings for {selectedDay?.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDay?.bookings.map((booking) => (
              <Card key={booking.id} className="border-l-4" style={{ borderLeftColor: getStatusColor(booking.status).replace('bg-', '#') }}>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">
                          {booking.profiles?.full_name || 'Unknown Customer'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Booking ID: {booking.id}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start Date:</span>
                        <p className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End Date:</span>
                        <p className="font-medium">{new Date(booking.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground">Items:</span>
                      <div className="mt-1 space-y-1">
                        {booking.items?.map((item: any, idx: number) => (
                          <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                            <span className="font-medium">{item.equipmentName || item.packageName}</span>
                            <span className="text-muted-foreground"> × {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <p className="text-lg font-bold text-purple-600">₱{booking.total_price}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminCalendarView;