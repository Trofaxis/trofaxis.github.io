---
id: poli-hq
estado: con fuente
validado_por: 
validado_fecha: 
tipo: vínculo
---

# Cociente de peligro (HQ) del producto para abejas + Floración visitada por polinizadores → Riesgo de Polinizadores

## Evidencia

<!-- Una línea por fuente: - postura | [[clave de la fuente]] | página, tabla o sección | nota.
     postura: a favor, en contra o menciona. «con fuente» exige al menos una «a favor» con página. -->
- a favor | [[plag-fao]] | página «Risks for bees» del Toolkit | Umbrales de 42 y 85.
- a favor | [[plag-ppdb]] | ficha de cada ingrediente activo | DL50 de cada ingrediente.
- a favor | [[plag-arena]] | por completar | Margen ×10 para abejas sin aguijón: derivación, no norma.

## Del código (no editar aquí)

- **Variables:** [[plag.hq|Cociente de peligro (HQ) del producto para abejas]] + [[poli.floracionVisitada|Floración visitada por polinizadores]] → [[riesgo.poli|Riesgo de Polinizadores]] (sube)
- **Mecanismo:** HQ = dosis ÷ DL50 por contacto: si supera el umbral, la dosis aplicada en floración puede matar abejas por contacto.
- **Dónde actúa:** `src/modules/polinizadores.js`, variable `claseEnFloracion` de la rúbrica (peso 15)
