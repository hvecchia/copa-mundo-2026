"""
Cria e inicializa o banco copa2026.db.

Uso:
    py db/init.py               # só migrations — NUNCA duplica dados
    py db/init.py --reset       # apaga o banco e recria do zero
    py db/init.py --seed-only   # força seeds (use só em banco vazio)
"""

import sqlite3
import sys
from pathlib import Path

DB_DIR         = Path(__file__).parent
DB_FILE        = DB_DIR / "copa2026.db"
MIGRATIONS_DIR = DB_DIR / "migrations"
SEEDS_DIR      = DB_DIR / "seeds"

# Seeds em ordem — selecoes antes de jogos (FK)
SEED_ORDER = [
    "selecoes.sql",
    "jogos_fase_grupos.sql",
]


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def run_file(conn: sqlite3.Connection, path: Path):
    sql = path.read_text(encoding="utf-8")
    conn.executescript(sql)
    print(f"  OK  {path.name}")


def run_migrations():
    """Aplica todas as migrations. Seguro de rodar N vezes (CREATE TABLE IF NOT EXISTS)."""
    print("Rodando migrations...")
    conn = connect()
    for migration in sorted(MIGRATIONS_DIR.glob("*.sql")):
        run_file(conn, migration)
    conn.close()   # fecha após executescript — evita estado de transação residual


def run_seeds():
    """Insere dados iniciais. NÃO chame diretamente; use as funções abaixo."""
    print("Rodando seeds...")
    conn = connect()
    for name in SEED_ORDER:
        path = SEEDS_DIR / name
        if path.exists():
            run_file(conn, path)
        else:
            print(f"  --  {name} (não encontrado, pulando)")
    conn.close()


def tem_dados() -> bool:
    """
    Abre uma conexão NOVA e verifica se selecoes tem linhas.
    Conexão separada garante leitura limpa, independente de qualquer
    transação ou estado residual de executescript.
    """
    conn = connect()
    try:
        count = conn.execute("SELECT COUNT(*) FROM selecoes").fetchone()[0]
        return count > 0
    except sqlite3.OperationalError:
        return False   # tabela ainda não existe
    finally:
        conn.close()


# ── Comandos ──────────────────────────────────────────────────────────────────

def migrate():
    """
    Fluxo padrão (sem flags).
    1. Aplica migrations (idempotente).
    2. Se banco NÃO tem dados, roda seeds uma única vez.
    3. Se banco JÁ tem dados, para aqui — seeds NUNCA rodam.
    """
    print(f"Banco: {DB_FILE}")
    run_migrations()

    if tem_dados():
        print("Dados já existem — seeds ignorados.")
    else:
        print("Banco vazio detectado, rodando seeds iniciais...")
        run_seeds()

    print("Pronto.")


def reset():
    """Apaga o banco e recria do zero (migrations + seeds)."""
    if DB_FILE.exists():
        DB_FILE.unlink()
        print(f"Banco apagado: {DB_FILE.name}")
    print(f"Banco: {DB_FILE}")
    run_migrations()
    run_seeds()
    print("Pronto.")


def seed_only():
    """Força os seeds independente do estado atual (use com cuidado)."""
    if not DB_FILE.exists():
        print("Erro: banco não existe. Rode sem flags primeiro.")
        sys.exit(1)
    run_seeds()
    print("Pronto.")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    args = sys.argv[1:]
    if "--reset" in args:
        reset()
    elif "--seed-only" in args:
        seed_only()
    else:
        migrate()
