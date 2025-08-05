import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Circle, Heart, BookOpen, Users, Calendar, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-card zen-soft-shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Sunrise className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">My Daily Office</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-xl"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Track Your Spiritual Journey
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            My Daily Office helps you maintain consistent spiritual practices through meditation, prayer, and reading. 
            Connect with a community of seekers on the same path.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-xl text-lg"
          >
            Begin Your Practice
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="zen-card hover:bg-secondary zen-transition">
            <CardHeader>
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
                <Circle className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold">Daily Practice</CardTitle>
              <CardDescription className="text-muted-foreground">
                Log your meditation, prayer, and reading time with personal notes and reflections.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="zen-card hover:bg-secondary zen-transition">
            <CardHeader>
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold">Track Progress</CardTitle>
              <CardDescription className="text-muted-foreground">
                Monitor your streaks, view monthly summaries, and celebrate your spiritual growth.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="zen-card hover:bg-secondary zen-transition">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold">Community</CardTitle>
              <CardDescription className="text-muted-foreground">
                See how others are practicing and find inspiration in the shared journey.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Practice Types */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Circle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Meditation</h3>
            <p className="text-muted-foreground">
              Quiet contemplation and mindfulness practice to center your spirit.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Prayer</h3>
            <p className="text-muted-foreground">
              Communicate with the divine through gratitude, petition, and worship.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Reading</h3>
            <p className="text-muted-foreground">
              Study sacred texts and spiritual literature for wisdom and guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            Begin your spiritual practice journey today.
          </p>
        </div>
      </footer>
    </div>
  );
}
