-- ============================================================
-- seeds/jogos_fase_grupos.sql
-- Copa do Mundo FIFA 2026 — 72 jogos da fase de grupos
-- Fonte: FIFA.com (via Trivela, calendário atualizado 14/06/2026)
-- Todos os horários em BRT (horário de Brasília, GMT-3)
-- ============================================================
-- Esquema esperado:
-- jogos (id, fase, grupo, rodada, selecao_a_id, selecao_b_id,
--        data_hora, estadio, cidade, pais_sede,
--        gols_a, gols_b, status, penaltis_a, penaltis_b)
--
-- IMPORTANTE sobre os IDs das seleções:
--   Este seed usa SUBQUERIES (SELECT id FROM selecoes WHERE nome_pt=...)
--   para não depender da ordem de inserção. Rode o seeds_selecoes.sql ANTES.
--   Os nomes precisam bater EXATAMENTE com os de selecoes.nome_pt.
--
-- NOTA sobre horários "de madrugada":
--   Jogos como "Dom 14 Jun 01h00" acontecem na madrugada (00h–01h BRT).
--   A data registrada é a do dia em que o relógio marca aquela hora em
--   Brasília — exatamente como a FIFA publica. Mantido fiel à fonte.
--
-- NOTA sobre status:
--   Todos entram como 'agendado' com placar NULL. Os já disputados
--   (rodada 1, dias 11–14) podem ser atualizados depois via admin,
--   ou descomente o bloco de UPDATE no final para os resultados reais
--   já conhecidos até 14/06.
-- ============================================================

-- Helper visual: as colunas de placar começam nulas; status 'agendado'.
-- pais_sede derivado da cidade (MEX/USA/CAN).

