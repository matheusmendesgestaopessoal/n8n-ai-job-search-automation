![Automação de vagas · só as vagas que valem atenção chegam até mim](assets/banner.png)

<p align="center">
  <img src="https://img.shields.io/badge/n8n-workflow-EA4B71?logo=n8n&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-regras%20e%20score-F7DF1E?logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/OpenAI-Structured%20Output-111111">
  <img src="https://img.shields.io/badge/PostgreSQL-hist%C3%B3rico-4169E1?logo=postgresql&logoColor=white">
  <img src="https://img.shields.io/badge/Telegram-alertas-26A5E4?logo=telegram&logoColor=white">
  <img src="https://img.shields.io/badge/Python-diagn%C3%B3stico-3776AB?logo=python&logoColor=white">
  <img src="https://img.shields.io/badge/status-em%20uso%20real-1A6BF5">
</p>

<p align="center">
  <a href="https://matheusmendes.site/projetos/automacao-vagas"><img src="https://img.shields.io/badge/%E2%96%B6%20Ver%20a%20apresenta%C3%A7%C3%A3o%20do%20projeto-1A6BF5?style=for-the-badge" alt="Ver a apresentação do projeto"></a>
  <a href="workflow/n8n-ai-job-search-public.json"><img src="https://img.shields.io/badge/%E2%AC%87%20Workflow%20para%20importar%20no%20n8n-111111?style=for-the-badge" alt="Workflow para importar no n8n"></a>
</p>

<p align="center">
  <a href="#-arquitetura">Arquitetura</a> ·
  <a href="#-javascript-regras-antes-da-ia">JavaScript</a> ·
  <a href="#-ia-com-saída-estruturada">IA</a> ·
  <a href="#-postgresql">PostgreSQL</a> ·
  <a href="#-telegram">Telegram</a> ·
  <a href="#-python-o-que-a-automação-entregou">Python</a> ·
  <a href="#-documentação">Documentação</a> ·
  <a href="#-decisões-técnicas">Decisões</a> ·
  <a href="#-como-executar">Executar</a>
</p>

## Sobre o projeto

Na minha busca por uma vaga em dados, a maior parte do tempo não ia para as candidaturas: ia para **procurar e descartar vagas**. Abrir o anúncio, ler a descrição inteira e comparar cada requisito com o que eu sei de verdade, para descobrir que a maioria pedia senioridade acima, inglês fluente ou uma cidade inviável.

Construí um workflow no **n8n** que faz essa triagem todo dia: busca vagas, descarta por regra o que não combina, usa IA para comparar cada vaga com o meu perfil, calcula um **score de 0 a 100 em código**, guarda o histórico no **PostgreSQL** e me avisa no **Telegram** só das vagas de alta e média aderência, já com o material para me candidatar.

> **Pergunta:** como reduzir a busca só às vagas que merecem atenção, sem inflar a minha aderência e sem perder as que combinam comigo?
> **Resultado em 12 dias de uso real:** centenas de vagas coletadas, a maioria descartada por regra antes da IA; 46 passaram pela análise completa e **30 chegaram ao Telegram** (13 de alta e 17 de média aderência) e a regra de requisito eliminatório evitou 9 alertas inúteis. Todos os scores conferidos batem com as regras do código. [Análise completa](docs/05_analise_e_recomendacoes.md)

