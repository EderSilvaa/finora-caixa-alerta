# Finora - Caixa Alerta

<div align="center">

  ![Finora Logo](https://img.shields.io/badge/Finora-Caixa%20Alerta-6366f1?style=for-the-badge)

  **Plataforma inteligente de gestão e previsão de fluxo de caixa com IA**

  [Demo](#) • [Documentação](#) • [Reportar Bug](https://github.com/seu-usuario/finora-caixa-alerta/issues) • [Solicitar Feature](https://github.com/seu-usuario/finora-caixa-alerta/issues)

</div>

---

## Sobre o Projeto

**Finora - Caixa Alerta** é uma plataforma de gestão financeira empresarial que utiliza inteligência artificial para prever o fluxo de caixa, identificar padrões de despesas e receitas, e fornecer insights acionáveis para evitar problemas de liquidez.

### Principais Funcionalidades

- **🤖 Previsão com Machine Learning**: Projeções avançadas usando Regressão Linear, EMA, Detecção de Padrões Recorrentes e Análise de Sazonalidade
- **📊 Períodos Personalizáveis**: Escolha entre projeções de 30, 60 ou 120 dias
- **🔔 Alertas Inteligentes**: Sistema completo de notificações push (PWA) para eventos financeiros críticos
- **🏦 Open Finance Brasil**: Integração com Pluggy para sincronização automática de transações bancárias
- **👤 Perfil de Usuário**: Sistema completo com upload de avatar e informações pessoais
- **📱 PWA Otimizado**: Performance mobile otimizada com cache inteligente e Service Worker
- **📄 Exportação PDF**: Relatórios completos com análises de IA, gráficos e recomendações
- **💡 Análise com IA Persistente**: Insights salvos no banco de dados, reutilizáveis e históricos
- **🎯 Metas Financeiras Inteligentes**: Criação e acompanhamento de objetivos com sugestões da IA
- **⚡ Dashboard Premium**: Visualização em tempo real de KPIs com gráficos interativos
- **🔄 Sincronização Automática**: Auto-sync de transações bancárias a cada 6 horas
- **🎨 Design Responsivo**: Interface otimizada para desktop e mobile com gradientes preservados

---

## Screenshots

### Dashboard Premium
> Visualização completa de KPIs, gráficos de projeção e insights de IA

### Análise de IA
> Insights detalhados e recomendações personalizadas baseadas em machine learning

### Simulador de Fluxo
> Ferramenta interativa para testar diferentes cenários financeiros

---

## Tecnologias

Este projeto foi construído com tecnologias modernas e robustas:

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática e segurança de código
- **Vite** - Build tool ultra-rápido
- **React Router DOM** - Navegação e rotas
- **TanStack Query** - Gerenciamento de estado assíncrono

### Backend & Database
- **Supabase** - Backend as a Service (PostgreSQL + Auth + Storage + Realtime)
- **Supabase Auth** - Autenticação segura de usuários
- **Supabase Storage** - Armazenamento de avatares e arquivos
- **Row Level Security (RLS)** - Políticas de segurança em nível de linha

### Integrações
- **Pluggy** - Open Finance Brasil para conexão bancária
- **OpenAI API** - Análise inteligente com GPT-4
- **Workbox** - Service Worker e cache para PWA

### UI/UX
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes acessíveis e customizáveis
- **Radix UI** - Primitivos de UI headless
- **Lucide React** - Ícones modernos
- **Recharts** - Gráficos e visualizações de dados
- **jsPDF** - Geração de relatórios PDF

### Formulários e Validação
- **React Hook Form** - Gerenciamento de formulários performático
- **Zod** - Validação de schemas TypeScript-first

### Machine Learning & Análise
- **Regressão Linear** - Análise de tendências históricas
- **EMA (Exponential Moving Average)** - Ponderação de dados recentes
- **Detecção de Padrões** - Identificação de transações recorrentes
- **Análise de Sazonalidade** - Identificação de padrões mensais

---

## Começando

### Pré-requisitos

Certifique-se de ter instalado:
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**

Recomendamos o uso do [nvm](https://github.com/nvm-sh/nvm) para gerenciar versões do Node.js:

```bash
# Instalar nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar versão LTS do Node
nvm install --lts
nvm use --lts
```

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/finora-caixa-alerta.git
cd finora-caixa-alerta
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

4. **Acesse a aplicação**

Abra [http://localhost:5173](http://localhost:5173) no seu navegador

---

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build de produção
npm run build:dev    # Build de desenvolvimento

# Qualidade de Código
npm run lint         # Executa ESLint

# Preview
npm run preview      # Preview do build de produção
```

---

## Estrutura do Projeto

```
finora-caixa-alerta/
├── src/
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes de UI (shadcn)
│   │   ├── Logo.tsx      # Componente de logo
│   │   └── BankLogos.tsx # Logos de bancos
│   ├── pages/            # Páginas da aplicação
│   │   ├── Index.tsx     # Página inicial
│   │   ├── Dashboard.tsx # Dashboard principal
│   │   ├── Simulator.tsx # Simulador de fluxo
│   │   ├── Results.tsx   # Resultados da simulação
│   │   ├── Onboarding.tsx    # Onboarding de usuários
│   │   ├── ConnectAccounts.tsx # Conexão de contas
│   │   └── ...
│   ├── hooks/            # React hooks customizados
│   ├── lib/              # Utilitários e helpers
│   ├── App.tsx           # Componente raiz
│   └── main.tsx          # Entry point
├── public/               # Assets estáticos
├── package.json          # Dependências e scripts
├── tsconfig.json         # Configuração TypeScript
├── tailwind.config.ts    # Configuração Tailwind
├── vite.config.ts        # Configuração Vite
└── README.md             # Este arquivo
```

---

## Funcionalidades Detalhadas

### Dashboard Financeiro
- KPIs em tempo real (Saldo Atual, Receita Mensal, Despesas, Economia)
- Gráfico de projeção de caixa com linha do tempo
- Comparativo de Receitas vs Despesas (6 meses)
- Feed de transações recentes
- Metas financeiras com barras de progresso

### Análise de IA
- Identificação automática de padrões de gastos
- Detecção de oportunidades de economia
- Análise de risco de fluxo de caixa
- Previsões baseadas em sazonalidade
- Recomendações acionáveis personalizadas

### Simulador
- Ajuste interativo de receitas semanais
- Configuração de despesas fixas e variáveis
- Cálculo instantâneo de saldo projetado
- Visualização de cenários "e se?"

### Gestão de Transações
- Registro rápido de receitas e despesas
- Categorização automática
- Histórico completo de movimentações
- Atualização em tempo real do saldo

---

## Customização

### Temas
O projeto suporta temas personalizados através do Tailwind CSS. Para customizar cores e estilos:

1. Edite `tailwind.config.ts`
2. Modifique variáveis CSS em `src/index.css`

### Componentes
Os componentes UI podem ser customizados individualmente em `src/components/ui/`

---

## Deploy

### Build de Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

### Deploy Recomendado

O projeto está otimizado para deploy em:
- **Vercel** (recomendado)
- **Netlify**
- **Cloudflare Pages**
- Qualquer hosting de sites estáticos

#### Deploy na Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy
vercel
```

---

## Roadmap

- [ ] Integração com APIs bancárias (Open Banking)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Notificações push e email
- [ ] App mobile (React Native)
- [ ] Análise preditiva avançada com ML
- [ ] Multi-empresa e multi-usuário
- [ ] Integração com contabilidade
- [ ] Dashboard de investimentos

---

## Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Convenção de Commits

Este projeto segue [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` mudanças na documentação
- `style:` formatação, ponto e vírgula, etc
- `refactor:` refatoração de código
- `test:` adição de testes
- `chore:` atualização de ferramentas, configurações

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## Contato

**Insta** - [@finorasolucoes]

Link do Projeto: [https://github.com/seu-usuario/finora-caixa-alerta](https://github.com/seu-usuario/finora-caixa-alerta)

---

## Agradecimentos

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Recharts](https://recharts.org/)

---

<div align="center">

  **Feito com ❤️ e TypeScript**

  Se este projeto foi útil, considere dar uma ⭐!

</div>
