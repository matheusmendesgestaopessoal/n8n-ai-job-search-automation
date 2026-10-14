// Código do nó "Code in JavaScript" (cópia do workflow n8n; a fonte é workflow/n8n-ai-job-search-public.json)

const item = $json;

// ========================================================
// 1. RESPOSTA DA IA
// ========================================================

const analise =
  item.output &&
  typeof item.output === 'object' &&
  !Array.isArray(item.output)
    ? item.output
    : {};

// ========================================================
// 2. FUNÇÕES AUXILIARES
// ========================================================

function limparTexto(valor) {
  return String(valor || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function limparLista(valor, maxItens) {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .map(limparTexto)
    .filter(Boolean)
    .slice(0, maxItens);
}

function formatarLista(lista) {
  return lista.length
    ? lista.join(' | ')
    : 'Nenhum identificado';
}

// ========================================================
// 3. NORMALIZAR ANÁLISE
// ========================================================

const pontosFortes =
  limparLista(
    analise.pontos_fortes,
    4
  );

const requisitosParciais =
  limparLista(
    analise.requisitos_parciais,
    3
  );

const requisitosAusentes =
  limparLista(
    analise.requisitos_ausentes,
    3
  );

const palavrasChaveAts =
  limparLista(
    analise.palavras_chave_ats,
    10
  );

const estrategiaCurriculo =
  limparTexto(
    analise.estrategia_curriculo
  );

const mensagemRecrutador =
  limparTexto(
    analise.mensagem_recrutador
  );

// ========================================================
// 4. DADOS DA VAGA
// ========================================================

const cargo =
  limparTexto(item.cargo) ||
  'Não informado';

const empresa =
  limparTexto(item.empresa) ||
  'Não informada';

const localizacao =
  limparTexto(item.localizacao) ||
  'Não informada';

const modalidade =
  limparTexto(item.modalidade_detectada) ||
  'Não informada';

// ========================================================
// 5. GERAR PROMPT COMPACTO DO CURRÍCULO
// ========================================================

const promptCurriculo = `
Adapte meu Currículo Mestre para esta vaga.

VAGA
Cargo: ${cargo}
Empresa: ${empresa}
Localização: ${localizacao}
Modalidade: ${modalidade}

PONTOS FORTES
${formatarLista(pontosFortes)}

REQUISITOS PARCIAIS
${formatarLista(requisitosParciais)}

REQUISITOS AUSENTES
${formatarLista(requisitosAusentes)}

PALAVRAS-CHAVE
${formatarLista(palavrasChaveAts)}

ESTRATÉGIA
${estrategiaCurriculo || 'Não informada'}

INSTRUÇÕES
Vou fornecer meu Currículo Mestre junto com este prompt. Adapte-o especificamente para esta oportunidade e use o currículo mestre como fonte factual principal.

Priorize no título, resumo, experiências, projetos e competências o que tiver relação real com a vaga. Nas experiências, preserve empresa, cargo oficial e período, mas reorganize os bullets para destacar primeiro as atividades mais relevantes. Não crie resultados ou números.

Projetos podem demonstrar conhecimento técnico, mas nunca devem ser apresentados como experiência profissional. Destaque somente projetos relevantes.

Priorize competências e palavras-chave compatíveis com o perfil. Não afirme requisitos listados como ausentes.

Não invente experiência, empresa, cargo, datas, tecnologias, certificações, resultados, números, idiomas ou nível de conhecimento. Não transforme projeto ou estudo em experiência profissional. Não atribua senioridade, especialização, domínio avançado ou experiência profissional sem evidência.

Preserve formação e certificações. Produza currículo profissional, objetivo, natural e compatível com ATS. Sem foto, gráficos, barras de habilidade ou tabelas. Priorize uma página A4 quando possível.

Ordem sugerida: NOME E CONTATO; TÍTULO PROFISSIONAL; RESUMO PROFISSIONAL; EXPERIÊNCIA PROFISSIONAL; PROJETOS RELEVANTES; COMPETÊNCIAS; FORMAÇÃO; CERTIFICAÇÕES; IDIOMAS E INFORMAÇÕES ADICIONAIS.

Não explique as alterações. Retorne somente o conteúdo final do currículo adaptado.
`
  .trim()
  .replace(/\n{3,}/g, '\n\n');

// ========================================================
// 6. REMOVER OUTPUT ANINHADO
// ========================================================

const {
  output,
  ...dadosOriginais
} = item;

// ========================================================
// 7. CONTROLE DE TAMANHO
// ========================================================

const tamanhoPrompt =
  promptCurriculo.length;

// ========================================================
// 8. OUTPUT FINAL
// ========================================================

return {
  json: {
    ...dadosOriginais,

    pontos_fortes:
      pontosFortes,

    requisitos_parciais:
      requisitosParciais,

    requisitos_ausentes:
      requisitosAusentes,

    palavras_chave_ats:
      palavrasChaveAts,

    estrategia_curriculo:
      estrategiaCurriculo,

    mensagem_recrutador:
      mensagemRecrutador,

    prompt_curriculo:
      promptCurriculo,

    prompt_curriculo_caracteres:
      tamanhoPrompt,

    prompt_cabe_em_uma_mensagem_telegram:
      tamanhoPrompt <= 3800
  }
};
