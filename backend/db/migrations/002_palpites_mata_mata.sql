-- 002_palpites_mata_mata.sql
-- Palpites para a fase eliminatória (mata-mata) do bolão

CREATE TABLE IF NOT EXISTS palpites_mata_mata (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    bolao_id    INTEGER NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
    match_id    TEXT    NOT NULL,  -- ex: 'r32_m1', 'r16_m1', 'qf_m1', 'sf_m1', 'final', 'terceiro'
    gols_a      INTEGER,
    gols_b      INTEGER,
    penaltis_a  INTEGER,
    penaltis_b  INTEGER,
    UNIQUE(bolao_id, match_id)
);
