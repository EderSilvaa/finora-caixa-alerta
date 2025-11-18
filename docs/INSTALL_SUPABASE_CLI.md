# Instalação e Configuração do Supabase CLI

## Opção 1: Instalação via Scoop (Recomendado para Windows)

### 1. Instalar Scoop (se não tiver)
```powershell
# No PowerShell (como Administrador)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### 2. Instalar Supabase CLI
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 3. Verificar instalação
```bash
supabase --version
```

---

## Opção 2: Instalação via NPM (Alternativa)

```bash
npm install -g supabase
```

Verificar:
```bash
supabase --version
```

---

## Opção 3: Download Direto (Mais Simples)

1. Baixe o executável: https://github.com/supabase/cli/releases/latest
2. Procure por `supabase_windows_amd64.exe`
3. Baixe e renomeie para `supabase.exe`
4. Mova para uma pasta no PATH (ex: `C:\Windows\System32\`)

---

## Configuração Inicial

### 1. Fazer Login no Supabase

```bash
supabase login
```

Isso vai abrir o navegador para você fazer login. Após login, um token será salvo automaticamente.

### 2. Linkar o Projeto

```bash
# No diretório do projeto
cd c:\Users\EDER\finora-caixa-alerta

# Linkar com o projeto remoto
supabase link --project-ref ixcjeoibvhkdhqitkbat
```

Quando pedir a senha do banco, use a senha do seu projeto Supabase.

### 3. Verificar Conexão

```bash
supabase projects list
```

---

## O que o CLI permite fazer:

✅ **Migrations**: Aplicar migrations automaticamente
```bash
supabase db push
```

✅ **Edge Functions**: Deploy com um comando
```bash
supabase functions deploy ai-analysis-cron
```

✅ **Secrets**: Configurar variáveis de ambiente
```bash
supabase secrets set OPENAI_API_KEY=sua-key
```

✅ **Database**: Executar queries diretamente
```bash
supabase db execute --sql "SELECT * FROM users LIMIT 5"
```

✅ **Logs**: Ver logs em tempo real
```bash
supabase functions logs ai-analysis-cron
```

---

## Comandos que vamos usar:

### 1. Aplicar a Migration
```bash
supabase db push
```

### 2. Deploy da Edge Function
```bash
supabase functions deploy ai-analysis-cron
```

### 3. Configurar OpenAI Key
```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Ver Logs (para debug)
```bash
supabase functions logs ai-analysis-cron --follow
```

---

## Troubleshooting

### Erro: "command not found"
- Reinicie o terminal após instalação
- Verifique se está no PATH: `echo $env:Path` (PowerShell)

### Erro no login
- Tente fazer logout e login novamente:
```bash
supabase logout
supabase login
```

### Erro ao linkar projeto
- Verifique se o project-ref está correto: `ixcjeoibvhkdhqitkbat`
- Use a senha de banco correta (Database Password do Supabase)

---

## Próximos Passos Após Instalação

1. Volte aqui e me avise que instalou
2. Eu vou rodar os comandos para você
3. Em 5 minutos está tudo configurado! 🚀
