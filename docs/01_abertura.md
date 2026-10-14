# Abertura do Projeto · Automação de busca e triagem de vagas

**Autor:** Matheus Mendes · **Ferramentas:** n8n, JavaScript, OpenAI, Apify, PostgreSQL, Telegram · **Período analisado:** 29/09 a 11/10/2026

---

## 1. Contexto

Durante a minha busca por uma vaga em dados, a maior parte do tempo não ia para as candidaturas. Ia para
**procurar e descartar vagas**: pesquisar títulos diferentes, abrir cada anúncio, ler a descrição inteira e comparar
os requisitos com o que eu realmente sei, estudo ou já fiz profissionalmente. A maioria não tinha aderência:
senioridade acima, tecnologia que eu não domino, inglês avançado obrigatório, cidade inviável.

Construí um workflow no n8n que faz essa triagem por mim todos os dias e só me avisa das vagas que valem atenção,
já com o material para decidir e me candidatar.

## 2. Problema

Triagem manual é repetitiva, lenta e inconsistente: no fim do dia, a mesma vaga pode ser avaliada de jeitos diferentes
dependendo do cansaço. E o filtro do próprio site de vagas não entende o que eu sei de verdade (experiência profissional
é diferente de projeto de portfólio, que é diferente de conhecimento em estudo).

## 3. Pergunta central

> **Como reduzir o tempo de busca a só as vagas que merecem atenção, sem inflar a minha aderência e sem perder
> as que realmente combinam comigo?**

**Perguntas de apoio**
1. Quais regras objetivas eliminam vagas sem precisar de IA (e sem custo)?
2. Como medir a aderência de forma comparável entre vagas, com critérios e pesos explícitos?
3. Como impedir que a IA trate projeto como experiência profissional ou siga instruções escondidas na vaga?
4. O que preciso receber, além do link, para decidir e agir rápido?
5. O que as vagas analisadas dizem sobre as lacunas do meu perfil?

## 4. Objetivos

- Buscar vagas automaticamente, uma vez por dia, em várias frentes e modalidades.
- Descartar por regra o que é claramente incompatível, antes de qualquer chamada de IA.
- Pontuar cada vaga de 0 a 100 com critérios fixos e classificar em alta, média, baixa ou descartar.
- Registrar tudo em banco, sem duplicar a mesma vaga entre execuções.
- Entregar no Telegram só alta e média, com pontos fortes, lacunas, palavras-chave, estratégia de currículo e mensagem ao recrutador.

## 5. Escopo

| Inclui | Não inclui |
|---|---|
| Vagas do LinkedIn coletadas pelo Apify | Candidatura automática (a decisão continua minha) |
| 10 buscas: dados e BI, operações, financeiro, estágio; remoto, híbrido em SP e presencial na Baixada Santista | Outras fontes de vagas |
| Pré-filtro em JavaScript, classificação e análise com IA | Geração automática do currículo final |
| Histórico no PostgreSQL e alertas no Telegram | Acompanhamento do processo seletivo depois da candidatura |

## 6. Entregáveis

| Entregável | Onde |
|---|---|
| Workflow importável no n8n (sem credenciais) | `workflow/n8n-ai-job-search-public.json` |
| Lógica dos nós em arquivos legíveis: JavaScript, prompts e schemas | `workflow/codigo/`, `workflow/prompts/`, `workflow/schemas/` |
| Estrutura da tabela no banco | `sql/01_schema_vagas.sql` |
| Diagnóstico reprodutível do que a automação entregou | `codigo/analises/diagnostico.py` |
| Documentação (este e os documentos 02 a 06) | `docs/` |

## 7. Premissas e limitações

- A versão pública não traz credenciais nem o meu perfil completo: o perfil é um modelo a preencher.
- A tabela `vagas` só guarda o que passou pelo pré-filtro. Quantas vagas a busca trouxe no total fica no histórico de execuções do n8n.
- O LinkedIn mostra no máximo "200+ candidatos": acima disso, o número real é desconhecido.
- A IA pode avaliar o mesmo texto de formas diferentes. Por isso o score final, a classificação e a ação são calculados por código, e a decisão de se candidatar é sempre minha.
- Os dados exportados (`dados/vagas.csv`) não são publicados: trazem nomes de empresas e o resumo de aderência ao meu perfil.
