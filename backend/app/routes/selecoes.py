from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.database import get_db

router = APIRouter(prefix="/api/selecoes", tags=["selecoes"])

_SEL_COLS = """
    id, nome_pt, bandeira_emoji, confederacao, grupo,
    pote, eh_cabeca_chave, eh_sede, treinador, ranking_fifa
"""

# Ordena jogadores por posição (GK→DEF→MID→FWD) e número
_POS_ORDER = "CASE posicao WHEN 'GK' THEN 1 WHEN 'DEF' THEN 2 WHEN 'MID' THEN 3 WHEN 'FWD' THEN 4 ELSE 5 END"


@router.get("")
def list_selecoes(
    grupo:        Optional[str] = Query(None, description="A – L"),
    confederacao: Optional[str] = Query(None, description="UEFA, CONMEBOL, …"),
):
    """Lista todas as seleções com filtros opcionais."""
    sql    = f"SELECT {_SEL_COLS} FROM selecoes WHERE 1=1"
    params: list = []

    if grupo:
        sql += " AND grupo = ?"
        params.append(grupo.upper())
    if confederacao:
        sql += " AND confederacao = ?"
        params.append(confederacao)

    sql += " ORDER BY grupo, pote"

    with get_db() as conn:
        rows = conn.execute(sql, params).fetchall()
    return [dict(r) for r in rows]


@router.get("/{selecao_id}")
def get_selecao(selecao_id: int):
    """Detalhe de uma seleção pelo ID."""
    with get_db() as conn:
        row = conn.execute(
            f"SELECT {_SEL_COLS} FROM selecoes WHERE id = ?",
            [selecao_id],
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Seleção não encontrada")
    return dict(row)


@router.get("/{selecao_id}/jogadores")
def get_jogadores(
    selecao_id: int,
    posicao: Optional[str] = Query(None, description="GK | DEF | MID | FWD"),
):
    """Elenco de uma seleção, ordenado por posição e número."""
    with get_db() as conn:
        existe = conn.execute(
            "SELECT 1 FROM selecoes WHERE id = ?", [selecao_id]
        ).fetchone()
        if existe is None:
            raise HTTPException(status_code=404, detail="Seleção não encontrada")

        sql    = """
            SELECT id, numero, nome, posicao, clube, idade, eh_capitao
            FROM jogadores
            WHERE selecao_id = ?
        """
        params: list = [selecao_id]

        if posicao:
            sql += " AND posicao = ?"
            params.append(posicao.upper())

        sql += f" ORDER BY {_POS_ORDER}, numero"

        rows = conn.execute(sql, params).fetchall()

    return [dict(r) for r in rows]
