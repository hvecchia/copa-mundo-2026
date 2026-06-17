from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

from app.database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])

# ── Autenticação via header X-Admin-Key ───────────────────────────────────────

def verificar_admin(x_admin_key: Optional[str] = Header(None)):
    esperada = os.getenv("ADMIN_PASSWORD", "")
    if not esperada or x_admin_key != esperada:
        raise HTTPException(status_code=401, detail="Acesso não autorizado")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/verificar", dependencies=[Depends(verificar_admin)])
def verificar():
    """Valida a chave admin. Retorna 200 se correta, 401 se não."""
    return {"ok": True}


class JogoUpdate(BaseModel):
    gols_a:     Optional[int] = None
    gols_b:     Optional[int] = None
    penaltis_a: Optional[int] = None
    penaltis_b: Optional[int] = None
    status:     Optional[str] = None


_STATUS_VALIDOS = {"agendado", "em_andamento", "encerrado"}
_CAMPOS_PERMITIDOS = {"gols_a", "gols_b", "penaltis_a", "penaltis_b", "status"}


@router.patch("/jogos/{jogo_id}", dependencies=[Depends(verificar_admin)])
def update_jogo(jogo_id: int, body: JogoUpdate):
    """Atualiza placar e/ou status de um jogo."""
    if body.status is not None and body.status not in _STATUS_VALIDOS:
        raise HTTPException(
            400, f"Status inválido. Valores aceitos: {sorted(_STATUS_VALIDOS)}"
        )

    # Monta SET clause apenas com campos enviados (não None)
    updates: dict = {
        k: v
        for k, v in body.model_dump().items()
        if v is not None and k in _CAMPOS_PERMITIDOS
    }

    with get_db() as conn:
        if not conn.execute("SELECT 1 FROM jogos WHERE id = ?", [jogo_id]).fetchone():
            raise HTTPException(404, "Jogo não encontrado")

        if updates:
            set_clause = ", ".join(f"{col} = ?" for col in updates)
            conn.execute(
                f"UPDATE jogos SET {set_clause} WHERE id = ?",
                [*updates.values(), jogo_id],
            )
            conn.commit()

        row = conn.execute("SELECT * FROM jogos WHERE id = ?", [jogo_id]).fetchone()

    return dict(row)
