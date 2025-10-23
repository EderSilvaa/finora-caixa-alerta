import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, ArrowRight, Shield, Building2, Target, Bell } from "lucide-react";

const ConnectAccounts = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    businessType: "",
    goal: "",
    alertPreference: ""
  });

  const banks = [
    { name: "Itaú", logo: "🏦" },
    { name: "Nubank", logo: "💜" },
    { name: "Santander", logo: "🔴" },
    { name: "Caixa", logo: "🔵" },
    { name: "Bradesco", logo: "🔴" },
    { name: "Banco do Brasil", logo: "🟡" }
  ];

  const handleConnect = () => {
    setStep(2);
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  const progressValue = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/src/assets/logo_finora.jpg" alt="Finora" className="h-8 w-8 rounded-full" />
            <span className="text-xl font-bold text-primary-foreground">Finora</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Etapa {step} de 3</span>
            <div className="w-32">
              <Progress value={progressValue} className="h-2" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {step === 1 && (
          <div className="animate-fade-in space-y-8">
            {/* Main card */}
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">
                    Conecte suas contas com segurança através do Open Finance
                  </h1>
                </div>

                <p className="text-muted-foreground text-lg">
                  A Finora usa a infraestrutura oficial do Banco Central para ler seus dados financeiros — 
                  <span className="text-foreground font-medium"> sem guardar senhas, sem risco de acesso indevido.</span>
                </p>

                {/* Banks grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 py-6">
                  {banks.map((bank, index) => (
                    <div 
                      key={bank.name}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-all hover:scale-105 cursor-pointer"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="text-3xl">{bank.logo}</span>
                      <span className="text-xs text-muted-foreground text-center">{bank.name}</span>
                    </div>
                  ))}
                </div>

                {/* Authorization button */}
                <Button 
                  onClick={handleConnect}
                  size="lg"
                  className="w-full text-lg h-14 bg-gradient-primary hover:scale-105 transition-transform"
                >
                  <Lock className="mr-2 w-5 h-5" />
                  Autorizar conexão segura
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <a href="#" className="text-primary hover:underline">
                    Saiba mais sobre como protegemos seus dados
                  </a>
                </p>
              </div>
            </Card>

            {/* Security features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: "Criptografia bancária", desc: "Mesmo padrão dos bancos" },
                { icon: Lock, title: "Sem guardar senhas", desc: "Acesso via Open Finance" },
                { icon: Building2, title: "Regulado pelo BC", desc: "Infraestrutura oficial" }
              ].map((feature, index) => (
                <Card key={index} className="p-4 bg-card/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all">
                  <feature.icon className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4">
                    <Shield className="w-8 h-8 text-success" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Conexão autorizada com sucesso!
                  </h2>
                  <p className="text-muted-foreground">
                    Agora vamos personalizar sua experiência
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Question 1 */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-base">
                      <Building2 className="w-4 h-4 text-primary" />
                      Você é MEI, autônomo ou empresa?
                    </Label>
                    <Select onValueChange={(value) => setProfile({...profile, businessType: value})}>
                      <SelectTrigger className="h-12 bg-secondary/20">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-primary/20">
                        <SelectItem value="mei">MEI</SelectItem>
                        <SelectItem value="autonomo">Autônomo</SelectItem>
                        <SelectItem value="empresa">Empresa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question 2 */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-base">
                      <Target className="w-4 h-4 text-primary" />
                      Qual sua principal meta financeira?
                    </Label>
                    <Select onValueChange={(value) => setProfile({...profile, goal: value})}>
                      <SelectTrigger className="h-12 bg-secondary/20">
                        <SelectValue placeholder="Selecione sua meta" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-primary/20">
                        <SelectItem value="dividas">Reduzir dívidas</SelectItem>
                        <SelectItem value="fluxo">Manter fluxo de caixa</SelectItem>
                        <SelectItem value="investir">Investir no negócio</SelectItem>
                        <SelectItem value="crescer">Crescer a empresa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question 3 */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-base">
                      <Bell className="w-4 h-4 text-primary" />
                      Como você prefere receber alertas?
                    </Label>
                    <Select onValueChange={(value) => setProfile({...profile, alertPreference: value})}>
                      <SelectTrigger className="h-12 bg-secondary/20">
                        <SelectValue placeholder="Escolha o canal" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-primary/20">
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="app">Notificações no app</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleContinue}
                  size="lg"
                  disabled={!profile.businessType || !profile.goal || !profile.alertPreference}
                  className="w-full text-lg h-14 bg-gradient-primary hover:scale-105 transition-transform mt-8"
                >
                  Continuar para o seu dashboard preditivo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground text-sm">
          ✨ Transparência e controle em cada dado. Essa é a Finora.
        </p>
      </footer>
    </div>
  );
};

export default ConnectAccounts;
