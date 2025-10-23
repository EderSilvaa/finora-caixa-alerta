import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check } from "lucide-react";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !whatsapp.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Cadastro realizado! 🎉",
        description: "A partir de agora, a Finora te avisa antes do aperto.",
      });
      navigate("/success");
    }, 1500);
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-md mb-6 animate-fade-in">
        <button
          onClick={() => navigate("/results")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
      </div>

      {/* Main Content */}
      <Card className="w-full max-w-md p-8 space-y-6 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Últimas informações
          </h1>
          <p className="text-muted-foreground">
            Para te enviar alertas personalizados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              Seu nome
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-foreground font-medium">
              WhatsApp
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="(11) 98765-4321"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
              className="h-12 text-base"
              maxLength={15}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Enviaremos alertas por WhatsApp quando seu caixa precisar de atenção
            </p>
          </div>

          <Button 
            type="submit" 
            variant="gradient" 
            size="lg" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cadastrando..." : "Começar a receber alertas"}
          </Button>
        </form>

        {/* Benefits */}
        <div className="pt-4 space-y-3 border-t border-border">
          <p className="text-sm font-semibold text-foreground">O que você vai receber:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-full bg-success/10">
                <Check className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Alertas antes do caixa zerar</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-full bg-success/10">
                <Check className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Sugestões práticas personalizadas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-full bg-success/10">
                <Check className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Previsões semanais do seu fluxo</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Seus dados são privados e seguros. Não compartilhamos com terceiros.
        </p>
      </Card>
    </div>
  );
};

export default Signup;
