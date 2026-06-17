"""
Serviço de chaveamento do mata-mata do bolão.

Determina os 32 classificados a partir dos palpites da fase de grupos
e monta o bracket completo até a final.

Emparelhamento da Rodada de 32 (simplificado, evita rematches do mesmo grupo):
  Metade A (grupos A-F): 1A×2B, 1C×2D, 1E×2F, 1B×2A, 1D×2C, 1F×2E
  Metade B (grupos G-L): 1G×2H, 1I×2J, 1K×2L, 1H×2G, 1J×2I, 1L×2K
  Melhores 3ºs (8 dos 12): T1×T2, T3×T4, T5×T6, T7×T8
"""

from app.services.classificacao import calcular_classificacao

GRUPOS = list("ABCDEFGHIJKL")


def calcular_standings_grupos(
    jogos_db: list[dict],
    palpites_map: dict,
    selecoes_db: list[dict],
) -> dict[str, list[dict]]:
    """
    Calcula classificação de todos os grupos a partir dos palpites.
    Returns: { letra: [lista ordenada de stats por calcular_classificacao] }
    """
    selecoes_por_grupo: dict[str, list] = {}
    for s in selecoes_db:
        g = s["grupo"]
        selecoes_por_grupo.setdefault(g, []).append(s)

    resultado: dict[str, list] = {}
    for letra in GRUPOS:
        sels = selecoes_por_grupo.get(letra, [])
        jogos_com_palpite = []
        for j in jogos_db:
            if j.get("grupo") != letra:
                continue
            p = palpites_map.get(j["id"])
            if p:
                jogos_com_palpite.append({
                    "selecao_a_id": j["selecao_a_id"],
                    "selecao_b_id": j["selecao_b_id"],
                    "grupo": letra,
                    "gols_a": p["gols_a"],
                    "gols_b": p["gols_b"],
                    "status": "encerrado",
                })
        resultado[letra] = calcular_classificacao(jogos_com_palpite, sels)

    return resultado


def selecionar_melhores_terceiros(standings: dict[str, list]) -> list[dict]:
    """Seleciona os 8 melhores 3ºs colocados dos 12 grupos (Pts > SG > GP)."""
    terceiros = []
    for letra, sels in standings.items():
        if len(sels) >= 3:
            t = dict(sels[2])
            t["grupo_origem"] = letra
            terceiros.append(t)

    terceiros.sort(key=lambda x: (-x["Pts"], -x["SG"], -x["GP"]))
    return terceiros[:8]


def _determinar_vencedor(
    palpite: dict | None,
    id_a: int | None,
    id_b: int | None,
) -> tuple[int | None, int | None]:
    """Retorna (vencedor_id, perdedor_id) ou (None, None) se indefinido."""
    if not palpite or id_a is None or id_b is None:
        return None, None
    ga = palpite.get("gols_a")
    gb = palpite.get("gols_b")
    if ga is None or gb is None:
        return None, None
    ga, gb = int(ga), int(gb)
    if ga > gb:
        return id_a, id_b
    if gb > ga:
        return id_b, id_a
    pa = palpite.get("penaltis_a")
    pb = palpite.get("penaltis_b")
    if pa is not None and pb is not None and pa != pb:
        return (id_a, id_b) if int(pa) > int(pb) else (id_b, id_a)
    return None, None


