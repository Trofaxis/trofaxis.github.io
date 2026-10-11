# Umbrales del nivel de presencia (baja / media / alta)

Issue #13. El nivel de presencia es un dato **opcional** de especies y plagas en el cuestionario
(paso 3). Hoy es **informativo**: no entra en ninguna fórmula de riesgo.

> **Estado: criterio propio, por validar.** Ningún corte de esta tabla tiene fuente científica.
> Solo el *método* de muestreo de plagas sale de material del curso. Los valores viven en
> `src/core/config.js` (bloque `presencia`) y se cambian ahí sin tocar código.

| Grupo | Qué se mide | Unidad | Baja | Media | Alta | Fuente |
|---|---|---|---|---|---|---|
| Polinizadores y otra fauna | Individuos vistos en flores durante 10 min de observación | individuos / 10 min | < 5 | 5 a < 20 | ≥ 20 | Criterio propio |
| Árboles y arbustos | Individuos en la finca y sus bordes | individuos / ha | < 5 | 5 a < 20 | ≥ 20 | Criterio propio |
| Malezas | Cobertura del suelo estimada a la vista en el lote | % de cobertura | < 10 | 10 a < 30 | ≥ 30 | Criterio propio |
| Plagas y enfermedades | Plantas con la plaga o el síntoma en 15 a 20 estaciones de 2 a 5 plantas | % de plantas | < 5 | 5 a < 20 | ≥ 20 | Método: *Monitoreo en Cultivos Hortícolas*, AH Protección Vegetal (Zamorano), diap. 5. Cortes: criterio propio |
| Cultivos que florecen | — | — | — | — | — | Sin umbral (no aplica) |

## Qué falta validar

1. **Polinizadores**: la ventana de 10 minutos y los cortes deberían salir del protocolo de
   observación que use el proyecto de abejas nativas (Refugio de Exclusión). Para abejas sin
   aguijón quizá conviene contar nidos y no individuos.
2. **Árboles**: para especies de riesgo como *Spathodea campanulata* la app ya usa el número de
   individuos y el volumen de copa (Osorio 2025); falta decidir si la presencia debe medirse igual.
3. **Malezas**: confirmar con el área de malezas si la cobertura visual es suficiente.
4. **Plagas**: el corte útil depende de cada plaga (umbral de acción). Un solo corte por
   porcentaje de plantas es una simplificación; validar con entomología / fitopatología junto
   con la tabla de plagas (issue #11).
