import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Users, Download, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function CommunityFeed() {
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: communityEntries, isLoading } = useQuery({
    queryKey: ['/api/community', today],
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

  const exportToClipboard = () => {
    if (!communityEntries || communityEntries.length === 0) {
      toast({
        title: "No Data",
        description: "No community entries to export.",
        variant: "destructive",
      });
      return;
    }

    const text = communityEntries.map((entry: any) => {
      const name = entry.user.firstName || entry.user.email || 'Anonymous';
      const meditation = entry.meditationMinutes || 0;
      const prayer = entry.prayerMinutes || 0;
      const reading = entry.readingMinutes || 0;
      const total = meditation + prayer + reading;
      
      return `${name}: ${total} min total (🧘 ${meditation}min, 🙏 ${prayer}min, 📖 ${reading}min)`;
    }).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Community data copied to clipboard.",
      });
    });
  };

  const exportToExcel = () => {
    if (!communityEntries || communityEntries.length === 0) {
      toast({
        title: "No Data",
        description: "No community entries to export.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Meditation (min)', 'Prayer (min)', 'Reading (min)', 'Total (min)'];
    const rows = communityEntries.map((entry: any) => {
      const name = entry.user.firstName || entry.user.email || 'Anonymous';
      const meditation = entry.meditationMinutes || 0;
      const prayer = entry.prayerMinutes || 0;
      const reading = entry.readingMinutes || 0;
      const total = meditation + prayer + reading;
      
      return [name, meditation, prayer, reading, total];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `community-practice-${today}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Community data exported as CSV file.",
    });
  };

  if (isLoading) {
    return (
      <div className="zen-card">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-secondary rounded w-1/3"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-secondary rounded w-16"></div>
              <div className="h-8 bg-secondary rounded w-16"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background rounded-xl p-4 space-y-2">
                <div className="h-4 bg-secondary rounded w-1/2"></div>
                <div className="h-3 bg-secondary rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getBorderColor = (index: number) => {
    const colors = ['border-accent', 'border-success', 'border-primary'];
    return colors[index % colors.length];
  };

  return (
    <div className="zen-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center">
          <Users className="w-5 h-5 mr-2 text-accent" />
          Community Today
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="bg-secondary hover:bg-secondary/80 text-foreground border-secondary"
          >
            <Download className="w-4 h-4 mr-1" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToClipboard}
            className="bg-secondary hover:bg-secondary/80 text-foreground border-secondary"
          >
            <Clipboard className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {!communityEntries || communityEntries.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No community entries for today yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to log your practice!
            </p>
          </div>
        ) : (
          communityEntries.map((entry: any, index: number) => {
            const name = entry.user.firstName || entry.user.email || 'Anonymous';
            const meditation = entry.meditationMinutes || 0;
            const prayer = entry.prayerMinutes || 0;
            const reading = entry.readingMinutes || 0;
            const total = meditation + prayer + reading;

            return (
              <div
                key={entry.id}
                className={`bg-background rounded-xl p-4 border-l-4 ${getBorderColor(index)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{name}</span>
                  <span className="text-sm text-muted-foreground">{total} min total</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>🧘 Meditation: {meditation} min</div>
                  <div>🙏 Prayer: {prayer} min</div>
                  <div>📖 Reading: {reading} min</div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {communityEntries && communityEntries.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            className="text-accent hover:text-accent/80 text-sm font-medium"
          >
            View More Entries
          </Button>
        </div>
      )}
    </div>
  );
}
