# PRD — Correções com Dados Reais da Copa 2026
**Documento de patch — substitua os blocos correspondentes no `prd.md` original**
Fonte: FIFA.com (sorteio 05/12/2025 + repescagens mar/2026), confirmado jun/2026

> Como usar: cada seção abaixo corresponde a uma seção do PRD original.
> Localize o trecho equivalente no seu `prd.md` e substitua pelo texto aqui.
> Os blocos marcam claramente o que mudou e por quê.

---

## ▶ SUBSTITUIR — Seção 1.2 (Contexto do Torneio)

### 1.2 Contexto do Torneio
- **Edição:** 23ª Copa do Mundo FIFA
- **Formato:** 48 seleções, 12 grupos de 4 equipes
- **Fase de grupos:** Top 2 de cada grupo + 8 melhores terceiros classificados avançam (32 times)
- **Mata-mata:** Começa na **Rodada de 32** (32 avos de final) — primeira vez na história
- **Total de jogos:** 104 partidas
- **Abertura:** 11 de junho de 2026, às 16h (horário de Brasília) — Estádio Azteca, Cidade do México (México vs. África do Sul)
- **Estreia do Brasil:** 13 de junho de 2026, às 19h (Brasília) — MetLife Stadium, Nova York/NJ (Brasil vs. Marrocos)
- **3º lugar:** 18 de julho de 2026 — Hard Rock Stadium, Miami
- **Final:** 19 de julho de 2026 — MetLife Stadium, Nova York/Nova Jersey

> ⚠️ MUDANÇAS vs. versão anterior:
> - Horário da abertura corrigido: **16h**, não 17h.
> - Adicionada a fase **Rodada de 32** (o documento antigo pulava direto pras oitavas).
> - Confirmada estreia do Brasil (Grupo C, não G).

---

## ▶ SUBSTITUIR — Seção 2 INTEIRA (Grupos da Copa)

## 2. Grupos da Copa do Mundo 2026

### Pote 1 — Cabeças de Chave
| Posição | Seleção | Grupo |
|---------|---------|-------|
| 1 | México (sede) | A |
| 2 | Canadá (sede) | B |
| 3 | Brasil | C |
| 4 | EUA (sede) | D |
| 5 | Alemanha | E |
| 6 | Holanda | F |
| 7 | Bélgica | G |
| 8 | Espanha | H |
| 9 | França | I |
| 10 | Argentina | J |
| 11 | Portugal | K |
| 12 | Inglaterra | L |

### Grupos Completos (composição final confirmada)
| Grupo | Cabeça de Chave | Seleção 2 | Seleção 3 | Seleção 4 |
|-------|----------------|-----------|-----------|-----------|
| A | México | Coreia do Sul | República Tcheca | África do Sul |
| B | Canadá | Suíça | Catar | Bósnia e Herzegovina |
| C | **Brasil** | Marrocos | Escócia | Haiti |
| D | EUA | Austrália | Paraguai | Turquia |
| E | Alemanha | Equador | Costa do Marfim | Curaçao |
| F | Holanda | Japão | Suécia | Tunísia |
| G | Bélgica | Egito | Irã | Nova Zelândia |
| H | Espanha | Uruguai | Cabo Verde | Arábia Saudita |
| I | França | Noruega | Senegal | Iraque |
| J | Argentina | Argélia | Áustria | Jordânia |
| K | Portugal | Colômbia | Uzbequistão | RD Congo |
| L | Inglaterra | Croácia | Gana | Panamá |

> ⚠️ MUDANÇAS vs. versão anterior (a tabela antiga estava com dados de rascunho):
> - **Brasil** estava no Grupo G → na verdade é **Grupo C** (com Marrocos, Escócia, Haiti).
> - **Colômbia** aparecia duplicada (G e J) → está só no **Grupo K**.
> - Cabeças de chave reposicionados: Argentina (J), Portugal (K), Bélgica (G), Inglaterra (L), Espanha (H), França (I).
> - Vagas que estavam "a definir" resolvidas pelas repescagens de março:
>   Grupo A → República Tcheca | Grupo B → Bósnia | Grupo D → Turquia |
>   Grupo F → Suécia | Grupo I → Iraque | Grupo K → RD Congo.
> - Composições dos grupos G, H, J, L também ajustadas aos confrontos reais.

