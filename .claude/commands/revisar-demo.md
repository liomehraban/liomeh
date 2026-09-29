---
description: Ejecuta el guion de demo completo y reporta fallas
---

# Revisar demo

1. Lee `docs/06_demo.md`.
2. Corre `pnpm build`. Si existe `tests/e2e/demo.spec.ts`, corre `pnpm e2e`; si no, recorre el guion con Playwright manualmente a 390×844 y toma screenshots de cada paso en `tests/e2e/screens/`.
3. Revisa además: consola sin errores, textos sin claves de i18n sin traducir, ningún string en inglés con locale `es` (ni viceversa), contraste y áreas táctiles.
4. Reporta una tabla: paso · estado (OK/Falla) · evidencia · arreglo propuesto. Pregunta antes de arreglar si la corrección toca más de 3 archivos.
