import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Mail, Lock, User, Building2 } from "lucide-react";
import Logo from "@/components/Logo";

const Signup = () => {
  const { signup, loading } = useAuth();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      setError("");
      await signup(data);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <div className="w-full max-w-md mb-6 animate-fade-in relative z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
      </div>

      {/* Main Content */}
      <Card className="w-full max-w-md p-8 space-y-6 animate-fade-in-up relative z-10 border-0 bg-card/95 backdrop-blur-xl shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Criar Conta
          </h1>
          <p className="text-muted-foreground">
            Comece a gerenciar seu fluxo de caixa
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10 h-12"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 h-12"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-semibold">
              Nome Completo (opcional)
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="João Silva"
                className="pl-10 h-12"
                {...register("fullName")}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-semibold">
              Nome da Empresa (opcional)
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="companyName"
                type="text"
                placeholder="Minha Empresa Ltda"
                className="pl-10 h-12"
                {...register("companyName")}
              />
            </div>
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Criando conta...
              </div>
            ) : (
              "Criar conta gratuita"
            )}
          </Button>
        </form>

        {/* Benefits */}
        <div className="pt-4 space-y-3 border-t border-border">
          <p className="text-sm font-semibold text-foreground">O que você ganha:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-full bg-success/10">
                <Check className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Dashboard completo de fluxo de caixa</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-full bg-success/10">
                <Check className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Projeções inteligentes com IA</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-full bg-success/10">
                <Check className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Alertas antes do caixa zerar</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Fazer login
          </Link>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Seus dados são protegidos e não compartilhamos com terceiros.
        </p>
      </Card>
    </div>
  );
};

export default Signup;
