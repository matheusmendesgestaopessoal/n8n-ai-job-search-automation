"""Métricas do que a automação entregou, a partir da exportação da tabela `vagas` (dados/vagas.csv).

Separa os registros válidos dos problemas de qualidade (linha sem dados da vaga, vagas antigas
sem análise da IA) e mostra o funil de classificação, os motivos de descarte e os scores.
Não imprime nomes de empresas: o resultado pode ir para a documentação pública.

Uso (na raiz do projeto):  python codigo/analises/metricas.py
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


def motivo(texto):
    """Agrupa o motivo eliminatório (texto livre da IA) em categorias."""
    t = str(texto).lower()
    if "inglês" in t or "ingles" in t:
        return "Inglês acima do perfil"
    if "presencial" in t or "híbrid" in t or "hibrid" in t:
        return "Localização / modalidade"
    if "superior" in t or "bacharel" in t or "formação" in t:
        return "Formação concluída"
    return "Ferramenta específica"


def main():
    d = pd.read_csv(ARQUIVO)
    sem_dados = d["dedupe_key"].eq("undefined")
    sem_ia = d["score_final"].eq(0) & ~sem_dados
    v = d[~sem_dados & ~sem_ia].copy()

    print("== VISÃO GERAL")
    datas = pd.to_datetime(d["data_encontrada"]).dt.date
    print(f"registros {len(d)} · de {datas.min()} a {datas.max()} · {datas.nunique()} dias com execução")
    print(f"válidos {len(v)} · sem dados da vaga {sem_dados.sum()} · sem análise da IA {sem_ia.sum()}")

    print("\n== CLASSIFICAÇÃO (registros válidos)")
    ordem = ["ALTA", "MEDIA", "BAIXA", "DESCARTAR"]
    c = v["classificacao"].value_counts().reindex(ordem, fill_value=0)
    for k, n in c.items():
        print(f"{k:<10} {n:>3}  {n / len(v):.0%}")
    chegam = c["ALTA"] + c["MEDIA"]
    print(f"chegam ao Telegram (alta + média): {chegam} de {len(v)} ({chegam / len(v):.0%})")

    print("\n== DESCARTES POR REQUISITO ELIMINATÓRIO")
    elim = v[v["eliminatorio"].astype(str).str.upper().eq("TRUE")]
    print(f"{len(elim)} vagas")
    for k, n in elim["motivo_eliminatorio"].map(motivo).value_counts().items():
        print(f"  {k:<26} {n}")

    print("\n== SCORE")
    print(f"médio {v['score_final'].mean():.1f} · mediana {v['score_final'].median():.0f} · "
          f"alta {v.loc[v.classificacao.eq('ALTA'), 'score_final'].mean():.1f} em média")
    print("componentes (média ÷ máximo):")
    for col, (nome, maximo) in COMPONENTES.items():
        m = v[col].mean()
        print(f"  {nome:<34} {m:5.1f} / {maximo}  ({m / maximo:.0%})")

    print("\n== SENIORIDADE DETECTADA")
    print(v["senioridade_detectada"].str.upper().value_counts().to_string())

    print("\n== MODALIDADE INFORMADA NA VAGA")
    print(v["modalidade"].value_counts().to_string())


if __name__ == "__main__":
    main()
