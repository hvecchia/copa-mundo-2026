from fastapi import APIRouter, Query
from typing import Optional

from app.database import get_db

router = APIRouter(prefix="/api/jogos", tags=["jogos"])

_SELECT = """
    SELECT
        j.id,
        j.fase,
        j.grupo,
        j.rodada,
        j.selecao_a_id,
        j.selecao_b_id,
        j.data_hora,
        j.estadio,
        j.cidade,
        j.pais_sede,
        j.gols_a,
        j.gols_b,
        j.penaltis_a,
        j.penaltis_b,
        j.status,
        sa.nome_pt        AS selecao_a_nome,
        sa.bandeira_emoji AS selecao_a_bandeira,
        sb.nome_pt        AS selecao_b_nome,
        sb.bandeira_emoji AS selecao_b_bandeira
    FROM jogos j
    LEFT JOIN selecoes sa ON j.selecao_a_id = sa.id
    LEFT JOIN selecoes sb ON j.selecao_b_id = sb.id
    WHERE 1=1
"""


@router.get("")
def list_jogos(
    status:     Optional[str] = Query(None, description="agendado | em_andamento | encerrado"),
    grupo:      Optional[str] = Query(None, description="A – L"),
    fase:       Optional[str] = Query(None, description="grupo | rodada_32 | oitavas | quartas | semi | terceiro | final"),
    selecao_id: Optional[int] = Query(None, description="ID da seleção (filtra como mandante ou visitante)"),
    limit:      Optional[int] = Query(None, ge=1, description="Máximo de resultados"),
):
    sql = _SELECT
    params: list = []

    if status:
        sql += " AND j.status = ?"
        params.append(status)
    if grupo:
        sql += " AND j.grupo = ?"
        params.append(grupo.upper())
    if fase:
        sql += " AND j.fase = ?"
        params.append(fase)
    if selecao_id:
        sql += " AND (j.selecao_a_id = ? OR j.selecao_b_id = ?)"
        params.extend([selecao_id, selecao_id])

    sql += " ORDER BY j.data_hora"

    if limit:
        sql += " LIMIT ?"
        params.append(limit)

    with get_db() as conn:
        rows = conn.execute(sql, params).fetchall()

    return [dict(row) for row in rows]


@router.get("/{jogo_id}")
def get_jogo(jogo_id: int):
    sql = _SELECT + " AND j.id = ?"

    with get_db() as conn:
        row = conn.execute(sql, [jogo_id]).fetchone()

    if row is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Jogo não encontrado")

    return dict(row)
