# Pack Claude Code · Bara Bara (Mercados Públicos CDMX)

Pack de arranque para que **Claude Code** programe la PWA de Bara Bara: Next.js con datos mock, lista para Supabase y con deploy en Vercel.

## Qué trae

| Ruta | Contenido |
|---|---|
| `CLAUDE.md` | Memoria del proyecto: stack, reglas y convenciones. Claude Code la lee sola |
| `PLAN.md` | 9 fases con checklist |
| `.claude/commands/` | `/fase-0` … `/fase-8` y `/revisar-demo` |
| `docs/` | Producto, arquitectura, datos, diseño, módulos con criterios de aceptación, guion de demo y modelo de negocio |
| `data/` | 10 JSON + CSV con datos reales de la Guía de Mercados CDMX 2026 y datos simulados |
| `src/lib/` | `schemas.ts` (zod), `routing.ts` (ruteo del interior) y `horario.ts` («abierto ahora»), ya probados |
| `scripts/validate-data.ts` | Valida esquemas y referencias cruzadas |
| `tests/unit/` | 19 tests pasando (ruteo y horarios) |
| `supabase/migrations/0001_init.sql` | Esquema futuro con PostGIS (probado en Postgres 16) |
| `.env.example` | Variables de entorno |

## Cómo usarlo

```bash
mkdir pasele && cd pasele && git init
# descomprime aquí el contenido de pack_claude_code (incluida la carpeta oculta .claude/)
claude
```

En Claude Code, corre las fases en orden y revisa cada una antes de pasar a la siguiente:

```
/fase-0
/fase-1
...
/fase-8
/revisar-demo
```

**Tips**

- Revisa `pnpm dev` después de cada fase. Si algo no te gusta, díselo en el mismo chat antes de seguir.
- Para el asistente con IA real, pon `ANTHROPIC_API_KEY` y `ANTHROPIC_MODEL` en `.env.local`. Sin ellas funciona con respuestas guionadas.
- **Deploy:** `vercel link` y luego `vercel` (preview) o `vercel --prod`. Configura las variables de `.env.example` en Vercel.
