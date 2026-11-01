---
id: fert-lluvia
estado: criterio propio
validado_por: 
validado_fecha: 
tipo: vínculo
---

# Meses en que se fertiliza + Meses de lluvia fuerte → Riesgo de Fertilización

## Evidencia

<!-- Una línea por fuente: - postura | [[clave de la fuente]] | página, tabla o sección | nota.
     postura: a favor, en contra o menciona. «con fuente» exige al menos una «a favor» con página. -->

## Del código (no editar aquí)

- **Variables:** [[fert.meses|Meses en que se fertiliza]] + [[clima.mesesLluvia|Meses de lluvia fuerte]] → [[riesgo.fert|Riesgo de Fertilización]] (sube)
- **Mecanismo:** La lluvia fuerte arrastra por escorrentía el fertilizante recién aplicado, antes de que el cultivo lo absorba.
- **Dónde actúa:** `src/modules/fertilizacion.js`, variable `lluvia` de la rúbrica (peso 20)
