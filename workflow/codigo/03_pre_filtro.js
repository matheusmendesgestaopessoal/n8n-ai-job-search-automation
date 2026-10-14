// Nó "Pré-Filtro" do workflow n8n (extraído por codigo/extrair_workflow.py; edite no n8n)

const vaga = $json;

// ========================================================
// FUNÇÕES AUXILIARES
// ========================================================

function norm(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(text = '') {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function contem(texto, termo) {
  const t = norm(texto);
  const p = norm(termo);

  if (!p) return false;

  // Expressões com espaço podem usar includes
  if (p.includes(' ')) {
    return t.includes(p);
  }

  // Termos curtos devem respeitar limites de palavra
  return new RegExp(
    `(^|[^a-z0-9])${escapeRegex(p)}([^a-z0-9]|$)`,
    'i'
  ).test(t);
}

function algum(texto, termos = []) {
  return termos.some(termo => contem(texto, termo));
}

// ========================================================
// DADOS NORMALIZADOS
// ========================================================

const cargo = norm(vaga.cargo);
const descricao = norm(vaga.descricao);
const local = norm(vaga.localizacao);

const frente = String(vaga.frente_origem || '').trim();
const modalidade = String(
  vaga.modalidade_detectada || 'NAO_INFORMADO'
).trim();

const modalidadeAlvo = String(
  vaga.modalidade_alvo || ''
).trim();

let score = 0;
let descartar = false;

const motivos = [];
const sinais = [];

// ========================================================
// 0. QUALIDADE DOS DADOS
// ========================================================

if (vaga.dados_validos === false) {
  descartar = true;
  motivos.push('Dados básicos da vaga inválidos');
}

if (!cargo) {
  descartar = true;
  motivos.push('Cargo não informado');
}

if (!descricao) {
  motivos.push('Descrição não informada');
}

// ========================================================
// 1. SENIORIDADE
// ========================================================

const senioridadeAlta = [
  'senior',
  'sr',
  'especialista',
  'specialist',
  'lead',
  'lider',
  'principal',
  'manager',
  'gerente',
  'coordenador',
  'coordinator',
  'head',
  'director',
  'diretor',
  'architect',
  'arquiteto'
];

const senioridadeCompativel = [
  'junior',
  'jr',
  'assistente',
  'assistant',
  'entry level',
  'estagio',
  'estagiario',
  'intern',
  'trainee'
];

if (algum(cargo, senioridadeAlta)) {
  descartar = true;
  motivos.push('Senioridade do cargo acima do alvo');
}

if (algum(cargo, senioridadeCompativel)) {
  score += 20;
  sinais.push('Senioridade compatível');
}

// ========================================================
// 2. CARGOS POR FRENTE
// ========================================================

const cargosDados = [
  'analista de dados',
  'data analyst',
  'data analytics analyst',
  'analytics analyst',
  'analista de bi',
  'bi analyst',
  'business intelligence analyst',
  'business intelligence',
  'assistente de bi',
  'assistente de dados',
  'analista de indicadores',
  'analista de mis',
  'mis analyst',
  'reporting analyst',
  'report analyst',
  'analista de relatorios',
  'analista de inteligencia de dados'
];

const cargosOperacoes = [
  'analista de operacoes',
  'operations analyst',
  'analista de planejamento',
  'planning analyst',
  'assistente de planejamento',
  'analista de processos',
  'process analyst',
  'analista de performance',
  'performance analyst',
  'analista administrativo',
  'assistente administrativo'
];

const cargosFinanceiro = [
  'analista financeiro',
  'financial analyst',
  'assistente financeiro',
  'operacoes financeiras',
  'financial operations',
  'backoffice',
  'back office',
  'analista de faturamento',
  'assistente de faturamento',
  'analista administrativo'
];

const cargosEstagio = [
  'estagio',
  'estagiario',
  'intern',
  'internship'
];

const todosCargos = [
  ...cargosDados,
  ...cargosOperacoes,
  ...cargosFinanceiro,
  ...cargosEstagio
];

let cargosDaFrente = todosCargos;

if (frente === 'DADOS_BI') {
  cargosDaFrente = cargosDados;
}

if (frente === 'OPERACOES_PLANEJAMENTO') {
  cargosDaFrente = cargosOperacoes;
}

if (frente === 'FINANCEIRO_ADMINISTRATIVO') {
  cargosDaFrente = cargosFinanceiro;
}

if (frente === 'ESTAGIO_ADS') {
  cargosDaFrente = cargosEstagio;
}

const cargoRelevante = algum(
  cargo,
  frente === 'MULTIFRENTE'
    ? todosCargos
    : cargosDaFrente
);

if (cargoRelevante) {
  score += 30;
  sinais.push('Cargo relacionado à frente');
}

// ========================================================
// 3. PALAVRAS-CHAVE POR FRENTE
// ========================================================

const keywordsComuns = [
  'excel',
  'analise de dados',
  'indicadores',
  'kpi',
  'dashboard',
  'relatorios'
];

const keywordsDados = [
  'power bi',
  'sql',
  'python',
  'business intelligence',
  'analytics',
  'etl',
  'data warehouse',
  'modelagem de dados',
  'modelagem dimensional',
  'star schema',
  'banco de dados',
  'mysql',
  'visualizacao de dados'
];

const keywordsOperacoes = [
  'planejamento',
  'operacoes',
  'processos',
  'performance',
  'produtividade',
  'faturamento',
  'melhoria de processos',
  'controle operacional',
  'eficiencia operacional'
];

const keywordsFinanceiro = [
  'financeiro',
  'operacoes financeiras',
  'backoffice',
  'back office',
  'faturamento',
  'controles',
  'investimentos',
  'mercado financeiro',
  'anbima',
  'cpa',
  'c-pro'
];

const keywordsEstagio = [
  'sql',
  'power bi',
  'python',
  'banco de dados',
  'automacao',
  'api',
  'webhook',
  'n8n',
  'etl',
  'analytics'
];

let palavrasFrente = keywordsComuns;

if (frente === 'DADOS_BI') {
  palavrasFrente = [
    ...keywordsComuns,
    ...keywordsDados
  ];
}

if (frente === 'OPERACOES_PLANEJAMENTO') {
  palavrasFrente = [
    ...keywordsComuns,
    ...keywordsOperacoes
  ];
}

if (frente === 'FINANCEIRO_ADMINISTRATIVO') {
  palavrasFrente = [
    ...keywordsComuns,
    ...keywordsFinanceiro
  ];
}

if (frente === 'ESTAGIO_ADS') {
  palavrasFrente = [
    ...keywordsComuns,
    ...keywordsEstagio
  ];
}

if (frente === 'MULTIFRENTE' || !frente) {
  palavrasFrente = [
    ...keywordsComuns,
    ...keywordsDados,
    ...keywordsOperacoes,
    ...keywordsFinanceiro,
    ...keywordsEstagio
  ];
}

// Remove repetidos
palavrasFrente = [...new Set(palavrasFrente)];

const encontrados = palavrasFrente.filter(
  palavra =>
    contem(cargo, palavra) ||
    contem(descricao, palavra)
);

score += Math.min(
  encontrados.length * 4,
  28
);

if (encontrados.length > 0) {
  sinais.push(
    `${encontrados.length} palavras-chave relevantes`
  );
}

// ========================================================
// 4. MODALIDADE E LOCALIZAÇÃO
// ========================================================

// Disponibilidade REAL do candidato:
//
// REMOTO: Brasil
// HIBRIDO: São Paulo/SP
// PRESENCIAL: Baixada Santista definida abaixo

const cidadesPresenciaisAceitas = [
  'guaruja',
  'santos',
  'sao vicente',
  'praia grande',
  'cubatao',
  'bertioga'
];

const presencialCompativel =
  cidadesPresenciaisAceitas.some(
    cidade => local.includes(cidade)
  );

const saoPauloCapital =
  local.includes('sao paulo') ||
  /(^|[\s,])sp([\s,]|$)/.test(local);

// REMOTO
if (modalidade === 'REMOTO') {
  score += 15;
  sinais.push('Modalidade remota compatível');
}

// HÍBRIDO
else if (
  modalidade === 'HIBRIDO' &&
  saoPauloCapital
) {
  score += 15;
  sinais.push('Híbrido em São Paulo compatível');
}

// PRESENCIAL
else if (
  modalidade === 'PRESENCIAL' &&
  presencialCompativel
) {
  score += 15;
  sinais.push('Presencial em região compatível');
}

// Modalidade conhecida, mas incompatível
else if (modalidade === 'HIBRIDO') {
  score -= 15;
  motivos.push(
    'Híbrido fora da região de São Paulo desejada'
  );
}

else if (modalidade === 'PRESENCIAL') {
  score -= 20;
  motivos.push(
    'Presencial fora da região desejada'
  );
}

// Modalidade não informada
else if (modalidade === 'NAO_INFORMADO') {
  score += 2;
  motivos.push(
    'Modalidade não identificada automaticamente'
  );
}

// ========================================================
// 5. DIVERGÊNCIA ENTRE BUSCA E RESULTADO
// ========================================================

// Não descarta automaticamente.
//
// Exemplo:
// busca REMOTO encontrou HÍBRIDO SP.
// A vaga ainda é compatível com o candidato.

if (
  modalidadeAlvo &&
  modalidade !== 'NAO_INFORMADO' &&
  modalidade !== modalidadeAlvo
) {
  sinais.push(
    `Resultado diferente da busca (${modalidadeAlvo} → ${modalidade})`
  );
}

// ========================================================
// 6. EXPERIÊNCIA EXIGIDA
// ========================================================

function detectarAnosObrigatorios(texto = '') {

  const patterns = [
    /(?:minimo|minima|pelo menos|ao menos)\s+(?:de\s+)?(\d+)\+?\s*anos?/g,
    /(\d+)\+?\s*anos?\s+(?:de\s+)?experiencia/g,
    /minimum\s+(?:of\s+)?(\d+)\+?\s+years?/g,
    /at least\s+(\d+)\+?\s+years?/g,
    /(\d+)\+?\s+years?\s+of\s+experience/g
  ];

  let maior = 0;

  for (const regex of patterns) {
    let match;

    while ((match = regex.exec(texto)) !== null) {
      maior = Math.max(
        maior,
        Number(match[1]) || 0
      );
    }
  }

  return maior;
}

const anosObrigatorios =
  detectarAnosObrigatorios(descricao);

if (anosObrigatorios === 4) {
  score -= 8;

  motivos.push(
    'Vaga menciona 4 anos de experiência'
  );
}

if (
  anosObrigatorios >= 5 &&
  anosObrigatorios <= 6
) {
  score -= 20;

  motivos.push(
    `Vaga menciona ${anosObrigatorios} anos de experiência`
  );
}

if (anosObrigatorios >= 7) {
  descartar = true;

  motivos.push(
    `Exigência elevada de ${anosObrigatorios} anos de experiência`
  );
}

// ========================================================
// 7. ÁREAS CLARAMENTE FORA DO ALVO
// ========================================================

const cargosIrrelevantes = [
  'vendedor',
  'sales manager',
  'executivo de vendas',
  'engenheiro civil',
  'enfermeiro',
  'medico',
  'advogado',
  'designer grafico',
  'social media',
  'marketing manager',
  'recrutador',
  'recruiter',
  'recursos humanos',
  'human resources'
];

if (algum(cargo, cargosIrrelevantes)) {
  descartar = true;

  motivos.push(
    'Área claramente fora das frentes profissionais'
  );
}

// ========================================================
// 8. ESTÁGIOS FORA DO FOCO
// ========================================================

if (frente === 'ESTAGIO_ADS') {

  const estagiosForaDoFoco = [
    'help desk',
    'suporte tecnico',
    'service desk',
    'infraestrutura',
    'redes',
    'manutencao de computadores',
    'field service'
  ];

  if (
    algum(cargo, estagiosForaDoFoco) ||
    estagiosForaDoFoco.filter(
      x => contem(descricao, x)
    ).length >= 2
  ) {
    descartar = true;

    motivos.push(
      'Estágio predominantemente fora do foco de Dados/Automação/Sistemas'
    );
  }
}

// ========================================================
// 9. PROTEÇÃO CONTRA CARGO SEM RELAÇÃO
// ========================================================

// Se o título não bate com nenhuma frente,
// exige pelo menos alguns sinais técnicos relevantes.
//
// Evita vagas aleatórias passarem apenas porque
// a descrição contém Excel ou SQL.

if (
  !cargoRelevante &&
  encontrados.length < 3
) {
  score -= 20;

  motivos.push(
    'Cargo pouco relacionado e poucos sinais relevantes'
  );
}

// ========================================================
// 10. NORMALIZA SCORE
// ========================================================

score = Math.max(
  0,
  Math.min(100, score)
);

// ========================================================
// 11. REGRA FINAL
// ========================================================

let preFiltro;

if (descartar) {

  preFiltro = 'DESCARTAR';

} else if (score >= 40) {

  preFiltro = 'ANALISAR';

} else {

  preFiltro = 'DESCARTAR';

  motivos.push(
    'Baixa aderência no pré-filtro'
  );
}

// ========================================================
// OUTPUT
// ========================================================

return {
  json: {
    ...vaga,

    pre_score: score,

    pre_filtro: preFiltro,

    sinais_pre_filtro: sinais,

    motivos_pre_filtro: motivos,

    palavras_relevantes_encontradas:
      encontrados,

    quantidade_palavras_relevantes:
      encontrados.length,

    cargo_relevante:
      cargoRelevante,

    anos_experiencia_identificados:
      anosObrigatorios,

    presencial_compativel:
      presencialCompativel,

    sao_paulo_compativel:
      saoPauloCapital
  }
};
