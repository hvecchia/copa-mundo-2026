from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.services.classificacao import calcular_classificacao
from app.services.chaveamento import (
    calcular_standings_grupos,
    selecionar_melhores_terceiros,
    montar_bracket,
)

router = APIRouter(prefix="/api/boloes", tags=["boloes"])


class BolaoIn(BaseModel):
    nome:       str           = "Meu Bolão"
    session_id: Optional[str] = None


class PalpiteIn(BaseModel):
    jogo_id: int
    gols_a:  int
    gols_b:  int


# ── CRUD de bolões ────────────────────────────────────────────────────────────

@router.get("")
def list_boloes(session_id: Optional[str] = Query(None)):
    with get_db() as conn:
        if session_id:
            rows = conn.execute(
                "SELECT * FROM boloes WHERE session_id = ? ORDER BY criado_em DESC",
                [session_id],
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM boloes ORDER BY criado_em DESC LIMIT 20"
            ).fetchall()
    return [dict(r) for r in rows]


@router.post("", status_code=201)
def create_bolao(body: BolaoIn):
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO boloes (nome, session_id) VALUES (?, ?)",
            (body.nome, body.session_id),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM boloes WHERE id = ?", [cur.lastrowid]
        ).fetchone()
    return dict(row)


@router.delete("/{bolao_id}", status_code=204)
def delete_bolao(bolao_id: int):
    with get_db() as conn:
        if not conn.execute(
            "SELECT 1 FROM boloes WHERE id = ?", [bolao_id]
        ).fetchone():
            raise HTTPException(404, "Bolão não encontrado")
        conn.execute("DELETE FROM boloes WHERE id = ?", [bolao_id])
        conn.commit()


# ── Palpites ─────────────────────────────────────────────────────────────────

@router.get("/{bolao_id}/palpites")
def get_palpites(bolao_id: int):
    with get_db() as conn:
        if not conn.execute(
            "SELECT 1 FROM boloes WHERE id = ?", [bolao_id]
        ).fetchone():
            raise HTTPException(404, "Bolão não encontrado")
        rows = conn.execute(
            "SELECT * FROM palpites WHERE bolao_id = ?", [bolao_id]
        ).fetchall()
    return [dict(r) for r in rows]


@router.post("/{bolao_id}/palpites")
def upsert_palpite(bolao_id: int, body: PalpiteIn):
    with get_db() as conn:
        if not conn.execute(
            "SELECT 1 FROM boloes WHERE id = ?", [bolao_id]
        ).fetchone():
            raise HTTPException(404, "Bolão não encontrado")

        conn.execute(
            """INSERT INTO palpites (bolao_id, jogo_id, gols_a, gols_b)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(bolao_id, jogo_id) DO UPDATE SET
                 gols_a = excluded.gols_a,
                 gols_b = excluded.gols_b""",
            (bolao_id, body.jogo_id, body.gols_a, body.gols_b),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM palpites WHERE bolao_id = ? AND jogo_id = ?",
            [bolao_id, body.jogo_id],
        ).fetchone()
    return dict(row)


# ── Chaveamento (mata-mata) ───────────────────────────────────────────────────

@router.get("/{bolao_id}/chaveamento")
def get_chaveamento(bolao_id: int):
    """
    Calcula o bracket completo do mata-mata com base nos palpites da fase
    de grupos e nos palpites salvos para o mata-mata.
    """
    with get_db() as conn:
        if not conn.execute(
            "SELECT 1 FROM boloes WHERE id = ?", [bolao_id]
        ).fetchone():
            raise HTTPException(404, "Bolão não encontrado")

        palpites_rows = conn.execute(
            "SELECT * FROM palpites WHERE bolao_id = ?", [bolao_id]
        ).fetchall()
        palpites_map = {r["jogo_id"]: dict(r) for r in palpites_rows}

        jogos_db = [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM jogos WHERE fase = 'grupo'"
            ).fetchall()
        ]

        selecoes_db = [
            dict(r) for r in conn.execute("SELECT * FROM selecoes").fetchall()
        ]
        selecoes_map = {s["id"]: s for s in selecoes_db}

        mata_rows = conn.execute(
            "SELECT * FROM palpites_mata_mata WHERE bolao_id = ?", [bolao_id]
        ).fetchall()
        palpites_mata = {r["match_id"]: dict(r) for r in mata_rows}

    standings         = calcular_standings_grupos(jogos_db, palpites_map, selecoes_db)
    melhores_terceiros = selecionar_melhores_terceiros(standings)
    bracket           = montar_bracket(standings, melhores_terceiros, palpites_mata, selecoes_map)

    return bracket


