import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function CalendarComponent() {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: userEntries, isLoading } = useQuery({
    queryKey: ['/api/practice-entries'],
    queryFn: async () => {
      const response = await fetch('/api/practice-entries?limit=100', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch entries');
      return response.json();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add days from previous/next month to fill the grid
  const startDay = monthStart.getDay();
  const endDay = monthEnd.getDay();
  
  for (let i = startDay - 1; i >= 0; i--) {
    const prevDate = new Date(monthStart);
    prevDate.setDate(prevDate.getDate() - (i + 1));
    calendarDays.unshift(prevDate);
  }
  
  for (let i = 1; i <= (6 - endDay); i++) {
    const nextDate = new Date(monthEnd);
    nextDate.setDate(nextDate.getDate() + i);
    calendarDays.push(nextDate);
  }

  const hasEntryForDate = (date: Date) => {
    if (!userEntries) return false;
    const dateString = format(date, 'yyyy-MM-dd');
    const entry = userEntries.find((e: any) => e.date === dateString);
    if (!entry) return false;
    
    const totalMinutes = (entry.meditationMinutes || 0) + (entry.prayerMinutes || 0) + (entry.readingMinutes || 0);
    return totalMinutes > 0;
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const previousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  if (isLoading) {
    return (
      <div className="zen-card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary rounded w-1/2"></div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-8 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="zen-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Calendar</h3>
      
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousMonth}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium text-foreground">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-muted-foreground p-2 font-medium">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const hasPractice = hasEntryForDate(day);
            const isCurrentDay = isToday(day);
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`
                  text-center p-2 rounded zen-transition text-sm font-medium
                  ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                  ${isCurrentDay ? 'bg-accent text-white' : ''}
                  ${hasPractice && !isCurrentDay ? 'bg-success text-white' : ''}
                  ${!hasPractice && !isCurrentDay && isCurrentMonth ? 'text-muted-foreground hover:bg-secondary' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-success rounded mr-2"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-accent rounded mr-2"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
