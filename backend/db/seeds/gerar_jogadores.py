"""
Seed de jogadores — Copa do Mundo 2026
Rode a partir do diretório backend/:
    python db/seeds/gerar_jogadores.py

Brasil: elenco real (PRD.md seção 8 — 23 jogadores, Marquinhos capitão).
Demais 47 seleções: 13 jogadores placeholder por time.
"""
import sys
from pathlib import Path

# Adiciona backend/ ao sys.path para importar app.database
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.database import get_db  # noqa: E402

# ── Elenco real do Brasil ────────────────────────────────────────────────────
# (numero, nome, posicao, clube, eh_capitao)
BRASIL = [
    (1,  "Ederson",             "GK",  "Manchester City",   0),
    (12, "Weverton",            "GK",  "Palmeiras",         0),
    (23, "Bento",               "GK",  "Al-Qadsiah",        0),
    (2,  "Danilo",              "DEF", "Flamengo",          0),
    (3,  "Guilherme Arana",     "DEF", "Atlético MG",       0),
    (4,  "Marquinhos",          "DEF", "PSG",               1),  # capitão
    (5,  "Gabriel Magalhães",   "DEF", "Arsenal",           0),
    (6,  "Éder Militão",        "DEF", "Real Madrid",       0),
    (13, "Alex Telles",         "DEF", "Sem clube",         0),
    (22, "Vanderson",           "DEF", "Monaco",            0),
    (7,  "Vinícius Jr.",        "FWD", "Real Madrid",       0),
    (8,  "Bruno Guimarães",     "MID", "Newcastle",         0),
    (9,  "Richarlison",         "FWD", "Tottenham",         0),
    (10, "Neymar Jr.",          "MID", "Al-Hilal",          0),
    (11, "Raphinha",            "FWD", "Barcelona",         0),
    (14, "Endrick",             "FWD", "Real Madrid",       0),
    (15, "Casemiro",            "MID", "Manchester United", 0),
    (16, "Gerson",              "MID", "Flamengo",          0),
    (17, "Rodrygo",             "MID", "Real Madrid",       0),
    (18, "Gabriel Martinelli",  "FWD", "Arsenal",           0),
    (19, "Lucas Paquetá",       "MID", "West Ham",          0),
    (20, "Savinho",             "FWD", "Manchester City",   0),
    (21, "Evanilson",           "FWD", "Bournemouth",       0),
]

# ── Template para os outros 47 times ────────────────────────────────────────
# (numero, posicao) — nome gerado como "Jogador <num>"
# 13 jogadores: 2 GK, 5 DEF, 4 MID, 4 FWD
TEMPLATE = [
    (1,  "GK"),
    (2,  "DEF"),
    (3,  "DEF"),
    (4,  "DEF"),
    (5,  "DEF"),
    (6,  "DEF"),
    (7,  "MID"),
    (8,  "MID"),
    (9,  "FWD"),
    (10, "FWD"),
    (11, "FWD"),
    (12, "GK"),
    (13, "FWD"),
]


def main() -> None:
    with get_db() as conn:
        conn.execute("DELETE FROM jogadores")

        # ── Brasil (dados reais) ─────────────────────────────────────────────
        brasil = conn.execute(
            "SELECT id FROM selecoes WHERE nome_pt = 'Brasil'"
        ).fetchone()
        brasil_id = brasil["id"]

        for num, nome, pos, clube, cap in BRASIL:
            conn.execute(
                """INSERT INTO jogadores
                       (selecao_id, numero, nome, posicao, clube, eh_capitao)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (brasil_id, num, nome, pos, clube, cap),
            )

        # ── Demais 47 seleções (placeholders) ───────────────────────────────
        outras = conn.execute(
            "SELECT id, nome_pt FROM selecoes WHERE nome_pt != 'Brasil'"
            " ORDER BY grupo, pote"
        ).fetchall()

        for selecao in outras:
            sid = selecao["id"]
            for num, pos in TEMPLATE:
                conn.execute(
                    """INSERT INTO jogadores
                           (selecao_id, numero, nome, posicao, clube, eh_capitao)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (sid, num, f"Jogador {num}", pos, "—", 1 if num == 10 else 0),
                )

        conn.commit()

        # ── Relatório ────────────────────────────────────────────────────────
        total   = conn.execute("SELECT COUNT(*) FROM jogadores").fetchone()[0]
        br_cnt  = conn.execute(
            "SELECT COUNT(*) FROM jogadores WHERE selecao_id = ?", (brasil_id,)
        ).fetchone()[0]
        ph_cnt  = total - br_cnt
        n_out   = len(outras)

        print(f"OK: {total} jogadores inseridos")
        print(f"  Brasil:       {br_cnt} jogadores reais")
        print(f"  Demais {n_out} selecoes: {ph_cnt} placeholders"
              f" ({ph_cnt // n_out if n_out else 0} por time)")


if __name__ == "__main__":
    main()
