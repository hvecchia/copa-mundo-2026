from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from app.database import get_db

router = APIRouter(prefix="/api/escalacoes", tags=["escalacoes"])


class EscalacaoIn(BaseModel):
    nome:           str  = "Minha Escalação"
    formacao:       str  = "4-3-3"
    jogadores_json: str          # JSON string com os slots e jogador_id
    session_id:     Optional[str] = None


@router.get("")
def list_escalacoes(
    session_id: Optional[str] = Query(None, description="Filtra por sessão"),
):
    with get_db() as conn:
        if session_id:
            rows = conn.execute(
                "SELECT * FROM escalacoes WHERE session_id = ? ORDER BY criado_em DESC",
                [session_id],
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM escalacoes ORDER BY criado_em DESC LIMIT 20"
            ).fetchall()
    return [dict(r) for r in rows]


@router.post("", status_code=201)
def create_escalacao(body: EscalacaoIn):
    with get_db() as conn:
        cur = conn.execute(
            """INSERT INTO escalacoes (nome, formacao, jogadores_json, session_id)
               VALUES (?, ?, ?, ?)""",
            (body.nome, body.formacao, body.jogadores_json, body.session_id),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM escalacoes WHERE id = ?", [cur.lastrowid]
        ).fetchone()
    return dict(row)


@router.put("/{esc_id}")
def update_escalacao(esc_id: int, body: EscalacaoIn):
    with get_db() as conn:
        if not conn.execute(
            "SELECT 1 FROM escalacoes WHERE id = ?", [esc_id]
        ).fetchone():
            raise HTTPException(status_code=404, detail="Escalação não encontrada")

        conn.execute(
            """UPDATE escalacoes
                  SET nome = ?, formacao = ?, jogadores_json = ?, session_id = ?
                WHERE id = ?""",
            (body.nome, body.formacao, body.jogadores_json, body.session_id, esc_id),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM escalacoes WHERE id = ?", [esc_id]
        ).fetchone()
    return dict(row)


@router.delete("/{esc_id}", status_code=204)
def delete_escalacao(esc_id: int):
    with get_db() as conn:
        if not conn.execute(
            "SELECT 1 FROM escalacoes WHERE id = ?", [esc_id]
        ).fetchone():
            raise HTTPException(status_code=404, detail="Escalação não encontrada")
        conn.execute("DELETE FROM escalacoes WHERE id = ?", [esc_id])
        conn.commit()
