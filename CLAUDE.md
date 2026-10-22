# Trofaxis (antes BioG.A.P.) — instrucciones para Claude Code

App de riesgo ambiental de fincas para exportadores GLOBALG.A.P. IFA v6.
Proyecto CADS (Zamorano). Dueño: Diego Guevara.

## Flujo de trabajo (obligatorio)
1. Primero revisa `git status` y `git log origin/main..HEAD --oneline`. Si hay cambios o commits sin subir, detente y avísale a Diego. No los borres ni los mezcles.
2. Solo con todo limpio: `git checkout main && git pull`.
3. Crea una rama nueva con nombre descriptivo que no exista todavía (revisa con `git branch -a`). Nunca hagas commit ni push a `main`.
4. Corre `npm test` antes y después de cada cambio. Todas las pruebas deben pasar.
5. Al terminar: push de la rama y un resumen corto de qué cambió y cuántas pruebas pasan.
   La unión a `main` la hace Diego (o Claude en el chat) después de revisar.

## Identidad de commits
`Diego Guevara <335656306+diegoguevara912-pixel@users.noreply.github.com>`
Nunca uses ni escribas el correo personal de Diego en el repo.

## Datos y referencias
- No inventes datos ni referencias. Si un valor no tiene fuente, márcalo como "criterio propio".
- Todo caso ficticio de la memoria de casos lleva `origen: 'ejemplo'` y se muestra como "Ejemplo".
- Datos de Anner Almendárez: publicación autorizada, pero nunca con coordenadas.
- Una variable no debe afectar a otra sin fundamento.
- La rúbrica de agua v0.2 no se programa hasta que la valide el ingeniero de riego.

## Técnica
- JavaScript con módulos ES, sin dependencias en tiempo de ejecución. Se programa y se prueba sin compilar.
- Al publicar, GitHub Actions corre `npm run build` (esbuild, versión fija, solo para publicar) y sube `dist/` a GitHub Pages. Decisión de Diego del 2026-10-22; ver `docs/build.md`. No agregar otras dependencias sin pedírselo.
- No usar SheetJS 0.18.5 (CVE-2023-30533, CVE-2024-22363). Existe un lector .xlsx propio.
- Umbrales y pesos van en `src/core/config.js`, no dentro de las fórmulas.
- Ver la app en local: `npx --yes http-server -p 8000`. La copia publicada: `npm ci && npm run build` y `npx --yes http-server dist -p 8001`.

## Estilo
Responde en español, corto y técnico. Si una petición tiene un error o un riesgo, dilo claramente.
