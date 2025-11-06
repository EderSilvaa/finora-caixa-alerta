# Schema SQL - Passo a Passo (Se SQL Editor não funcionar)

## Método 1: Aguardar e Tentar Novamente (RECOMENDADO)

1. Aguarde **3 minutos completos** após criar o projeto
2. Recarregue a página do Supabase (F5)
3. Vá em **SQL Editor**
4. Cole o conteúdo de `schema.sql` e execute

**Se ainda não funcionar, use o Método 2 abaixo:**

---

## Método 2: Via Table Editor (Interface Visual)

### Passo 1: Criar tabela `profiles`

1. Vá em **Database** → **Tables** (menu lateral)
2. Clique em **Create a new table**
3. Preencha:
   - Nome: `profiles`
   - Enable Row Level Security: ✅ SIM

4. **Columns** (clique em Add column):

| Column name | Type | Default value | Primary | Nullable | Unique |
|------------|------|---------------|---------|----------|--------|
| id | uuid | - | ✅ Yes | No | Yes |
| email | text | - | No | No | Yes |
| full_name | text | - | No | ✅ Yes | No |
| company_name | text | - | No | ✅ Yes | No |
| phone | text | - | No | ✅ Yes | No |
| created_at | timestamptz | now() | No | No | No |
| updated_at | timestamptz | now() | No | No | No |

5. Em **Foreign Keys**, adicione:
   - Column: `id`
   - Referenced table: `auth.users`
   - Referenced column: `id`
   - On Delete: CASCADE

6. Clique em **Save**

---

### Passo 2: Criar tabela `transactions`

1. **Create a new table**
2. Nome: `transactions`
3. Enable RLS: ✅ SIM

**Columns:**

| Column name | Type | Default value | Primary | Nullable |
|------------|------|---------------|---------|----------|
| id | uuid | gen_random_uuid() | ✅ Yes | No |
| user_id | uuid | - | No | No |
| type | text | - | No | No |
| amount | numeric | - | No | No |
| description | text | - | No | No |
| category | text | - | No | No |
| date | timestamptz | now() | No | No |
| created_at | timestamptz | now() | No | No |
| updated_at | timestamptz | now() | No | No |

**Foreign Keys:**
- Column: `user_id`
- Referenced: `auth.users(id)`
- On Delete: CASCADE

**Check Constraints:**
- Name: `type_check`
- Definition: `type IN ('income', 'expense')`

- Name: `amount_positive`
- Definition: `amount > 0`

---

### Passo 3: Criar tabela `financial_goals`

1. **Create a new table**
2. Nome: `financial_goals`
3. Enable RLS: ✅ SIM

**Columns:**

| Column name | Type | Default value | Primary | Nullable |
|------------|------|---------------|---------|----------|
| id | uuid | gen_random_uuid() | ✅ Yes | No |
| user_id | uuid | - | No | No |
| title | text | - | No | No |
| target_amount | numeric | - | No | No |
| current_amount | numeric | 0 | No | No |
| deadline | timestamptz | - | No | ✅ Yes |
| created_at | timestamptz | now() | No | No |
| updated_at | timestamptz | now() | No | No |

**Foreign Keys:**
- Column: `user_id`
- Referenced: `auth.users(id)`
- On Delete: CASCADE

---

### Passo 4: Criar tabela `projections`

1. **Create a new table**
2. Nome: `projections`
3. Enable RLS: ✅ SIM

**Columns:**

| Column name | Type | Default value | Primary | Nullable |
|------------|------|---------------|---------|----------|
| id | uuid | gen_random_uuid() | ✅ Yes | No |
| user_id | uuid | - | No | No |
| projection_date | timestamptz | - | No | No |
| projected_balance | numeric | - | No | No |
| confidence_level | numeric | 0.5 | No | No |
| created_at | timestamptz | now() | No | No |

