# ApiRadar: resolver un problema con los datos de la finca

El ApiRadar no es una sección aparte. Está en el dashboard, en el panel **Resolver un problema**. El usuario carga su finca como siempre, elige el problema (hoy: *Spathodea campanulata y las abejas nativas*) y la app cruza sus datos y devuelve un diagnóstico que se puede leer y comprobar.

Código: `src/apiradar/diagnostico.js` (lógica) y `src/ui/apiradar.js` (panel). Valores propios en `CONFIG.apiradar`.

## Qué devuelve

1. **Qué datos usó**: especies de riesgo, árboles y volumen de copa, meses de floración, aplicaciones de plaguicidas, abejas registradas y lluvia. Cada dato dice de dónde sale.
2. **Por qué sale ese riesgo**: las variables del módulo Polinizadores, con valor, puntaje, peso, estado de la evidencia y los puntos que aporta cada una al total.
3. **Qué hacer, cuándo y dónde**: cada cambio con sus meses y cuánto baja el riesgo.
4. **Qué falta** para afinar el diagnóstico.
5. **Cómo saber si funcionó**.

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
| Volumen de copa, meses de floración | Verificado | Osorio (2025), Kuniyoshi (2025), como ya usa Polinizadores |
| Otras flores, meses secos, foliares | No verificado: hipótesis | Factores que Kuniyoshi (2025) menciona sin medir |
| Pesos y cortes de la rúbrica | Criterio propio, por calibrar | `CONFIG.rubrica.poli` |

**No se cita Tejeda et al. (2025):** no está entre los archivos del proyecto y no se pudo verificar.

## Límites conocidos

- **Dónde ubicar el refugio.** En el mapa del dashboard, «Árboles de riesgo con coordenadas»: una línea por árbol, en grados («14.0108, -87.0044») o UTM («501177 1547784», zona 16 N o 17 N). Con el contorno de la finca dibujado, el ApiRadar calcula qué parte de la finca queda a 300 m y a 500 m o más de todos los árboles y marca en verde el punto más alejado. Sin contorno, solo dibuja los radios.
- Esas coordenadas **viven solo en el navegador** (junto con el punto y el contorno): no van en el archivo exportado, en la nube ni en la memoria de casos.
- El punto más alejado es una referencia, no una ubicación final: la app no sabe dónde hay floración alternativa, agua ni acceso. El criterio doble (lejos del árbol y cerca de flores seguras) lo decide el usuario.
- Un árbol de riesgo cuenta igual sin importar su tamaño; el radio no cambia con el volumen de copa.
- Un solo problema por ahora. Agregar otro es sumar una entrada en `PROBLEMAS` y su función de diagnóstico.
