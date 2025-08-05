import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Users, Sunrise, ArrowLeft, Download, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Community() {
  const { toast } = useToast();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: communityEntries, isLoading } = useQuery({
    queryKey: ['/api/community', today],
  });

  const exportToClipboard = () => {
    if (!communityEntries || communityEntries.length === 0) {
      toast({
        title: "Sem Dados",
        description: "Não há registros da comunidade para exportar.",
        variant: "destructive",
      });
      return;
    }

    const text = communityEntries.map((entry: any) => {
      const practices = [];
      if (entry.meditation) practices.push("🧘 Meditação");
      if (entry.prayer) practices.push("🙏 Oração");
      if (entry.reading) practices.push("📖 Leitura");
      
      return `${entry.userName}: ${practices.join(", ") || "Nenhuma prática"}`;
    }).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado!",
        description: "Dados da comunidade copiados para a área de transferência.",
      });
    });
  };

  const exportToExcel = () => {
    if (!communityEntries || communityEntries.length === 0) {
      toast({
        title: "Sem Dados",
        description: "Não há registros da comunidade para exportar.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ['Nome', 'Meditação', 'Oração', 'Leitura'];
    const rows = communityEntries.map((entry: any) => [
      entry.userName,
      entry.meditation ? 'Sim' : 'Não',
      entry.prayer ? 'Sim' : 'Não',
      entry.reading ? 'Sim' : 'Não'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comunidade-pratica-${today}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Baixado!",
      description: "Dados da comunidade exportados como arquivo CSV.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <nav className="bg-card zen-soft-shadow sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 zen-transition">
                <ArrowLeft className="w-5 h-5 text-foreground" />
                <span>Voltar</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">Comunidade</h1>
              </div>
              <div className="w-20"></div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="bg-card zen-soft-shadow sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 zen-transition">
              <ArrowLeft className="w-5 h-5 text-foreground" />
              <span>Voltar</span>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Comunidade</h1>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Comunidade Hoje
          </h2>
          <p className="text-muted-foreground text-lg">
            Veja como outros estão praticando
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "dd 'de' MMMM 'de' yyyy")}
          </p>
        </div>

        {/* Community Feed */}
        <div className="zen-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              Práticas de Hoje
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className="bg-secondary hover:bg-secondary/80 text-foreground border-secondary"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToClipboard}
                className="bg-secondary hover:bg-secondary/80 text-foreground border-secondary"
              >
                <Clipboard className="w-4 h-4 mr-1" />
                Copiar
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {!communityEntries || communityEntries.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma prática registrada hoje ainda.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Seja o primeiro a registrar sua prática!
                </p>
              </div>
            ) : (
              communityEntries.map((entry: any, index: number) => {
                const practices = [];
                if (entry.meditation) practices.push({ icon: "🧘", name: "Meditação", color: "accent" });
                if (entry.prayer) practices.push({ icon: "🙏", name: "Oração", color: "success" });
                if (entry.reading) practices.push({ icon: "📖", name: "Leitura", color: "primary" });

                const getBorderColor = (index: number) => {
                  const colors = ['border-accent', 'border-success', 'border-primary'];
                  return colors[index % colors.length];
                };

                return (
                  <div
                    key={entry.id}
                    className={`bg-background rounded-xl p-4 border-l-4 ${getBorderColor(index)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{entry.userName}</span>
                      <span className="text-sm text-muted-foreground">
                        {practices.length} {practices.length === 1 ? 'prática' : 'práticas'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {practices.length > 0 ? (
                        practices.map((practice, i) => (
                          <div key={i}>{practice.icon} {practice.name}</div>
                        ))
                      ) : (
                        <div className="text-muted-foreground italic">Nenhuma prática registrada</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="zen-card text-center mt-8">
          <div className="w-8 h-8 text-accent mx-auto mb-3">🌟</div>
          <blockquote className="text-foreground italic mb-3">
            "Onde dois ou três estiverem reunidos em meu nome, aí estou eu no meio deles."
          </blockquote>
          <cite className="text-sm text-muted-foreground">Mateus 18:20</cite>
        </div>
      </div>
    </div>
  );
}