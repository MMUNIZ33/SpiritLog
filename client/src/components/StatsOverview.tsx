import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function StatsOverview() {
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
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

  const { data: recentEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ['/api/practice-entries'],
    queryFn: async () => {
      const response = await fetch('/api/practice-entries?limit=7', {
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

  if (isLoading) {
    return (
      <div className="zen-card">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-secondary rounded w-1/4"></div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-2">
                <div className="h-8 bg-secondary rounded w-12 mx-auto"></div>
                <div className="h-4 bg-secondary rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate weekly data from recent entries
  const weekData = [];
  const today = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const entry = recentEntries?.find((e: any) => e.date === dateString);
    const totalMinutes = entry 
      ? (entry.meditationMinutes || 0) + (entry.prayerMinutes || 0) + (entry.readingMinutes || 0)
      : 0;
      
    weekData.push({
      day: daysOfWeek[date.getDay()],
      minutes: totalMinutes,
      isToday: i === 0,
    });
  }

  const maxMinutes = Math.max(...weekData.map(d => d.minutes), 1);

  return (
    <div className="zen-card">
      <h3 className="text-xl font-semibold text-foreground mb-6">Your Journey</h3>
      
      <div className="grid sm:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-accent mb-1">
            {stats?.currentStreak || 0}
          </div>
          <div className="text-sm text-muted-foreground">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-success mb-1">
            {stats?.monthlyTotal || 0}
          </div>
          <div className="text-sm text-muted-foreground">Minutes This Month</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground mb-1">
            {stats?.bestStreak || 0}
          </div>
          <div className="text-sm text-muted-foreground">Best Streak</div>
        </div>
      </div>
      
      {/* Weekly Progress */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">This Week's Progress</h4>
        <div className="flex space-x-2">
          {weekData.map((day, index) => (
            <div key={index} className="flex-1 space-y-1">
              <div className="text-xs text-muted-foreground text-center">{day.day}</div>
              <div 
                className={`${
                  day.isToday ? 'bg-accent' : day.minutes > 0 ? 'bg-success' : 'bg-background border-2 border-dashed border-secondary'
                } rounded-xl`}
                style={{ 
                  height: day.minutes > 0 ? `${Math.max((day.minutes / maxMinutes) * 48, 8)}px` : '32px' 
                }}
              ></div>
              <div className={`text-xs text-center ${day.minutes > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {day.minutes > 0 ? day.minutes : '--'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
