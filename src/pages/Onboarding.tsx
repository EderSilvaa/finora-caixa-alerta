import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Shield, Sparkles, AlertTriangle, Lightbulb, CheckCircle, ArrowRight, Smartphone, BarChart3 } from "lucide-react";
import logo from "@/assets/logo_finora.jpg";

const Onboarding = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-glow/10 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary/20 rounded-lg rotate-12 animate-[spin_20s_linear_infinite]" />
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-secondary/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        <div className="absolute bottom-32 right-40 w-40 h-40 border-2 border-primary-glow/20 rounded-xl rotate-45 animate-[spin_25s_linear_infinite]" />
        <div className="absolute bottom-20 left-1/4 w-28 h-28 border-2 border-accent/20 rounded-full animate-[spin_18s_linear_infinite_reverse]" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />
      </div>

      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <img src={logo} alt="Finora Finanças" className="h-10 w-auto" />
          
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </button>
            <button onClick={() => scrollToSection('benefits')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Benefícios
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            <Button 
              variant="gradient" 
              onClick={() => navigate("/connect")}
              className="shadow-glow"
            >
              Começar grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Previsão inteligente de caixa
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Preveja seu caixa
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              antes do aperto
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            A Finora te avisa quando seu caixa pode zerar e sugere exatamente o que fazer. 
            Um copiloto financeiro, não um banco.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              variant="gradient" 
              size="lg" 
              onClick={() => navigate("/connect")}
              className="shadow-glow text-lg"
            >
              Simular gratuitamente
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => scrollToSection('how-it-works')}
              className="text-lg"
            >
              Como funciona
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            ✓ Sem cadastro inicial · ✓ Resultado em 2 minutos · ✓ 100% gratuito
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Seu caixa sob controle
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ferramentas inteligentes para você nunca mais ser pego de surpresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 space-y-4 hover:shadow-glow transition-all duration-300 border-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="p-3 rounded-xl bg-gradient-primary w-fit">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Previsão automática</h3>
              <p className="text-muted-foreground">
                Veja exatamente quando seu dinheiro vai acabar. A Finora analisa seu fluxo e projeta as próximas 4 semanas.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover:shadow-glow transition-all duration-300 border-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="p-3 rounded-xl bg-gradient-primary w-fit">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Alertas inteligentes</h3>
              <p className="text-muted-foreground">
                Receba avisos no WhatsApp antes do seu caixa zerar. Sem surpresas, só prevenção.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover:shadow-glow transition-all duration-300 border-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="p-3 rounded-xl bg-gradient-primary w-fit">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Sugestões práticas</h3>
              <p className="text-muted-foreground">
                Dicas automáticas e personalizadas: antecipe recebíveis, reduza custos ou aumente a receita.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Simples em 3 passos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Não precisa ser expert em finanças. A Finora faz tudo por você.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-glow">
                1
              </div>
              <Card className="flex-1 p-8 border-2">
                <div className="flex items-start gap-4">
                  <BarChart3 className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Informe seus números</h3>
                    <p className="text-muted-foreground">
                      Receita semanal, despesas fixas e variáveis. São só 3 sliders, leva 30 segundos.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-glow">
                2
              </div>
              <Card className="flex-1 p-8 border-2">
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Veja sua previsão</h3>
                    <p className="text-muted-foreground">
                      Gráfico claro mostrando se você vai ficar positivo ou negativo nas próximas semanas.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-glow">
                3
              </div>
              <Card className="flex-1 p-8 border-2">
                <div className="flex items-start gap-4">
                  <Smartphone className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Receba alertas no WhatsApp</h3>
                    <p className="text-muted-foreground">
                      A Finora te avisa antes do aperto e sugere exatamente o que fazer.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Por que escolher a Finora?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Feito para MEIs, autônomos e pequenos negócios que não têm tempo a perder
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: CheckCircle, title: "Zero burocracia", desc: "Sem planilhas complexas ou cursos de finanças" },
              { icon: Shield, title: "Dados seguros", desc: "Suas informações são privadas e protegidas" },
              { icon: Sparkles, title: "IA inteligente", desc: "Previsões e sugestões automáticas personalizadas" },
              { icon: Smartphone, title: "Alertas práticos", desc: "Avisos diretos no WhatsApp quando precisar" }
            ].map((benefit, i) => (
              <Card key={i} className="p-6 flex items-start gap-4 hover:shadow-soft transition-all animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-12 bg-gradient-primary text-center space-y-6 shadow-glow animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Nunca mais seja pego de surpresa
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Comece agora a prever seu caixa e receba alertas antes de faltar dinheiro.
              É rápido, fácil e gratuito.
            </p>
            <div className="pt-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 border-white text-lg"
                onClick={() => navigate("/connect")}
              >
                Simular meu caixa agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-white/80">
              Sem cartão de crédito · Sem compromisso · Resultado instantâneo
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Finora" className="h-8 w-auto" />
              <p className="text-sm text-muted-foreground">
                © 2025 Finora Finanças. Um copiloto financeiro para seu negócio.
              </p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Privacidade</button>
              <button className="hover:text-foreground transition-colors">Termos</button>
              <button className="hover:text-foreground transition-colors">Contato</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
