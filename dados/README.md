# Dados

`vagas.csv` é a exportação da tabela `vagas` do PostgreSQL usado pela automação (uma linha por vaga
analisada). **Não é versionado**: traz nomes de empresas, links de vagas e o resumo de aderência ao
meu perfil, gerado pela IA.

As métricas publicadas no projeto (sem nomes de empresas) saem de:

```bash
python codigo/analises/diagnostico.py
```

## Como exportar

No n8n, num workflow separado: `Manual Trigger` → `Postgres` (*Execute a SQL query*:
`SELECT * FROM vagas;`, com a mesma credencial do nó "Registrar Vaga") → `Convert to File` (CSV).
Salve o arquivo como `dados/vagas.csv`.

A estrutura da tabela está em [`sql/01_schema_vagas.sql`](../sql/01_schema_vagas.sql).
