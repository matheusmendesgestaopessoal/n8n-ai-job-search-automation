# Registro de Revisão · 13/10/2026

Revisão do projeto depois de 12 dias de uso real. O histórico da tabela `vagas` foi exportado e conferido com
`codigo/analises/diagnostico.py`.

---

## 1. Conferido e correto

| O que foi conferido | Resultado |
|---|---|
| Score = soma dos 6 componentes, com teto de 49 quando há eliminatório | 46 de 46 |
| Classificação na faixa (80 / 65 / 50) | 46 de 46 |
| Ação correspondente à classificação | 46 de 46 |
| Notas dentro do limite de cada critério | 0 fora do limite |
| Credenciais, chat_id e perfil pessoal fora do workflow público | Nenhum dado sensível encontrado |

## 2. Problemas encontrados

| Problema | Efeito | Situação |
|---|---|---|
| Só a 1ª das 10 buscas gerou registros | Vagas de operações, financeiro, estágio, híbrido e presencial nunca foram analisadas | Causa a confirmar no histórico do n8n (Cartão 1 do doc 05) |
| 1 registro gravado sem dados da vaga | Linha "undefined" no histórico | Causa provável: junção por posição no `Merge` (Cartão 3) |
| 7 registros do primeiro dia com score 0 | Vagas sem análise da IA | Versão anterior do fluxo; separados nas métricas |
| Mesma vaga em duas cidades com 66 e 49 | Avaliações diferentes para o mesmo texto | Limite conhecido da IA; decisão final continua manual (Cartão 4) |
| Exportação em CSV pelo n8n omite as colunas de listas (`pontos_fortes`, `riscos`…) | Essas colunas não aparecem no arquivo exportado | Não é erro da gravação: o "Convert to File" ignora campos do tipo lista |

## 3. Organização

- A lógica que só existia dentro do JSON do n8n (JavaScript dos nós, prompts e formatos de saída da IA) agora também está em arquivos legíveis: `workflow/codigo/`, `workflow/prompts/`, `workflow/schemas/`.
- `database/schema.sql` passou para `sql/01_schema_vagas.sql`; os prints foram para `assets/prints/`.
- Documentação criada (01 a 06) e diagnóstico reprodutível em `codigo/analises/diagnostico.py`.
- A exportação da tabela fica em `dados/`, fora do Git (traz nomes de empresas e o resumo de aderência ao meu perfil).
- Link do LinkedIn no README atualizado.

## Como reproduzir

```bash
pip install -r requirements.txt
# exporte a tabela vagas para dados/vagas.csv (ver dados/README.md)
python codigo/analises/diagnostico.py
```
