# Cerebro de Trofaxis

Esta carpeta es una bóveda de Obsidian. Ábrela con «Abrir carpeta como bóveda».

**Qué se edita aquí y entra a la app**
- En cada nota de `Vínculos/`: la propiedad `estado` (con fuente, criterio propio o por validar), `validado_por`,
  `validado_fecha` y la lista bajo «## Evidencia».
- Fuentes nuevas: una nota en `Fuentes/` con `origen: bóveda`, `cita` y `acceso` (enlace, handle o dónde está el documento).

**Reglas (las revisan las pruebas)**
- Nada sin fuente se marca «con fuente». «con fuente» exige al menos una evidencia «a favor» con página, tabla o sección.
- Una evidencia «a favor» sin página queda como «por completar» y aparece en la lista de pendientes.
- No se inventan citas: toda evidencia enlaza una nota de `Fuentes/`.
- «por validar» no puede tener evidencia «a favor»: si la hay, es «con fuente» o «criterio propio».

**Después de editar**
1. `npm run cerebro` (reescribe lo que viene del código y genera `src/cerebro/boveda.js`).
2. `npm test`.
3. PR. Diego revisa y une.
