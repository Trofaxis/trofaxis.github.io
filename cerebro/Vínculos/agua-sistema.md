---
id: agua-sistema
estado: criterio propio
validado_por: 
validado_fecha: 
tipo: vínculo
---

# Eficiencia de aplicación del sistema de riego → Riesgo de Agua

## Evidencia

<!-- Una línea por fuente: - postura | [[clave de la fuente]] | página, tabla o sección | nota.
     postura: a favor, en contra o menciona. «con fuente» exige al menos una «a favor» con página. -->
- a favor | [[fao-tm4]] | Tabla 8 | Pasar la eficiencia a 0, 50 y 100 puntos es criterio propio.

## Del código (no editar aquí)

- **Variables:** [[riego.sistema|Eficiencia de aplicación del sistema de riego]] → [[riesgo.agua|Riesgo de Agua]] (baja)
- **Mecanismo:** Con más eficiencia de aplicación se pierde menos del agua aplicada: goteo 90 %, aspersión 75 %, superficie 60 %.
- **Dónde actúa:** `src/modules/agua.js`, variable `sistema` de la rúbrica (peso 25)
