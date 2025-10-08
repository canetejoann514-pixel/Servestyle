// src/components/BookingCalendar.tsx
// ✅ Updated to allow multiple bookings and only show confirmed bookings

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BookingCalendarProps {
  onDateSelect: (startDate: string | null, endDate: string | null) => void;
  selectedStartDate: string | null;
  selectedEndDate: string | null;
}

const BookingCalendar = ({ onDateSelect, selectedStartDate, selectedEndDate }: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [confirmedBookedDates, setConfirmedBookedDates] = useState<string[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfirmedBookedDates();
  }, []);

  const fetchConfirmedBookedDates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`);
      const bookings = await res.json();
      
      // ✅ ONLY show dates that are CONFIRMED (not pending, cancelled, etc.)
      const dates: string[] = [];
      bookings.forEach((booking: any) => {
        // Only consider confirmed bookings for visual reference
        if (booking.status === 'confirmed') {
          const start = new Date(booking.start_date);
          const end = new Date(booking.end_date);
          
          // Add all dates in the range
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toDateString());
          }
        }
      });
      
      setConfirmedBookedDates([...new Set(dates)]); // Remove duplicates
    } catch (error) {
      console.error('Error fetching confirmed booked dates:', error);
    } finally {
      setLoading(false);
    }
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

  const isDateConfirmedBooked = (date: Date) => {
    return confirmedBookedDates.includes(date.toDateString());
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedStartDate) return false;
    
    const dateStr = date.toDateString();
    const startStr = new Date(selectedStartDate).toDateString();
    
    if (!selectedEndDate) {
      return dateStr === startStr;
    }
    
    const endStr = new Date(selectedEndDate).toDateString();
    const current = new Date(date);
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    
    return current >= start && current <= end;
  };

  const isDateInHoverRange = (date: Date) => {
    if (!selectedStartDate || !hoveredDate || selectedEndDate) return false;
    
    const start = new Date(selectedStartDate);
    const hovered = new Date(hoveredDate);
    const current = new Date(date);
    
    if (hovered < start) return false;
    
    return current >= start && current <= hovered;
  };

  const handleDateClick = (date: Date) => {
    // ✅ ONLY block past dates - allow booking on any future date
    if (isDateInPast(date)) return;
    
    // Create a new date with local timezone to avoid UTC conversion issues
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dateString = localDate.toISOString().split('T')[0];
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Starting new selection
      onDateSelect(dateString, null);
    } else {
      // Completing selection
      const start = new Date(selectedStartDate);
      if (localDate < start) {
        // If clicked date is before start, swap them
        onDateSelect(dateString, selectedStartDate);
      } else {
        onDateSelect(selectedStartDate, dateString);
      }
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const hasConfirmedBooking = isDateConfirmedBooked(date);
      const isPast = isDateInPast(date);
      const isSelected = isDateSelected(date);
      const isInHoverRange = isDateInHoverRange(date);
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => setHoveredDate(date)}
          onMouseLeave={() => setHoveredDate(null)}
          disabled={isPast}
          className={`
            h-10 rounded-md text-sm font-medium transition-all relative
            ${isPast 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'hover:bg-purple-100 cursor-pointer'
            }
            ${isSelected 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : ''
            }
            ${isInHoverRange && !isSelected
              ? 'bg-purple-200 text-purple-900'
              : ''
            }
            ${!isPast && !isSelected && !isInHoverRange
              ? 'bg-white hover:bg-purple-50 border border-gray-200'
              : ''
            }
          `}
        >
          {day}
          {/* ✅ Show indicator for confirmed bookings (informational only) */}
          {hasConfirmedBooking && !isSelected && (
            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="w-full bg-white rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={previousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-600" />
          <h3 className="text-base font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading availability...</div>
      ) : (
        <>
          {/* Info Alert */}
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              You can book any available date. Multiple bookings per day are allowed. 
              Blue dots indicate dates with confirmed bookings.
            </AlertDescription>
          </Alert>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-muted-foreground h-6 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded" />
              <span className="text-muted-foreground">Your Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border border-gray-200 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-blue-500 rounded-full" />
              </div>
              <span className="text-muted-foreground">Has Confirmed Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 rounded" />
              <span className="text-muted-foreground">Past Dates</span>
            </div>
          </div>

          {/* Selection info */}
          {selectedStartDate && (
            <div className="mt-3 p-3 bg-purple-50 rounded-md">
              <p className="text-xs font-medium text-purple-900">
                {selectedEndDate 
                  ? `${new Date(selectedStartDate).toLocaleDateString()} - ${new Date(selectedEndDate).toLocaleDateString()}`
                  : `Start: ${new Date(selectedStartDate).toLocaleDateString()} (Click to select end date)`
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookingCalendar;