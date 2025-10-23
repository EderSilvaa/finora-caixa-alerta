import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Shield, Sparkles, AlertTriangle, Lightbulb, CheckCircle, ArrowRight, Smartphone, BarChart3, Zap, Brain, Target, Activity, Clock, TrendingDown } from "lucide-react";
import Logo from "@/components/Logo";

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
          <Logo size="md" />

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

      {/* Hero Section - MANTIDO INTACTO */}
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
            Sem cadastro inicial · Resultado em 2 minutos · 100% gratuito
          </p>
        </div>
      </section>

      {/* Features Section - REDESENHADA PREMIUM */}
      <section id="features" className="py-24 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              RECURSOS PRINCIPAIS
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Seu caixa sob controle
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ferramentas inteligentes alimentadas por IA para você nunca mais ser pego de surpresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Feature 1 - Premium */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 group animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-4 relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">Previsão Automática</CardTitle>
                <CardDescription className="text-base">Powered by Machine Learning</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Veja exatamente quando seu dinheiro vai acabar. Nossa IA analisa seu fluxo histórico e projeta as próximas 4 semanas com precisão.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Activity className="w-4 h-4" />
                  <span>Análise preditiva em tempo real</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 - Premium */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl hover:shadow-warning/20 transition-all duration-500 hover:-translate-y-2 group animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-4 relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning/20 to-warning/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">Alertas Inteligentes</CardTitle>
                <CardDescription className="text-base">Prevenção antes do problema</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Receba avisos diretos no WhatsApp antes do seu caixa zerar. Sistema de alertas multicamada que aprende com seu comportamento.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-warning">
                  <Smartphone className="w-4 h-4" />
                  <span>Notificações personalizadas</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 - Premium */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-2xl hover:shadow-success/20 transition-all duration-500 hover:-translate-y-2 group animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-4 relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Brain className="w-8 h-8 text-success" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">Sugestões Práticas</CardTitle>
                <CardDescription className="text-base">Recomendações baseadas em IA</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Dicas automáticas e personalizadas: antecipe recebíveis, otimize custos ou identifique oportunidades de crescimento.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-success">
                  <Target className="w-4 h-4" />
                  <span>Insights acionáveis</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section - REDESENHADA PREMIUM */}
      <section id="how-it-works" className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              PROCESSO SIMPLIFICADO
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Simples em 3 passos
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Não precisa ser expert em finanças. A Finora faz todo o trabalho pesado por você.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-12">
            {/* Step 1 - Premium */}
            <div className="flex flex-col md:flex-row items-center gap-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                  <span className="text-white text-3xl font-bold">1</span>
                </div>
              </div>

              <Card className="flex-1 border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">Informe seus números</CardTitle>
                      <CardDescription className="text-base mt-1">Rápido e intuitivo</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    Receita semanal, despesas fixas e variáveis. São apenas 3 sliders interativos, leva menos de 30 segundos. Interface simples e visual.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Connector Line */}
            <div className="flex justify-center">
              <div className="w-0.5 h-12 bg-gradient-to-b from-primary/50 to-primary/20" />
            </div>

            {/* Step 2 - Premium */}
            <div className="flex flex-col md:flex-row items-center gap-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                  <span className="text-white text-3xl font-bold">2</span>
                </div>
              </div>

              <Card className="flex-1 border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">Veja sua previsão</CardTitle>
                      <CardDescription className="text-base mt-1">Análise instantânea</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    Gráfico claro e interativo mostrando se você vai ficar positivo ou negativo nas próximas semanas. Dados em tempo real com insights acionáveis.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Connector Line */}
            <div className="flex justify-center">
              <div className="w-0.5 h-12 bg-gradient-to-b from-primary/50 to-primary/20" />
            </div>

            {/* Step 3 - Premium */}
            <div className="flex flex-col md:flex-row items-center gap-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                  <span className="text-white text-3xl font-bold">3</span>
                </div>
              </div>

              <Card className="flex-1 border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">Receba alertas inteligentes</CardTitle>
                      <CardDescription className="text-base mt-1">Prevenção proativa</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    A Finora te avisa no WhatsApp antes do aperto financeiro e sugere exatamente o que fazer. Alertas personalizados baseados no seu perfil.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - REDESENHADA PREMIUM */}
      <section id="benefits" className="py-24 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              DIFERENCIAIS
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Por que escolher a Finora?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Feito sob medida para MEIs, autônomos e pequenos negócios que precisam de resultados rápidos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: CheckCircle,
                title: "Zero Burocracia",
                desc: "Sem planilhas complexas, cursos de finanças ou processos complicados. Tudo automatizado.",
                color: "success"
              },
              {
                icon: Shield,
                title: "Dados Seguros",
                desc: "Criptografia de ponta a ponta. Suas informações financeiras são privadas e protegidas.",
                color: "primary"
              },
              {
                icon: Brain,
                title: "IA Inteligente",
                desc: "Machine Learning que aprende com seu histórico para previsões cada vez mais precisas.",
                color: "secondary"
              },
              {
                icon: Zap,
                title: "Alertas Práticos",
                desc: "Notificações instantâneas no WhatsApp quando você mais precisa, com ações sugeridas.",
                color: "warning"
              }
            ].map((benefit, i) => (
              <Card key={i} className="relative overflow-hidden border-0 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`absolute inset-0 bg-gradient-to-br from-${benefit.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardHeader className="pb-4 relative">
                  <div className={`w-14 h-14 rounded-xl bg-${benefit.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                    <benefit.icon className={`w-7 h-7 text-${benefit.color}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Extra Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20">
            {[
              { value: "98%", label: "Taxa de precisão nas previsões" },
              { value: "2min", label: "Tempo médio para primeira análise" },
              { value: "24/7", label: "Monitoramento contínuo do seu caixa" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 hover:border-primary/40 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.1 + 0.4}s` }}>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - REDESENHADA PREMIUM */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden max-w-5xl mx-auto border-0 bg-gradient-to-br from-primary via-primary to-secondary shadow-2xl animate-fade-in-up">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

            <CardContent className="relative p-12 md:p-16 text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4" />
                COMECE AGORA GRATUITAMENTE
              </div>

              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Nunca mais seja pego
                <br />
                de surpresa
              </h2>

              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Comece agora a prever seu caixa com precisão e receba alertas inteligentes antes de faltar dinheiro. É rápido, fácil e 100% gratuito.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-2xl text-lg h-14 px-8"
                  onClick={() => navigate("/connect")}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Simular meu caixa agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm text-lg h-14 px-8"
                  onClick={() => navigate("/dashboard")}
                >
                  Ver exemplo do dashboard
                </Button>
              </div>

              <div className="flex items-center justify-center gap-8 pt-4 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Sem compromisso</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Resultado instantâneo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer - REDESENHADO PREMIUM */}
      <footer className="relative z-10 border-t border-border/40 bg-muted/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <Logo size="md" />
              <p className="text-muted-foreground leading-relaxed max-w-md">
                A Finora é o copiloto financeiro alimentado por IA que prevê problemas de caixa antes que eles aconteçam. Feito para empreendedores que precisam de respostas rápidas.
              </p>
              <div className="flex gap-4 pt-2">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  WhatsApp
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  Instagram
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  LinkedIn
                </Button>
              </div>
            </div>

            {/* Links Column 1 */}
            <div className="space-y-4">
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Produto</h4>
              <div className="space-y-3">
                <button onClick={() => scrollToSection('features')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Recursos
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Como Funciona
                </button>
                <button onClick={() => navigate("/dashboard")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard Demo
                </button>
                <button className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Preços
                </button>
              </div>
            </div>

            {/* Links Column 2 */}
            <div className="space-y-4">
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Empresa</h4>
              <div className="space-y-3">
                <button className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sobre Nós
                </button>
                <button className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </button>
                <button className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </button>
                <button className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Suporte
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Finora Finanças. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">Privacidade</button>
              <button className="hover:text-foreground transition-colors">Termos de Uso</button>
              <button className="hover:text-foreground transition-colors">Política de Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
