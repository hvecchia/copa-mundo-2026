from fastapi import APIRouter, HTTPException

from app.database import get_db
from app.services.classificacao import calcular_classificacao

router = APIRouter(prefix="/api", tags=["grupos"])

GRUPOS = list("ABCDEFGHIJKL")


def _selecoes(conn, letra: str) -> list[dict]:
    rows = conn.execute(
        """
        SELECT id, nome_pt, bandeira_emoji, confederacao,
               grupo, pote, eh_cabeca_chave, eh_sede
        FROM selecoes
        WHERE grupo = ?
        ORDER BY pote
        """,
        [letra],
    ).fetchall()
    return [dict(r) for r in rows]


def _jogos(conn, letra: str) -> list[dict]:
    rows = conn.execute(
        """
        SELECT
            j.id, j.fase, j.grupo, j.rodada, j.data_hora,
            j.estadio, j.cidade, j.pais_sede, j.status,
            j.selecao_a_id, j.gols_a, j.penaltis_a,
            j.selecao_b_id, j.gols_b, j.penaltis_b,
            sa.nome_pt        AS selecao_a_nome,
            sa.bandeira_emoji AS selecao_a_bandeira,
            sb.nome_pt        AS selecao_b_nome,
            sb.bandeira_emoji AS selecao_b_bandeira
        FROM jogos j
        LEFT JOIN selecoes sa ON j.selecao_a_id = sa.id
        LEFT JOIN selecoes sb ON j.selecao_b_id = sb.id
        WHERE j.grupo = ? AND j.fase = 'grupo'
        ORDER BY j.data_hora
        """,
        [letra],
    ).fetchall()
    return [dict(r) for r in rows]


# ── GET /api/grupos ──────────────────────────────────────────────────────────

@router.get("/grupos")
def list_grupos():
    """Todos os grupos com suas seleções (sem classificação calculada)."""
    resultado = []
    with get_db() as conn:
        for g in GRUPOS:
            sels = _selecoes(conn, g)
            if sels:
                resultado.append({"grupo": g, "selecoes": sels})
    return resultado


# ── GET /api/classificacao ───────────────────────────────────────────────────

@router.get("/classificacao")
def get_classificacao_todos():
    """Classificação calculada de todos os 12 grupos."""
    resultado = []
    with get_db() as conn:
        for g in GRUPOS:
            sels = _selecoes(conn, g)
            if not sels:
                continue
            todos_jogos  = _jogos(conn, g)
            encerrados   = [j for j in todos_jogos if j["status"] == "encerrado"]
            classif      = calcular_classificacao(encerrados, sels)
            resultado.append({"grupo": g, "classificacao": classif})
    return resultado


# ── GET /api/grupos/{letra} ──────────────────────────────────────────────────

@router.get("/grupos/{letra}")
def get_grupo(letra: str):
    """Um grupo com classificação calculada e lista de jogos."""
    letra = letra.upper()
    if letra not in GRUPOS:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")

    with get_db() as conn:
        sels = _selecoes(conn, letra)
        if not sels:
            raise HTTPException(status_code=404, detail="Grupo sem seleções")

        todos_jogos = _jogos(conn, letra)
        encerrados  = [j for j in todos_jogos if j["status"] == "encerrado"]
        classif     = calcular_classificacao(encerrados, sels)

    return {
        "grupo":          letra,
        "classificacao":  classif,
        "jogos":          todos_jogos,
    }
