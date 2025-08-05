import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import PracticeForm from "@/components/PracticeForm";
import StatsOverview from "@/components/StatsOverview";
import CommunityFeed from "@/components/CommunityFeed";
import CalendarComponent from "@/components/CalendarComponent";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your spiritual practice...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentTime = new Date().getHours();
  let greeting = "Good morning";
  if (currentTime >= 12 && currentTime < 17) greeting = "Good afternoon";
  else if (currentTime >= 17) greeting = "Good evening";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {greeting}, {user.firstName || "friend"}
          </h2>
          <p className="text-secondary text-lg">How was your spiritual practice today?</p>
        </div>

        {/* Today's Practice Entry */}
        <PracticeForm />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats and Community */}
          <div className="lg:col-span-2 space-y-8">
            <StatsOverview />
            <CommunityFeed />
          </div>
          
          {/* Calendar Sidebar */}
          <div className="space-y-6">
            <CalendarComponent />
            
            {/* Quick Actions */}
            <div className="zen-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-background hover:bg-secondary text-foreground px-4 py-3 rounded-xl zen-transition text-left flex items-center">
                  <span className="w-4 h-4 mr-3 text-accent">📅</span>
                  View Week
                </button>
                <button className="w-full bg-background hover:bg-secondary text-foreground px-4 py-3 rounded-xl zen-transition text-left flex items-center">
                  <span className="w-4 h-4 mr-3 text-accent">📊</span>
                  View Month
                </button>
                <button className="w-full bg-background hover:bg-secondary text-foreground px-4 py-3 rounded-xl zen-transition text-left flex items-center">
                  <span className="w-4 h-4 mr-3 text-accent">💾</span>
                  Export Data
                </button>
              </div>
            </div>
            
            {/* Inspirational Quote */}
            <div className="zen-card text-center">
              <div className="w-8 h-8 text-accent mx-auto mb-3">❤️</div>
              <blockquote className="text-foreground italic mb-3">
                "Be still and know that I am God."
              </blockquote>
              <cite className="text-sm text-muted-foreground">Psalm 46:10</cite>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
