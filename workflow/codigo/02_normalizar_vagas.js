// Nó "Normalizar Vagas" do workflow n8n (extraído por codigo/extrair_workflow.py; edite no n8n)

// =========================================================
// NORMALIZAR VAGAS
// Mode: Run Once for Each Item
// =========================================================


// =========================================================
// FUNÇÕES AUXILIARES
// =========================================================

function stripHtml(html = '') {
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}


function get(obj, keys, fallback = '') {
  for (const key of keys) {
    if (
      obj &&
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ''
    ) {
      return obj[key];
    }
  }

  return fallback;
}


function getPath(obj, path, fallback = '') {
  try {
    const value = path
      .split('.')
      .reduce((acc, key) => acc?.[key], obj);

    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      return value;
    }

    return fallback;
  } catch {
    return fallback;
  }
}


function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}


function firstNonEmpty(values, fallback = '') {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      return value;
    }
  }

  return fallback;
}


// =========================================================
// URL CANÔNICA DA VAGA
// =========================================================

function canonicalLinkedinJobUrl(raw = '', id = '') {

  if (id) {
    return `https://www.linkedin.com/jobs/view/${id}`;
  }

  try {
    const url = new URL(raw);

    const match = url.pathname.match(
      /jobs\/view\/(?:.*-)?(\d+)/
    );

    if (match) {
      return `https://www.linkedin.com/jobs/view/${match[1]}`;
    }

    url.search = '';
    url.hash = '';

    return url.toString();

  } catch {
    return raw;
  }
}


// =========================================================
// URL CANÔNICA DE PERFIL LINKEDIN
// =========================================================

function canonicalLinkedinProfileUrl(raw = '') {

  if (!raw) {
    return '';
  }

  try {
    const url = new URL(raw);

    url.search = '';
    url.hash = '';

    return url.toString()
      .replace(/\/+$/, '');

  } catch {
    return String(raw).trim();
  }
}


// =========================================================
// DETECÇÃO DE MODALIDADE
// =========================================================

function detectarModalidade(item, descricao = '') {

  // Primeiro prioriza campos explícitos
  const camposExplicitos = [
    item.workplaceTypes,
    item.workplaceType,
    item['tipos de local de trabalho'],
    item['tipo de local de trabalho'],
    item['modalidade'],
    item['workplace']
  ]
    .flat()
    .filter(Boolean)
    .join(' ');

  const explicito = normalizeText(camposExplicitos);

  if (
    explicito.includes('remote') ||
    explicito.includes('remoto')
  ) {
    return 'REMOTO';
  }

  if (
    explicito.includes('hybrid') ||
    explicito.includes('hibrido')
  ) {
    return 'HIBRIDO';
  }

  if (
    explicito.includes('on-site') ||
    explicito.includes('onsite') ||
    explicito.includes('presencial')
  ) {
    return 'PRESENCIAL';
  }


  // Se o Apify não informar explicitamente,
  // verifica apenas o início da descrição
  const desc = normalizeText(descricao).slice(0, 2500);

  if (
    /\b(100% remote|fully remote|remote position|trabalho remoto|vaga remota|100% remoto)\b/.test(desc)
  ) {
    return 'REMOTO';
  }

  if (
    /\b(hybrid|hibrido|modelo hibrido|trabalho hibrido|regime hibrido)\b/.test(desc)
  ) {
    return 'HIBRIDO';
  }

  if (
    /\b(on-site|onsite|presencial|modelo presencial|trabalho presencial)\b/.test(desc)
  ) {
    return 'PRESENCIAL';
  }

  return 'NAO_INFORMADO';
}


// =========================================================
// NORMALIZAR NÚMERO DE CANDIDATOS
// =========================================================

function normalizarCandidatos(valor) {

  if (
    valor === undefined ||
    valor === null ||
    valor === ''
  ) {
    return null;
  }

  if (typeof valor === 'number') {
    return valor;
  }

  const texto = String(valor);

  const numeros = texto.match(/\d+/g);

  if (!numeros || numeros.length === 0) {
    return null;
  }

  return Number(
    numeros.join('')
  );
}


// =========================================================
// EXTRAÇÃO DO RECRUTADOR / JOB POSTER
// =========================================================

