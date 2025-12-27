-- MEI - Regras Específicas e Preparação para Reforma Tributária
-- Microempreendedor Individual tem regras especiais que mudarão com a reforma

-- ============================================================
-- 1. TABELA DE REGRAS DO MEI (ATUAL E REFORMA)
-- ============================================================

CREATE TABLE IF NOT EXISTS mei_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Vigência
  year INTEGER NOT NULL CHECK (year >= 2024 AND year <= 2050),
  regime_version TEXT NOT NULL CHECK (regime_version IN ('current', 'reform')),

  -- Limites de faturamento
  annual_revenue_limit DECIMAL(12,2) NOT NULL, -- Atual: R$ 81.000
  monthly_revenue_limit DECIMAL(12,2) NOT NULL, -- R$ 6.750

  -- Valores fixos mensais (sistema atual)
  inss_monthly DECIMAL(10,2), -- Atual: 5% do salário mínimo
  icms_monthly DECIMAL(10,2), -- R$ 1,00 (comércio/indústria)
  iss_monthly DECIMAL(10,2),  -- R$ 5,00 (prestadores de serviço)

  -- Valores após reforma (IBS/CBS substituem ICMS/ISS)
  ibs_monthly DECIMAL(10,2), -- Substitui ICMS/ISS
  cbs_monthly DECIMAL(10,2), -- Pode ser introduzido ou mantido zero

  -- Restrições
  max_employees INTEGER DEFAULT 1, -- Máximo 1 funcionário
  prohibited_activities TEXT[], -- Atividades proibidas no MEI

  -- Mudanças na reforma
  mei_will_change BOOLEAN DEFAULT false, -- Se MEI sofrerá mudanças neste ano
  migration_required BOOLEAN DEFAULT false, -- Se precisará migrar para Simples
  new_category TEXT, -- Ex: 'micro_mei', 'mei_plus', etc.

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(year, regime_version)
);

-- ============================================================
-- 2. CATEGORIAS PERMITIDAS NO MEI
-- ============================================================

CREATE TABLE IF NOT EXISTS mei_allowed_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Código CNAE
  cnae_code TEXT NOT NULL,
  activity_name TEXT NOT NULL,

  -- Vigência
  valid_from DATE NOT NULL,
  valid_until DATE, -- NULL se ainda válido

  -- Tipo de tributação
  requires_icms BOOLEAN DEFAULT false, -- Comércio/Indústria
  requires_iss BOOLEAN DEFAULT false,  -- Serviços

  -- Mudanças na reforma
  remains_in_mei_post_reform BOOLEAN DEFAULT true, -- Se continua no MEI após 2033
  alternative_regime TEXT, -- Sugestão se não puder continuar como MEI

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. SEED DATA - Regras MEI Atuais (2024-2025)
-- ============================================================

INSERT INTO mei_rules (
  year,
  regime_version,
  annual_revenue_limit,
  monthly_revenue_limit,
  inss_monthly,
  icms_monthly,
  iss_monthly,
  max_employees,
  prohibited_activities,
  mei_will_change
)
VALUES
  (2024, 'current', 81000.00, 6750.00, 66.00, 1.00, 5.00, 1,
   ARRAY['atividades_regulamentadas', 'profissionais_liberais', 'construcao_predial'],
   false),

  (2025, 'current', 81000.00, 6750.00, 70.60, 1.00, 5.00, 1,
   ARRAY['atividades_regulamentadas', 'profissionais_liberais', 'construcao_predial'],
   false);

-- ============================================================
-- 4. SEED DATA - Regras MEI na Reforma (Projeções)
-- ============================================================

-- 2026-2032: Período de transição
INSERT INTO mei_rules (
  year,
  regime_version,
  annual_revenue_limit,
  monthly_revenue_limit,
  inss_monthly,
  icms_monthly,
  iss_monthly,
  ibs_monthly,
  cbs_monthly,
  max_employees,
  mei_will_change,
  migration_required
)
VALUES
  -- 2026: Início de discussões, ainda no sistema atual
  (2026, 'current', 81000.00, 6750.00, 75.00, 1.00, 5.00, NULL, NULL, 1, true, false),

  -- 2027: Possível aumento de limite e introdução gradual de IBS
  (2027, 'transition', 90000.00, 7500.00, 80.00, 0.90, 4.50, 0.50, 0.00, 1, true, false),

  -- 2028-2030: Transição progressiva
  (2028, 'transition', 100000.00, 8333.33, 85.00, 0.80, 4.00, 1.00, 0.00, 1, true, false),
  (2029, 'transition', 110000.00, 9166.67, 90.00, 0.60, 3.00, 2.00, 0.50, 1, true, false),
  (2030, 'transition', 120000.00, 10000.00, 95.00, 0.40, 2.00, 3.00, 1.00, 1, true, false),

  -- 2031-2032: Transição avançada
  (2031, 'transition', 130000.00, 10833.33, 100.00, 0.20, 1.00, 4.00, 1.50, 1, true, false),
  (2032, 'transition', 140000.00, 11666.67, 105.00, 0.10, 0.50, 5.00, 2.00, 1, true, false);

