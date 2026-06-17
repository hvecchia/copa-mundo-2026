-- ============================================================
-- 001_create_tables.sql — Copa do Mundo 2026
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------------
-- Seleções
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS selecoes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_pt         TEXT    NOT NULL,
    bandeira_emoji  TEXT,
    confederacao    TEXT    NOT NULL,
    grupo           TEXT    NOT NULL,
    pote            INTEGER NOT NULL,
    eh_cabeca_chave INTEGER NOT NULL DEFAULT 0,
    eh_sede         INTEGER NOT NULL DEFAULT 0,
    treinador       TEXT,
    ranking_fifa    INTEGER,
    criado_em       TEXT    DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------------
-- Jogadores
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jogadores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    selecao_id  INTEGER NOT NULL REFERENCES selecoes(id) ON DELETE CASCADE,
    numero      INTEGER,
    nome        TEXT    NOT NULL,
    posicao     TEXT    NOT NULL CHECK(posicao IN ('GK', 'DEF', 'MID', 'FWD')),
    clube       TEXT,
    idade       INTEGER,
    eh_capitao  INTEGER NOT NULL DEFAULT 0,
    criado_em   TEXT    DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------------
-- Jogos
-- fase inclui 'rodada_32' (Rodada de 32 — estreia na Copa 2026)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jogos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    fase            TEXT    NOT NULL CHECK(fase IN (
                        'grupo', 'rodada_32', 'oitavas',
                        'quartas', 'semi', 'terceiro', 'final'
                    )),
    grupo           TEXT,
    rodada          INTEGER,
    selecao_a_id    INTEGER REFERENCES selecoes(id),
    selecao_b_id    INTEGER REFERENCES selecoes(id),
    data_hora       TEXT    NOT NULL,
    estadio         TEXT,
    cidade          TEXT,
    pais_sede       TEXT,
    gols_a          INTEGER,
    gols_b          INTEGER,
    penaltis_a      INTEGER,
    penaltis_b      INTEGER,
    status          TEXT    NOT NULL DEFAULT 'agendado'
                        CHECK(status IN ('agendado', 'em_andamento', 'encerrado')),
    criado_em       TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_jogos_fase   ON jogos(fase);
CREATE INDEX IF NOT EXISTS idx_jogos_grupo  ON jogos(grupo);
CREATE INDEX IF NOT EXISTS idx_jogos_data   ON jogos(data_hora);
CREATE INDEX IF NOT EXISTS idx_jogos_status ON jogos(status);

CREATE INDEX IF NOT EXISTS idx_jogadores_selecao ON jogadores(selecao_id);

-- ------------------------------------------------------------------
-- Classificação por grupo (materializada / cache)
-- Recalculada pelo service sempre que um placar muda
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classificacao (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    selecao_id    INTEGER NOT NULL REFERENCES selecoes(id) ON DELETE CASCADE,
    grupo         TEXT    NOT NULL,
    pontos        INTEGER NOT NULL DEFAULT 0,
    jogos         INTEGER NOT NULL DEFAULT 0,
    vitorias      INTEGER NOT NULL DEFAULT 0,
    empates       INTEGER NOT NULL DEFAULT 0,
    derrotas      INTEGER NOT NULL DEFAULT 0,
    gols_pro      INTEGER NOT NULL DEFAULT 0,
    gols_contra   INTEGER NOT NULL DEFAULT 0,
    saldo_gols    INTEGER NOT NULL DEFAULT 0,
    UNIQUE(selecao_id)
);

-- ------------------------------------------------------------------
-- Bolões
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS boloes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT    NOT NULL DEFAULT 'Meu Bolão',
    session_id    TEXT    NOT NULL,
    criado_em     TEXT    DEFAULT (datetime('now')),
    atualizado_em TEXT    DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------------
-- Palpites
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS palpites (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    bolao_id    INTEGER NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
    jogo_id     INTEGER NOT NULL REFERENCES jogos(id),
    gols_a      INTEGER NOT NULL DEFAULT 0,
    gols_b      INTEGER NOT NULL DEFAULT 0,
    penaltis_a  INTEGER,
    penaltis_b  INTEGER,
    UNIQUE(bolao_id, jogo_id)
);

-- ------------------------------------------------------------------
-- Escalações (somente Brasil, salvas por sessão)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS escalacoes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT    NOT NULL DEFAULT 'Minha Escalação',
    formacao        TEXT    NOT NULL DEFAULT '4-3-3',
    jogadores_json  TEXT    NOT NULL,
    session_id      TEXT,
    criado_em       TEXT    DEFAULT (datetime('now'))
);
