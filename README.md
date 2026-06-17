# 🏆 Copa do Mundo 2026 — App Full-Stack

Aplicação web completa dedicada à Copa do Mundo FIFA 2026 (EUA, Canadá e México), com acompanhamento de jogos, classificação por grupos, elencos das seleções, escalação interativa da Seleção Brasileira e um simulador de bolão com chaveamento até a final.

Projeto desenvolvido como estudo de arquitetura full-stack, com backend em **FastAPI + SQLite** e frontend em **React + Vite + Tailwind CSS**, populado com dados reais do torneio.

---

## ✨ Funcionalidades

- **Landing page** com contagem regressiva (três estados: antes / durante / depois da Copa), destaques de próximos jogos e últimos resultados, e estatísticas do torneio.
- **Tabela de jogos** — todas as 72 partidas da fase de grupos, com filtros combináveis por fase, grupo, data, seleção e status.
- **Classificação dos grupos** — os 12 grupos (A–L) com tabela completa (J, V, E, D, GP, GC, SG, Pts) calculada automaticamente a partir dos resultados, aplicando os critérios de desempate da FIFA.
- **Elencos** — as 48 seleções participantes; a Seleção Brasileira com elenco detalhado.
- **Escalação interativa** — campo de futebol com drag & drop, 7 formações táticas, salvamento de escalações.
- **Bolão e simulador de chaveamento** — palpites de placar com classificação recalculada em tempo real, e bracket do mata-mata (Rodada de 32 → final) com avanço automático dos vencedores. Suporta múltiplos bolões.
- **Painel administrativo** — atualização de placares e status dos jogos por uma interface protegida por senha; a classificação recalcula automaticamente.

---

## 🛠️ Stack

**Backend**
- Python + FastAPI
- SQLite (arquivo único, migrations versionadas e seeds)
- Uvicorn

**Frontend**
- React + Vite
- Tailwind CSS
- React Router
- flag-icons (bandeiras das seleções)

---

## 📁 Estrutura do projeto

```
copa2026/
├── backend/
│   ├── app/
│   │   ├── routes/        # rotas da API (jogos, grupos, seleções, bolões, admin...)
│   │   └── services/      # lógica de cálculo (classificação, chaveamento)
│   ├── db/
│   │   ├── migrations/    # criação das tabelas
│   │   ├── seeds/         # dados iniciais (seleções, jogos, jogadores)
│   │   ├── init.py        # cria e popula o banco
│   │   └── resultados.py  # aplica resultados reais já disputados
│   └── main.py
├── frontend/
│   └── src/
│       ├── components/    # componentes reutilizáveis
│       └── pages/         # páginas (Home, Tabela, Grupos, Elencos, Brasil, Bolão, Admin)
└── docs/
```

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Python 3.x
- Node.js + npm

### 1. Clonar o repositório
```bash
git clone https://github.com/hvecchia/copa-mundo-2026.git
cd copa-mundo-2026
```

### 2. Backend
```bash
cd backend

# criar e ativar o ambiente virtual
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# instalar dependências
pip install -r requirements.txt

# criar o banco, popular com os dados e aplicar resultados reais
python db/init.py
python db/resultados.py

# subir o servidor (http://localhost:8000)
python main.py
```

> No Windows, dependendo da instalação, use `py` no lugar de `python`.

Crie um arquivo `backend/.env` com:
```
DB_PATH=db/copa2026.db
PORT=8000
ADMIN_PASSWORD=defina_sua_senha
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# abre em http://localhost:5173
```

Com o backend e o frontend rodando, acesse **http://localhost:5173**.

---

## 🗄️ Banco de dados

O banco (`copa2026.db`) **não é versionado** — ele é recriado a partir dos seeds. Os comandos:

- `python db/init.py` — cria as tabelas e popula com os dados iniciais. Pode ser rodado com segurança várias vezes (não duplica dados existentes).
- `python db/init.py --reset` — apaga e recria o banco do zero.
- `python db/resultados.py` — aplica os resultados das partidas já disputadas.

Os placares também podem ser atualizados pela interface, no painel administrativo (`/admin`).

---

## 📝 Sobre os dados

Os dados de grupos, jogos e resultados refletem a Copa do Mundo FIFA 2026 (fontes públicas de imprensa esportiva). O elenco da Seleção Brasileira é detalhado; os demais elencos são simplificados, por se tratar de um projeto de estudo.

---

## 🤖 Ferramentas

Este projeto foi desenvolvido com o apoio do **Claude Code** (Anthropic) como ferramenta de desenvolvimento assistido por IA, usada para acelerar a escrita de código e a estruturação da aplicação. Toda a arquitetura, decisões de produto, depuração e validação dos dados foram conduzidas e revisadas manualmente.

---

## 📄 Licença

Projeto de estudo, livre para fins educacionais.