-- ===================== 1ª RODADA =====================
INSERT INTO jogos (fase, grupo, rodada, selecao_a_id, selecao_b_id, data_hora, estadio, cidade, pais_sede, status) VALUES
('grupo','A',1,(SELECT id FROM selecoes WHERE nome_pt='México'),         (SELECT id FROM selecoes WHERE nome_pt='África do Sul'),    '2026-06-11 16:00','Estádio Azteca','Cidade do México','MEX','agendado'),
('grupo','A',1,(SELECT id FROM selecoes WHERE nome_pt='Coreia do Sul'),  (SELECT id FROM selecoes WHERE nome_pt='República Tcheca'), '2026-06-11 23:00','Estadio Akron','Guadalajara','MEX','agendado'),
('grupo','B',1,(SELECT id FROM selecoes WHERE nome_pt='Canadá'),         (SELECT id FROM selecoes WHERE nome_pt='Bósnia e Herzegovina'),'2026-06-12 16:00','BMO Field','Toronto','CAN','agendado'),
('grupo','D',1,(SELECT id FROM selecoes WHERE nome_pt='Estados Unidos'), (SELECT id FROM selecoes WHERE nome_pt='Paraguai'),        '2026-06-12 22:00','SoFi Stadium','Los Angeles','USA','agendado'),
('grupo','B',1,(SELECT id FROM selecoes WHERE nome_pt='Catar'),          (SELECT id FROM selecoes WHERE nome_pt='Suíça'),           '2026-06-13 16:00','Levi''s Stadium','San Francisco','USA','agendado'),
('grupo','C',1,(SELECT id FROM selecoes WHERE nome_pt='Brasil'),         (SELECT id FROM selecoes WHERE nome_pt='Marrocos'),        '2026-06-13 19:00','MetLife Stadium','Nova York/NJ','USA','agendado'),
('grupo','C',1,(SELECT id FROM selecoes WHERE nome_pt='Haiti'),          (SELECT id FROM selecoes WHERE nome_pt='Escócia'),         '2026-06-13 22:00','Gillette Stadium','Boston','USA','agendado'),
('grupo','D',1,(SELECT id FROM selecoes WHERE nome_pt='Austrália'),      (SELECT id FROM selecoes WHERE nome_pt='Turquia'),         '2026-06-14 01:00','BC Place','Vancouver','CAN','agendado'),
('grupo','E',1,(SELECT id FROM selecoes WHERE nome_pt='Alemanha'),       (SELECT id FROM selecoes WHERE nome_pt='Curaçao'),         '2026-06-14 14:00','NRG Stadium','Houston','USA','agendado'),
('grupo','F',1,(SELECT id FROM selecoes WHERE nome_pt='Holanda'),        (SELECT id FROM selecoes WHERE nome_pt='Japão'),           '2026-06-14 17:00','AT&T Stadium','Dallas','USA','agendado'),
('grupo','E',1,(SELECT id FROM selecoes WHERE nome_pt='Costa do Marfim'),(SELECT id FROM selecoes WHERE nome_pt='Equador'),         '2026-06-14 20:00','Lincoln Financial Field','Philadelphia','USA','agendado'),
('grupo','F',1,(SELECT id FROM selecoes WHERE nome_pt='Suécia'),         (SELECT id FROM selecoes WHERE nome_pt='Tunísia'),         '2026-06-14 23:00','Estadio BBVA','Monterrey','MEX','agendado'),
('grupo','H',1,(SELECT id FROM selecoes WHERE nome_pt='Espanha'),        (SELECT id FROM selecoes WHERE nome_pt='Cabo Verde'),      '2026-06-15 13:00','Mercedes-Benz Stadium','Atlanta','USA','agendado'),
('grupo','G',1,(SELECT id FROM selecoes WHERE nome_pt='Bélgica'),        (SELECT id FROM selecoes WHERE nome_pt='Egito'),           '2026-06-15 16:00','Lumen Field','Seattle','USA','agendado'),
('grupo','H',1,(SELECT id FROM selecoes WHERE nome_pt='Arábia Saudita'), (SELECT id FROM selecoes WHERE nome_pt='Uruguai'),         '2026-06-15 19:00','Hard Rock Stadium','Miami','USA','agendado'),
('grupo','G',1,(SELECT id FROM selecoes WHERE nome_pt='Irã'),            (SELECT id FROM selecoes WHERE nome_pt='Nova Zelândia'),   '2026-06-15 22:00','SoFi Stadium','Los Angeles','USA','agendado'),
('grupo','I',1,(SELECT id FROM selecoes WHERE nome_pt='França'),         (SELECT id FROM selecoes WHERE nome_pt='Senegal'),         '2026-06-16 16:00','MetLife Stadium','Nova York/NJ','USA','agendado'),
('grupo','I',1,(SELECT id FROM selecoes WHERE nome_pt='Iraque'),         (SELECT id FROM selecoes WHERE nome_pt='Noruega'),         '2026-06-16 19:00','Gillette Stadium','Boston','USA','agendado'),
('grupo','J',1,(SELECT id FROM selecoes WHERE nome_pt='Argentina'),      (SELECT id FROM selecoes WHERE nome_pt='Argélia'),         '2026-06-16 22:00','Arrowhead Stadium','Kansas City','USA','agendado'),
('grupo','J',1,(SELECT id FROM selecoes WHERE nome_pt='Áustria'),        (SELECT id FROM selecoes WHERE nome_pt='Jordânia'),        '2026-06-17 01:00','Levi''s Stadium','San Francisco','USA','agendado'),
('grupo','K',1,(SELECT id FROM selecoes WHERE nome_pt='Portugal'),       (SELECT id FROM selecoes WHERE nome_pt='RD Congo'),        '2026-06-17 14:00','NRG Stadium','Houston','USA','agendado'),
('grupo','L',1,(SELECT id FROM selecoes WHERE nome_pt='Inglaterra'),     (SELECT id FROM selecoes WHERE nome_pt='Croácia'),         '2026-06-17 17:00','AT&T Stadium','Dallas','USA','agendado'),
('grupo','L',1,(SELECT id FROM selecoes WHERE nome_pt='Gana'),           (SELECT id FROM selecoes WHERE nome_pt='Panamá'),          '2026-06-17 20:00','BMO Field','Toronto','CAN','agendado'),
('grupo','K',1,(SELECT id FROM selecoes WHERE nome_pt='Uzbequistão'),    (SELECT id FROM selecoes WHERE nome_pt='Colômbia'),        '2026-06-17 23:00','Estádio Azteca','Cidade do México','MEX','agendado');

