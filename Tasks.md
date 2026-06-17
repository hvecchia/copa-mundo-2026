# Tasks.md — Copa do Mundo 2026 App
**Plano de Desenvolvimento por Sprints**
Versão: 1.0 | Metodologia: Iterativa por Feature

---

## Legenda
- [ ] Pendente
- [~] Em andamento
- [x] Concluído
- 🔴 Bloqueador
- 🟡 Dependência
- 🟢 Independente

---

## 📦 SPRINT 0 — Fundação e Setup (Estimativa: 1–2 dias)

### S0.1 — Estrutura do Projeto
- [ ] 🟢 Criar estrutura de diretórios do projeto
  ```
  copa2026/
  ├── backend/
  │   ├── app/
  │   │   ├── routes/
  │   │   ├── models/
  │   │   └── services/
  │   ├── db/
  │   │   ├── migrations/
  │   │   └── seeds/
  │   └── main.py (ou index.js)
  ├── frontend/
  │   ├── public/
  │   ├── src/
  │   │   ├── components/
  │   │   ├── pages/
  │   │   └── assets/
  │   └── index.html
  ├── claude.md
  ├── prd.md
  └── tasks.md
  ```
- [ ] 🟢 Inicializar projeto (package.json / pyproject.toml)
- [ ] 🟢 Configurar linting e formatação (ESLint/Prettier ou Black/Ruff)
- [ ] 🟢 Criar `.gitignore` adequado
- [ ] 🟢 README.md com instruções de setup

### S0.2 — Banco de Dados SQLite
- [ ] 🟢 Criar migration `001_create_tables.sql` com todas as tabelas
- [ ] 🟢 Criar script de inicialização do banco `db/init.py` (ou `init.js`)
- [ ] 🟢 Criar seed `seeds/selecoes.sql` — todas as 48 seleções com grupos, potes e cabeças de chave
- [ ] 🟢 Criar seed `seeds/jogos_fase_grupos.sql` — 48 jogos com datas, horários e estádios
- [ ] 🟢 Criar seed `seeds/jogadores_brasil.sql` — elenco completo da Seleção Brasileira (23 jogadores)
- [ ] 🟢 Criar seed `seeds/jogadores_outros.sql` — elencos simplificados das demais 47 seleções
- [ ] 🟢 Script `npm run db:reset` / `make db-reset` para recriar banco do zero
- [ ] 🟢 Script `npm run db:seed` para popular dados
- [ ] 🟢 Verificar integridade referencial (foreign keys ativas no SQLite)

### S0.3 — Backend Base
- [ ] 🟢 Setup do servidor (FastAPI com uvicorn / Express)
- [ ] 🟢 Configurar CORS para desenvolvimento local
- [ ] 🟢 Middleware de logging de requests
- [ ] 🟢 Rota de health check: `GET /api/health`
- [ ] 🟢 Tratamento global de erros (404, 500)
- [ ] 🟢 Variáveis de ambiente (.env): `DB_PATH`, `PORT`, `ADMIN_PASSWORD`

### S0.4 — Frontend Base
- [ ] 🟢 Setup React + Vite (ou HTML/CSS/JS simples)
- [ ] 🟢 Instalar Tailwind CSS + configurar tema personalizado (cores verde/amarelo/azul do Brasil)
- [ ] 🟢 Criar sistema de roteamento (React Router ou páginas HTML separadas)
- [ ] 🟢 Criar componentes base: `Header`, `Footer`, `Layout`, `Loader`, `ErrorBoundary`
- [ ] 🟢 Importar fontes: uma display moderna + corpo legível
- [ ] 🟢 Definir design tokens (CSS variables): cores, espaçamentos, sombras

---

## 🏠 SPRINT 1 — Landing Page (Estimativa: 2–3 dias)

### S1.1 — Hero Section
- [ ] 🟢 Criar componente `HeroSection`
- [ ] 🟢 Background visual temático Copa 2026 (gradiente, textura ou imagem)
- [ ] 🟢 Logo/título do app
- [ ] 🟢 Tagline e chamada para ação

### S1.2 — Countdown Regressivo
- [ ] 🟢 Criar componente `Countdown`
- [ ] 🟢 Data alvo: 11/06/2026 às 17h00 (horário de Brasília, GMT-3)
- [ ] 🟢 Exibir: DIAS / HORAS / MINUTOS / SEGUNDOS com animação de flip ou pulse
- [ ] 🟢 `setInterval` atualizando a cada 1 segundo
- [ ] 🟢 Mensagem pós-Copa: "A Copa começou!" quando countdown zera
- [ ] 🟢 Responsivo: layout empilhado em mobile