function extrairRecrutador(item) {

  let nome = '';
  let cargo = '';
  let linkedin = '';
  let fonte = 'NAO_INFORMADO';


  // ---------------------------------------------------------
  // 1. Campos simples/flat
  // ---------------------------------------------------------

  nome = String(firstNonEmpty([
    item.jobPosterName,
    item.recruiterName,
    item.hiringContactName,
    item.posterFullName,
    item.recruiterFullName,
    item['nome do recrutador'],
    item['nome recrutador']
  ])).trim();

  cargo = String(firstNonEmpty([
    item.jobPosterTitle,
    item.recruiterTitle,
    item.hiringContactTitle,
    item.posterHeadline,
    item.recruiterHeadline,
    item['cargo do recrutador']
  ])).trim();

  linkedin = String(firstNonEmpty([
    item.jobPosterProfileUrl,
    item.jobPosterUrl,
    item.recruiterProfileUrl,
    item.recruiterLinkedinUrl,
    item.hiringContactUrl,
    item.posterProfileUrl,
    item.posterUrl,
    item['linkedin do recrutador'],
    item['link do recrutador']
  ])).trim();

  if (nome || linkedin) {
    fonte = 'CAMPOS_DIRETOS';
  }


  // ---------------------------------------------------------
  // 2. Objeto jobPoster
  // ---------------------------------------------------------

  if (!nome) {
    nome = String(firstNonEmpty([
      getPath(item, 'jobPoster.name'),
      getPath(item, 'jobPoster.fullName'),
      getPath(item, 'jobPoster.displayName')
    ])).trim();

    if (nome) {
      fonte = 'JOB_POSTER';
    }
  }

  if (!cargo) {
    cargo = String(firstNonEmpty([
      getPath(item, 'jobPoster.title'),
      getPath(item, 'jobPoster.headline'),
      getPath(item, 'jobPoster.position')
    ])).trim();
  }

  if (!linkedin) {
    linkedin = String(firstNonEmpty([
      getPath(item, 'jobPoster.profileUrl'),
      getPath(item, 'jobPoster.linkedinUrl'),
      getPath(item, 'jobPoster.url')
    ])).trim();

    if (linkedin) {
      fonte = 'JOB_POSTER';
    }
  }


  // ---------------------------------------------------------
  // 3. Objeto recruiter
  // ---------------------------------------------------------

  if (!nome) {
    nome = String(firstNonEmpty([
      getPath(item, 'recruiter.name'),
      getPath(item, 'recruiter.fullName'),
      getPath(item, 'recruiter.displayName')
    ])).trim();

    if (nome) {
      fonte = 'RECRUITER';
    }
  }

  if (!cargo) {
    cargo = String(firstNonEmpty([
      getPath(item, 'recruiter.title'),
      getPath(item, 'recruiter.headline'),
      getPath(item, 'recruiter.position')
    ])).trim();
  }

  if (!linkedin) {
    linkedin = String(firstNonEmpty([
      getPath(item, 'recruiter.profileUrl'),
      getPath(item, 'recruiter.linkedinUrl'),
      getPath(item, 'recruiter.url')
    ])).trim();

    if (linkedin) {
      fonte = 'RECRUITER';
    }
  }


  // ---------------------------------------------------------
  // 4. Hiring Team
  // Pode vir como array
  // ---------------------------------------------------------

  const hiringTeam = firstNonEmpty([
    item.hiringTeam,
    item.hiring_team,
    item['hiring team'],
    item['equipe de contratação']
  ], []);

  if (
    Array.isArray(hiringTeam) &&
    hiringTeam.length > 0
  ) {

    const pessoa = hiringTeam[0];

    if (!nome) {
      nome = String(firstNonEmpty([
        pessoa?.name,
        pessoa?.fullName,
        pessoa?.displayName
      ])).trim();
    }

    if (!cargo) {
      cargo = String(firstNonEmpty([
        pessoa?.title,
        pessoa?.headline,
        pessoa?.position
      ])).trim();
    }

    if (!linkedin) {
      linkedin = String(firstNonEmpty([
        pessoa?.profileUrl,
        pessoa?.linkedinUrl,
        pessoa?.url
      ])).trim();
    }

    if (nome || linkedin) {
      fonte = 'HIRING_TEAM';
    }
  }


  // ---------------------------------------------------------
  // 5. Nome pode vir dividido em firstName / lastName
  // ---------------------------------------------------------

  if (!nome) {

    const firstName = String(firstNonEmpty([
      getPath(item, 'jobPoster.firstName'),
      getPath(item, 'recruiter.firstName')
    ])).trim();

    const lastName = String(firstNonEmpty([
      getPath(item, 'jobPoster.lastName'),
      getPath(item, 'recruiter.lastName')
    ])).trim();

    nome = `${firstName} ${lastName}`.trim();

    if (nome) {
      fonte = 'NOME_SEPARADO';
    }
  }


  // ---------------------------------------------------------
  // Normaliza URL
  // ---------------------------------------------------------

  linkedin = canonicalLinkedinProfileUrl(
    linkedin
  );


  return {
    nome,
    cargo,
    linkedin,
    fonte,
    encontrado: Boolean(nome || linkedin)
  };
}


// =========================================================
// ITEM RECEBIDO DO APIFY
// =========================================================

const item = $json;


// =========================================================
// CAMPOS PRINCIPAIS DA VAGA
// =========================================================

const id = String(
  get(item, [
    'id',
    'eu ia',
    'jobId',
    'job_id'
  ])
).trim();


const titulo = String(
  get(item, [
    'title',
    'título',
    'titulo',
    'jobTitle'
  ])
).trim();


const empresa = String(
  get(item, [
    'companyName',
    'nome da empresa',
    'empresa',
    'company'
  ])
).trim();


