// Código do nó "Calcular Score Final" (cópia do workflow n8n; a fonte é workflow/n8n-ai-job-search-public.json)

const item = $json;

// ========================================================
// 1. VALIDAR OUTPUT DA IA
// ========================================================

if (
  !item.output ||
  typeof item.output !== 'object' ||
  Array.isArray(item.output)
) {
  throw new Error(
    'Calcular Score Final não recebeu o output estruturado da IA. Verifique o Merge Classificação.'
  );
}

const ai = item.output;

const { output, ...dadosOriginais } = item;

// ========================================================
// 2. CAMPOS OBRIGATÓRIOS
// ========================================================

const camposObrigatorios = [
  'score_tecnico',
  'score_experiencia',
  'score_senioridade',
  'score_modalidade_localizacao',
  'score_formacao',
  'score_diferenciais',
  'eliminatorio',
  'motivo_eliminatorio',
  'frente_sugerida',
  'senioridade_detectada',
  'resumo_aderencia'
];

const camposAusentes = camposObrigatorios.filter(
  campo =>
    ai[campo] === undefined ||
    ai[campo] === null
);

if (camposAusentes.length > 0) {
  throw new Error(
    `Classificação da IA incompleta. Campos ausentes: ${camposAusentes.join(', ')}`
  );
}

// ========================================================
// 3. AUXILIAR
// ========================================================

function clampInt(value, min, max) {
  const numero = Number(value);

  if (!Number.isFinite(numero)) {
    throw new Error(
      `Score inválido recebido da IA: ${value}`
    );
  }

  return Math.max(
    min,
    Math.min(max, Math.round(numero))
  );
}

// ========================================================
// 4. SCORES
// ========================================================

const componentes = {
  tecnico:
    clampInt(ai.score_tecnico, 0, 35),

  experiencia:
    clampInt(ai.score_experiencia, 0, 25),

  senioridade:
    clampInt(ai.score_senioridade, 0, 15),

  modalidade_localizacao:
    clampInt(
      ai.score_modalidade_localizacao,
      0,
      10
    ),

  formacao:
    clampInt(ai.score_formacao, 0, 5),

  diferenciais:
    clampInt(ai.score_diferenciais, 0, 10)
};

const scoreBruto =
  componentes.tecnico +
  componentes.experiencia +
  componentes.senioridade +
  componentes.modalidade_localizacao +
  componentes.formacao +
  componentes.diferenciais;

// ========================================================
// 5. ELIMINATÓRIO
// ========================================================

const eliminatorio =
  ai.eliminatorio === true;

const scoreFinal =
  eliminatorio
    ? Math.min(scoreBruto, 49)
    : scoreBruto;

// ========================================================
// 6. CLASSIFICAÇÃO
// ========================================================

let classificacao;
let acao;

if (eliminatorio) {
  classificacao = 'DESCARTAR';
  acao = 'ARQUIVAR';

} else if (scoreFinal >= 80) {
  classificacao = 'ALTA';
  acao = 'PREPARAR_CANDIDATURA';

} else if (scoreFinal >= 65) {
  classificacao = 'MEDIA';
  acao = 'REVISAR';

} else if (scoreFinal >= 50) {
  classificacao = 'BAIXA';
  acao = 'REGISTRAR';

} else {
  classificacao = 'DESCARTAR';
  acao = 'ARQUIVAR';
}

// ========================================================
// 7. VALIDAR FRENTE
// ========================================================

const frentesPermitidas = [
  'DADOS_BI',
  'OPERACOES_PLANEJAMENTO',
  'FINANCEIRO_ADMINISTRATIVO',
  'ESTAGIO_ADS',
  'OUTRA'
];

const frenteSugerida =
  frentesPermitidas.includes(
    ai.frente_sugerida
  )
    ? ai.frente_sugerida
    : 'OUTRA';

// ========================================================
// 8. VALIDAR SENIORIDADE
// ========================================================

const senioridadesPermitidas = [
  'ESTAGIO',
  'ASSISTENTE',
  'JUNIOR',
  'PLENO',
  'SENIOR',
  'ESPECIALISTA_LIDERANCA',
  'NAO_INFORMADA'
];

const senioridadeDetectada =
  senioridadesPermitidas.includes(
    ai.senioridade_detectada
  )
    ? ai.senioridade_detectada
    : 'NAO_INFORMADA';

// ========================================================
// 9. OUTPUT FINAL
// ========================================================

return {
  json: {
    ...dadosOriginais,

    score_tecnico:
      componentes.tecnico,

    score_experiencia:
      componentes.experiencia,

    score_senioridade:
      componentes.senioridade,

    score_modalidade_localizacao:
      componentes.modalidade_localizacao,

    score_formacao:
      componentes.formacao,

    score_diferenciais:
      componentes.diferenciais,

    score_componentes:
      componentes,

    score_bruto:
      scoreBruto,

    score_final:
      scoreFinal,

    classificacao,
    acao,

    eliminatorio,

    motivo_eliminatorio:
      eliminatorio
        ? String(ai.motivo_eliminatorio || '').trim()
        : '',

    frente_sugerida:
      frenteSugerida,

    senioridade_detectada:
      senioridadeDetectada,

    resumo_aderencia:
      String(ai.resumo_aderencia || '').trim(),

    classificacao_valida:
      true
  }
};