---

## ▶ SUBSTITUIR — Seção 6 (Fases do Torneio)

## 6. Fases do Torneio

| Fase | Times | Jogos | Datas |
|------|-------|-------|-------|
| Fase de Grupos | 48 (12 grupos × 4) | 72 jogos | 11 – 27 jun |
| Rodada de 32 (32 avos) | 32 | 16 jogos | 28 jun – 3 jul |
| Oitavas de Final | 16 | 8 jogos | 4 – 7 jul |
| Quartas de Final | 8 | 4 jogos | 8 – 11 jul |
| Semifinais | 4 | 2 jogos | 14 – 15 jul |
| 3º Lugar | 2 | 1 jogo | 18 jul (Miami) |
| Final | 2 | 1 jogo | 19 jul (Nova York/NJ) |

> ⚠️ MUDANÇAS vs. versão anterior:
> - A fase de grupos tem **72 jogos** (12 grupos × 6), não 48. O número 48 do
>   documento antigo era o nº de jogos por rodada errado — são 24 por rodada × 3 = 72.
> - Adicionada a **Rodada de 32** (16 jogos) — o documento antigo começava o
>   mata-mata direto nas oitavas com "32 times", o que estava conceitualmente errado.
> - Contagem corrigida das fases seguintes (oitavas = 16 times / 8 jogos, etc.).
> - Total: 72 + 16 + 8 + 4 + 2 + 1 + 1 = 104 jogos. ✓

---

## ▶ SUBSTITUIR — RF-01 (apenas o item do Countdown)

No bloco "Funcionalidades" do RF-01, troque a linha do countdown por:

- **Countdown regressivo:** Contagem em tempo real (dias, horas, minutos, segundos) até o jogo de abertura (11 de junho de 2026, **16h** horário de Brasília — México vs. África do Sul, Estádio Azteca)

> ⚠️ MUDANÇA: horário corrigido de 17h para **16h**.
> Observação prática: a Copa **já começou** (hoje é jun/2026). O countdown
> deve detectar data passada e exibir o estado pós-início — ex: "A Copa está
> rolando!" com link pros jogos do dia. Vale tratar três estados:
> antes / durante / depois do torneio.

---

## ▶ AJUSTE MENOR — Seção 8 (Elenco do Brasil)

O elenco-referência do PRD continua **válido como exemplo**, mas é uma
convocação fictícia/projetada. Se quiser fidelidade total, a convocação
real de 23 nomes deve ser conferida na lista oficial da CBF para a Copa
(pode ter mudado em relação ao que está no documento). Para fins de estudo
do app, o elenco atual serve — a lógica de montar escalação é idêntica
independente dos nomes.

---

## ▶ AJUSTE MENOR — Seção 7 (Cidades-Sede)

A tabela de 16 estádios do PRD está **correta** e bate com a tabela oficial.
Nenhuma mudança necessária. (Toronto/BMO Field aparece com asterisco de
capacidade reduzida por configuração da Copa — isso está OK.)

---

## Resumo do que NÃO mudou (continua válido no PRD original)

- Seções 1.1, 1.3, 1.4 (descrição, público, objetivos)
- Seção 3 inteira (RF-02 a RF-07) — requisitos funcionais
- Seção 4 (requisitos não-funcionais)
- Seção 5 (modelo de dados SQLite) — o esquema continua adequado
- Seção 7 (cidades-sede)
- Seção 9 (regras de negócio) — desempate FIFA, mata-mata, bolão
- Seção 10, 11 (critérios de sucesso, fora de escopo)
