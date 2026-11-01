---
id: lixiviacion-gus
estado: criterio propio
validado_por: 
validado_fecha: 
tipo: vínculo
---

# Movilidad del plaguicida en el suelo (GUS) + Plaguicida aplicado al suelo o por el riego + Meses de lluvia fuerte → Plaguicida que llega al agua subterránea

## Evidencia

<!-- Una línea por fuente: - postura | [[clave de la fuente]] | página, tabla o sección | nota.
     postura: a favor, en contra o menciona. «con fuente» exige al menos una «a favor» con página. -->
- a favor | [[plag-gus]] | por completar | Solo el potencial de lixiviación del producto. La suma con la lluvia y el umbral de lámina no están verificados.

## Del código (no editar aquí)

- **Variables:** [[plag.gus|Movilidad del plaguicida en el suelo (GUS)]] + [[plag.alSuelo|Plaguicida aplicado al suelo o por el riego]] + [[clima.mesesLluvia|Meses de lluvia fuerte]] → [[riesgo.lixiviacion|Plaguicida que llega al agua subterránea]] (sube)
- **Mecanismo:** Un producto móvil aplicado al suelo o por el riego puede bajar con la lluvia o un riego excesivo hasta el agua subterránea.
- **Dónde actúa:** `src/plag/calculo.js`, aviso «Producto móvil aplicado al suelo» (no suma al puntaje)
