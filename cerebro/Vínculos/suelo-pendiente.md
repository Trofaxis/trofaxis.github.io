---
id: suelo-pendiente
estado: criterio propio
validado_por: 
validado_fecha: 
tipo: vínculo
---

# Pendiente del terreno → Riesgo de Suelo

## Evidencia

<!-- Una línea por fuente: - postura | [[clave de la fuente]] | página, tabla o sección | nota.
     postura: a favor, en contra o menciona. «con fuente» exige al menos una «a favor» con página. -->
- menciona | [[godoy-garzon-2015]] | pág. 4 | Premisa: en ladera la erosión y la degradación se aceleran. Clases de pendiente y distancia entre barreras en pág. 22–23 (de segunda mano).

## Del código (no editar aquí)

- **Variables:** [[finca.pendiente|Pendiente del terreno]] → [[riesgo.suelo|Riesgo de Suelo]] (sube)
- **Mecanismo:** Con más pendiente, la escorrentía tiene más fuerza y erosiona más.
- **Dónde actúa:** `src/modules/suelo.js`, variable `pendiente` de la rúbrica (peso 25)