**Foreign Keys:**
- Column: `user_id`
- Referenced: `auth.users(id)`
- On Delete: CASCADE

---

### Passo 5: Criar tabela `ai_insights`

1. **Create a new table**
2. Nome: `ai_insights`
3. Enable RLS: ✅ SIM

**Columns:**

| Column name | Type | Default value | Primary | Nullable |
|------------|------|---------------|---------|----------|
| id | uuid | gen_random_uuid() | ✅ Yes | No |
| user_id | uuid | - | No | No |
| insight_type | text | - | No | No |
| title | text | - | No | No |
| description | text | - | No | No |
| action | text | - | No | No |
| is_read | boolean | false | No | No |
| created_at | timestamptz | now() | No | No |

**Foreign Keys:**
- Column: `user_id`
- Referenced: `auth.users(id)`
- On Delete: CASCADE

---

### Passo 6: Configurar Row Level Security (RLS)

Agora precisamos adicionar as políticas de segurança. **ESTE PASSO É CRUCIAL!**

Para cada tabela, vá em **Database** → **Tables** → [nome da tabela] → **RLS Policies**

#### Políticas para `profiles`:

1. **View own profile**
   - Policy name: `Users can view own profile`
   - Allowed operation: SELECT
   - Target roles: authenticated
   - USING expression: `auth.uid() = id`

2. **Update own profile**
   - Policy name: `Users can update own profile`
   - Allowed operation: UPDATE
   - Target roles: authenticated
   - USING expression: `auth.uid() = id`

3. **Insert own profile**
   - Policy name: `Users can insert own profile`
   - Allowed operation: INSERT
   - Target roles: authenticated
   - WITH CHECK expression: `auth.uid() = id`

#### Políticas para `transactions`:

1. **View own transactions**
   - Policy: SELECT
   - USING: `auth.uid() = user_id`

2. **Insert own transactions**
   - Policy: INSERT
   - WITH CHECK: `auth.uid() = user_id`

3. **Update own transactions**
   - Policy: UPDATE
   - USING: `auth.uid() = user_id`

4. **Delete own transactions**
   - Policy: DELETE
   - USING: `auth.uid() = user_id`

**Repita o mesmo padrão** para `financial_goals`, `projections` e `ai_insights`.

---

### Passo 7: Criar Trigger de Auto Profile

Vá em **SQL Editor** e tente executar APENAS isto:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

Se o SQL Editor ainda der erro, **PULE ESTE PASSO** por enquanto. Você pode criar profiles manualmente.

---

## Método 3: Usar Cliente Desktop (MAIS FÁCIL)

Se nada funcionar, use o **TablePlus** ou **DBeaver** (gratuitos):

### Com TablePlus:

1. Baixe: https://tableplus.com (grátis)
2. No Supabase, vá em **Settings** → **Database**
3. Copie a **Connection String** (formato: `postgresql://...`)
4. No TablePlus:
   - New connection → PostgreSQL
   - Cole a connection string
   - Connect
5. Agora abra o `schema.sql` e execute lá!

---

## ✅ Como Verificar se Funcionou

Após criar as tabelas (por qualquer método):

1. Vá em **Database** → **Tables**
2. Você deve ver:
   - ✅ profiles
   - ✅ transactions
   - ✅ financial_goals
   - ✅ projections
   - ✅ ai_insights

3. Clique em cada uma e verifique se tem as colunas corretas

---

## 🆘 Se NADA Funcionar

**Opção Final: Usar outro backend temporariamente**

Posso adaptar o código para usar:
- Firebase (mais simples, porém menos features)
- Pocketbase (auto-hospedado)
- Backend simples em Node.js

**Mas antes disso, tente:**

1. Criar um NOVO projeto no Supabase
2. Usar região diferente (US East)
3. Aguardar 5 minutos completos
4. Limpar cache do navegador
5. Usar navegador diferente (modo anônimo)

---

Me diga qual erro específico aparece para eu te ajudar melhor!