O foco deste README é **como foi feito**: as ferramentas, por que cada uma e as decisões técnicas no caminho. A história contada visualmente está na [**apresentação no meu portfólio**](https://matheusmendes.site/projetos/automacao-vagas).

---

## 🏗 Arquitetura

29 nós em 5 etapas. A IA só entra depois que regras baratas já descartaram o que não combina, e nunca decide sozinha: ela devolve notas num formato fixo, e o score, a classificação e a ação são calculados em código.

![Da busca ao alerta, em 5 etapas](assets/fluxo.png)

<details>
<summary><b>O workflow no n8n</b></summary>

![Workflow completo no n8n](assets/prints/workflow-overview.png)

| Parte | Print |
|---|---|
| Busca, normalização e pré-filtro | [01-job-discovery-filtering.png](assets/prints/01-job-discovery-filtering.png) |
| Classificação com IA, score e gravação | [02-ai-scoring-persistence.png](assets/prints/02-ai-scoring-persistence.png) |
| Análise detalhada e envio | [03-detailed-analysis-routing.png](assets/prints/03-detailed-analysis-routing.png) |
</details>

O JSON do n8n guarda a lógica dentro dos nós, difícil de ler no GitHub. Por isso o código de cada nó, os prompts e os formatos de saída da IA também estão em arquivos de texto, como cópia para leitura:

| Pasta | Conteúdo |
|---|---|
| [`workflow/codigo/`](workflow/codigo/) | JavaScript dos 5 nós de código: pesquisas, normalização, pré-filtro, score e mensagens |
| [`workflow/prompts/`](workflow/prompts/) | Os 2 prompts: classificação e análise detalhada |
| [`workflow/schemas/`](workflow/schemas/) | Os 2 formatos de saída exigidos da IA (JSON Schema) |

---

## ⚙ JavaScript: regras antes da IA

**Por que regras antes:** boa parte das vagas é eliminada por sinais objetivos (cargo sênior, área fora do alvo, 7 anos de experiência). Mandar tudo para a IA custaria mais e não mudaria o resultado.

| Nó | O que faz | Técnicas |
|---|---|---|
| [`01_gerar_pesquisas.js`](workflow/codigo/01_gerar_pesquisas.js) | 10 buscas: frente × modalidade × região | parâmetros do Apify gerados por código, modo de teste |
| [`02_normalizar_vagas.js`](workflow/codigo/02_normalizar_vagas.js) | Formato único para cada vaga | detecção de modalidade, `"200+"` → 200, chave `dedupe_key` |
| [`03_pre_filtro.js`](workflow/codigo/03_pre_filtro.js) | Pontua e descarta antes da IA | expressões regulares por frente, pontos por sinal, corte em 40 |
| [`04_calcular_score_final.js`](workflow/codigo/04_calcular_score_final.js) | Score, faixa e ação | validação da saída da IA, limite por critério, teto do eliminatório |

O pré-filtro soma e subtrai pontos: cargo júnior +20, cargo de uma das frentes +30, palavras-chave até +28, modalidade viável +15, presencial fora da Baixada −20, 5 ou 6 anos de experiência −20. Abaixo de 40, a vaga para ali. A tabela completa está nas [regras de negócio](docs/02_regras_de_negocio.md).

```js
// workflow/codigo/04_calcular_score_final.js · a IA dá as notas, o código decide
function clampInt(value, min, max) {
  const numero = Number(value);
  if (!Number.isFinite(numero)) throw new Error(`Score inválido recebido da IA: ${value}`);
  return Math.max(min, Math.min(max, Math.round(numero)));
}

const scoreBruto = componentes.tecnico + componentes.experiencia + componentes.senioridade
                 + componentes.modalidade_localizacao + componentes.formacao + componentes.diferenciais;
const scoreFinal = eliminatorio ? Math.min(scoreBruto, 49) : scoreBruto;
```

---

## 🤖 IA com saída estruturada

**Por que saída estruturada:** um texto livre não entra num pipeline. A IA responde num formato fixo ([JSON Schema](workflow/schemas/01_classificacao.schema.json)) com as 6 notas, o requisito eliminatório, o motivo e um resumo. Se faltar uma nota, o fluxo para em vez de gravar um score errado.

![A IA dá as notas, o código decide](assets/score.png)

Três regras do [prompt de classificação](workflow/prompts/01_classificar_vaga.md) que mais pesam no resultado:

| Regra | Por quê |
|---|---|
| Experiência profissional ≠ projeto de portfólio ≠ estudo | Impede inflar a aderência. Em 67% das vagas a IA anotou que BI e SQL aparecem em projetos, não em experiência |
| Eliminatório só quando o requisito é obrigatório e claramente não atendido | "Desejável" e "diferencial" nunca eliminam, e na dúvida a vaga não é eliminada |
| A descrição da vaga é dado, nunca instrução | Proteção contra instruções escondidas num anúncio (*prompt injection*) |

A segunda chamada de IA ([análise detalhada](workflow/prompts/02_analisar_vaga_em_detalhes.md)) só roda para alta e média aderência: é a mais longa, então vai só para o que pode chegar até mim.

---

## 🗄 PostgreSQL

**Por que um banco:** o Telegram mostra a vaga e ela se perde na conversa. O banco guarda cada vaga com os 6 componentes do score, o motivo do descarte e o resumo de aderência, e é dele que sai a análise do que a automação entregou.

| Decisão | Como |
|---|---|
| Uma linha por vaga | `dedupe_key` com `UNIQUE` ([`sql/01_schema_vagas.sql`](sql/01_schema_vagas.sql)) |
| Vaga que reaparece é atualizada | `INSERT ... ON CONFLICT (dedupe_key) DO UPDATE` |
| Duplicatas evitadas antes da IA | nó Remove Duplicates com as últimas 10.000 chaves |
| Listas da análise detalhada | colunas `JSONB` (pontos fortes, lacunas, palavras-chave) |

---

## 📨 Telegram

**Por que o Telegram:** a notificação chega no celular, e o alerta já traz o próximo passo. Alta e média aderência recebem mensagens diferentes, e logo depois chega um prompt pronto para adaptar o currículo à vaga.

![O alerta já chega com o próximo passo](assets/telegram.png)

<details>
<summary><b>Prints reais do Telegram (empresa ocultada)</b></summary>

<p align="center">
  <img src="assets/prints/04-telegram-opportunity-summary.png" alt="Resumo de uma vaga no Telegram" width="32%">
  <img src="assets/prints/05-telegram-resume-prompt-part-1.png" alt="Prompt do currículo, parte 1" width="32%">
  <img src="assets/prints/06-telegram-resume-prompt-part-2.png" alt="Prompt do currículo, parte 2" width="32%">
</p>
</details>

---

## 🐍 Python: o que a automação entregou

**Por que Python:** uma automação também precisa ser avaliada. Exportei a tabela `vagas` e escrevi um diagnóstico que mede o resultado e confere se o score gravado respeita as regras do código.

![De centenas de vagas a 30 alertas](assets/triagem.png)

| O que [`diagnostico.py`](codigo/analises/diagnostico.py) mede | Resultado |
|---|---|
| Distribuição das faixas | 13 alta, 17 média, 1 baixa, 15 descartadas |
| Score = soma dos componentes, faixa e ação corretas | 46 de 46 |
| Vagas que a regra eliminatória segurou | 9 teriam chegado ao Telegram sem ela |
| Consistência da IA na mesma vaga | 1 caso divergente: 66 numa cidade, 49 na outra |
| Lacunas mais citadas | experiência profissional com BI/SQL (67%), formação (22%), inglês (17%) |

```python
# codigo/analises/diagnostico.py · o score gravado respeita a regra do código?
soma = v[list(COMPONENTES)].sum(axis=1)
esperado = soma.where(~v.eliminatorio, soma.clip(upper=49))
print(f"score_final = soma (teto 49 com eliminatório): {(esperado == v.score_final).sum()} de {len(v)}")
```

A conferência também achou o que não estava certo: só a 1ª das 10 buscas gerou registros, e 1 registro foi gravado sem os dados da vaga. As causas prováveis e as correções estão no [registro de revisão](docs/06_registro_de_correcoes.md).

---

## 📚 Documentação

| Documento | Conteúdo |
|---|---|
| [01 · Abertura](docs/01_abertura.md) | Contexto, problema, pergunta central, escopo, entregáveis, premissas e limitações |
| [02 · Regras de negócio](docs/02_regras_de_negocio.md) | Busca, normalização, pré-filtro, deduplicação, IA, score e entrega, cada regra com o arquivo onde está |
| [03 · Requisitos](docs/03_requisitos.md) | 15 requisitos funcionais e 7 não funcionais |
| [04 · Dicionário de dados](docs/04_dicionario_de_dados.md) | Colunas da tabela `vagas` e campos da saída da IA |
| [05 · Análise e recomendações](docs/05_analise_e_recomendacoes.md) | O que a automação entregou e cartões de decisão com causa, validação e ação |
| [06 · Registro de revisão](docs/06_registro_de_correcoes.md) | O que foi conferido, os problemas encontrados e como reproduzir |

---

## 🧠 Decisões técnicas

| Decisão | Por quê |
|---|---|
| **Regras em JavaScript antes da IA** | Vagas claramente incompatíveis não gastam chamada de IA. |
| **Score calculado por código** | A IA pode avaliar o mesmo texto de jeitos diferentes; soma, teto, faixa e ação ficam previsíveis e auditáveis. |
| **Saída estruturada com validação** | Nota fora do limite é corrigida; nota ausente interrompe o fluxo. |
| **Teto de 49 com requisito eliminatório** | Uma vaga pode ir bem em 5 critérios e ainda pedir algo que eu não tenho. Segurou 9 alertas. |
| **Projeto não é experiência profissional** | O alerta precisa refletir o que eu posso afirmar numa entrevista. |
| **Deduplicação em duas camadas** | Remove Duplicates antes da IA e `ON CONFLICT` no banco. |
| **Segunda análise só para alta e média** | A chamada mais longa vai só para o que chega até mim. |
| **Lógica também em arquivos de texto** | O JSON do n8n é a fonte; `workflow/codigo`, `prompts` e `schemas` permitem ler e revisar no GitHub. |
| **Credenciais, perfil e dados fora do Git** | O workflow público não tem chaves nem `chat_id`, o perfil é um modelo a preencher e a exportação da tabela (com nomes de empresas) não é versionada. |

---

## ▶ Como executar

**Pré-requisitos:** n8n, PostgreSQL e contas no Apify (com o nó da comunidade `@apify/n8n-nodes-apify` instalado no n8n), OpenAI e Telegram (um bot).

1. Crie a tabela rodando [`sql/01_schema_vagas.sql`](sql/01_schema_vagas.sql) no PostgreSQL.
2. No n8n, importe [`workflow/n8n-ai-job-search-public.json`](workflow/n8n-ai-job-search-public.json).
3. Configure as credenciais **dentro do n8n** (o [`.env.example`](.env.example) só lista o que é preciso).
4. Troque o perfil no nó "Adicionar Perfil Candidato", o `chat_id` do Telegram e, se quiser, as buscas em "Gerar Pesquisas".
5. Rode uma execução manual antes de ativar o agendamento. Com `TEST_MODE = true` em "Gerar Pesquisas", só a 1ª busca é executada.

**Rodar o diagnóstico:**

```bash
git clone https://github.com/matheusmendesgestaopessoal/n8n-ai-job-search-automation.git
cd n8n-ai-job-search-automation
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
# exporte a tabela vagas para dados/vagas.csv (ver dados/README.md)
python codigo/analises/diagnostico.py
```

As imagens deste README são geradas a partir de HTML com `python assets/fontes/gerar_diagramas.py`.

<details>
<summary><b>Estrutura do repositório</b></summary>

```
n8n-ai-job-search-automation/
├── workflow/
│   ├── n8n-ai-job-search-public.json   # o workflow para importar (fonte da lógica)
│   ├── codigo/            # JavaScript dos nós, cópia para leitura
│   ├── prompts/           # os 2 prompts da IA
│   └── schemas/           # os 2 formatos de saída da IA
├── sql/
│   └── 01_schema_vagas.sql             # tabela vagas
├── codigo/
│   └── analises/          # diagnostico.py: mede o que a automação entregou
├── docs/                  # 6 documentos do projeto
├── dados/                 # como exportar a tabela (vagas.csv fica fora do Git)
├── assets/                # imagens do README (fontes/ gera a partir de HTML) e prints/ do n8n e do Telegram
├── .env.example
└── requirements.txt
```
</details>

---

## Próximos passos

- Confirmar no histórico de execuções do n8n por que só a 1ª busca gerou vagas e corrigir o laço das buscas.
- Levar para o pré-filtro a detecção de formação concluída e inglês fluente obrigatórios (11 dos 15 descartes).
- Juntar a vaga e a resposta da IA pela `dedupe_key`, e não pela posição, e bloquear a gravação de registros sem dados.
- Registrar no banco o status da candidatura para medir quantos alertas viram entrevista.

---

## Autor

**Matheus Mendes** · Analista de Dados · SQL · Python · Power BI

Passei mais de três anos na operação de empresas de engenharia e manutenção (programação, medição e faturamento de cerca de 3 mil ordens de serviço por mês) e foi digitalizando processos que encontrei os dados. Hoje curso Análise e Desenvolvimento de Sistemas e trabalho com análise de dados de ponta a ponta, do banco ao dashboard.

[![Portfólio](https://img.shields.io/badge/Portf%C3%B3lio-1A6BF5?style=for-the-badge&logo=googlechrome&logoColor=white)](https://matheusmendes.site/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/matheusmendes-dados)
[![GitHub](https://img.shields.io/badge/GitHub-111111?style=for-the-badge&logo=github&logoColor=white)](https://github.com/matheusmendesgestaopessoal)
[![E-mail](https://img.shields.io/badge/E--mail-5E5E5E?style=for-the-badge&logo=gmail&logoColor=white)](mailto:matheus.mendesgestao@gmail.com)
