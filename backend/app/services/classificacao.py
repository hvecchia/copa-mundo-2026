"""
Serviço de classificação de grupos.

Recebe jogos encerrados e seleções do grupo; retorna lista ordenada
com stats de cada seleção. Sem acesso ao banco — lógica pura.

Critérios FIFA (simplificados, suficientes para a fase de grupos):
  1. Pontos  (V=3, E=1, D=0)
  2. Saldo de gols (GP − GC)
  3. Gols marcados (GP)
"""


def calcular_classificacao(
    jogos_encerrados: list[dict],
    selecoes: list[dict],
) -> list[dict]:
    """
    Args:
        jogos_encerrados: jogos com status='encerrado' do grupo.
        selecoes:         seleções que pertencem ao grupo.

    Returns:
        Lista ordenada de dicts com: selecao_id, nome_pt,
        bandeira_emoji, pote, eh_cabeca_chave,
        J, V, E, D, GP, GC, SG, Pts, posicao.
    """
    stats: dict[int, dict] = {}
    for s in selecoes:
        stats[s["id"]] = {
            "selecao_id":     s["id"],
            "nome_pt":        s["nome_pt"],
            "bandeira_emoji": s["bandeira_emoji"],
            "pote":           s["pote"],
            "eh_cabeca_chave": bool(s["eh_cabeca_chave"]),
            "J": 0, "V": 0, "E": 0, "D": 0,
            "GP": 0, "GC": 0, "SG": 0, "Pts": 0,
        }

    for jogo in jogos_encerrados:
        sid_a = jogo["selecao_a_id"]
        sid_b = jogo["selecao_b_id"]
        ga    = jogo["gols_a"] or 0
        gb    = jogo["gols_b"] or 0

        if sid_a not in stats or sid_b not in stats:
            continue  # guarda defensiva: jogo fora do escopo

        stats[sid_a]["J"]  += 1;  stats[sid_b]["J"]  += 1
        stats[sid_a]["GP"] += ga; stats[sid_a]["GC"] += gb
        stats[sid_b]["GP"] += gb; stats[sid_b]["GC"] += ga

        if ga > gb:           # Seleção A venceu
            stats[sid_a]["V"]   += 1;  stats[sid_a]["Pts"] += 3
            stats[sid_b]["D"]   += 1
        elif gb > ga:         # Seleção B venceu
            stats[sid_b]["V"]   += 1;  stats[sid_b]["Pts"] += 3
            stats[sid_a]["D"]   += 1
        else:                 # Empate
            stats[sid_a]["E"]   += 1;  stats[sid_a]["Pts"] += 1
            stats[sid_b]["E"]   += 1;  stats[sid_b]["Pts"] += 1

    for st in stats.values():
        st["SG"] = st["GP"] - st["GC"]

    classif = sorted(
        stats.values(),
        key=lambda s: (s["Pts"], s["SG"], s["GP"]),
        reverse=True,
    )

    for i, row in enumerate(classif):
        row["posicao"] = i + 1

    return classif
