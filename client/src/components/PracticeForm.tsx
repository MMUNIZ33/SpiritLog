import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { format } from "date-fns";
import { Circle, Heart, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const practiceSchema = z.object({
  date: z.string(),
  meditationMinutes: z.number().min(0).max(1440),
  meditationNotes: z.string().optional(),
  prayerMinutes: z.number().min(0).max(1440),
  prayerNotes: z.string().optional(),
  readingMinutes: z.number().min(0).max(1440),
  readingNotes: z.string().optional(),
});

type PracticeFormData = z.infer<typeof practiceSchema>;

export default function PracticeForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const form = useForm<PracticeFormData>({
    resolver: zodResolver(practiceSchema),
    defaultValues: {
      date: selectedDate,
      meditationMinutes: 0,
      meditationNotes: "",
      prayerMinutes: 0,
      prayerNotes: "",
      readingMinutes: 0,
      readingNotes: "",
    },
  });

  // Load existing entry for today
  const { data: existingEntry, isLoading } = useQuery({
    queryKey: ['/api/practice-entries', selectedDate],
    enabled: !!selectedDate,
  });

  // Update form when existing entry loads
  useState(() => {
    if (existingEntry) {
      form.reset({
        date: existingEntry.date,
        meditationMinutes: existingEntry.meditationMinutes || 0,
        meditationNotes: existingEntry.meditationNotes || "",
        prayerMinutes: existingEntry.prayerMinutes || 0,
        prayerNotes: existingEntry.prayerNotes || "",
        readingMinutes: existingEntry.readingMinutes || 0,
        readingNotes: existingEntry.readingNotes || "",
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PracticeFormData) => {
      await apiRequest('POST', '/api/practice-entries', data);
    },
    onSuccess: () => {
      toast({
        title: "Practice Saved",
        description: "Your spiritual practice has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/practice-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
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
      toast({
        title: "Error",
        description: "Failed to save your practice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PracticeFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="zen-card mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-secondary rounded w-1/3"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background rounded-xl p-4 space-y-3">
                <div className="h-4 bg-secondary rounded w-1/2"></div>
                <div className="h-10 bg-secondary rounded"></div>
                <div className="h-20 bg-secondary rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="zen-card mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-accent" />
          Today's Practice
        </h3>
        <span className="text-sm text-muted-foreground">
          {format(new Date(selectedDate), 'MMMM d, yyyy')}
        </span>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Meditation */}
            <div className="bg-background rounded-xl p-4 hover:bg-secondary zen-transition">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                  <Circle className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-medium text-foreground">Meditation</h4>
              </div>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="meditationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">
                        Duration (minutes)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="bg-card border-secondary rounded-xl focus:border-accent"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meditationNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How did it feel?"
                          className="bg-card border-secondary rounded-xl focus:border-accent h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Prayer */}
            <div className="bg-background rounded-xl p-4 hover:bg-secondary zen-transition">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center mr-3">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-medium text-foreground">Prayer</h4>
              </div>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="prayerMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">
                        Duration (minutes)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="bg-card border-secondary rounded-xl focus:border-accent"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prayerNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What did you pray about?"
                          className="bg-card border-secondary rounded-xl focus:border-accent h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Reading */}
            <div className="bg-background rounded-xl p-4 hover:bg-secondary zen-transition">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-foreground" />
                </div>
                <h4 className="font-medium text-foreground">Reading</h4>
              </div>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="readingMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">
                        Duration (minutes)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="bg-card border-secondary rounded-xl focus:border-accent"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="readingNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What did you read?"
                          className="bg-card border-secondary rounded-xl focus:border-accent h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-xl zen-transition font-medium"
            >
              {saveMutation.isPending ? "Saving..." : "Save Today's Practice"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