-- 2033+: Reforma plena - MEI adaptado
INSERT INTO mei_rules (
  year,
  regime_version,
  annual_revenue_limit,
  monthly_revenue_limit,
  inss_monthly,
  icms_monthly,
  iss_monthly,
  ibs_monthly,
  cbs_monthly,
  max_employees,
  mei_will_change,
  migration_required,
  new_category
)
VALUES
  (2033, 'reform', 150000.00, 12500.00, 110.00, 0.00, 0.00, 6.00, 3.00, 1, true, false, 'mei_unificado');

-- ============================================================
-- 5. FUNÇÃO - Calcular DAS do MEI
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_mei_tax(
  p_user_id UUID,
  p_month INTEGER,
  p_year INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_rules RECORD;
  v_revenue_month DECIMAL(12,2);
  v_revenue_ytd DECIMAL(12,2);
  v_das_total DECIMAL(10,2);
  v_over_limit BOOLEAN := false;
  v_warning TEXT;
BEGIN
  -- Buscar regras do MEI para o ano
  SELECT * INTO v_rules
  FROM mei_rules
  WHERE year = p_year
  ORDER BY
    CASE
      WHEN regime_version = 'current' THEN 1
      WHEN regime_version = 'transition' THEN 2
      WHEN regime_version = 'reform' THEN 3
    END
  LIMIT 1;

  IF v_rules IS NULL THEN
    -- Se não houver regras, usar as de 2025
    SELECT * INTO v_rules FROM mei_rules WHERE year = 2025 AND regime_version = 'current';
  END IF;

  -- Calcular receita do mês
  SELECT COALESCE(SUM(amount), 0) INTO v_revenue_month
  FROM transactions
  WHERE user_id = p_user_id
    AND type = 'income'
    AND EXTRACT(MONTH FROM date) = p_month
    AND EXTRACT(YEAR FROM date) = p_year;

  -- Calcular receita acumulada no ano
  SELECT COALESCE(SUM(amount), 0) INTO v_revenue_ytd
  FROM transactions
  WHERE user_id = p_user_id
    AND type = 'income'
    AND EXTRACT(YEAR FROM date) = p_year
    AND EXTRACT(MONTH FROM date) <= p_month;

  -- Verificar se ultrapassou limite
  IF v_revenue_ytd > v_rules.annual_revenue_limit THEN
    v_over_limit := true;
    v_warning := format(
      'ATENÇÃO: Faturamento anual (R$ %s) ultrapassou o limite do MEI (R$ %s). Você deve migrar para Simples Nacional.',
      v_revenue_ytd,
      v_rules.annual_revenue_limit
    );
  ELSIF v_revenue_ytd > (v_rules.annual_revenue_limit * 0.80) THEN
    v_warning := format(
      'Alerta: Você já ultrapassou 80%% do limite anual do MEI. Faturamento: R$ %s / R$ %s',
      v_revenue_ytd,
      v_rules.annual_revenue_limit
    );
  END IF;

  -- Calcular DAS (valor fixo mensal)
  IF v_rules.regime_version = 'reform' THEN
    -- Sistema pós-reforma: INSS + IBS + CBS
    v_das_total := COALESCE(v_rules.inss_monthly, 0) +
                   COALESCE(v_rules.ibs_monthly, 0) +
                   COALESCE(v_rules.cbs_monthly, 0);
  ELSIF v_rules.regime_version = 'transition' THEN
    -- Sistema em transição: INSS + misto de impostos
    v_das_total := COALESCE(v_rules.inss_monthly, 0) +
                   COALESCE(v_rules.icms_monthly, 0) +
                   COALESCE(v_rules.iss_monthly, 0) +
                   COALESCE(v_rules.ibs_monthly, 0) +
                   COALESCE(v_rules.cbs_monthly, 0);
  ELSE
    -- Sistema atual: INSS + ICMS/ISS
    v_das_total := COALESCE(v_rules.inss_monthly, 0) +
                   COALESCE(v_rules.icms_monthly, 0) +
                   COALESCE(v_rules.iss_monthly, 0);
  END IF;

  RETURN jsonb_build_object(
    'das_amount', v_das_total,
    'inss_amount', v_rules.inss_monthly,
    'icms_amount', COALESCE(v_rules.icms_monthly, 0),
    'iss_amount', COALESCE(v_rules.iss_monthly, 0),
    'ibs_amount', COALESCE(v_rules.ibs_monthly, 0),
    'cbs_amount', COALESCE(v_rules.cbs_monthly, 0),
    'revenue_month', v_revenue_month,
    'revenue_ytd', v_revenue_ytd,
    'annual_limit', v_rules.annual_revenue_limit,
    'over_limit', v_over_limit,
    'warning', v_warning,
    'regime_version', v_rules.regime_version,
    'max_employees', v_rules.max_employees
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. FUNÇÃO - Verificar Elegibilidade ao MEI
-- ============================================================

CREATE OR REPLACE FUNCTION check_mei_eligibility(
  p_user_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_revenue_ytd DECIMAL(12,2);
  v_rules RECORD;
  v_eligible BOOLEAN := true;
  v_reasons TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Buscar regras do ano
  SELECT * INTO v_rules
  FROM mei_rules
  WHERE year = p_year
  ORDER BY
    CASE
      WHEN regime_version = 'current' THEN 1
      WHEN regime_version = 'transition' THEN 2
      WHEN regime_version = 'reform' THEN 3
    END
  LIMIT 1;

  -- Calcular receita acumulada
  SELECT COALESCE(SUM(amount), 0) INTO v_revenue_ytd
  FROM transactions
  WHERE user_id = p_user_id
    AND type = 'income'
    AND EXTRACT(YEAR FROM date) = p_year;

  -- Verificar limite de faturamento
  IF v_revenue_ytd > v_rules.annual_revenue_limit THEN
    v_eligible := false;
    v_reasons := array_append(v_reasons, format(
      'Faturamento anual (R$ %s) excede o limite (R$ %s)',
      v_revenue_ytd,
      v_rules.annual_revenue_limit
    ));
  END IF;

  -- Verificar se terá que migrar na reforma
  IF v_rules.migration_required THEN
    v_eligible := false;
    v_reasons := array_append(v_reasons, format(
      'MEI será descontinuado em %s. Migração para %s será necessária.',
      p_year,
      COALESCE(v_rules.new_category, 'Simples Nacional')
    ));
  END IF;

  RETURN jsonb_build_object(
    'eligible', v_eligible,
    'year', p_year,
    'revenue_ytd', v_revenue_ytd,
    'limit', v_rules.annual_revenue_limit,
    'utilization_percentage', ROUND((v_revenue_ytd / v_rules.annual_revenue_limit) * 100, 2),
    'reasons', v_reasons,
    'suggested_regime', CASE
      WHEN v_eligible THEN 'mei'
      ELSE 'simples_nacional'
    END,
    'reform_impact', v_rules.mei_will_change
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 7. SEED - Atividades Permitidas no MEI (Exemplos)
-- ============================================================

INSERT INTO mei_allowed_activities (cnae_code, activity_name, valid_from, requires_icms, requires_iss, remains_in_mei_post_reform)
VALUES
  -- Comércio (requer ICMS)
  ('4781-4/00', 'Comércio varejista de artigos do vestuário e acessórios', '2020-01-01', true, false, true),
  ('4712-1/00', 'Comércio varejista de mercadorias em geral', '2020-01-01', true, false, true),

  -- Serviços (requer ISS)
  ('9602-5/01', 'Cabeleireiros, manicure e pedicure', '2020-01-01', false, true, true),
  ('4923-0/02', 'Serviço de transporte de passageiros - locação de automóveis com motorista', '2020-01-01', false, true, true),
  ('6201-5/01', 'Desenvolvimento de programas de computador sob encomenda', '2020-01-01', false, true, false), -- Pode sair do MEI na reforma
  ('7490-1/04', 'Consultoria em tecnologia da informação', '2020-01-01', false, true, false), -- Pode sair do MEI na reforma

  -- Indústria (requer ICMS)
  ('1091-1/02', 'Fabricação de produtos de panificação industrial', '2020-01-01', true, false, true);

-- ============================================================
-- 8. TRIGGER - Criar Alerta quando MEI se aproxima do limite
-- ============================================================

CREATE OR REPLACE FUNCTION check_mei_limit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_settings RECORD;
  v_revenue_ytd DECIMAL(12,2);
  v_rules RECORD;
  v_year INTEGER;
BEGIN
  -- Pegar ano da transação
  v_year := EXTRACT(YEAR FROM NEW.date)::INTEGER;

  -- Verificar se é MEI
  SELECT * INTO v_settings
  FROM tax_settings
  WHERE user_id = NEW.user_id AND regime = 'mei';

  IF v_settings IS NULL THEN
    RETURN NEW;
  END IF;

  -- Buscar regras do MEI
  SELECT * INTO v_rules
  FROM mei_rules
  WHERE year = v_year
  ORDER BY
    CASE
      WHEN regime_version = 'current' THEN 1
      WHEN regime_version = 'transition' THEN 2
      WHEN regime_version = 'reform' THEN 3
    END
  LIMIT 1;

  -- Calcular receita acumulada
  SELECT COALESCE(SUM(amount), 0) INTO v_revenue_ytd
  FROM transactions
  WHERE user_id = NEW.user_id
    AND type = 'income'
    AND EXTRACT(YEAR FROM date) = v_year;

  -- Criar alertas conforme thresholds
  IF v_revenue_ytd > v_rules.annual_revenue_limit THEN
    -- Ultrapassou o limite
    INSERT INTO tax_alerts (user_id, type, severity, title, message, related_data)
    VALUES (
      NEW.user_id,
      'regime_optimization',
      'critical',
      'MEI: Limite de faturamento ultrapassado!',
      format('Seu faturamento anual (R$ %s) ultrapassou o limite do MEI (R$ %s). Você DEVE migrar para Simples Nacional imediatamente para evitar multas.', v_revenue_ytd, v_rules.annual_revenue_limit),
      jsonb_build_object(
        'revenue_ytd', v_revenue_ytd,
        'limit', v_rules.annual_revenue_limit,
        'year', v_year,
        'action_required', 'migrate_to_simples'
      )
    )
    ON CONFLICT DO NOTHING;

  ELSIF v_revenue_ytd > (v_rules.annual_revenue_limit * 0.90) THEN
    -- 90% do limite
    INSERT INTO tax_alerts (user_id, type, severity, title, message, related_data)
    VALUES (
      NEW.user_id,
      'bracket_change',
      'warning',
      'MEI: Você está próximo do limite!',
      format('Seu faturamento (R$ %s) já atingiu %.0f%% do limite anual do MEI. Planeje sua migração para Simples Nacional.', v_revenue_ytd, (v_revenue_ytd / v_rules.annual_revenue_limit) * 100),
      jsonb_build_object(
        'revenue_ytd', v_revenue_ytd,
        'limit', v_rules.annual_revenue_limit,
        'percentage', (v_revenue_ytd / v_rules.annual_revenue_limit) * 100
      )
    )
    ON CONFLICT DO NOTHING;

  ELSIF v_revenue_ytd > (v_rules.annual_revenue_limit * 0.80) THEN
    -- 80% do limite
    INSERT INTO tax_alerts (user_id, type, severity, title, message, related_data)
    VALUES (
      NEW.user_id,
      'bracket_change',
      'info',
      'MEI: Atenção ao limite de faturamento',
      format('Você já faturou R$ %s este ano (%.0f%% do limite). Fique atento para não ultrapassar R$ %s.', v_revenue_ytd, (v_revenue_ytd / v_rules.annual_revenue_limit) * 100, v_rules.annual_revenue_limit),
      jsonb_build_object(
        'revenue_ytd', v_revenue_ytd,
        'limit', v_rules.annual_revenue_limit,
        'percentage', (v_revenue_ytd / v_rules.annual_revenue_limit) * 100
      )
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS mei_limit_check ON transactions;
CREATE TRIGGER mei_limit_check
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  WHEN (NEW.type = 'income')
  EXECUTE FUNCTION check_mei_limit_trigger();

-- ============================================================
-- 9. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_mei_rules_year ON mei_rules(year);
CREATE INDEX IF NOT EXISTS idx_mei_activities_cnae ON mei_allowed_activities(cnae_code);

-- ============================================================
-- 10. COMENTÁRIOS
-- ============================================================

COMMENT ON TABLE mei_rules IS
  'Regras do MEI por ano, incluindo valores atuais e projeções para reforma tributária.
   MEI terá mudanças significativas entre 2026-2033.';

COMMENT ON FUNCTION calculate_mei_tax IS
  'Calcula o DAS mensal do MEI. Valor fixo que varia conforme CNAE e ano.
   Após 2033, valores serão adaptados para IBS/CBS.';

COMMENT ON FUNCTION check_mei_eligibility IS
  'Verifica se o usuário ainda é elegível ao MEI baseado em faturamento e outras regras.
   Retorna sugestão de migração se necessário.';

COMMENT ON TRIGGER mei_limit_check ON transactions IS
  'Trigger que cria alertas automáticos quando MEI se aproxima ou ultrapassa limite de faturamento.
   Thresholds: 80% (info), 90% (warning), 100%+ (critical).';
