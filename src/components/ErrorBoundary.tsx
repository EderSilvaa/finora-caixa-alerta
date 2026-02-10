import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-center">
                    <div className="p-4 rounded-full bg-destructive/10 mb-4">
                        <AlertTriangle className="w-12 h-12 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Desculpe, ocorreu um erro inesperado. Tente recarregar a página.
                    </p>
                    {this.state.error && (
                        <pre className="text-xs text-left bg-muted p-4 rounded mb-6 max-w-md overflow-auto whitespace-pre-wrap">
                            {this.state.error.toString()}
                        </pre>
                    )}
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => window.location.href = '/'}>
                            Voltar ao Início
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Recarregar
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
