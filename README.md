# AI Job Search & Ranking Automation with n8n

Automação em **n8n** para buscar vagas, normalizar os dados, aplicar pré-filtros, usar IA para medir aderência ao perfil do candidato, registrar resultados em PostgreSQL e enviar as melhores oportunidades pelo Telegram.

## Visão geral

Fluxo principal:

```text
Schedule
  ↓
Generate Search Queries
  ↓
Apify / LinkedIn Jobs
  ↓
Normalize Job Data
  ↓
Rule-based Pre-filter
  ↓
Deduplication
  ↓
AI Job Fit Scoring
  ↓
PostgreSQL
  ↓
Detailed AI Analysis
  ↓
Telegram Notification
```

## O que o workflow faz

- Executa buscas de vagas automaticamente.
- Consulta vagas por meio de um actor do Apify.
- Normaliza cargo, empresa, localização, descrição, modalidade, links e dados do recrutador.
- Cria uma chave de deduplicação para evitar processar a mesma vaga repetidamente.
- Aplica um pré-filtro determinístico antes de chamar o modelo de IA.
- Avalia aderência em critérios separados:
  - compatibilidade técnica;
  - experiência;
  - senioridade;
  - modalidade/localização;
  - formação;
  - diferenciais.
- Gera um score final de 0 a 100.
- Classifica as vagas por prioridade.
- Salva os resultados em PostgreSQL.
- Para oportunidades mais relevantes, gera:
  - pontos fortes;
  - requisitos parciais;
  - requisitos ausentes;
  - palavras-chave para ATS;
  - estratégia de currículo;
  - mensagem para recrutador.
- Envia as melhores oportunidades pelo Telegram.

## Tecnologias

- n8n
- JavaScript
- OpenAI
- Apify
- PostgreSQL
- Telegram
- LinkedIn Jobs como fonte pesquisada pelo actor configurado no Apify

## Segurança

Este repositório não inclui credenciais reais.

Depois de importar o workflow no n8n, configure suas próprias credenciais para:

- Apify
- OpenAI
- PostgreSQL
- Telegram

Também substitua o perfil de candidato de exemplo no node `Adicionar Perfil Candidato`.

## Como usar

1. Importe `workflow/n8n-ai-job-search-public.json` no n8n.
2. Configure as credenciais necessárias.
3. Ajuste as buscas e localizações para o seu perfil.
4. Substitua `YOUR_TELEGRAM_CHAT_ID`.
5. Preencha o seu perfil no node `Adicionar Perfil Candidato`.
6. Crie a tabela PostgreSQL esperada pelo workflow.
7. Execute primeiro em modo de teste.
8. Ative o schedule somente depois de validar o fluxo.

## Decisões de design

### Pré-filtro antes da IA

O workflow evita enviar todas as vagas ao modelo. Primeiro aplica regras determinísticas de senioridade, localização, modalidade, cargo e palavras-chave.

Isso reduz chamadas de IA e concentra a análise detalhada nas vagas com maior potencial.

### Structured Output

As avaliações de IA utilizam saída estruturada para que o workflow possa validar e processar scores e campos de forma previsível.

### Deduplicação

Cada vaga recebe uma `dedupe_key`, permitindo evitar processamento repetido entre execuções.

### Persistência

As vagas classificadas são registradas em PostgreSQL, permitindo histórico e evolução futura do projeto.

## Possíveis evoluções

- dashboard em Power BI;
- histórico de candidaturas;
- acompanhamento de status das vagas;
- análise de taxa de resposta;
- múltiplos perfis de busca;
- personalização automática do currículo;
- interface web para configuração dos filtros.

## Aviso

Use automações de coleta de vagas em conformidade com os termos das plataformas e serviços utilizados.
