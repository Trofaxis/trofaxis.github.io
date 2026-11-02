---
id: suelo-fert-desnudo
estado: criterio propio
validado_por: 
validado_fecha: 
tipo: vínculo
---

# Meses en que se fertiliza + Meses con suelo desnudo + Meses de lluvia fuerte → Riesgo de Suelo

## Evidencia

<!-- Una línea por fuente: - postura | [[clave de la fuente]] | página, tabla o sección | nota.
     postura: a favor, en contra o menciona. «con fuente» exige al menos una «a favor» con página. -->

## Del código (no editar aquí)

- **Variables:** [[fert.meses|Meses en que se fertiliza]] + [[suelo.desnudoMeses|Meses con suelo desnudo]] + [[clima.mesesLluvia|Meses de lluvia fuerte]] → [[riesgo.suelo|Riesgo de Suelo]] (sube)
- **Mecanismo:** Sin cobertura, la lluvia erosiona el suelo y arrastra el fertilizante recién aplicado.
- **Dónde actúa:** `src/modules/suelo.js`, variable `fertSueloDesnudo` de la rúbrica (peso 15)
