# Claude.md — Copa do Mundo 2026 App
**Guia de Contexto para Desenvolvimento com IA**
Este arquivo orienta o Claude (e outros LLMs) sobre as decisões técnicas, padrões de código e contexto do projeto.

---

## 🎯 O que é este projeto

Aplicação web completa sobre a Copa do Mundo FIFA 2026. Em português brasileiro. Sem Docker. Banco SQLite local. Foco em funcionalidade, performance e boa UX.

**Repositório:** `copa2026/`
**Banco:** `backend/db/copa2026.db` (SQLite, arquivo único)
**Idioma do código:** inglês (variáveis, funções, comentários relevantes em PT-BR)
**Idioma da UI:** português brasileiro

---

## 🏗️ Stack Técnica

### Backend
- **Runtime:** Python 3.11+ com FastAPI
- **Servidor:** Uvicorn
- **ORM:** Nenhum — SQL puro via `sqlite3` (stdlib) ou `aiosqlite`
- **Autenticação:** Nenhuma para usuários comuns; admin via header `X-Admin-Key` com valor em `.env`
- **Porta padrão:** 8000

### Frontend
- **Framework:** React 18 + Vite
- **Estilização:** Tailwind CSS v3 com tema customizado
- **Roteamento:** React Router v6
- **Estado global:** Zustand (leve, sem boilerplate)
- **HTTP client:** Fetch nativo (sem axios)
- **Drag & Drop:** HTML5 Drag and Drop API (sem lib externa)
- **Porta dev:** 5173

### Banco de Dados
- **Motor:** SQLite 3 (embutido no Python)
- **Arquivo:** `backend/db/copa2026.db`
- **Foreign keys:** ATIVADAS via `PRAGMA foreign_keys = ON` em toda conexão
- **Sem ORM:** queries SQL diretas, parametrizadas sempre
- **Migrations:** arquivos `.sql` numerados em `backend/db/migrations/`
- **Seeds:** arquivos `.sql` em `backend/db/seeds/`

---

## 📁 Estrutura de Arquivos

```
copa2026/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py          # Variáveis de env, paths
│   │   ├── database.py        # Conexão SQLite, get_db()
│   │   ├── routes/
│   │   │   ├── jogos.py       # /api/jogos
│   │   │   ├── grupos.py      # /api/grupos
│   │   │   ├── selecoes.py    # /api/selecoes
│   │   │   ├── escalacoes.py  # /api/escalacoes
│   │   │   ├── boloes.py      # /api/boloes
│   │   │   └── admin.py       # /api/admin (protegido)
│   │   └── services/
│   │       ├── classificacao.py  # Cálculo de tabela por grupo
│   │       └── chaveamento.py    # Lógica de bracket mata-mata
│   ├── db/
│   │   ├── migrations/
│   │   │   └── 001_create_tables.sql
│   │   ├── seeds/
│   │   │   ├── 01_selecoes.sql
│   │   │   ├── 02_jogos.sql
│   │   │   ├── 03_jogadores_brasil.sql
│   │   │   └── 04_jogadores_outros.sql
│   │   └── init.py            # Script: cria banco + roda migrations + seeds
│   ├── main.py                # Entry point FastAPI
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── countdown/
│   │   │   │   └── Countdown.jsx
│   │   │   ├── jogos/
│   │   │   │   ├── JogoCard.jsx
│   │   │   │   └── FiltrosJogos.jsx
│   │   │   ├── grupos/
│   │   │   │   ├── TabelaGrupo.jsx
│   │   │   │   └── PotesSection.jsx
│   │   │   ├── escalacao/
│   │   │   │   ├── CampoFutebol.jsx
│   │   │   │   ├── JogadorSlot.jsx
│   │   │   │   └── ListaConvocados.jsx
│   │   │   └── bolao/
│   │   │       ├── SimuladorGrupos.jsx
│   │   │       └── Chaveamento.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Landing page
│   │   │   ├── TabelaPage.jsx
│   │   │   ├── GruposPage.jsx
│   │   │   ├── ElencoPage.jsx
│   │   │   ├── EscalacaoPage.jsx
│   │   │   └── BolaoPage.jsx
│   │   ├── store/
│   │   │   └── useAppStore.js    # Zustand store global
│   │   ├── hooks/
│   │   │   ├── useJogos.js
│   │   │   ├── useGrupos.js
│   │   │   └── useBolao.js
│   │   ├── utils/
│   │   │   ├── classificacao.js  # Cálculo no frontend (para bolão)
│   │   │   ├── formatDate.js
│   │   │   └── flags.js          # Emoji de bandeiras por código ISO
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── PRD.md
├── Tasks.md
├── Claude.md
└── README.md
```

