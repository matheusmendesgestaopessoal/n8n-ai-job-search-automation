-- PostgreSQL schema expected by the n8n workflow.
-- Adjust types/constraints to your environment if needed.

CREATE TABLE IF NOT EXISTS vagas (
    id BIGSERIAL PRIMARY KEY,
    dedupe_key TEXT NOT NULL UNIQUE,
    vaga_id TEXT,
    data_encontrada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fonte TEXT,
    cargo TEXT,
    empresa TEXT,
    localizacao TEXT,
    modalidade TEXT,
    data_publicacao TEXT,
    candidatos INTEGER,
    link TEXT,
    busca_origem TEXT,
    frente_origem TEXT,
    prioridade_busca INTEGER,

    score_tecnico INTEGER,
    score_experiencia INTEGER,
    score_senioridade INTEGER,
    score_modalidade_localizacao INTEGER,
    score_formacao INTEGER,
    score_diferenciais INTEGER,
    score_final INTEGER,

    classificacao TEXT,
    acao TEXT,
    eliminatorio BOOLEAN NOT NULL DEFAULT FALSE,
    motivo_eliminatorio TEXT,
    frente_sugerida TEXT,
    senioridade_detectada TEXT,

    requisitos_atendidos JSONB NOT NULL DEFAULT '[]'::jsonb,
    requisitos_parciais JSONB NOT NULL DEFAULT '[]'::jsonb,
    requisitos_ausentes JSONB NOT NULL DEFAULT '[]'::jsonb,
    pontos_fortes JSONB NOT NULL DEFAULT '[]'::jsonb,
    riscos JSONB NOT NULL DEFAULT '[]'::jsonb,

    resumo_aderencia TEXT,
    status_processo TEXT,
    ultima_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vagas_score_final
    ON vagas (score_final DESC);

CREATE INDEX IF NOT EXISTS idx_vagas_classificacao
    ON vagas (classificacao);

CREATE INDEX IF NOT EXISTS idx_vagas_data_encontrada
    ON vagas (data_encontrada DESC);
