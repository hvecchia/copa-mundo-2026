-- ============================================================
-- seeds/selecoes.sql
-- Copa do Mundo FIFA 2026 — 48 seleções, 12 grupos (A–L)
-- Fonte: Sorteio final (Washington, 05/12/2025) + repescagens (mar/2026)
-- Composição confirmada com jogos já em andamento (jun/2026)
-- ============================================================
-- Esquema esperado:
-- selecoes (id, nome_pt, bandeira_emoji, confederacao, grupo,
--           pote, eh_cabeca_chave, treinador, ranking_fifa)
-- Obs.: treinador e ranking_fifa ficam NULL aqui — preencher depois
--       via painel admin ou seed complementar. O foco deste seed é
--       a composição correta de grupos/potes.
-- ============================================================

-- ---------- GRUPO A ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('México',            '🇲🇽', 'CONCACAF', 'A', 1, 1),
('Coreia do Sul',     '🇰🇷', 'AFC',      'A', 2, 0),
('República Tcheca',  '🇨🇿', 'UEFA',     'A', 3, 0),
('África do Sul',     '🇿🇦', 'CAF',      'A', 4, 0);

-- ---------- GRUPO B ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('Canadá',                 '🇨🇦', 'CONCACAF', 'B', 1, 1),
('Suíça',                  '🇨🇭', 'UEFA',     'B', 2, 0),
('Catar',                  '🇶🇦', 'AFC',      'B', 3, 0),
('Bósnia e Herzegovina',   '🇧🇦', 'UEFA',     'B', 4, 0);

-- ---------- GRUPO C ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('Brasil',   '🇧🇷', 'CONMEBOL', 'C', 1, 1),
('Marrocos', '🇲🇦', 'CAF',      'C', 2, 0),
('Escócia',  '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'UEFA',     'C', 3, 0),
('Haiti',    '🇭🇹', 'CONCACAF', 'C', 4, 0);

-- ---------- GRUPO D ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('Estados Unidos', '🇺🇸', 'CONCACAF', 'D', 1, 1),
('Austrália',      '🇦🇺', 'AFC',      'D', 2, 0),
('Paraguai',       '🇵🇾', 'CONMEBOL', 'D', 3, 0),
('Turquia',        '🇹🇷', 'UEFA',     'D', 4, 0);

-- ---------- GRUPO E ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('Alemanha',        '🇩🇪', 'UEFA',     'E', 1, 1),
('Equador',         '🇪🇨', 'CONMEBOL', 'E', 2, 0),
('Costa do Marfim', '🇨🇮', 'CAF',      'E', 3, 0),
('Curaçao',         '🇨🇼', 'CONCACAF', 'E', 4, 0);

-- ---------- GRUPO F ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('Holanda', '🇳🇱', 'UEFA', 'F', 1, 1),
('Japão',   '🇯🇵', 'AFC',  'F', 2, 0),
('Suécia',  '🇸🇪', 'UEFA', 'F', 3, 0),
('Tunísia', '🇹🇳', 'CAF',  'F', 4, 0);

-- ---------- GRUPO G ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('Bélgica',        '🇧🇪', 'UEFA', 'G', 1, 1),
('Egito',          '🇪🇬', 'CAF',  'G', 2, 0),
('Irã',            '🇮🇷', 'AFC',  'G', 3, 0),
('Nova Zelândia',  '🇳🇿', 'OFC',  'G', 4, 0);

-- ---------- GRUPO H ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('Espanha',        '🇪🇸', 'UEFA',     'H', 1, 1),
('Uruguai',        '🇺🇾', 'CONMEBOL', 'H', 2, 0),
('Cabo Verde',     '🇨🇻', 'CAF',      'H', 3, 0),
('Arábia Saudita', '🇸🇦', 'AFC',      'H', 4, 0);

-- ---------- GRUPO I ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('França',  '🇫🇷', 'UEFA', 'I', 1, 1),
('Noruega', '🇳🇴', 'UEFA', 'I', 2, 0),
('Senegal', '🇸🇳', 'CAF',  'I', 3, 0),
('Iraque',  '🇮🇶', 'AFC',  'I', 4, 0);

-- ---------- GRUPO J ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('Argentina', '🇦🇷', 'CONMEBOL', 'J', 1, 1),
('Argélia',   '🇩🇿', 'CAF',      'J', 2, 0),
('Áustria',   '🇦🇹', 'UEFA',     'J', 3, 0),
('Jordânia',  '🇯🇴', 'AFC',      'J', 4, 0);

-- ---------- GRUPO K ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('Portugal',    '🇵🇹', 'UEFA',     'K', 1, 1),
('Colômbia',    '🇨🇴', 'CONMEBOL', 'K', 2, 0),
('Uzbequistão', '🇺🇿', 'AFC',      'K', 3, 0),
('RD Congo',    '🇨🇩', 'CAF',      'K', 4, 0);

-- ---------- GRUPO L ----------
INSERT INTO selecoes (nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave) VALUES
('Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'UEFA', 'L', 1, 1),
('Croácia',    '🇭🇷', 'UEFA',     'L', 2, 0),
('Gana',       '🇬🇭', 'CAF',      'L', 3, 0),
('Panamá',     '🇵🇦', 'CONCACAF', 'L', 4, 0);

-- ============================================================
-- VERIFICAÇÃO RÁPIDA (rode após o seed):
--   SELECT grupo, COUNT(*) FROM selecoes GROUP BY grupo;   -- deve dar 4 por grupo (12 linhas)
--   SELECT COUNT(*) FROM selecoes;                          -- deve dar 48
--   SELECT pote, COUNT(*) FROM selecoes GROUP BY pote;      -- deve dar 12 por pote
--   SELECT COUNT(*) FROM selecoes WHERE eh_cabeca_chave=1;  -- deve dar 12
-- ============================================================
