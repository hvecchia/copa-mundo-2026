from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os

from app.routes.jogos      import router as jogos_router
from app.routes.grupos     import router as grupos_router
from app.routes.selecoes   import router as selecoes_router
from app.routes.escalacoes import router as escalacoes_router
from app.routes.boloes     import router as boloes_router
from app.routes.admin      import router as admin_router

load_dotenv()

app = FastAPI(title="Copa do Mundo 2026 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jogos_router)
app.include_router(grupos_router)
app.include_router(selecoes_router)
app.include_router(escalacoes_router)
app.include_router(boloes_router)
app.include_router(admin_router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"error": "Recurso não encontrado"})


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    return JSONResponse(status_code=500, content={"error": "Erro interno do servidor"})


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