def montar_bracket(
    standings: dict[str, list],
    melhores_terceiros: list[dict],
    palpites_mata: dict[str, dict],
    selecoes_map: dict[int, dict],
) -> dict:
    """
    Constrói o bracket completo.

    standings:          { letra: [lista de stats] } — resultado de calcular_standings_grupos
    melhores_terceiros: lista ordenada com os 8 melhores 3ºs
    palpites_mata:      { match_id: {gols_a, gols_b, penaltis_a, penaltis_b} }
    selecoes_map:       { selecao_id: dict_raw_selecao }
    """

    def get_team(letra: str, pos: int) -> dict | None:
        sels = standings.get(letra, [])
        if len(sels) >= pos:
            s = sels[pos - 1]
            return {
                "id":            s["selecao_id"],
                "nome_pt":       s["nome_pt"],
                "bandeira_emoji": s["bandeira_emoji"],
                "grupo":         letra,
                "posicao":       pos,
            }
        return None

    def get_third(idx: int) -> dict | None:
        if idx < len(melhores_terceiros):
            t = melhores_terceiros[idx]
            return {
                "id":            t["selecao_id"],
                "nome_pt":       t["nome_pt"],
                "bandeira_emoji": t["bandeira_emoji"],
                "grupo":         t["grupo_origem"],
                "posicao":       3,
            }
        return None

    def as_team(s: dict | None) -> dict | None:
        if s is None:
            return None
        return {
            "id":            s["id"],
            "nome_pt":       s["nome_pt"],
            "bandeira_emoji": s["bandeira_emoji"],
        }

    def make_match(match_id: str, team_a: dict | None, team_b: dict | None) -> dict:
        p   = palpites_mata.get(match_id)
        id_a = team_a["id"] if team_a else None
        id_b = team_b["id"] if team_b else None
        vid, pid = _determinar_vencedor(p, id_a, id_b)
        return {
            "id":          match_id,
            "selecao_a":   team_a,
            "selecao_b":   team_b,
            "palpite":     p or {},
            "vencedor_id": vid,
            "perdedor_id": pid,
        }

    def winner(match: dict) -> dict | None:
        vid = match["vencedor_id"]
        return as_team(selecoes_map.get(vid)) if vid else None

    def loser(match: dict) -> dict | None:
        pid = match["perdedor_id"]
        return as_team(selecoes_map.get(pid)) if pid else None

    thirds = melhores_terceiros  # já ordenados, top 8

    # ── Rodada de 32 (16 jogos) ───────────────────────────────────────────────
    r32 = [
        # Metade A (grupos A–F)
        make_match("r32_m1",  get_team("A", 1), get_team("B", 2)),
        make_match("r32_m2",  get_team("C", 1), get_team("D", 2)),
        make_match("r32_m3",  get_team("E", 1), get_team("F", 2)),
        make_match("r32_m4",  get_team("B", 1), get_team("A", 2)),
        make_match("r32_m5",  get_team("D", 1), get_team("C", 2)),
        make_match("r32_m6",  get_team("F", 1), get_team("E", 2)),
        # Metade B (grupos G–L)
        make_match("r32_m7",  get_team("G", 1), get_team("H", 2)),
        make_match("r32_m8",  get_team("I", 1), get_team("J", 2)),
        make_match("r32_m9",  get_team("K", 1), get_team("L", 2)),
        make_match("r32_m10", get_team("H", 1), get_team("G", 2)),
        make_match("r32_m11", get_team("J", 1), get_team("I", 2)),
        make_match("r32_m12", get_team("L", 1), get_team("K", 2)),
        # Melhores 3ºs
        make_match("r32_m13", get_third(0), get_third(1)),
        make_match("r32_m14", get_third(2), get_third(3)),
        make_match("r32_m15", get_third(4), get_third(5)),
        make_match("r32_m16", get_third(6), get_third(7)),
    ]
    w32 = [winner(m) for m in r32]

    # ── Oitavas de final (8 jogos) ────────────────────────────────────────────
    r16 = [
        make_match("r16_m1", w32[0],  w32[1]),
        make_match("r16_m2", w32[2],  w32[3]),
        make_match("r16_m3", w32[4],  w32[5]),
        make_match("r16_m4", w32[6],  w32[7]),
        make_match("r16_m5", w32[8],  w32[9]),
        make_match("r16_m6", w32[10], w32[11]),
        make_match("r16_m7", w32[12], w32[13]),
        make_match("r16_m8", w32[14], w32[15]),
    ]
    w16 = [winner(m) for m in r16]

    # ── Quartas de final (4 jogos) ────────────────────────────────────────────
    qf = [
        make_match("qf_m1", w16[0], w16[1]),
        make_match("qf_m2", w16[2], w16[3]),
        make_match("qf_m3", w16[4], w16[5]),
        make_match("qf_m4", w16[6], w16[7]),
    ]
    wqf = [winner(m) for m in qf]
    lqf = [loser(m)  for m in qf]

    # ── Semifinais (2 jogos) ──────────────────────────────────────────────────
    sf = [
        make_match("sf_m1", wqf[0], wqf[1]),
        make_match("sf_m2", wqf[2], wqf[3]),
    ]
    wsf = [winner(m) for m in sf]
    lsf = [loser(m)  for m in sf]

    # ── 3º lugar e Final ──────────────────────────────────────────────────────
    terceiro = [make_match("terceiro", lsf[0], lsf[1])]
    final    = [make_match("final",    wsf[0], wsf[1])]

    return {
        "rodada_32": r32,
        "oitavas":   r16,
        "quartas":   qf,
        "semi":      sf,
        "terceiro":  terceiro,
        "final":     final,
    }
