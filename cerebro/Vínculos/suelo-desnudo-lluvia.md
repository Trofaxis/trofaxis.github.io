---
id: suelo-desnudo-lluvia
estado: criterio propio
validado_por: 
validado_fecha: 
tipo: vínculo
---

# Meses con suelo desnudo + Meses de lluvia fuerte → Riesgo de Suelo

## Evidencia

<!-- Una línea por fuente: - postura | [[clave de la fuente]] | página, tabla o sección | nota.
     postura: a favor, en contra o menciona. «con fuente» exige al menos una «a favor» con página. -->

## Del código (no editar aquí)

- **Variables:** [[suelo.desnudoMeses|Meses con suelo desnudo]] + [[clima.mesesLluvia|Meses de lluvia fuerte]] → [[riesgo.suelo|Riesgo de Suelo]] (sube)
- **Mecanismo:** Sin cobertura, la lluvia golpea el suelo y lo erosiona.
- **Dónde actúa:** `src/modules/suelo.js`, variable `sueloDesnudoLluvia` de la rúbrica (peso 35)
