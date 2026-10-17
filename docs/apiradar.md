# ApiRadar: resolver un problema con los datos de la finca

El ApiRadar no es una sección aparte. Está en el dashboard, en el panel **Resolver un problema**. El usuario carga su finca como siempre, elige el problema (hoy: *Spathodea campanulata y las abejas nativas*) y la app cruza sus datos y devuelve un diagnóstico que se puede leer y comprobar.

Código: `src/apiradar/diagnostico.js` (lógica), `src/apiradar/censo.js` (censo de árboles y sitios), `src/ui/apiradar.js` (panel) y `src/ui/mapariesgo.js` (mapa de riesgo). Valores propios en `CONFIG.apiradar`.

## Qué devuelve

1. **Qué datos usó**: especies de riesgo, árboles y volumen de copa, meses de floración, aplicaciones de plaguicidas, abejas registradas y lluvia. Cada dato dice de dónde sale.
2. **Por qué sale ese riesgo**: las variables del módulo Polinizadores, con valor, puntaje, peso, estado de la evidencia y los puntos que aporta cada una al total.
3. **Dónde están los árboles de riesgo**: censo de árboles con su volumen de copa y riesgo, mapa de riesgo (contorno, árboles, radios de exclusión) y veredicto de cada sitio candidato para colonias o refugios.
4. **Qué hacer, cuándo y dónde**: cada cambio con sus meses y cuánto baja el riesgo.
5. **Qué falta** para afinar el diagnóstico.
6. **Cómo saber si funcionó**.

## Censo, mapa de riesgo y sitios

En el mapa de la finca, el bloque «Censo de árboles y sitios (ApiRadar)» recibe, por árbol: ID, coordenadas (UTM «este norte», zona 16 N o 17 N, o «latitud, longitud»), DAP, diámetro de copa y altura de copa (los tres últimos opcionales). Se puede agregar de uno en uno o pegar una tabla desde Excel. También hay sitios candidatos (por coordenadas o marcados sobre el mapa).

- **Volumen de copa** de cada árbol: V = 4/3·π·(D/2)²·(H/2), Osorio (2025), Ec. 3; es la misma fórmula del módulo Polinizadores. H es la altura de la copa. El DAP se muestra pero no entra al cálculo.
- **Riesgo por árbol** (alto, medio, bajo): percentil del volumen de copa dentro del propio censo, por tercios (`CONFIG.apiradar.percentilesRiesgo`). **Criterio propio, por validar.** Es relativo: en cualquier censo habrá árboles «altos», aunque todos sean pequeños, y con menos de 6 árboles medidos la clasificación es muy gruesa. Sirve para priorizar qué árbol atender primero; no es una medida absoluta de daño.
- **Veredicto de cada sitio**: distancia al árbol censado más cercano. *Cerca*: menos de 300 m. *Revisar*: entre 300 y 500 m. *Lejos*: 500 m o más. El radio se aplica a **todos** los árboles del censo, no solo a los de mayor volumen (Osorio censó 23 árboles en la franja; los medianos cercanos entre sí suman exposición).
- **Mapa de riesgo**: SVG propio en metros (sin imagen satelital, funciona sin internet). Árboles con color por riesgo y tamaño por volumen, anillo continuo = radio mínimo, punteado = radio conservador, rombo = sitio con el color de su veredicto, verde = punto más alejado de todos los árboles. La imagen satelital del mapa de la finca muestra las mismas marcas.
- **Ejemplo**: «Ver con datos de ejemplo» carga 14 árboles y 3 sitios **ficticios** (marcados «Ejemplo»); no son de ninguna finca. Al agregar datos propios, el ejemplo se borra.
- **No cambia el puntaje.** El censo no entra en la rúbrica de Polinizadores (esa usa el volumen declarado en Especies); solo ordena y ubica. Si el número de árboles de Especies no coincide con el del censo, la acción de refugio lo avisa.

## Cómo calcula

- **No hay pesos nuevos.** El puntaje es el del módulo Polinizadores. El ApiRadar solo lo ordena como diagnóstico.
- **Cuánto baja cada cambio** sale de recalcular la finca con ese cambio hecho (copia de la finca; la del usuario no se toca). Los cambios se aplican en orden y la baja es acumulada: sembrar flores alternativas antes de sacar las aplicaciones de la floración puede subir la coincidencia, por eso el orden importa.
- Cambios que mide: sacar las aplicaciones de la floración visitada, tener otras flores en los meses sin alternativa, pasar los foliares fuera de la floración.
- Cambios que **no** cuantifica, y lo dice: ubicar refugios (la app no tiene las coordenadas de cada árbol) y reducir la flor del árbol de riesgo (la rúbrica no modela una poda parcial).

