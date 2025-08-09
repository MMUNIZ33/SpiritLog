import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Sparkles, Zap, BookOpen, Sunrise, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { insertPracticeEntrySchema, type PracticeEntry } from "@shared/schema";

type PracticeFormData = typeof insertPracticeEntrySchema._type;

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [userName, setUserName] = useState("");
  const today = format(new Date(), 'yyyy-MM-dd');

  const form = useForm<PracticeFormData>({
    resolver: zodResolver(insertPracticeEntrySchema),
    defaultValues: {
      userName: "",
      date: today,
      meditation: false,
      prayer: false,
      reading: false,
    },
  });

  // Load existing entry for today if user name is provided
  const { data: existingEntry, isLoading } = useQuery<PracticeEntry>({
    queryKey: ['/api/practice-entries', userName, today],
    enabled: !!userName && userName.length > 0,
    retry: false,
  });

  // Update form when existing entry loads
  useEffect(() => {
    if (existingEntry) {
      form.reset({
        userName: existingEntry.userName,
        date: existingEntry.date,
        meditation: existingEntry.meditation ?? false,
        prayer: existingEntry.prayer ?? false,
        reading: existingEntry.reading ?? false,
      });
    }
  }, [existingEntry, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: PracticeFormData) => {
      await apiRequest('POST', '/api/practice-entries', data);
    },
    onSuccess: () => {
      toast({
        title: "Muito bem! 🙏",
        description: "Sua prática foi registrada. Continue assim!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/practice-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community'] });
      
      // Redirect to community page after saving
      setTimeout(() => {
        setLocation("/community");
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar sua prática. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PracticeFormData) => {
    saveMutation.mutate(data);
  };

  const watchedUserName = form.watch("userName");
  useEffect(() => {
    if (watchedUserName && watchedUserName !== userName) {
      setUserName(watchedUserName);
    }
  }, [watchedUserName, userName]);

  const currentTime = new Date().getHours();
  let greeting = "Bom dia";
  if (currentTime >= 12 && currentTime < 18) greeting = "Boa tarde";
  else if (currentTime >= 18) greeting = "Boa noite";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="bg-card zen-soft-shadow sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Sunrise className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Meu MDO</h1>
            </div>
            <Link href="/community" className="flex items-center space-x-2 text-foreground hover:text-accent zen-transition">
              <Users className="w-5 h-5" />
              <span className="hidden sm:block">Comunidade</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground text-lg">
            Registre seu MDO da semana
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "dd 'de' MMMM 'de' yyyy")}
          </p>
        </div>

        {/* Practice Form */}
        <div className="zen-card">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Input */}
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-foreground">
                      Seu nome
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu nome"
                        className="bg-background border-secondary rounded-xl focus:border-accent text-lg p-4"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Practice Checkboxes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  Marque suas práticas de hoje:
                </h3>

                <FormField
                  control={form.control}
                  name="meditation"
                  render={({ field }) => (
                    <div 
                      className={`flex items-center justify-between rounded-xl p-4 cursor-pointer zen-transition border-2 ${
                        field.value 
                          ? 'bg-accent/20 border-accent text-accent-foreground' 
                          : 'bg-background border-transparent hover:bg-secondary'
                      }`}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center zen-transition ${
                          field.value ? 'bg-accent' : 'bg-accent/60'
                        }`}>
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-base font-medium text-foreground">
                            Meditação
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Contemplação e mindfulness
                          </p>
                        </div>
                      </div>
                      {field.value && (
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <input type="hidden" {...field} value={field.value ? "true" : "false"} />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prayer"
                  render={({ field }) => (
                    <div 
                      className={`flex items-center justify-between rounded-xl p-4 cursor-pointer zen-transition border-2 ${
                        field.value 
                          ? 'bg-primary/20 border-primary text-primary-foreground' 
                          : 'bg-background border-transparent hover:bg-secondary'
                      }`}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center zen-transition ${
                          field.value ? 'bg-primary' : 'bg-primary/60'
                        }`}>
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-base font-medium text-foreground">
                            Oração
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Comunicação com o divino
                          </p>
                        </div>
                      </div>
                      {field.value && (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <input type="hidden" {...field} value={field.value ? "true" : "false"} />
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reading"
                  render={({ field }) => (
                    <div 
                      className={`flex items-center justify-between rounded-xl p-4 cursor-pointer zen-transition border-2 ${
                        field.value 
                          ? 'bg-primary/20 border-primary text-primary-foreground' 
                          : 'bg-background border-transparent hover:bg-secondary'
                      }`}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center zen-transition ${
                          field.value ? 'bg-primary' : 'bg-primary/60'
                        }`}>
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-base font-medium text-foreground">
                            Leitura
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Estudo de textos sagrados
                          </p>
                        </div>
                      </div>
                      {field.value && (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <input type="hidden" {...field} value={field.value ? "true" : "false"} />
                    </div>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={saveMutation.isPending || !form.watch("userName")}
                className="w-full bg-accent hover:bg-accent/90 text-white py-3 rounded-xl text-lg font-medium zen-button-animate"
              >
                {saveMutation.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Inspirational Quote */}
        <div className="zen-card text-center mt-8">
          <div className="w-8 h-8 text-accent mx-auto mb-3">💜</div>
          <blockquote className="text-foreground italic mb-3">
            "Aquietai-vos e sabei que eu sou Deus."
          </blockquote>
          <cite className="text-sm text-muted-foreground">Salmos 46:10</cite>
        </div>
      </div>
    </div>
  );
}