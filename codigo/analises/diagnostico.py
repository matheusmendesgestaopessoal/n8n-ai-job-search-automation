"""DIAGNÓSTICO · o que a automação entregou e se ela obedeceu às próprias regras.

Lê a exportação da tabela `vagas` (dados/vagas.csv) e:
1. separa os registros válidos dos problemas de qualidade;
2. mostra o funil de classificação, os descartes e os scores;
3. confere, linha a linha, as regras do nó "Calcular Score Final"
   (score = soma dos componentes, teto de 49 com eliminatório, faixas 80/65/50);
4. testa a consistência da IA em vagas repetidas (mesmo cargo e empresa);
5. conta as lacunas mais citadas nos resumos de aderência.

Não imprime nomes de empresas: o resultado pode ir para a documentação pública.
Uso (na raiz do projeto):  python codigo/analises/diagnostico.py
"""
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parents[2]
ARQUIVO = RAIZ / "dados" / "vagas.csv"

COMPONENTES = {
    "score_tecnico": ("Compatibilidade técnica", 35),
    "score_experiencia": ("Experiência e responsabilidades", 25),
    "score_senioridade": ("Senioridade", 15),
    "score_modalidade_localizacao": ("Modalidade e localização", 10),
    "score_formacao": ("Formação e elegibilidade", 5),
    "score_diferenciais": ("Diferenciais", 10),
}
# termos procurados nos resumos de aderência (o que o mercado pediu e o perfil não comprovou)
LACUNAS = {
    "Inglês": ["inglês", "ingles"],
    "Formação concluída": ["superior completo", "graduação", "bacharelado", "formação"],
    "Google Analytics / web analytics": ["google analytics", "ga4", "web analytics", "tag manager"],
    "BigQuery / GCP": ["bigquery", "gcp"],
    "dbt / Databricks / Airflow": ["dbt", "databricks", "airflow"],
    "Experiência profissional com BI/SQL": ["não como experiência profissional", "não em experiência profissional",
                                            "aparecem em projetos", "demonstrados em projetos", "demonstrado em projeto"],
}


def faixa(score, eliminatorio):
    if eliminatorio:
        return "DESCARTAR"
    if score >= 80:
        return "ALTA"
    if score >= 65:
        return "MEDIA"
    if score >= 50:
        return "BAIXA"
    return "DESCARTAR"


def motivo(texto):
    t = str(texto).lower()
    if "inglês" in t or "ingles" in t:
        return "Inglês acima do perfil"
    if "presencial" in t or "híbrid" in t or "hibrid" in t:
        return "Localização / modalidade"
    if "superior" in t or "bacharel" in t or "formação" in t:
        return "Formação concluída"
    return "Ferramenta específica"


def carregar():
    d = pd.read_csv(ARQUIVO)
    d["eliminatorio"] = d["eliminatorio"].astype(str).str.upper().eq("TRUE")
    d["candidatos"] = pd.to_numeric(d["candidatos"], errors="coerce")
    d["sem_dados"] = d["dedupe_key"].eq("undefined")
    d["sem_ia"] = d["score_final"].eq(0) & ~d["sem_dados"]
    return d