## Fuentes y estado

| Elemento | Estado | Fuente |
|---|---|---|
| Radio de exclusión 300-500 m | Verificado en el resumen del artículo, no en el texto completo | Barrantes-Vásquez et al. (2018), *Rev. For. Mesoam. Kurú* 16(38): 13-23, rango de vuelo de *Trigona fulviventris* en Guanacaste |
| Mismo radio para *Plebeia melanica* y otras | Criterio propio, por validar | Sin cifra en los documentos del proyecto |
| Área excluida por árbol (28-79 ha) | Cálculo geométrico π·r² con ese radio | |
| Punto del refugio y % de la finca fuera del radio | Cálculo con las coordenadas que carga el usuario, sobre una rejilla dentro del contorno | Distancia en plano local (error de metros en una finca) |
| Conversión de UTM a grados | Series de Krüger; probada contra el arco de meridiano (WGS84) | Karney (2011) |
| Fórmula del volumen de copa, meses de floración | Verificado | Osorio (2025), Ec. 3, pág. 15; Kuniyoshi (2026), floración de septiembre a enero |
| Más volumen de copa, más riesgo | No verificado: hipótesis | Osorio lo espera sin medirlo (pág. 27); Kuniyoshi halló una relación débil y no significativa con flores visibles |
| Otras flores, meses secos, foliares | No verificado: hipótesis | Factores que Kuniyoshi (2026) menciona sin medir |
| Pesos y cortes de la rúbrica | Criterio propio, por calibrar | `CONFIG.rubrica.poli` |

**No se cita Tejeda et al. (2025):** está con embargo en bdigital.zamorano.edu y no se pudo verificar.

## Límites conocidos

- **Dónde ubicar el refugio.** Con el censo cargado (ver arriba). Con el contorno de la finca dibujado, el ApiRadar calcula qué parte de la finca queda a 300 m y a 500 m o más de todos los árboles y marca en verde el punto más alejado. Sin contorno, solo dibuja los radios.
- Esas coordenadas **viven solo en el navegador** (junto con el punto y el contorno): no van en el archivo exportado, en la nube ni en la memoria de casos.
- El punto más alejado es una referencia, no una ubicación final: la app no sabe dónde hay floración alternativa, agua ni acceso. El criterio doble (lejos del árbol y cerca de flores seguras) lo decide el usuario.
- Un árbol de riesgo cuenta igual sin importar su tamaño para el radio; el radio no cambia con el volumen de copa.
- **No hay hábitat natural ni otras capas** en el mapa de riesgo: solo contorno, árboles y sitios. Los datos reales del censo de Zamorano (Osorio) no están en el repositorio: se cargan a mano o pegando la tabla, y se quedan en el navegador.
- Las coordenadas del censo se muestran en grados, aunque se hayan escrito en UTM.
- Un solo problema por ahora. Agregar otro es sumar una entrada en `PROBLEMAS` y su función de diagnóstico.

## Ruta guiada, plan y descarga (2026-10-14)

- El panel se lee como una ruta: riesgo hoy → con tu plan (barra), cinco pasos con su estado (riesgo, censo, sitios, cambios hechos, comprobación), el plan de acciones y «Dónde actuar». Lo técnico (datos usados, rúbrica, qué falta) queda plegado en «Cómo se calculó».
- Cada acción medible se puede quitar del plan (`S.arExcluir`); el cálculo se repite sin ella (`apiRadar(..., excluir)`). «Ya lo hice» se guarda con las demás recomendaciones (`S.done['ar|id']`).
- La acción de colonias y la de árboles traen dónde: el sitio propuesto más lejano que sirve o, si no hay, el punto más alejado de la finca; y los árboles de más copa con sus coordenadas.
- «Descargar plan (imagen)» arma un PNG en el navegador (`src/ui/plan-imagen.js`): satélite si las teselas llegan con CORS, árboles, radios, sitios, coordenadas y pasos. Sin conexión sale sin satélite y lo dice. «Imprimir o guardar PDF» imprime solo el ApiRadar.
- La animación de análisis al generar el ApiRadar es solo presentación (`CONFIG.apiradar.msAnalisis`) y se salta con «reducir movimiento».
- Un sitio marcado sobre el ejemplo se compara con los árboles de ejemplo (antes los borraba y el botón parecía no hacer nada).