-- ===================== 2ª RODADA =====================
INSERT INTO jogos (fase, grupo, rodada, selecao_a_id, selecao_b_id, data_hora, estadio, cidade, pais_sede, status) VALUES
('grupo','A',2,(SELECT id FROM selecoes WHERE nome_pt='República Tcheca'),(SELECT id FROM selecoes WHERE nome_pt='África do Sul'),    '2026-06-18 13:00','Mercedes-Benz Stadium','Atlanta','USA','agendado'),
('grupo','B',2,(SELECT id FROM selecoes WHERE nome_pt='Suíça'),          (SELECT id FROM selecoes WHERE nome_pt='Bósnia e Herzegovina'),'2026-06-18 16:00','SoFi Stadium','Los Angeles','USA','agendado'),
('grupo','B',2,(SELECT id FROM selecoes WHERE nome_pt='Canadá'),         (SELECT id FROM selecoes WHERE nome_pt='Catar'),           '2026-06-18 19:00','BC Place','Vancouver','CAN','agendado'),
('grupo','A',2,(SELECT id FROM selecoes WHERE nome_pt='México'),         (SELECT id FROM selecoes WHERE nome_pt='Coreia do Sul'),   '2026-06-18 22:00','Estadio Akron','Guadalajara','MEX','agendado'),
('grupo','D',2,(SELECT id FROM selecoes WHERE nome_pt='Estados Unidos'), (SELECT id FROM selecoes WHERE nome_pt='Austrália'),       '2026-06-19 16:00','Lumen Field','Seattle','USA','agendado'),
('grupo','C',2,(SELECT id FROM selecoes WHERE nome_pt='Escócia'),        (SELECT id FROM selecoes WHERE nome_pt='Marrocos'),        '2026-06-19 19:00','Gillette Stadium','Boston','USA','agendado'),
('grupo','C',2,(SELECT id FROM selecoes WHERE nome_pt='Brasil'),         (SELECT id FROM selecoes WHERE nome_pt='Haiti'),           '2026-06-19 21:30','Lincoln Financial Field','Philadelphia','USA','agendado'),
('grupo','D',2,(SELECT id FROM selecoes WHERE nome_pt='Turquia'),        (SELECT id FROM selecoes WHERE nome_pt='Paraguai'),        '2026-06-20 00:00','Levi''s Stadium','San Francisco','USA','agendado'),
('grupo','F',2,(SELECT id FROM selecoes WHERE nome_pt='Holanda'),        (SELECT id FROM selecoes WHERE nome_pt='Suécia'),          '2026-06-20 14:00','NRG Stadium','Houston','USA','agendado'),
('grupo','E',2,(SELECT id FROM selecoes WHERE nome_pt='Alemanha'),       (SELECT id FROM selecoes WHERE nome_pt='Costa do Marfim'), '2026-06-20 17:00','BMO Field','Toronto','CAN','agendado'),
('grupo','E',2,(SELECT id FROM selecoes WHERE nome_pt='Equador'),        (SELECT id FROM selecoes WHERE nome_pt='Curaçao'),         '2026-06-20 21:00','Arrowhead Stadium','Kansas City','USA','agendado'),
('grupo','F',2,(SELECT id FROM selecoes WHERE nome_pt='Tunísia'),        (SELECT id FROM selecoes WHERE nome_pt='Japão'),           '2026-06-21 01:00','Estadio BBVA','Monterrey','MEX','agendado'),
('grupo','H',2,(SELECT id FROM selecoes WHERE nome_pt='Espanha'),        (SELECT id FROM selecoes WHERE nome_pt='Arábia Saudita'),  '2026-06-21 13:00','Mercedes-Benz Stadium','Atlanta','USA','agendado'),
('grupo','G',2,(SELECT id FROM selecoes WHERE nome_pt='Bélgica'),        (SELECT id FROM selecoes WHERE nome_pt='Irã'),             '2026-06-21 16:00','SoFi Stadium','Los Angeles','USA','agendado'),
('grupo','H',2,(SELECT id FROM selecoes WHERE nome_pt='Uruguai'),        (SELECT id FROM selecoes WHERE nome_pt='Cabo Verde'),      '2026-06-21 19:00','Hard Rock Stadium','Miami','USA','agendado'),
('grupo','G',2,(SELECT id FROM selecoes WHERE nome_pt='Nova Zelândia'),  (SELECT id FROM selecoes WHERE nome_pt='Egito'),           '2026-06-21 22:00','BC Place','Vancouver','CAN','agendado'),
('grupo','J',2,(SELECT id FROM selecoes WHERE nome_pt='Argentina'),      (SELECT id FROM selecoes WHERE nome_pt='Áustria'),         '2026-06-22 14:00','AT&T Stadium','Dallas','USA','agendado'),
('grupo','I',2,(SELECT id FROM selecoes WHERE nome_pt='França'),         (SELECT id FROM selecoes WHERE nome_pt='Iraque'),          '2026-06-22 18:00','Lincoln Financial Field','Philadelphia','USA','agendado'),
('grupo','I',2,(SELECT id FROM selecoes WHERE nome_pt='Noruega'),        (SELECT id FROM selecoes WHERE nome_pt='Senegal'),         '2026-06-22 21:00','MetLife Stadium','Nova York/NJ','USA','agendado'),
('grupo','J',2,(SELECT id FROM selecoes WHERE nome_pt='Jordânia'),       (SELECT id FROM selecoes WHERE nome_pt='Argélia'),         '2026-06-23 00:00','Levi''s Stadium','San Francisco','USA','agendado'),
('grupo','K',2,(SELECT id FROM selecoes WHERE nome_pt='Portugal'),       (SELECT id FROM selecoes WHERE nome_pt='Uzbequistão'),     '2026-06-23 14:00','NRG Stadium','Houston','USA','agendado'),
('grupo','L',2,(SELECT id FROM selecoes WHERE nome_pt='Inglaterra'),     (SELECT id FROM selecoes WHERE nome_pt='Gana'),            '2026-06-23 17:00','Gillette Stadium','Boston','USA','agendado'),
('grupo','L',2,(SELECT id FROM selecoes WHERE nome_pt='Panamá'),         (SELECT id FROM selecoes WHERE nome_pt='Croácia'),         '2026-06-23 20:00','BMO Field','Toronto','CAN','agendado'),
('grupo','K',2,(SELECT id FROM selecoes WHERE nome_pt='Colômbia'),       (SELECT id FROM selecoes WHERE nome_pt='RD Congo'),        '2026-06-23 23:00','Estadio Akron','Guadalajara','MEX','agendado');