### S1.3 — Próximos Jogos (widget)
- [ ] 🟡 (depende S0.2) Criar API: `GET /api/jogos?limit=5&status=agendado`
- [ ] 🟢 Componente `ProximosJogos` com scroll horizontal em mobile
- [ ] 🟢 Card de jogo: bandeiras, horário (brasília), estádio

### S1.4 — Últimos Resultados (widget)
- [ ] 🟡 Criar API: `GET /api/jogos?status=encerrado&limit=5`
- [ ] 🟢 Componente `UltimosResultados` com placar final

### S1.5 — Stats da Copa
- [ ] 🟢 Seção com cards estáticos: 48 seleções, 104 jogos, 16 cidades, 3 países-sede
- [ ] 🟢 Animação de count-up nos números ao entrar na viewport

### S1.6 — Navegação Principal
- [ ] 🟢 Navbar fixa com links: Tabela | Grupos | Elencos | Brasil | Bolão
- [ ] 🟢 Menu hamburger mobile
- [ ] 🟢 Indicador de página ativa

---

## 📅 SPRINT 2 — Tabela de Jogos (Estimativa: 3 dias)

### S2.1 — API de Jogos
- [ ] 🟡 `GET /api/jogos` — lista paginada com filtros:
  - `?fase=grupos|oitavas|quartas|semi|terceiro|final`
  - `?grupo=A|B|...|L`
  - `?selecao_id=:id`
  - `?data=YYYY-MM-DD`
  - `?status=agendado|em_andamento|encerrado`
- [ ] 🟡 `GET /api/jogos/:id` — detalhe de um jogo
- [ ] 🟡 `PATCH /api/admin/jogos/:id` — atualizar placar (autenticado)

### S2.2 — Componente de Tabela
- [ ] 🟡 Página `TabelaPage`
- [ ] 🟢 Barra de filtros: fase, grupo, data, seleção
- [ ] 🟢 Agrupamento visual por data (ex: "Terça, 11 de junho")
- [ ] 🟡 Componente `JogoCard`:
  - Bandeiras e nomes das seleções
  - Horário (brasília)
  - Placar (ou "-" se não iniciado)
  - Estádio e cidade
  - Badge de status (Agendado / Ao vivo / Encerrado)
  - Fase e grupo
- [ ] 🟢 Loading skeleton durante fetch
- [ ] 🟢 Estado vazio: "Nenhum jogo encontrado para esse filtro"

### S2.3 — Detalhes do Jogo
- [ ] 🟡 Modal/página de detalhe do jogo
- [ ] 🟢 Informações completas: data, horário, sede, árbitro (se disponível)
- [ ] 🟢 Mini-tabela do grupo ao qual pertence o jogo

---

## 🏆 SPRINT 3 — Classificação e Grupos (Estimativa: 3 dias)

### S3.1 — API de Grupos e Classificação
- [ ] 🟡 `GET /api/grupos` — lista de todos os grupos com seleções
- [ ] 🟡 `GET /api/grupos/:letra` — detalhe de um grupo com classificação calculada
- [ ] 🟡 `GET /api/classificacao` — classificação de todos os grupos
- [ ] 🟢 Serviço de cálculo de classificação: aplica pontuação + regras de desempate FIFA

### S3.2 — Visualização de Grupos
- [ ] 🟡 Página `GruposPage`
- [ ] 🟢 Grid de 12 grupos (A–L) em 3 ou 4 colunas
- [ ] 🟡 Componente `TabelaGrupo`:
  - Header com nome do grupo e bandeira da cabeça de chave
  - Linhas: posição, bandeira, seleção, J, V, E, D, GP, GC, SG, Pts
  - Cores: verde (top 2), amarelo (3º em disputa), vermelho (eliminado)
  - Badge "Cabeça de Chave" na seleção do Pote 1
- [ ] 🟢 Tab/filtro para ver grupo específico em tela cheia
- [ ] 🟡 Jogos do grupo abaixo da tabela (rodadas 1, 2, 3)

### S3.3 — Seção de Potes
- [ ] 🟢 Componente `PotesSection`
- [ ] 🟢 4 potes com bandeiras e nomes de todas as 48 seleções
- [ ] 🟢 Destaque visual para cabeças de chave (Pote 1)

---

## 🌍 SPRINT 4 — Elencos das Seleções (Estimativa: 3–4 dias)

### S4.1 — API de Seleções e Jogadores
- [ ] 🟡 `GET /api/selecoes` — lista de todas as 48 seleções
- [ ] 🟡 `GET /api/selecoes/:id` — dados da seleção
- [ ] 🟡 `GET /api/selecoes/:id/jogadores` — elenco completo com filtro por posição
- [ ] 🟡 `GET /api/selecoes/:id/jogos` — jogos da seleção na Copa

