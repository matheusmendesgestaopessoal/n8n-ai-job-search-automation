// Código do nó "Gerar Pesquisas" (cópia do workflow n8n; a fonte é workflow/n8n-ai-job-search-public.json)

// =========================================================
// CONFIGURAÇÃO GERAL
// =========================================================

// true  = executa somente a primeira pesquisa para testes
// false = executa todas as pesquisas em produção
const TEST_MODE = false;

const baseInput = {
  urls: [],
  datePosted: "past24Hours",
  under10Applicants: false,
  autoConvertToAiSearch: true,
  scrapeCompany: false,
  splitByLocation: false,
};

function makeInput(keywords, location, limitPerSource) {
  return {
    ...baseInput,
    keywords,
    location,
    limitPerSource,
  };
}

// =========================================================
// PESQUISAS
// =========================================================

const searches = [

  // =========================================================
  // 1. DADOS & BI — REMOTO BRASIL
  // =========================================================
  {
    busca: "DADOS_BI_REMOTO",
    frente: "DADOS_BI",
    modalidade_alvo: "REMOTO",
    regiao_alvo: "BRASIL",
    prioridade: 1,

    input: makeInput(
      `
Vagas remotas no Brasil para nível júnior, junior, entry level ou assistente em:

- Analista de Dados
- Data Analyst
- Analista de BI
- Business Intelligence Analyst
- Assistente de Dados
- Assistente de BI
- Analista de Indicadores
- Analista MIS
- Reporting Analyst

Priorizar vagas relacionadas a:
Excel, SQL, Power BI, dashboards, indicadores, KPIs, análise de dados, Python, ETL, Data Warehouse ou visualização de dados.

Evitar cargos:
Senior, Sr, Specialist, Especialista, Lead, Principal, Coordinator, Coordenador, Manager, Gerente, Head ou Director.
      `.trim(),
      "Brazil",
      12
    ),
  },

  // =========================================================
  // 2. DADOS & BI — HÍBRIDO SÃO PAULO
  // =========================================================
  {
    busca: "DADOS_BI_HIBRIDO_SP",
    frente: "DADOS_BI",
    modalidade_alvo: "HIBRIDO",
    regiao_alvo: "SAO_PAULO",
    prioridade: 1,

    input: makeInput(
      `
Vagas híbridas em São Paulo/SP para nível júnior, junior, entry level ou assistente em:

- Analista de Dados
- Data Analyst
- Analista de BI
- Business Intelligence Analyst
- Assistente de Dados
- Assistente de BI
- Analista de Indicadores
- Analista MIS
- Reporting Analyst

Priorizar:
Excel, SQL, Power BI, dashboards, indicadores, KPIs, análise de dados, Python, ETL, Data Warehouse ou visualização de dados.

Evitar cargos:
Senior, Sr, Specialist, Especialista, Lead, Principal, Coordinator, Coordenador, Manager, Gerente, Head ou Director.
      `.trim(),
      "São Paulo, São Paulo, Brazil",
      12
    ),
  },

  // =========================================================
  // 3. OPERAÇÕES / PLANEJAMENTO — REMOTO
  // =========================================================
  {
    busca: "OPERACOES_REMOTO",
    frente: "OPERACOES_PLANEJAMENTO",
    modalidade_alvo: "REMOTO",
    regiao_alvo: "BRASIL",
    prioridade: 2,

    input: makeInput(
      `
Vagas remotas no Brasil para nível júnior, junior ou assistente em:

- Analista de Operações
- Operations Analyst
- Analista de Planejamento
- Planning Analyst
- Assistente de Planejamento
- Analista de Processos
- Process Analyst
- Analista de Performance
- Analista Administrativo com perfil analítico

Priorizar:
Excel, indicadores, KPIs, relatórios, planejamento operacional, controle operacional, performance, produtividade, faturamento, análise de dados e melhoria de processos.

Evitar cargos:
Senior, Especialista, Specialist, Lead, Coordenador, Manager, Gerente, Head ou Diretor.
      `.trim(),
      "Brazil",
      10
    ),
  },

  // =========================================================
  // 4. OPERAÇÕES / PLANEJAMENTO — HÍBRIDO SP
  // =========================================================
  {
    busca: "OPERACOES_HIBRIDO_SP",
    frente: "OPERACOES_PLANEJAMENTO",
    modalidade_alvo: "HIBRIDO",
    regiao_alvo: "SAO_PAULO",
    prioridade: 2,

    input: makeInput(
      `
Vagas híbridas em São Paulo/SP para nível júnior, junior ou assistente em:

- Analista de Operações
- Operations Analyst
- Analista de Planejamento
- Planning Analyst
- Assistente de Planejamento
- Analista de Processos
- Analista de Performance
- Analista Administrativo com perfil analítico

Priorizar:
Excel, indicadores, KPIs, relatórios, planejamento, controle operacional, performance, produtividade, faturamento e melhoria de processos.

Evitar cargos:
Senior, Especialista, Specialist, Lead, Coordenador, Manager, Gerente, Head ou Diretor.
      `.trim(),
      "São Paulo, São Paulo, Brazil",
      10
    ),
  },

  // =========================================================
  // 5. FINANCEIRO / ADMINISTRATIVO — REMOTO
  // =========================================================
  {
    busca: "FINANCEIRO_REMOTO",
    frente: "FINANCEIRO_ADMINISTRATIVO",
    modalidade_alvo: "REMOTO",
    regiao_alvo: "BRASIL",
    prioridade: 3,

    input: makeInput(
      `
Vagas remotas no Brasil para nível júnior ou assistente em:

- Analista Financeiro
- Assistente Financeiro
- Operações Financeiras
- Backoffice
- Back Office
- Analista de Faturamento
- Controles
- Analista Administrativo
- Operações de bancos ou fintechs

Priorizar:
Excel, análise de dados, controles, conferência de informações, faturamento, relatórios, indicadores, operações financeiras, investimentos, mercado financeiro, CPA ou C-Pro R.

Evitar cargos:
Senior, Especialista, Specialist, Lead, Coordenador, Manager, Gerente, Head ou Diretor.
      `.trim(),
      "Brazil",
      8
    ),
  },

  // =========================================================
  // 6. FINANCEIRO / ADMINISTRATIVO — HÍBRIDO SP
  // =========================================================
  {
    busca: "FINANCEIRO_HIBRIDO_SP",
    frente: "FINANCEIRO_ADMINISTRATIVO",
    modalidade_alvo: "HIBRIDO",
    regiao_alvo: "SAO_PAULO",
    prioridade: 3,

    input: makeInput(
      `
Vagas híbridas em São Paulo/SP para nível júnior ou assistente em:

- Analista Financeiro
- Assistente Financeiro
- Operações Financeiras
- Backoffice
- Back Office
- Analista de Faturamento
- Controles
- Analista Administrativo
- Operações de bancos ou fintechs

Priorizar:
Excel, análise de dados, controles, conferência de informações, faturamento, relatórios, indicadores, operações financeiras, investimentos, mercado financeiro, CPA ou C-Pro R.

Evitar cargos:
Senior, Especialista, Specialist, Lead, Coordenador, Manager, Gerente, Head ou Diretor.
      `.trim(),
      "São Paulo, São Paulo, Brazil",
      8
    ),
  },

  // =========================================================
  // 7. ESTÁGIO ADS — REMOTO
  // =========================================================
  {
    busca: "ESTAGIO_ADS_REMOTO",
    frente: "ESTAGIO_ADS",
    modalidade_alvo: "REMOTO",
    regiao_alvo: "BRASIL",
    prioridade: 2,

    input: makeInput(
      `
Estágio remoto no Brasil para estudante de Análise e Desenvolvimento de Sistemas em:

- Dados
- Business Intelligence
- BI
- Analytics
- Banco de Dados
- Automação
- Processos
- Sistemas
- Desenvolvimento relacionado a dados ou automação

Priorizar:
SQL, Power BI, Excel, Python, bancos de dados, APIs, n8n, automação, dashboards, indicadores, ETL ou análise de dados.

Evitar estágio focado exclusivamente em:
suporte técnico, help desk, infraestrutura, redes, manutenção de computadores ou atendimento de TI.
      `.trim(),
      "Brazil",
      10
    ),
  },

  // =========================================================
  // 8. ESTÁGIO ADS — HÍBRIDO SP
  // =========================================================
  {
    busca: "ESTAGIO_ADS_HIBRIDO_SP",
    frente: "ESTAGIO_ADS",
    modalidade_alvo: "HIBRIDO",
    regiao_alvo: "SAO_PAULO",
    prioridade: 2,

    input: makeInput(
      `
Estágio híbrido em São Paulo/SP para estudante de Análise e Desenvolvimento de Sistemas em:

- Dados
- Business Intelligence
- BI
- Analytics
- Banco de Dados
- Automação
- Processos
- Sistemas
- Desenvolvimento relacionado a dados ou automação

Priorizar:
SQL, Power BI, Excel, Python, bancos de dados, APIs, n8n, automação, dashboards, indicadores, ETL ou análise de dados.

Evitar estágio focado exclusivamente em:
suporte técnico, help desk, infraestrutura, redes, manutenção de computadores ou atendimento de TI.
      `.trim(),
      "São Paulo, São Paulo, Brazil",
      10
    ),
  },

  // =========================================================
  // 9. PRESENCIAL — GUARUJÁ
  // =========================================================
  {
    busca: "PRESENCIAL_GUARUJA",
    frente: "MULTIFRENTE",
    modalidade_alvo: "PRESENCIAL",
    regiao_alvo: "GUARUJA",
    prioridade: 2,

    input: makeInput(
      `
Vagas presenciais em Guarujá/SP para nível júnior, junior, assistente ou estágio nas áreas de:

- Dados
- BI
- Business Intelligence
- Analytics
- Operações
- Planejamento
- Processos
- Performance
- Administrativo analítico
- Financeiro
- Faturamento
- Backoffice
- Automação
- Sistemas
- Banco de Dados

Priorizar:
Excel, Power BI, SQL, Python, análise de dados, indicadores, planejamento, processos, faturamento, automação, n8n ou certificações ANBIMA.

Evitar cargos de senioridade elevada ou funções sem relação com essas áreas.
      `.trim(),
      "Guarujá, São Paulo, Brazil",
      10
    ),
  },

  // =========================================================
  // 10. PRESENCIAL — SANTOS
  // =========================================================
  {
    busca: "PRESENCIAL_SANTOS",
    frente: "MULTIFRENTE",
    modalidade_alvo: "PRESENCIAL",
    regiao_alvo: "SANTOS",
    prioridade: 2,

    input: makeInput(
      `
Vagas presenciais em Santos/SP para nível júnior, junior, assistente ou estágio nas áreas de:

- Dados
- BI
- Business Intelligence
- Analytics
- Operações
- Planejamento
- Processos
- Performance
- Administrativo analítico
- Financeiro
- Faturamento
- Backoffice
- Automação
- Sistemas
- Banco de Dados

Priorizar:
Excel, Power BI, SQL, Python, análise de dados, indicadores, planejamento, processos, faturamento, automação, n8n ou certificações ANBIMA.

Evitar cargos de senioridade elevada ou funções sem relação com essas áreas.
      `.trim(),
      "Santos, São Paulo, Brazil",
      10
    ),
  },

];

// =========================================================
// TESTE / PRODUÇÃO
// =========================================================

const selectedSearches = TEST_MODE
  ? searches.slice(0, 1)
  : searches;

// =========================================================
// OUTPUT PARA O LOOP / APIFY
// =========================================================

return selectedSearches.map(s => ({
  json: {
    busca: s.busca,
    frente: s.frente,
    modalidade_alvo: s.modalidade_alvo,
    regiao_alvo: s.regiao_alvo,
    prioridade_busca: s.prioridade,

    apify_input: s.input,
    apify_input_json: JSON.stringify(s.input),
  }
}));
