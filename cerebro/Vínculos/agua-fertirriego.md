---
id: agua-fertirriego
estado: criterio propio
validado_por: 
validado_fecha: 
tipo: vínculo
---

# Fertirriego + Goteo que aplica más de lo que el suelo infiltra → Riesgo de Agua

## Evidencia

<!-- Una línea por fuente: - postura | [[clave de la fuente]] | página, tabla o sección | nota.
     postura: a favor, en contra o menciona. «con fuente» exige al menos una «a favor» con página. -->
- menciona | [[vargas-2008]] | pág. 4 | El resumen afirma que la uniformidad del riego influye en la aplicación de fertilizantes; no lo midió. Umbrales de CU y UD en pág. 11 y 14.

## Del código (no editar aquí)

- **Variables:** [[fert.fertirriego|Fertirriego]] + [[riego.escorrentia|Goteo que aplica más de lo que el suelo infiltra]] → [[riesgo.agua|Riesgo de Agua]] (sube)
- **Mecanismo:** En fertirriego el fertilizante va disuelto en el agua: si el goteo aplica más de lo que el suelo infiltra, el agua escurre y se lo lleva.
- **Dónde actúa:** `src/modules/agua.js`, variable `fertirriegoEscorrentia` de la rúbrica (peso 10)
