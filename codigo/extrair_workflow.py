"""Extrai do workflow do n8n (JSON) a lógica que fica escondida dentro dos nós, em arquivos legíveis:

- workflow/codigo/*.js       código JavaScript dos nós Code
- workflow/prompts/*.md      prompts enviados ao modelo de IA
- workflow/schemas/*.json    formato de saída exigido do modelo (Structured Output)
- sql/02_registrar_vaga.sql  consulta de gravação (UPSERT) no PostgreSQL

O JSON continua sendo a fonte da verdade (é o que se importa no n8n). Rode este script sempre
que o workflow mudar, para os arquivos extraídos não ficarem desatualizados.

Uso (na raiz do projeto):  python codigo/extrair_workflow.py
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
WORKFLOW = RAIZ / "workflow" / "n8n-ai-job-search-public.json"

# nome do nó no n8n -> arquivo de saída
CODIGO = {
    "Gerar Pesquisas": "01_gerar_pesquisas.js",
    "Normalizar Vagas": "02_normalizar_vagas.js",
    "Pré-Filtro": "03_pre_filtro.js",
    "Calcular Score Final": "04_calcular_score_final.js",
    "Code in JavaScript": "05_montar_mensagens_telegram.js",
}
PROMPTS = {
    "Classificar Vaga": "01_classificar_vaga.md",
    "Analisar Vaga em Detalhes": "02_analisar_vaga_em_detalhes.md",
}
SCHEMAS = {
    "Structured Output Parser": "01_classificacao.schema.json",
    "Structured Output Parser1": "02_analise_detalhada.schema.json",
}


def gravar(caminho, texto):
    caminho.parent.mkdir(parents=True, exist_ok=True)
    caminho.write_bytes(texto.rstrip().encode("utf-8") + b"\n")
    print(f"  {caminho.relative_to(RAIZ)}")


def main():
    nos = {n["name"]: n for n in json.loads(WORKFLOW.read_text(encoding="utf-8"))["nodes"]}

    for no, arquivo in CODIGO.items():
        cab = f"// Nó \"{no}\" do workflow n8n (extraído por codigo/extrair_workflow.py; edite no n8n)\n\n"
        gravar(RAIZ / "workflow" / "codigo" / arquivo, cab + nos[no]["parameters"]["jsCode"])

    for no, arquivo in PROMPTS.items():
        texto = nos[no]["parameters"]["text"].lstrip("=")
        cab = (f"<!-- Prompt do nó \"{no}\" (extraído por codigo/extrair_workflow.py). "
               "Trechos {{ ... }} são substituídos pelo n8n com os dados de cada vaga. -->\n\n")
        gravar(RAIZ / "workflow" / "prompts" / arquivo, cab + texto)

    for no, arquivo in SCHEMAS.items():
        schema = json.loads(nos[no]["parameters"]["inputSchema"])
        gravar(RAIZ / "workflow" / "schemas" / arquivo, json.dumps(schema, ensure_ascii=False, indent=2))

    sql = nos["Registrar Vaga"]["parameters"]["query"].lstrip("=")
    cab = "-- Consulta do nó \"Registrar Vaga\" (extraída por codigo/extrair_workflow.py)\n-- {{ ... }} = valores da vaga preenchidos pelo n8n\n\n"
    gravar(RAIZ / "sql" / "02_registrar_vaga.sql", cab + sql)


if __name__ == "__main__":
    print("Extraindo do workflow:")
    main()
