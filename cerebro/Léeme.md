# Cerebro de Trofaxis

Esta carpeta es una bóveda de Obsidian. Ábrela con «Abrir carpeta como bóveda».

**Qué se edita aquí y entra a la app**
- En cada nota de `Vínculos/`: la propiedad `estado` (con fuente, criterio propio o por validar), `validado_por`,
  `validado_fecha` y la lista bajo «## Evidencia».
- Fuentes nuevas: una nota en `Fuentes/` con `origen: bóveda`, `cita` y `acceso` (enlace, handle o dónde está el documento).
- Tesis: una nota en `Tesis/` por tesis, con relaciones, umbrales, fórmulas y datos. Cada línea termina con
  `pág. N | "frase textual"` y solo entra si la frase está en esa página del PDF (`Tesis/_verificacion.json`).
  Una tesis sirve como fuente de un vínculo con `[[clave]]`. `Tesis/_Resumen.md` junta lo que dicen todas.

**Reglas (las revisan las pruebas)**
- Nada sin fuente se marca «con fuente». «con fuente» exige al menos una evidencia «a favor» con página, tabla o sección.
- Una evidencia «a favor» sin página queda como «por completar» y aparece en la lista de pendientes.
- No se inventan citas: toda evidencia enlaza una nota de `Fuentes/`.
- «por validar» no puede tener evidencia «a favor»: si la hay, es «con fuente» o «criterio propio».
- Una evidencia que cita una tesis debe decir `pág. N` de una página donde la tesis tiene una frase verificada.

**Después de editar**
1. `node scripts/cerebro.mjs` (reescribe lo que viene del código, genera `src/cerebro/boveda.js` y actualiza `CACHE_NAME` de `sw.js`).
   Si cambiaste una tesis: `node scripts/cerebro.mjs --verificar <carpeta con los textos de las tesis>`.
2. `npm test`.
3. PR. Diego revisa y une.
