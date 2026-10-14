# Análise e Recomendações · Automação de vagas

**Período:** 29/09 a 11/10/2026 (12 dias com execução) · **Universo:** 54 vagas registradas, 46 com análise completa
**Autor:** Matheus Mendes

Todos os números podem ser recalculados com `python codigo/analises/diagnostico.py`.

---

## Recomendação

> **A triagem funciona e é confiável no que depende de código. Os próximos ganhos estão em três frentes: fazer as
> 10 buscas rodarem de fato, mover para regras os descartes que a IA sempre repete e travar a gravação de registros
> incompletos.**

| Ordem | Frente | Decisão | Indicador (hoje → meta) | Esforço |
|:---:|---|---|---|---|
| 1 | Cobertura das buscas | Confirmar no histórico do n8n por que só a busca 1 gerou vagas e corrigir o laço | Buscas com resultado: 1 de 10 → 10 de 10 | Baixo |
| 2 | Regras antes da IA | Detectar "superior completo" e "inglês fluente/avançado" obrigatórios no pré-filtro | Descartes que passaram pela IA: 11 de 15 → perto de 0 | Baixo |
| 3 | Qualidade da gravação | Juntar vaga e resposta da IA pela chave da vaga e bloquear registro sem dados | Registros inválidos: 8 → 0 | Baixo |

---

## O que a automação entregou

| Indicador | Valor |
|---|---:|
| Vagas registradas · com análise completa | 54 · 46 |
| ALTA (preparar candidatura) | 13 (28%) |
| MÉDIA (revisar) | 17 (37%) |
| BAIXA (só registrar) | 1 (2%) |
| DESCARTAR (requisito eliminatório) | 15 (33%) |
| **Chegaram ao Telegram** | **30 de 46 (65%)** |
| Score médio · mediana · média das ALTA | 67 · 70 · 83 |

**As regras de código foram cumpridas em 100% dos casos.** Em 46 de 46 registros o score é a soma dos componentes
(com teto de 49 quando há eliminatório), a classificação está na faixa certa e a ação corresponde à classificação.
Nenhuma nota passou do limite do seu critério. Calcular o score por código, e não pedir o número final à IA,
deixou o resultado previsível.

**A regra eliminatória evitou alertas inúteis.** Das 15 vagas descartadas, 9 tinham soma de 65 a 77 e teriam chegado
ao Telegram sem a regra, mas exigiam algo que eu não atendo:

| Motivo do descarte | Vagas |
|---|---:|
| Formação superior concluída | 6 |
| Inglês avançado ou fluente | 5 |
| Localização ou modalidade inviável | 3 |
| Ferramenta específica obrigatória (Google Analytics) | 1 |

**O pré-filtro fez o trabalho dele.** A nota média de senioridade foi 93% do máximo: vagas de nível alto já tinham sido
barradas antes de chegar à IA.

## O que as vagas dizem sobre o meu perfil

Lacunas citadas nos resumos de aderência das 46 vagas:

| Lacuna | Vagas |
|---|---:|
| Ferramentas de BI e SQL demonstradas em projetos, mas não em experiência profissional | 31 (67%) |
| Formação superior concluída | 10 (22%) |
| Inglês | 8 (17%) |
| dbt, Databricks ou Airflow | 5 (11%) |
| Google Analytics / web analytics | 4 (9%) |
| BigQuery / GCP | 4 (9%) |

A regra de não tratar projeto como experiência profissional apareceu em 2 de cada 3 análises. É o que torna a
avaliação honesta, e também mostra o caminho: vagas júnior e de assistente, em que projeto conta como evidência,
são as que mais chegam a ALTA.

---

## Cartão 1 · Cobertura das buscas
**Prioridade:** Alta · **Esforço:** Baixo · **Confiança na causa:** Média

**Fato.** O workflow tem 10 buscas configuradas, mas 53 de 53 registros com dados vieram da busca 1 (Dados e BI, remoto).
Operações, financeiro, estágio, híbrido em SP e presencial na Baixada nunca geraram registro.
**Causas prováveis.** (a) o ramo "falso" do nó `If` (vaga reprovada no pré-filtro) volta direto para o laço
"Executar Pesquisas", o que pode encerrar o laço antes das outras buscas; (b) modo de teste ligado na versão em produção.
**Validação.** Conferir na aba *Executions* do n8n quantos itens cada busca retornou e em que ponto a execução terminou.
**Ação.** Ligar o ramo "falso" a um nó que só encerra o item, e manter o retorno ao laço apenas no fim do processamento da busca.
**Acompanhamento.** Contagem de registros por `busca_origem` a cada semana.

## Cartão 2 · Regras antes da IA
**Prioridade:** Média · **Esforço:** Baixo · **Confiança:** Alta

**Fato.** 11 dos 15 descartes foram por formação concluída ou inglês avançado obrigatórios, requisitos que aparecem
escritos de forma parecida nos anúncios.
**Interpretação.** Cada um desses casos gastou uma chamada de IA para chegar a uma conclusão que uma regra pegaria.
**Ação.** Adicionar ao pré-filtro a detecção de "superior completo / graduação concluída" e "inglês fluente / avançado"
quando aparecem como obrigatórios, mantendo "desejável" e "diferencial" fora da regra.
**Resultado esperado.** Menos chamadas de IA sem mudar a lista que chega ao Telegram.

## Cartão 3 · Qualidade da gravação
**Prioridade:** Média · **Esforço:** Baixo · **Confiança:** Média

**Fato.** 1 registro foi gravado sem os dados da vaga ("undefined" em todos os campos, mas com notas da IA) e 7 registros
do primeiro dia ficaram com score 0 e sem análise.
**Causa provável.** O nó `Merge` junta a vaga e a resposta da IA **pela posição** dos itens; se as listas se desalinham,
a resposta de uma vaga pode ser gravada sem a vaga. Os 7 registros de score 0 são de uma versão anterior do fluxo.
**Ação.** Juntar pelo campo `dedupe_key` em vez da posição e não gravar quando `dados_validos` for falso.

## Cartão 4 · Consistência da IA
**Prioridade:** Baixa · **Esforço:** Baixo · **Confiança:** Alta

**Fato.** A mesma vaga, publicada em duas cidades, recebeu 66 (MÉDIA) numa e 49 (DESCARTAR) na outra: numa leitura o inglês
foi considerado obrigatório, na outra não.
**Interpretação.** O mesmo texto pode ter avaliações diferentes. Por isso a decisão final é minha e o score é calculado por código.
**Ação.** Reaproveitar a classificação de vagas com mesmo cargo e empresa, ou reavaliar quando as notas divergirem.

---

## Premissas e limitações
- 46 vagas em 12 dias é uma amostra pequena e concentrada em uma busca (ver Cartão 1).
- As lacunas foram contadas por termos nos resumos escritos pela IA: indicam tendência, não uma medida exata.
- A tabela não guarda as vagas descartadas no pré-filtro, então o funil completo (busca → pré-filtro → IA) depende do histórico do n8n.
- O tempo economizado não foi medido.