---

## 🗄️ Schema do Banco de Dados

### Regras gerais
- IDs são `INTEGER PRIMARY KEY AUTOINCREMENT`
- Datas e horas: `TEXT` no formato ISO 8601 `YYYY-MM-DDTHH:MM:SS` (sempre em UTC)
- Booleans: `INTEGER` (0 ou 1)
- JSON como `TEXT`: para dados flexíveis (ex: jogadores_json na escalação)

### DDL Completo

```sql
-- Ativar sempre em cada conexão
PRAGMA foreign_keys = ON;

-- Seleções
CREATE TABLE IF NOT EXISTS selecoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,                -- Nome em inglês (chave)
    nome_pt TEXT NOT NULL,             -- Nome em português
    codigo_iso TEXT NOT NULL,          -- BR, AR, FR...
    bandeira_emoji TEXT,               -- 🇧🇷
    confederacao TEXT NOT NULL,        -- CONMEBOL, UEFA, CAF, CONCACAF, AFC, OFC
    grupo TEXT NOT NULL,               -- A a L
    pote INTEGER NOT NULL,             -- 1 a 4
    eh_cabeca_chave INTEGER NOT NULL DEFAULT 0,
    eh_sede INTEGER NOT NULL DEFAULT 0,
    treinador TEXT,
    ranking_fifa INTEGER,
    criado_em TEXT DEFAULT (datetime('now'))
);

-- Jogadores
CREATE TABLE IF NOT EXISTS jogadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    selecao_id INTEGER NOT NULL REFERENCES selecoes(id) ON DELETE CASCADE,
    numero INTEGER,
    nome TEXT NOT NULL,
    nome_curto TEXT,
    posicao TEXT NOT NULL CHECK(posicao IN ('GK','DEF','MID','FWD')),
    clube TEXT,
    idade INTEGER,
    eh_capitao INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT DEFAULT (datetime('now'))
);

-- Jogos
CREATE TABLE IF NOT EXISTS jogos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fase TEXT NOT NULL CHECK(fase IN (
        'grupo','oitavas','quartas','semi','terceiro','final'
    )),
    grupo TEXT,                         -- Nulo nas fases eliminatórias
    rodada INTEGER,                     -- 1, 2 ou 3 na fase de grupos
    selecao_a_id INTEGER REFERENCES selecoes(id),
    selecao_b_id INTEGER REFERENCES selecoes(id),
    data_hora_utc TEXT NOT NULL,        -- ISO 8601 UTC
    estadio TEXT,
    cidade TEXT,
    pais_sede TEXT,
    gols_a INTEGER,
    gols_b INTEGER,
    penaltis_a INTEGER,
    penaltis_b INTEGER,
    status TEXT NOT NULL DEFAULT 'agendado'
        CHECK(status IN ('agendado','em_andamento','encerrado')),
    criado_em TEXT DEFAULT (datetime('now'))
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_jogos_fase ON jogos(fase);
CREATE INDEX IF NOT EXISTS idx_jogos_grupo ON jogos(grupo);
CREATE INDEX IF NOT EXISTS idx_jogos_data ON jogos(data_hora_utc);
CREATE INDEX IF NOT EXISTS idx_jogos_status ON jogos(status);
CREATE INDEX IF NOT EXISTS idx_jogadores_selecao ON jogadores(selecao_id);

-- Bolões
CREATE TABLE IF NOT EXISTS boloes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL DEFAULT 'Meu Bolão',
    session_id TEXT NOT NULL,
    criado_em TEXT DEFAULT (datetime('now')),
    atualizado_em TEXT DEFAULT (datetime('now'))
);

-- Palpites
CREATE TABLE IF NOT EXISTS palpites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bolao_id INTEGER NOT NULL REFERENCES boloes(id) ON DELETE CASCADE,
    jogo_id INTEGER NOT NULL REFERENCES jogos(id),
    gols_a INTEGER NOT NULL DEFAULT 0,
    gols_b INTEGER NOT NULL DEFAULT 0,
    penaltis_a INTEGER,
    penaltis_b INTEGER,
    UNIQUE(bolao_id, jogo_id)
);

-- Escalações salvas (somente Brasil)
CREATE TABLE IF NOT EXISTS escalacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL DEFAULT 'Minha Escalação',
    formacao TEXT NOT NULL DEFAULT '4-3-3',
    titulares_json TEXT NOT NULL,       -- Array de {slot, jogador_id}
    reservas_json TEXT,                 -- Array de jogador_ids
    session_id TEXT,
    criado_em TEXT DEFAULT (datetime('now'))
);
```

