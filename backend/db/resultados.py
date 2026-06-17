"""
resultados.py — aplica os resultados reais já disputados da Copa 2026.

Marca status='encerrado' e preenche gols_a/gols_b nos jogos que já
aconteceram (1ª rodada, 11–15/jun/2026).

Fonte dos placares: olympics.com / DAZN / GZH (confirmados jun/2026).

Uso:
    py db/resultados.py

Não recria o banco nem apaga nada — só faz UPDATE nos jogos listados.
Identifica cada jogo por (selecao_a_nome, rodada=1), que é único
na fase de grupos.
"""

import sqlite3
from pathlib import Path

DB_FILE = Path(__file__).parent / "copa2026.db"

# (selecao_a, gols_a, gols_b) — rodada 1. O mandante (selecao_a) bate
# com o seed; o placar é na ordem A x B.
RESULTADOS = [
    # Quinta 11/06 — Grupo A
    ("México",          2, 0),  # México 2x0 África do Sul
    ("Coreia do Sul",   2, 1),  # Coreia do Sul 2x1 Rep. Tcheca
    # Sexta 12/06
    ("Canadá",          1, 1),  # Canadá 1x1 Bósnia (Grupo B)
    ("Estados Unidos",  4, 1),  # EUA 4x1 Paraguai (Grupo D)
    # Sábado 13/06
    ("Catar",           1, 1),  # Catar 1x1 Suíça (Grupo B)
    ("Brasil",          1, 1),  # Brasil 1x1 Marrocos (Grupo C)
    ("Haiti",           0, 1),  # Haiti 0x1 Escócia (Grupo C)
    ("Austrália",       2, 0),  # Austrália 2x0 Turquia (Grupo D)
    # Domingo 14/06
    ("Alemanha",        7, 1),  # Alemanha 7x1 Curaçao (Grupo E)
    ("Holanda",         2, 2),  # Holanda 2x2 Japão (Grupo F)
    ("Costa do Marfim", 1, 0),  # Costa do Marfim 1x0 Equador (Grupo E)
    ("Suécia",          5, 1),  # Suécia 5x1 Tunísia (Grupo F)
    # Segunda 15/06
    ("Espanha",         0, 0),  # Espanha 0x0 Cabo Verde (Grupo H)
    ("Bélgica",         1, 1),  # Bélgica 1x1 Egito (Grupo G)
    ("Arábia Saudita",  1, 1),  # Arábia Saudita 1x1 Uruguai (Grupo H)
    ("Irã",             2, 2),  # Irã 2x2 Nova Zelândia (Grupo G)
]


def aplicar():
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON")

    atualizados = 0
    nao_encontrados = []

    for nome_a, ga, gb in RESULTADOS:
        cur = conn.execute(
            """
            UPDATE jogos
               SET gols_a = ?, gols_b = ?, status = 'encerrado'
             WHERE rodada = 1
               AND selecao_a_id = (
                   SELECT id FROM selecoes WHERE nome_pt = ?
               )
            """,
            (ga, gb, nome_a),
        )
        if cur.rowcount > 0:
            atualizados += cur.rowcount
        else:
            nao_encontrados.append(nome_a)

    conn.commit()
    conn.close()

    print(f"Jogos atualizados: {atualizados} (esperado: {len(RESULTADOS)})")
    if nao_encontrados:
        print("ATENÇÃO — não encontrados (verificar nome):")
        for n in nao_encontrados:
            print(f"  - {n}")
    else:
        print("Todos os resultados foram aplicados com sucesso.")


if __name__ == "__main__":
    aplicar()
