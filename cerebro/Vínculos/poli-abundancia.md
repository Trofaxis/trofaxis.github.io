---
id: poli-abundancia
estado: por validar
validado_por: 
validado_fecha: 
tipo: vínculo
---

# Abundancia de la especie de riesgo (volumen de copa) → Riesgo de Polinizadores

## Evidencia

<!-- Una línea por fuente: - postura | [[clave de la fuente]] | página, tabla o sección | nota.
     postura: a favor, en contra o menciona. «con fuente» exige al menos una «a favor» con página. -->
- menciona | [[osorio]] | pág. 27 | Espera más floración con más volumen de copa, sin medirlo.
- menciona | [[kuniyoshi]] | Resultados, Figura 10 (pág. 32–33) | Midió flores visibles en copas cercanas, no volumen de copa: pendiente 0,077 y R² = 0,2147, con Spearman no significativa (p > 0,05). La autora dice que no se puede afirmar una asociación consistente. Cita a Tejeda et al. (2025) con una relación más fuerte usando flores caídas.

## Del código (no editar aquí)

- **Variables:** [[poli.abundanciaRiesgo|Abundancia de la especie de riesgo (volumen de copa)]] → [[riesgo.poli|Riesgo de Polinizadores]] (sube)
- **Mecanismo:** Más volumen de copa daría más flores de la especie de riesgo y, con ellas, más abejas muertas bajo los árboles.
- **Contexto:** Spathodea campanulata en el campus de Zamorano
- **Dónde actúa:** `src/modules/polinizadores.js`, variable `abundanciaRiesgo` de la rúbrica (peso 15)
- **Nota:** Hipótesis que ya suma al puntaje. Para validarla hay que contar flores y abejas muertas por árbol junto con su volumen de copa (Osorio, Ec. 3).