def main():
    d = carregar()
    v = d[~d.sem_dados & ~d.sem_ia].copy()

    print("== VISÃO GERAL")
    datas = pd.to_datetime(d["data_encontrada"]).dt.date
    print(f"registros {len(d)} · de {datas.min()} a {datas.max()} · {datas.nunique()} dias com execução")
    print(f"válidos {len(v)} · sem dados da vaga {d.sem_dados.sum()} · sem análise da IA {d.sem_ia.sum()}")
    print(f"média de {len(v) / datas.nunique():.1f} vagas analisadas por dia")

    print("\n== CLASSIFICAÇÃO (registros válidos)")
    c = v["classificacao"].value_counts().reindex(["ALTA", "MEDIA", "BAIXA", "DESCARTAR"], fill_value=0)
    for k, n in c.items():
        print(f"{k:<10} {n:>3}  {n / len(v):.0%}")
    chegam = c["ALTA"] + c["MEDIA"]
    print(f"chegam ao Telegram (alta + média): {chegam} de {len(v)} ({chegam / len(v):.0%})")

    print("\n== DESCARTES POR REQUISITO ELIMINATÓRIO")
    elim = v[v.eliminatorio]
    print(f"{len(elim)} vagas")
    for k, n in elim["motivo_eliminatorio"].map(motivo).value_counts().items():
        print(f"  {k:<26} {n}")
    soma = v[list(COMPONENTES)].sum(axis=1)
    salvas = elim[soma[elim.index] >= 65]
    print(f"sem a regra eliminatória, {len(salvas)} delas teriam chegado ao Telegram "
          f"(soma dos componentes ≥ 65; maior soma {soma[elim.index].max()})")

    print("\n== SCORE")
    print(f"médio {v['score_final'].mean():.1f} · mediana {v['score_final'].median():.0f} · "
          f"alta {v.loc[v.classificacao.eq('ALTA'), 'score_final'].mean():.1f} em média")
    for col, (nome, maximo) in COMPONENTES.items():
        m = v[col].mean()
        print(f"  {nome:<34} {m:5.1f} / {maximo}  ({m / maximo:.0%})")

    print("\n== AS REGRAS DO CÓDIGO FORAM CUMPRIDAS?")
    esperado = soma.where(~v.eliminatorio, soma.clip(upper=49))
    print(f"score_final = soma (teto 49 com eliminatório): {(esperado == v.score_final).sum()} de {len(v)}")
    fx = [faixa(s, e) for s, e in zip(v.score_final, v.eliminatorio)]
    print(f"classificação dentro da faixa: {(pd.Series(fx, index=v.index) == v.classificacao).sum()} de {len(v)}")
    acoes = {"ALTA": "PREPARAR_CANDIDATURA", "MEDIA": "REVISAR", "BAIXA": "REGISTRAR", "DESCARTAR": "ARQUIVAR"}
    print(f"ação coerente com a classificação: {(v.classificacao.map(acoes) == v.acao).sum()} de {len(v)}")
    fora = sum(((v[c] < 0) | (v[c] > m)).sum() for c, (_, m) in COMPONENTES.items())
    print(f"componentes fora do limite (0 a máximo): {fora}")

    print("\n== CONSISTÊNCIA DA IA EM VAGAS REPETIDAS (mesmo cargo e empresa)")
    rep = v.groupby(["empresa", "cargo"]).filter(lambda g: len(g) > 1)
    grupos = rep.groupby(["empresa", "cargo"])
    print(f"{grupos.ngroups} vagas aparecem mais de uma vez ({len(rep)} registros)")
    for i, (_, g) in enumerate(grupos, 1):
        print(f"  caso {i}: scores {list(g.score_final)} · classificações {list(g.classificacao)} · "
              f"locais {g.localizacao.nunique()} · eliminatório {list(g.eliminatorio)}")

    print("\n== LACUNAS MAIS CITADAS NOS RESUMOS DE ADERÊNCIA")
    texto = v["resumo_aderencia"].fillna("").str.lower() + " " + v["motivo_eliminatorio"].fillna("").str.lower()
    for nome, termos in LACUNAS.items():
        n = texto.apply(lambda t: any(x in t for x in termos)).sum()
        print(f"  {nome:<38} {n:>3} vagas ({n / len(v):.0%})")

    print("\n== CONTEXTO DAS VAGAS")
    print(f"modalidade não informada: {v.modalidade.eq('NAO_INFORMADO').sum()} de {len(v)}")
    print(f"senioridade: {v.senioridade_detectada.str.upper().value_counts().to_dict()}")
    cand = v["candidatos"].dropna()
    print(f"candidatos por vaga: mediana {cand.median():.0f} · {cand.ge(200).sum()} vagas no teto de 200+ do LinkedIn")


if __name__ == "__main__":
    main()
