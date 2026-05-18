# Agenci Claude Code — Inteligentny System Rezerwacji Stolików Restauracyjnych

Katalog zawiera definicje agentów dla projektu **Inteligentny System Rezerwacji Stolików Restauracyjnych** pracujących w modelu **Agents Teams Pipeline**.

## Agenci fazowi (pipeline)

- `planner.md`
- `domain-analyst.md`
- `architect.md`
- `implementer.md`
- `code-reviewer.md`
- `tester.md`

## Agenci domenowi (używani wewnętrznie przez Implementera)

- `backend-dev.md`
- `frontend-dev.md`
- `devops.md`

## Jak używać

Uruchom Claude Code w katalogu projektu:

```bash
claude
```

Claude odczyta `CLAUDE.md` z korzenia repozytorium i poprowadzi Cię przez Agents Teams Pipeline.

## Pipeline (skrót)

```
gh issue list
  → planner → domain-analyst → architect
  → implementer (deleguje do: backend-dev / frontend-dev / devops)
  → code-reviewer → tester
  → gh pr create
```

Szczegółowy workflow i diagram Mermaid znajdują się w `CLAUDE.md` w korzeniu repozytorium.
