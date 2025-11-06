// Setup Database via Supabase API
// Execute: node scripts/setup-database.js

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Você vai precisar adicionar esta

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.log('\nAdicione no .env:');
  console.log('VITE_SUPABASE_URL=sua-url');
  console.log('SUPABASE_SERVICE_KEY=sua-service-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Iniciando setup do banco de dados...\n');

  try {
    // Ler o arquivo SQL
    const sqlPath = join(__dirname, '..', 'supabase', 'schema.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('📝 Executando schema SQL...');

    // Executar SQL via RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      throw error;
    }

    console.log('✅ Banco de dados configurado com sucesso!\n');
    console.log('Tabelas criadas:');
    console.log('  ✓ profiles');
    console.log('  ✓ transactions');
    console.log('  ✓ projections');
    console.log('  ✓ financial_goals');
    console.log('  ✓ ai_insights\n');

  } catch (error) {
    console.error('\n❌ Erro durante setup:', error.message);
    process.exit(1);
  }
}

setupDatabase();