### S4.2 — Página de Seleções
- [ ] 🟡 Página `ElencoPage`
- [ ] 🟢 Search bar para buscar seleção por nome
- [ ] 🟢 Grid de seleções com bandeira e nome (filtro por grupo/confederação)
- [ ] 🟡 Componente `PerfilSelecao`:
  - Banner com bandeira grande
  - Treinador, confederação, ranking FIFA
  - Grupo e pote
  - Resultados na Copa (atualizado)
- [ ] 🟡 Componente `TabelaElenco`:
  - Colunas: #, Nome, Posição, Clube, Idade
  - Filtros por posição
  - Ícone de capitão
- [ ] 🟢 Navegação entre seleções (anterior / próxima)

---

## 🇧🇷 SPRINT 5 — Escalação da Seleção Brasileira (Estimativa: 4–5 dias)

### S5.1 — API de Escalação
- [ ] 🟡 `GET /api/escalacoes` — listar escalações salvas
- [ ] 🟡 `POST /api/escalacoes` — salvar nova escalação
- [ ] 🟡 `PUT /api/escalacoes/:id` — atualizar escalação
- [ ] 🟡 `DELETE /api/escalacoes/:id` — remover escalação

### S5.2 — Campo de Futebol Interativo
- [ ] 🟢 Componente `CampoFutebol` (SVG ou Canvas)
- [ ] 🟢 Campo com gramado, linhas, área, círculo central
- [ ] 🟢 Slots de posição baseados na formação selecionada
- [ ] 🟢 Cada slot mostra: avatar/emoji, número e nome do jogador alocado
- [ ] 🟢 Slot vazio: círculo pulsante indicando que precisa ser preenchido

### S5.3 — Seletor de Formação
- [ ] 🟢 Dropdown com formações: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2, 4-1-4-1, 3-4-3
- [ ] 🟢 Ao mudar formação: repositicionar slots no campo, manter jogadores alocados quando possível

### S5.4 — Lista de Convocados
- [ ] 🟡 Painel lateral com 23 convocados
- [ ] 🟢 Filtro por posição (GK, DEF, MEI, ATA)
- [ ] 🟢 Jogador já alocado aparece destacado (marcado)
- [ ] 🟢 Arrastar jogador para o slot (drag & drop via HTML5 API)
- [ ] 🟢 Clique em slot vazio abre modal de seleção (fallback mobile)

### S5.5 — Reservas e Banco
- [ ] 🟢 Área de banco de reservas (12 jogadores)
- [ ] 🟢 Jogadores não titulares aparecem no banco automaticamente
- [ ] 🟢 Troca fácil: clicar em jogador no banco + clicar em titular

### S5.6 — Salvar e Compartilhar
- [ ] 🟡 Botão "Salvar Escalação" com nome personalizado
- [ ] 🟡 Persistência no SQLite via API
- [ ] 🟢 Lista de escalações salvas (max 10)
- [ ] 🟢 Botão "Exportar como imagem" (html2canvas)
- [ ] 🟢 Validação: alerta se campo incompleto (faltam titulares)

---

## 🎯 SPRINT 6 — Bolão e Simulador de Chaveamento (Estimativa: 5–6 dias)

### S6.1 — API de Bolão
- [ ] 🟡 `GET /api/boloes` — listar bolões da sessão
- [ ] 🟡 `POST /api/boloes` — criar bolão
- [ ] 🟡 `GET /api/boloes/:id/palpites` — palpites de um bolão
- [ ] 🟡 `POST /api/boloes/:id/palpites` — salvar/atualizar palpite
- [ ] 🟡 `GET /api/boloes/:id/chaveamento` — chaveamento calculado com base nos palpites
- [ ] 🟡 `DELETE /api/boloes/:id` — remover bolão

### S6.2 — Simulador de Fase de Grupos
- [ ] 🟡 Página `BolaoPage`
- [ ] 🟢 Wizard em abas: "Grupos" → "Oitavas" → "Quartas" → "Semis" → "Final"
- [ ] 🟡 Para cada jogo da fase de grupos:
  - Bandeiras e nomes das seleções
  - Input de placar (0–20, steppers +/-)
  - Botão de empate rápido
- [ ] 🟡 Classificação em tempo real ao lado (atualiza conforme palpites)
- [ ] 🟡 Serviço de cálculo: `calcularClassificacaoGrupos(palpites)` → classificados
- [ ] 🟡 Seleção dos 8 melhores terceiros (automático ou manual em caso de empate de critérios)

### S6.3 — Chaveamento Visual (Bracket)
- [ ] 🟡 Componente `Chaveamento` (bracket tree)
- [ ] 🟢 Visual de chave estilo mata-mata: oitavas → quartas → semi → final
- [ ] 🟢 Cada confronto: logo/bandeira das seleções, placar, vencedor
- [ ] 🟢 Destaque visual para o campeão (estrela, confete)
- [ ] 🟡 Ao definir palpite em um jogo: vencedor avança automaticamente para próxima fase
- [ ] 🟢 Toggle "Prorrogação" e "Pênaltis" em cada confronto de mata-mata
- [ ] 🟢 Input de placar nos pênaltis (ex: 4 × 3)
- [ ] 🟢 Chaveamento navegável em mobile (scroll horizontal)

