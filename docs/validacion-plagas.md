# Validación de la tabla de plagas por cultivo

Issue #11 (bloquea el PR #4). La tabla vive en `src/especies/plagas.js`; la plantilla para el
especialista es [`validacion-plagas.csv`](validacion-plagas.csv) (40 filas, una por plaga y cultivo).

## Estado

| Columna pedida | Estado |
|---|---|
| Cultivo, plaga, nombre científico | Listos para revisar |
| Tipo (insecto, enfermedad, ácaro, nematodo…) | Agregado, para revisar |
| Zona / altitud | **Vacío**: falta fuente |
| Meses de mayor presión | **Vacío**: falta fuente |
| Factores que favorecen la propagación | **Vacío**: falta fuente |
| Fuente | Solo las 12 filas de chile la tienen (material del curso AH Protección Vegetal, que cita a Agro Alpha 2022). Las otras 28 son la lista sugerida inicial, sin fuente |

No se llenaron zona, meses ni factores con supuestos: son datos que el especialista debe dar
con su fuente.

## Qué tiene que hacer el especialista

1. Abrir el CSV, confirmar o corregir cada fila y llenar `zona`, `mesesPresion`, `factores`,
   `fuente`, `validado_por` y `comentarios`.
2. Puntos a revisar en particular:
   - *Melanaphis sacchari* en sorgo: parte de la literatura reciente la separa como *M. sorghi*.
   - Chile: se corrigió la ortografía de la diapositiva (*Grillus* → *Gryllus*, *Tabamovirus* →
     *Tobamovirus*, *Oïdium* → *Oidium*); "Spodoptera sp." queda sin especie.
   - Plátano y banano comparten lista.
3. Con el CSV validado, se pasan los datos a `src/especies/plagas.js`, se cambia
   `ESTADO_TABLA_PLAGAS` a `'validado'` y se regenera el CSV (una prueba verifica que coincidan).

Hasta entonces la lista solo **sugiere** en el cuestionario y no se usa para puntuar.
