# Dicionário de Dados · Automação de vagas

Colunas de `sql/01_schema_vagas.sql` e campos dos formatos de saída da IA em `workflow/schemas/`.

---

## Tabela `vagas` (PostgreSQL)

**Grão:** 1 linha por vaga classificada (passou pelo pré-filtro e pela IA). Gravada pelo nó "Registrar Vaga" com `INSERT ... ON CONFLICT (dedupe_key) DO UPDATE`.

| Coluna | Tipo | Regra | Descrição |
|---|---|---|---|
| `id` | BIGSERIAL | chave | Identificador interno do registro |
| `dedupe_key` | TEXT | única, obrigatória | Chave única da vaga (`linkedin:<id>`); impede duplicar a mesma vaga |
| `vaga_id` | TEXT |  | Id da vaga no LinkedIn |
| `data_encontrada` | TIMESTAMPTZ | obrigatória | Quando a automação encontrou a vaga |
| `fonte` | TEXT |  | Origem da vaga (LinkedIn) |
| `cargo` | TEXT |  | Título do anúncio |
| `empresa` | TEXT |  | Empresa anunciante |
| `localizacao` | TEXT |  | Local informado no anúncio |
| `modalidade` | TEXT |  | REMOTO, HIBRIDO, PRESENCIAL ou NAO_INFORMADO (normalizada) |
| `data_publicacao` | TEXT |  | Data de publicação do anúncio |
| `candidatos` | INTEGER |  | Número de candidatos informado (200 = teto "200+" do LinkedIn) |
| `link` | TEXT |  | URL da vaga |
| `busca_origem` | TEXT |  | Qual das 10 buscas encontrou a vaga |
| `frente_origem` | TEXT |  | Frente profissional da busca |
| `prioridade_busca` | INTEGER |  | Prioridade da busca (1 = principal) |
| `score_tecnico` | INTEGER |  | Compatibilidade técnica (0 a 35) |
| `score_experiencia` | INTEGER |  | Experiência e responsabilidades (0 a 25) |
| `score_senioridade` | INTEGER |  | Senioridade (0 a 15) |
| `score_modalidade_localizacao` | INTEGER |  | Modalidade e localização (0 a 10) |
| `score_formacao` | INTEGER |  | Formação e elegibilidade (0 a 5) |
| `score_diferenciais` | INTEGER |  | Diferenciais (0 a 10) |
| `score_final` | INTEGER |  | Soma dos componentes; limitada a 49 se houver eliminatório |
| `classificacao` | TEXT |  | ALTA, MEDIA, BAIXA ou DESCARTAR |
| `acao` | TEXT |  | PREPARAR_CANDIDATURA, REVISAR, REGISTRAR ou ARQUIVAR |
| `eliminatorio` | BOOLEAN | obrigatória | Há requisito obrigatório claramente não atendido |
| `motivo_eliminatorio` | TEXT |  | Explicação curta do requisito incompatível |
| `frente_sugerida` | TEXT |  | Frente que a IA considera mais adequada para a vaga |
| `senioridade_detectada` | TEXT |  | Nível identificado pela IA no anúncio |
| `requisitos_atendidos` | JSONB | obrigatória | Lista de requisitos atendidos |
| `requisitos_parciais` | JSONB | obrigatória | Lista de requisitos atendidos em parte |
| `requisitos_ausentes` | JSONB | obrigatória | Lista de requisitos não atendidos |
| `pontos_fortes` | JSONB | obrigatória | Pontos fortes do perfil para a vaga |
| `riscos` | JSONB | obrigatória | Riscos ou pontos de atenção |
| `resumo_aderencia` | TEXT |  | Resumo da aderência escrito pela IA |
| `status_processo` | TEXT |  | Situação do registro no fluxo |
| `ultima_atualizacao` | TIMESTAMPTZ | obrigatória | Última gravação do registro |

**Índices:** `idx_vagas_score_final` (score_final DESC) · `idx_vagas_classificacao` (classificacao) · `idx_vagas_data_encontrada` (data_encontrada DESC)

---

## Saída da classificação (1ª chamada de IA)

Formato exigido do modelo no nó "Classificar Vaga". As notas são validadas e somadas pelo código.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `score_tecnico` | number | sim | Compatibilidade técnica (0 a 35) |
| `score_experiencia` | number | sim | Experiência e responsabilidades (0 a 25) |
| `score_senioridade` | number | sim | Senioridade (0 a 15) |
| `score_modalidade_localizacao` | number | sim | Modalidade e localização (0 a 10) |
| `score_formacao` | number | sim | Formação e elegibilidade (0 a 5) |
| `score_diferenciais` | number | sim | Diferenciais (0 a 10) |
| `eliminatorio` | boolean | sim | Há requisito obrigatório claramente não atendido |
| `motivo_eliminatorio` | string | sim | Explicação curta do requisito incompatível |
| `frente_sugerida` | string | sim | Frente que a IA considera mais adequada para a vaga |
| `senioridade_detectada` | string | sim | Nível identificado pela IA no anúncio |
| `resumo_aderencia` | string | sim | Resumo da aderência escrito pela IA |

---

## Saída da análise detalhada (2ª chamada de IA, só ALTA e MÉDIA)

Formato exigido no nó "Analisar Vaga em Detalhes". Alimenta a mensagem do Telegram; não altera o score.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `pontos_fortes` | lista de string | sim | Pontos fortes do perfil para a vaga |
| `requisitos_parciais` | lista de string | sim | Lista de requisitos atendidos em parte |
| `requisitos_ausentes` | lista de string | sim | Lista de requisitos não atendidos |
| `palavras_chave_ats` | lista de string | sim | Termos da vaga com evidência no perfil, para o currículo |
| `estrategia_curriculo` | string | sim | O que priorizar e o que deixar em segundo plano no currículo |
| `mensagem_recrutador` | string | sim | Mensagem curta sugerida para o recrutador |