-- ===================== 3ª RODADA =====================
-- (jogos simultâneos por grupo — pares no mesmo horário)
INSERT INTO jogos (fase, grupo, rodada, selecao_a_id, selecao_b_id, data_hora, estadio, cidade, pais_sede, status) VALUES
('grupo','B',3,(SELECT id FROM selecoes WHERE nome_pt='Suíça'),          (SELECT id FROM selecoes WHERE nome_pt='Canadá'),          '2026-06-24 16:00','BC Place','Vancouver','CAN','agendado'),
('grupo','B',3,(SELECT id FROM selecoes WHERE nome_pt='Bósnia e Herzegovina'),(SELECT id FROM selecoes WHERE nome_pt='Catar'),      '2026-06-24 16:00','Lumen Field','Seattle','USA','agendado'),
('grupo','C',3,(SELECT id FROM selecoes WHERE nome_pt='Escócia'),        (SELECT id FROM selecoes WHERE nome_pt='Brasil'),          '2026-06-24 19:00','Hard Rock Stadium','Miami','USA','agendado'),
('grupo','C',3,(SELECT id FROM selecoes WHERE nome_pt='Marrocos'),       (SELECT id FROM selecoes WHERE nome_pt='Haiti'),           '2026-06-24 19:00','Mercedes-Benz Stadium','Atlanta','USA','agendado'),
('grupo','A',3,(SELECT id FROM selecoes WHERE nome_pt='República Tcheca'),(SELECT id FROM selecoes WHERE nome_pt='México'),          '2026-06-24 22:00','Estádio Azteca','Cidade do México','MEX','agendado'),
('grupo','A',3,(SELECT id FROM selecoes WHERE nome_pt='África do Sul'),  (SELECT id FROM selecoes WHERE nome_pt='Coreia do Sul'),   '2026-06-24 22:00','Estadio BBVA','Monterrey','MEX','agendado'),
('grupo','E',3,(SELECT id FROM selecoes WHERE nome_pt='Curaçao'),        (SELECT id FROM selecoes WHERE nome_pt='Costa do Marfim'), '2026-06-25 17:00','Lincoln Financial Field','Philadelphia','USA','agendado'),
('grupo','E',3,(SELECT id FROM selecoes WHERE nome_pt='Equador'),        (SELECT id FROM selecoes WHERE nome_pt='Alemanha'),        '2026-06-25 17:00','MetLife Stadium','Nova York/NJ','USA','agendado'),
('grupo','F',3,(SELECT id FROM selecoes WHERE nome_pt='Japão'),          (SELECT id FROM selecoes WHERE nome_pt='Suécia'),          '2026-06-25 20:00','AT&T Stadium','Dallas','USA','agendado'),
('grupo','F',3,(SELECT id FROM selecoes WHERE nome_pt='Tunísia'),        (SELECT id FROM selecoes WHERE nome_pt='Holanda'),         '2026-06-25 20:00','Arrowhead Stadium','Kansas City','USA','agendado'),
('grupo','D',3,(SELECT id FROM selecoes WHERE nome_pt='Turquia'),        (SELECT id FROM selecoes WHERE nome_pt='Estados Unidos'),  '2026-06-25 23:00','SoFi Stadium','Los Angeles','USA','agendado'),
('grupo','D',3,(SELECT id FROM selecoes WHERE nome_pt='Paraguai'),       (SELECT id FROM selecoes WHERE nome_pt='Austrália'),       '2026-06-25 23:00','Levi''s Stadium','San Francisco','USA','agendado'),
('grupo','I',3,(SELECT id FROM selecoes WHERE nome_pt='Noruega'),        (SELECT id FROM selecoes WHERE nome_pt='França'),          '2026-06-26 16:00','Gillette Stadium','Boston','USA','agendado'),
('grupo','I',3,(SELECT id FROM selecoes WHERE nome_pt='Senegal'),        (SELECT id FROM selecoes WHERE nome_pt='Iraque'),          '2026-06-26 16:00','BMO Field','Toronto','CAN','agendado'),
('grupo','H',3,(SELECT id FROM selecoes WHERE nome_pt='Cabo Verde'),     (SELECT id FROM selecoes WHERE nome_pt='Arábia Saudita'),  '2026-06-26 21:00','NRG Stadium','Houston','USA','agendado'),
('grupo','H',3,(SELECT id FROM selecoes WHERE nome_pt='Uruguai'),        (SELECT id FROM selecoes WHERE nome_pt='Espanha'),         '2026-06-26 21:00','Estadio Akron','Guadalajara','MEX','agendado'),
('grupo','G',3,(SELECT id FROM selecoes WHERE nome_pt='Egito'),          (SELECT id FROM selecoes WHERE nome_pt='Irã'),             '2026-06-27 00:00','Lumen Field','Seattle','USA','agendado'),
('grupo','G',3,(SELECT id FROM selecoes WHERE nome_pt='Nova Zelândia'),  (SELECT id FROM selecoes WHERE nome_pt='Bélgica'),         '2026-06-27 00:00','BC Place','Vancouver','CAN','agendado'),
('grupo','L',3,(SELECT id FROM selecoes WHERE nome_pt='Panamá'),         (SELECT id FROM selecoes WHERE nome_pt='Inglaterra'),      '2026-06-27 18:00','MetLife Stadium','Nova York/NJ','USA','agendado'),
('grupo','L',3,(SELECT id FROM selecoes WHERE nome_pt='Croácia'),        (SELECT id FROM selecoes WHERE nome_pt='Gana'),            '2026-06-27 18:00','Lincoln Financial Field','Philadelphia','USA','agendado'),
('grupo','K',3,(SELECT id FROM selecoes WHERE nome_pt='Colômbia'),       (SELECT id FROM selecoes WHERE nome_pt='Portugal'),        '2026-06-27 20:30','Hard Rock Stadium','Miami','USA','agendado'),
('grupo','K',3,(SELECT id FROM selecoes WHERE nome_pt='RD Congo'),       (SELECT id FROM selecoes WHERE nome_pt='Uzbequistão'),     '2026-06-27 20:30','Mercedes-Benz Stadium','Atlanta','USA','agendado'),
('grupo','J',3,(SELECT id FROM selecoes WHERE nome_pt='Argélia'),        (SELECT id FROM selecoes WHERE nome_pt='Áustria'),         '2026-06-27 23:00','Arrowhead Stadium','Kansas City','USA','agendado'),
('grupo','J',3,(SELECT id FROM selecoes WHERE nome_pt='Jordânia'),       (SELECT id FROM selecoes WHERE nome_pt='Argentina'),       '2026-06-27 23:00','AT&T Stadium','Dallas','USA','agendado');