class MataMataIn(BaseModel):
    match_id:   str
    gols_a:     Optional[int] = None
    gols_b:     Optional[int] = None
    penaltis_a: Optional[int] = None
    penaltis_b: Optional[int] = None


@router.post("/{bolao_id}/chaveamento/palpite")
def upsert_palpite_mata_mata(bolao_id: int, body: MataMataIn):
    """Salva (insert ou update) o palpite de um confronto do mata-mata."""
    with get_db() as conn:
        if not conn.execute(
            "SELECT 1 FROM boloes WHERE id = ?", [bolao_id]
        ).fetchone():
            raise HTTPException(404, "Bolão não encontrado")

        conn.execute(
            """INSERT INTO palpites_mata_mata
                   (bolao_id, match_id, gols_a, gols_b, penaltis_a, penaltis_b)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(bolao_id, match_id) DO UPDATE SET
                   gols_a     = excluded.gols_a,
                   gols_b     = excluded.gols_b,
                   penaltis_a = excluded.penaltis_a,
                   penaltis_b = excluded.penaltis_b""",
            (bolao_id, body.match_id, body.gols_a, body.gols_b,
             body.penaltis_a, body.penaltis_b),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM palpites_mata_mata WHERE bolao_id = ? AND match_id = ?",
            [bolao_id, body.match_id],
        ).fetchone()
    return dict(row)


# ── Classificação calculada a partir dos palpites ─────────────────────────────

@router.get("/{bolao_id}/classificacao")
def get_classificacao_bolao(bolao_id: int):
    with get_db() as conn:
        if not conn.execute(
            "SELECT 1 FROM boloes WHERE id = ?", [bolao_id]
        ).fetchone():
            raise HTTPException(404, "Bolão não encontrado")

        # Todos os jogos da fase de grupos com IDs das seleções
        jogos = conn.execute(
            """SELECT id, grupo, selecao_a_id, selecao_b_id
                 FROM jogos
                WHERE fase = 'grupo'"""
        ).fetchall()

        # Palpites do bolão indexados por jogo_id
        palpites = {
            r["jogo_id"]: r
            for r in conn.execute(
                "SELECT * FROM palpites WHERE bolao_id = ?", [bolao_id]
            ).fetchall()
        }

        # Todas as seleções
        selecoes = [dict(r) for r in conn.execute("SELECT * FROM selecoes").fetchall()]

    # Constrói "jogos encerrados" substituindo placar real pelo palpite
    jogos_virtuais = []
    for j in jogos:
        jd = dict(j)
        p  = palpites.get(jd["id"])
        if p:
            jogos_virtuais.append({
                "selecao_a_id": jd["selecao_a_id"],
                "selecao_b_id": jd["selecao_b_id"],
                "grupo":        jd["grupo"],
                "gols_a":       p["gols_a"],
                "gols_b":       p["gols_b"],
                "status":       "encerrado",
            })

    # Calcula por grupo (reutiliza o serviço de desempate FIFA)
    letras = sorted({dict(j)["grupo"] for j in jogos})
    resultado: dict[str, list] = {}
    for letra in letras:
        sels_grupo  = [s for s in selecoes if s["grupo"] == letra]
        jogos_grupo = [j for j in jogos_virtuais if j["grupo"] == letra]
        resultado[letra] = calcular_classificacao(jogos_grupo, sels_grupo)

    return resultado