---

## 🔌 Contratos de API

### Convenções
- Base URL: `http://localhost:8000/api`
- Respostas sempre em JSON
- Erros no formato: `{ "error": "mensagem", "detail": "..." }`
- Datas retornadas em UTC ISO 8601; o frontend converte para horário de Brasília (UTC-3)
- Paginação: `?page=1&per_page=20` quando aplicável

### Endpoints Principais

```
GET    /api/jogos                     Lista jogos (filtros: fase, grupo, status, data, selecao_id)
GET    /api/jogos/:id                 Detalhe de um jogo
PATCH  /api/admin/jogos/:id           Atualizar placar (header: X-Admin-Key)

GET    /api/grupos                    Todos os grupos com classificação atual
GET    /api/grupos/:letra             Grupo específico (A-L)

GET    /api/selecoes                  Todas as seleções (filtro: grupo, confederacao)
GET    /api/selecoes/:id              Detalhe de uma seleção
GET    /api/selecoes/:id/jogadores    Elenco (filtro: posicao)
GET    /api/selecoes/:id/jogos        Jogos da seleção

GET    /api/boloes                    Bolões da sessão (header: X-Session-Id)
POST   /api/boloes                    Criar bolão {nome}
GET    /api/boloes/:id/palpites       Palpites do bolão
POST   /api/boloes/:id/palpites       Salvar palpite {jogo_id, gols_a, gols_b}
GET    /api/boloes/:id/chaveamento    Chaveamento calculado
DELETE /api/boloes/:id                Remover bolão

GET    /api/escalacoes                Escalações da sessão
POST   /api/escalacoes                Salvar escalação
PUT    /api/escalacoes/:id            Atualizar escalação
DELETE /api/escalacoes/:id            Remover escalação
```

### Formato de Resposta — Jogo
```json
{
  "id": 1,
  "fase": "grupo",
  "grupo": "A",
  "rodada": 1,
  "data_hora_utc": "2026-06-11T20:00:00",
  "estadio": "Estádio Azteca",
  "cidade": "Cidade do México",
  "pais_sede": "México",
  "status": "encerrado",
  "selecao_a": {
    "id": 1,
    "nome_pt": "México",
    "codigo_iso": "MX",
    "bandeira_emoji": "🇲🇽"
  },
  "selecao_b": {
    "id": 2,
    "nome_pt": "África do Sul",
    "codigo_iso": "ZA",
    "bandeira_emoji": "🇿🇦"
  },
  "gols_a": 2,
  "gols_b": 1,
  "penaltis_a": null,
  "penaltis_b": null
}
```

---

## 🧠 Lógica de Negócio Crítica

### Cálculo de Classificação de Grupos

```python
# backend/app/services/classificacao.py

def calcular_classificacao(jogos: list, grupo: str) -> list:
    """
    Retorna lista ordenada de seleções por grupo, aplicando regras FIFA.
    Critérios em ordem:
    1. Pontos (V=3, E=1, D=0)
    2. Saldo de gols geral
    3. Gols marcados geral
    4. Pontos em confronto direto
    5. Saldo de gols em confronto direto
    6. Gols marcados em confronto direto
    7. Fair Play (não implementado na v1)
    8. Ranking FIFA
    """
    pass
```

### Seleção dos 8 Melhores Terceiros

```python
# Os 8 melhores terceiros colocados avançam para as oitavas
# Critérios de comparação entre terceiros: mesmos de cima
# Em caso de empate entre terceiros: grupo que tem mais pontos, etc.
def selecionar_melhores_terceiros(terceiros: list) -> list:
    """Recebe lista de 12 terceiros colocados, retorna os 8 melhores."""
    pass
```

### Chaveamento das Oitavas

```
O chaveamento das oitavas segue tabela FIFA pré-definida
baseada em quais grupos os terceiros vieram.
Ex: 1A vs melhor-3(B/C/D/E/F), etc.
Essa tabela deve estar hardcoded no backend conforme regras FIFA 2026.
```

---

## 🎨 Design System

### Cores (Tailwind config)
```js
// tailwind.config.js
colors: {
  copa: {
    green:  '#009C3B',  // Verde Brasil
    yellow: '#FFDF00',  // Amarelo Brasil
    blue:   '#002776',  -- Azul Brasil (escudo)
    gold:   '#C8A951',  // Dourado troféu
    dark:   '#0A0A0A',  // Fundo escuro
    card:   '#141414',  // Card escuro
    border: '#2A2A2A',  // Bordas
  }
}
```