### S6.4 — Gestão de Múltiplos Bolões
- [ ] 🟡 Sidebar ou dropdown para alternar entre bolões
- [ ] 🟢 Criar novo bolão: modal com nome personalizado
- [ ] 🟢 Duplicar bolão existente
- [ ] 🟡 Comparação: resultado do bolão vs. resultado real (quando disponível)
- [ ] 🟢 Percentual de acertos ao lado de cada palpite

### S6.5 — Progresso e Persistência
- [ ] 🟡 Barra de progresso: "X de 48 palpites preenchidos"
- [ ] 🟡 Auto-save a cada mudança de placar (debounce 800ms)
- [ ] 🟢 Indicador "Salvo" / "Salvando..."

---

## ⚙️ SPRINT 7 — Painel Admin e Polimento (Estimativa: 2–3 dias)

### S7.1 — Painel Administrativo
- [ ] 🟢 Rota protegida `/admin` com senha simples
- [ ] 🟡 Lista de jogos com status e placar atuais
- [ ] 🟡 Formulário para atualizar placar de jogo
- [ ] 🟡 Toggle de status: Agendado → Em andamento → Encerrado
- [ ] 🟡 Atualização de elencos (adicionar/remover jogadores)

### S7.2 — Melhorias de UX
- [ ] 🟢 Toasts de feedback em todas as ações (salvar, erro, sucesso)
- [ ] 🟢 Skeleton loaders em todas as listas
- [ ] 🟢 Tratamento de erro de rede (retry automático)
- [ ] 🟢 Modo escuro / claro (toggle)
- [ ] 🟢 Animações de transição entre páginas
- [ ] 🟢 Scroll to top ao navegar

### S7.3 — SEO e Performance
- [ ] 🟢 Meta tags (title, description, og:image por página)
- [ ] 🟢 Favicon temático Copa 2026
- [ ] 🟢 Lazy loading de imagens/bandeiras
- [ ] 🟢 Compressão de assets

---

## 🧪 SPRINT 8 — Testes e Deploy (Estimativa: 2 dias)

### S8.1 — Testes
- [ ] 🟢 Testar todos os 12 grupos com classificação manual
- [ ] 🟢 Testar simulação completa de bolão (grupos → final)
- [ ] 🟢 Testar escalação com todas as 7 formações
- [ ] 🟢 Testar em mobile (iOS Safari, Chrome Android)
- [ ] 🟢 Testar countdown nos últimos segundos

### S8.2 — Deploy
- [ ] 🟢 Build de produção do frontend
- [ ] 🟢 Configurar servidor (local ou VPS)
- [ ] 🟢 Backup automático do SQLite (script cron)
- [ ] 🟢 Variáveis de ambiente de produção
- [ ] 🟢 Documentação de deploy no README

---

## 📊 Backlog (Futuras Versões)

- [ ] Notificações push para início de jogos (PWA)
- [ ] Tabela histórica de Copas do Mundo anteriores
- [ ] Estatísticas de goleadores e artilheiros
- [ ] Integração com API de odds
- [ ] Sistema de comentários por jogo
- [ ] Login com Google para salvar bolão na nuvem
- [ ] Visualização do caminho de cada seleção até a final

---

## 🗓️ Cronograma Sugerido

| Sprint | Conteúdo | Duração | Início |
|--------|----------|---------|--------|
| 0 | Fundação + DB | 2 dias | Dia 1 |
| 1 | Landing Page | 3 dias | Dia 3 |
| 2 | Tabela de Jogos | 3 dias | Dia 6 |
| 3 | Grupos e Classificação | 3 dias | Dia 9 |
| 4 | Elencos | 3 dias | Dia 12 |
| 5 | Escalação Brasil | 4 dias | Dia 15 |
| 6 | Bolão + Chaveamento | 5 dias | Dia 19 |
| 7 | Admin + Polimento | 3 dias | Dia 24 |
| 8 | Testes + Deploy | 2 dias | Dia 27 |
| **Total** | | **~29 dias** | |

---

## 🔑 Dependências Críticas

```
S0.2 (Banco) → [S2.1, S3.1, S4.1, S5.1, S6.1]  ← BLOQUEADOR PRINCIPAL
S2.1 (API Jogos) → S1.3, S1.4, S2.2
S3.1 (API Grupos) → S3.2, S6.2
S4.1 (API Seleções) → S4.2, S5.4
S5.1 (API Escalação) → S5.6
S6.1 (API Bolão) → S6.2, S6.3, S6.4
```