-- ============================================================
-- RESULTADOS JÁ CONHECIDOS (até 14/06/2026) — opcional
-- Descomente para marcar os jogos da 1ª rodada já disputados.
-- Fonte: resultados Trivela/Sofascore em 14/06.
-- ============================================================
-- UPDATE jogos SET gols_a=2, gols_b=1, status='encerrado'
--   WHERE selecao_a_id=(SELECT id FROM selecoes WHERE nome_pt='México') AND rodada=1;            -- México 2x1 África do Sul (abertura)
-- UPDATE jogos SET gols_a=1, gols_b=1, status='encerrado'
--   WHERE selecao_a_id=(SELECT id FROM selecoes WHERE nome_pt='Catar') AND rodada=1;             -- Catar 1x1 Suíça
-- UPDATE jogos SET gols_a=1, gols_b=1, status='encerrado'
--   WHERE selecao_a_id=(SELECT id FROM selecoes WHERE nome_pt='Brasil') AND rodada=1;            -- Brasil 1x1 Marrocos
-- UPDATE jogos SET gols_a=0, gols_b=1, status='encerrado'
--   WHERE selecao_a_id=(SELECT id FROM selecoes WHERE nome_pt='Haiti') AND rodada=1;             -- Haiti 0x1 Escócia
-- UPDATE jogos SET gols_a=2, gols_b=0, status='encerrado'
--   WHERE selecao_a_id=(SELECT id FROM selecoes WHERE nome_pt='Austrália') AND rodada=1;         -- Austrália 2x0 Turquia
-- (demais jogos de 14/06 em diante: atualizar conforme forem ocorrendo)

-- ============================================================
-- VERIFICAÇÃO RÁPIDA (rode após o seed):
--   SELECT COUNT(*) FROM jogos WHERE fase='grupo';            -- deve dar 72
--   SELECT rodada, COUNT(*) FROM jogos GROUP BY rodada;        -- 24 por rodada
--   SELECT grupo, COUNT(*) FROM jogos WHERE fase='grupo'
--     GROUP BY grupo;                                          -- 6 por grupo
--   -- Conferir que nenhum subselect ficou NULL (nome digitado errado):
--   SELECT * FROM jogos WHERE selecao_a_id IS NULL OR selecao_b_id IS NULL;  -- deve vir vazio
-- ============================================================