### Tipografia
- **Display (títulos grandes):** `Bebas Neue` (CDN Google Fonts)
- **Body:** `DM Sans` (Google Fonts)
- **Monospace (placares):** `JetBrains Mono`

### Tema Global
- Fundo escuro (`#0A0A0A`) com cards em `#141414`
- Acentos em verde `#009C3B` e dourado `#C8A951`
- Textos: branco `#FFFFFF` e cinza `#A0A0A0`

### Componentes Padrão
```jsx
// Botão primário
<button className="bg-copa-green text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">

// Card
<div className="bg-copa-card border border-copa-border rounded-xl p-4">

// Badge de status
const statusColors = {
  agendado: 'bg-gray-700 text-gray-300',
  em_andamento: 'bg-green-900 text-green-400 animate-pulse',
  encerrado: 'bg-gray-800 text-gray-400'
}
```

---

## ⏰ Datas e Fusos Horários

### Regra de ouro
- **Armazenar:** sempre em UTC no SQLite
- **Exibir:** converter para horário de Brasília (UTC-3, sem horário de verão em junho)
- **Countdown:** target = `2026-06-11T20:00:00Z` (17h de Brasília)

### Utilitário de conversão
```js
// frontend/src/utils/formatDate.js
export function toHorarioBrasilia(utcString) {
  const date = new Date(utcString);
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}
```

---

## 🚫 Regras e Restrições

1. **Nunca usar Docker** — o projeto roda direto na máquina local
2. **Nunca usar ORMs** — SQL puro, sempre parametrizado (evitar SQL injection)
3. **Nunca hardcodar SQL no frontend** — toda lógica de banco fica no backend
4. **Session ID:** usar `crypto.randomUUID()` gerado no primeiro acesso e salvo em `sessionStorage`
5. **Admin key:** lida de `.env`, nunca exposta no frontend
6. **Queries sempre parametrizadas:**
   ```python
   # CORRETO
   cursor.execute("SELECT * FROM jogos WHERE grupo = ?", (grupo,))
   # ERRADO — SQL injection!
   cursor.execute(f"SELECT * FROM jogos WHERE grupo = '{grupo}'")
   ```

---

## 🔧 Scripts de Desenvolvimento

```bash
# Setup inicial completo
cd backend
pip install -r requirements.txt
python db/init.py          # Cria banco, roda migrations e seeds

# Iniciar backend
uvicorn main:app --reload --port 8000

# Iniciar frontend (outro terminal)
cd frontend
npm install
npm run dev                # http://localhost:5173

# Resetar banco (CUIDADO: apaga todos os dados)
python db/init.py --reset

# Seed somente (sem apagar)
python db/init.py --seed-only
```

---

## 📋 Checklist Antes de Cada PR/Commit

- [ ] Queries SQL parametrizadas
- [ ] Sem `console.log` ou `print` desnecessários
- [ ] Sem credenciais hardcoded
- [ ] Componentes React com PropTypes ou TypeScript types
- [ ] Erro tratado em todo fetch (try/catch)
- [ ] Responsivo testado em viewport 375px

---

## 🔮 Decisões Arquiteturais e Motivações

| Decisão | Motivo |
|---------|--------|
| SQLite sem Docker | Simplicidade, zero config, portabilidade |
| FastAPI (Python) | Tipagem, performance, docs automáticos |
| SQL puro (sem ORM) | Controle total, sem overhead, fácil debugar |
| Zustand (não Redux) | Leveza para estado simples (bolão, sessão) |
| Vite (não CRA) | Build rápido, HMR nativo |
| Tailwind (não styled-components) | Velocidade de desenvolvimento, consistência |
| HTML5 DnD API | Zero dependência extra para drag & drop |

---

## 📖 Glossário do Domínio

| Termo | Significado |
|-------|-------------|
| Cabeça de chave | Seleção do Pote 1, que lidera um grupo |
| Sede | País que organiza a Copa (EUA, Canadá, México) |
| Fase de grupos | Primeira fase: 48 seleções, 12 grupos de 4 |
| Mata-mata | Fase eliminatória (oitavas em diante) |
| Oitavas | 16 confrontos com as 32 classificadas |
| Prorrogação | 30 minutos extras em caso de empate no mata-mata |
| Bolão | Conjunto de palpites de placar para jogos da Copa |
| Chaveamento | Visualização em árvore do mata-mata |
| Escalação | Definição dos 11 titulares e formação tática |
| SG | Saldo de gols (GP - GC) |
| GP/GC | Gols pró / Gols contra |