const localizacao = String(
  get(item, [
    'location',
    'localização',
    'localizacao'
  ])
).trim();


// =========================================================
// DESCRIÇÃO
// =========================================================

const descricaoHtml = String(
  get(item, [
    'descriptionHtml',
    'descricaoHtml',
    'description_html'
  ])
);


const descricaoDireta = get(item, [
  'descriptionText',
  'descricaoTexto',
  'description'
]);


const descricaoTexto = String(
  descricaoDireta ||
  stripHtml(descricaoHtml)
).trim();


// =========================================================
// LINK DA VAGA
// =========================================================

const linkOriginal = String(
  get(item, [
    'link',
    'jobUrl',
    'job_url',
    'url'
  ])
).trim();


const link = canonicalLinkedinJobUrl(
  linkOriginal,
  id
);


// =========================================================
// LINK PARA CANDIDATURA
// =========================================================

const applyUrl = String(
  get(item, [
    'applyUrl',
    'applyURL',
    'apply_url'
  ])
).trim();


// =========================================================
// DATA DA PUBLICAÇÃO
// =========================================================

const dataPublicacao = get(item, [
  'postedAt',
  'postadoEm',
  'posted_at',
  'publishedAt'
]);


// =========================================================
// CANDIDATOS
// =========================================================

const candidatosRaw = get(item, [
  'applicantsCount',
  'contagem de candidatos',
  'numeroCandidatos',
  'applicants'
], '');


const candidatos = normalizarCandidatos(
  candidatosRaw
);


// =========================================================
// MODALIDADE
// =========================================================

const modalidade = detectarModalidade(
  item,
  descricaoTexto
);


// =========================================================
// RECRUTADOR
// =========================================================

const recrutador = extrairRecrutador(
  item
);


// =========================================================
// CONTEXTO DA PESQUISA
// =========================================================

let contexto = {};

try {

  contexto =
    $('Executar Pesquisas').item.json;

} catch (e) {

  contexto = {};

}


// =========================================================
// VALIDAÇÃO
// =========================================================

const problemas = [];


if (!titulo) {
  problemas.push('SEM_CARGO');
}


if (!empresa) {
  problemas.push('SEM_EMPRESA');
}


if (!descricaoTexto) {
  problemas.push('SEM_DESCRICAO');
}


if (!id && !linkOriginal) {
  problemas.push('SEM_IDENTIFICADOR');
}


const dadosValidos =
  titulo !== '' &&
  empresa !== '' &&
  (id !== '' || linkOriginal !== '');


// =========================================================
// DEDUPE KEY
// =========================================================

const dedupeKey = id
  ? `linkedin:${id}`
  : `linkedin:${normalizeText(
      `${empresa}|${titulo}|${localizacao}`
    )}`;


// =========================================================
// OUTPUT
// =========================================================

return {
  json: {

    // -------------------------------------------------------
    // IDENTIFICAÇÃO
    // -------------------------------------------------------

    vaga_id: id,

    dedupe_key: dedupeKey,

    fonte: 'LinkedIn',


    // -------------------------------------------------------
    // DADOS DA VAGA
    // -------------------------------------------------------

    cargo: titulo,

    empresa,

    localizacao,

    modalidade_detectada:
      modalidade,


    // -------------------------------------------------------
    // PUBLICAÇÃO / CANDIDATOS
    // -------------------------------------------------------

    data_publicacao:
      dataPublicacao,

    candidatos,

    candidatos_original:
      candidatosRaw,


    // -------------------------------------------------------
    // LINKS
    // -------------------------------------------------------

    link,

    apply_url:
      applyUrl,

    company_linkedin_url:
      get(item, [
        'companyLinkedinUrl',
        'companyLinkedInUrl',
        'companyUrl'
      ]),


    // -------------------------------------------------------
    // RECRUTADOR / JOB POSTER
    // -------------------------------------------------------

    recrutador_nome:
      recrutador.nome,

    recrutador_cargo:
      recrutador.cargo,

    recrutador_linkedin:
      recrutador.linkedin,

    tem_recrutador:
      recrutador.encontrado,

    recrutador_fonte:
      recrutador.fonte,


    // -------------------------------------------------------
    // DESCRIÇÃO
    // -------------------------------------------------------

    descricao:
      descricaoTexto,


    // -------------------------------------------------------
    // ORIGEM DA BUSCA
    // -------------------------------------------------------

    busca_origem:
      contexto.busca || '',

    frente_origem:
      contexto.frente || '',

    modalidade_alvo:
      contexto.modalidade_alvo || '',

    regiao_alvo:
      contexto.regiao_alvo || '',

    prioridade_busca:
      contexto.prioridade_busca ?? null,


    // -------------------------------------------------------
    // CONTROLE / QUALIDADE
    // -------------------------------------------------------

    dados_validos:
      dadosValidos,

    problemas_normalizacao:
      problemas,

    status:
      'ENCONTRADA',

    coletada_em:
      new Date().toISOString()
  }
};
