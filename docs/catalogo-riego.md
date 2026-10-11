# Catálogo de referencia: diseño agronómico de riego por goteo

Este catálogo es el **criterio propio** del módulo de riego (`src/riego/`): las fórmulas que la app recalcula y los rangos con fuente contra los que revisa los datos del usuario. No usa IA.

**Caso de origen:** hoja *Emisores – Diseño Agronómico 2025*, de Anner Almendárez (Lab de Riego, Zamorano), publicada con autorización del autor. Maíz Dicta Guayape, 12.43 ha, goteo con emisor de 1.2 L/h.

## 1. Fórmulas del diseño

Todo parte de la demanda pico del cultivo: con 8.21 mm/día de ETc, cada sector se riega 1.82 h y caben 6 sectores en la jornada.

| Variable | Fórmula | Unidad | Caso |
| --- | --- | --- | --- |
| Densidad de siembra | 10 000 / (dist. plantas × dist. surcos) × hileras | plantas/ha | 41 667 |
| ETc máxima | ETo × Kc máximo | mm/día | 8.21 |
| Marco del emisor | dist. laterales × dist. emisores / hileras | m² | 0.24 |
| Densidad de emisores | 10 000 / marco | emisores/ha | 41 667 |
| Precipitación horaria (Pp) | caudal del emisor / marco | mm/h | 5.0 |
| Caudal por hectárea | densidad de emisores × caudal / 1000 | m³/h/ha | 50 |
| Tiempo de riego por sector | ETc / (Pp × eficiencia) | h | 1.82 |
| Sectores | piso(horas laborales / tiempo de riego) | — | 6 (6.03) |
| Caudal por sector | caudal por ha × área del lote / sectores | m³/h | 103.6 |
| Volumen neto del día pico | ETc × 10 × área del lote | m³/día | 1 020 (bruto ÷ eficiencia: 1 134) |

> La hoja original calcula la densidad de emisores como `10 000 / marco × hileras`, con las hileras ya dentro del marco. Con una hilera por cama no se nota; con dos, duplica el resultado. La app usa `10 000 / marco`.

## 2. Suelo (por sección, en la zona radicular)

| Variable | Fórmula | Unidad |
| --- | --- | --- |
| Agua disponible | (CC − PMP) en %W × densidad aparente | cm/m |
| Lámina disponible (LADzr) | agua disponible × 10 × profundidad radicular | mm |
| Fracción p ajustada | p + 0.04 (5 − ETc), entre 0.1 y 0.8 (FAO-56, Tabla 22) | — |
| Lámina aprovechable (LAAzr) | agua disponible × p ajustada × (1 − pedregosidad) × 10 × profundidad radicular | mm |
| Intervalo máximo entre riegos | piso(LAAzr de la sección más limitante / ETc) | días |

| Sección | Textura | LAA en la hoja (por metro, p = 0.55) | LAA en 0.6 m de raíces | LAA con p ajustada (0.42) |
| --- | --- | --- | --- | --- |
| Parte 1 | Franco arcilloso | 99.8 mm | 59.9 mm | 45.9 mm |
| Parte 2 | Franco | 65.6 mm | 39.4 mm | 30.2 mm |
| Parte 3 | Franco arenoso | 49.5 mm | 29.7 mm | 22.8 mm |

Con la sección más limitante, el intervalo máximo entre riegos es de **2 días**, no de los 6 que sugiere la hoja.

## 2b. Consumo del ciclo (método de la clase)

ETc de cada etapa = Kc promedio de la etapa × suma de la ETo de sus días. Kc promedio: inicial; (inicial + medio) / 2; medio; (medio + final) / 2. La ETo de cada día es la ETo media diaria del mes en que cae, según la fecha de siembra (calendario real, o meses de 30 días como en la clase). Volumen neto = ETc del ciclo × 10 × área; bruto = neto ÷ eficiencia. No descuenta lluvia efectiva.

| Caso | ETc del ciclo | Comparación |
| --- | --- | --- |
| Ejercicio de ETc de la clase, maíz 3 ha, ETo 2017 ene–abr | 285.3 mm; 8 558 m³ netos | 286.8 mm resuelto a mano con el Kc final como promedio de la tabla (0.6125 en vez de 0.6) |
| Lab de Riego, maíz 12.43 ha, siembra 1 ene 2024, ETo media mensual 2024 | 484.7 mm; 60 250 m³ netos, 66 944 brutos | 489.6 mm en la cubicación del reservorio, con ETo y Kc diarios (−1 %) |

Sin fecha de siembra ni ETo mensual, la app usa la ETo pico todos los días y lo avisa (720.8 mm en el caso del Lab: sobreestima).

## 2c. Hidráulica del sector más desfavorable

Fórmulas de la hoja *Diseño Hidráulico Lab de riego 2025* (Anner Almendárez). Caudales en L/h, diámetros internos en mm.

| Variable | Fórmula | Caso del Lab (sector 1) |
| --- | --- | --- |
| Pérdida (Hazen-Williams) | hf = 3163 × Q^1.852 × L / (C^1.852 × Di^4.871) × F | |
| Factor de salidas múltiples (Christiansen) | F = 1/2.852 + 1/(2N) + √0.852 / (6N²) | |
| Pérdida máxima | 10 % de la presión de operación | 1.02 m (Po 10.2 mca) |
| Largo máximo del lateral | mayor N con hf ≤ hf máx; largo = N × dist. emisores | 104.1 m (347 emisores, Di 16.1 mm, C 150) |
| Lateral de la hoja CDT | 137.1 m | hf 2.23 m: no cumple |
| Secundaria 1 | 52.8 m³/h, 74.72 m, Di 107.3 mm, C 140, 93.4 salidas | hf 0.64 m, 1.62 m/s |
| Principal del sector 1 | 7 tramos, 767.8 m, 100.8 m³/h, Di 155.3 mm | hf 10.08 m, 1.48 m/s |
| CDT | Po + lateral + secundaria + principal + filtros + accesorios + desnivel | 23.2 m sin filtros, accesorios ni desnivel |
| Potencia | Q (L/s) × CDT / (76 × eficiencia de la bomba) | sin dato de eficiencia |

La velocidad máxima de 1.5 m/s es criterio propio (valor común para PVC); la hoja del Lab dimensiona las principales a 2 m/s.

## 2d. Reservorio

Fórmulas de la hoja *Cubicación de reservorio* (Anner Almendárez).

| Variable | Fórmula | Caso del Lab |
| --- | --- | --- |
| Lámina bruta | ETc del ciclo × (1 − aporte de la fuente) / eficiencia | 489.6 × 0.85 / 0.9 = 462.4 mm |
| Demanda | lámina bruta × 10 × área | 55 493 m³ (12 ha) |
| Calor latente | λ = 2.501 − 0.002361 × T (FAO-56) | 2.449 MJ/kg a 22 °C |
| Evaporación | Σ días del ciclo × radiación (MJ/m²/día) × 0.8 / λ | 758.4 mm = 9 177 m³ en 1.21 ha |
| Profundidad | volumen / área (paredes verticales); con talud z se resuelve h·[L·W − z·h·(L+W) + 4/3·z²·h²] = volumen | 5.34 m; con 10 % de borde 5.88 m |

No incluye infiltración del fondo ni volumen muerto.

## 3. Rangos de referencia (FAO-56, maíz de grano)

| Parámetro | Hoja | FAO-56 | Veredicto |
| --- | --- | --- | --- |
| Kc inicial | 0.35 | 0.3 (cereales) | Cercano; FAO-56 lo ajusta según la frecuencia de riego |
| Kc medio | 1.20 | 1.20 | Coincide |
| Kc final | 0.35 | 0.60 a 0.35 | Coincide (0.35 = grano secado en campo) |
| Etapas | 20 / 35 / 40 / 30 días | 20 / 35 / 40 / 30 (Nigeria húmedo; India seco) | Coincide |
| Altura máxima | "250 m" | 2 m | Error de unidad |
| Profundidad radicular | 0.6 m | 1.0 a 1.7 m (máxima) | Criterio: justificar |
| Fracción p | 0.55 | 0.55 a ETc ≈ 5 mm/día | Falta el ajuste por ETc |

En la app, `min` y `max` de cada Kc son una **tolerancia propia** alrededor del valor de FAO-56, por calibrar con casos reales. El rango de eficiencia de goteo (0.85–0.95) es un valor común en diseño de riego; falta citarle una fuente.

## 4. Reglas que aplica la app

| Regla | Qué revisa | Nivel si falla |
| --- | --- | --- |
| Escorrentía | Pp ≤ infiltración básica del suelo más lento | Error |
| Horas disponibles | sectores × tiempo ≤ horas laborales (margen < 5 % = revisar) | Error / Revisar |
| Frecuencia segura | ETc × días entre riegos ≤ LAA más limitante | Error |
| Fracción p | p dentro de ±0.05 de la p ajustada por ETc | Revisar |
| Kc y ciclo | dentro de la tolerancia y de los rangos de FAO-56 | Revisar |
| Profundidad radicular | menor que la mínima de FAO-56 | Criterio |
| Eficiencia | goteo entre 0.85 y 0.95 | Revisar |
| Escala física | alturas, profundidades o eficiencias imposibles para su unidad | Error |
| Valores declarados | lo que el archivo trae calculado coincide con el recálculo (±2 %) | Error |
| Lámina por metro | la LAA declarada coincide con el cálculo por metro y no con la zona radicular | Error |
| Números a mano | una fórmula usa un número fijo igual a un dato, o un decimal largo sin origen | Revisar |
| Área redondeada | una fórmula de área o volumen usa un entero cercano al área del lote, pero distinto (12 en vez de 12.43) | Revisar |
| Cálculos a mano | una celda opera solo con números cortos escritos (áreas medidas, por ejemplo) | Criterio |
| Volumen por ciclo | el volumen declarado coincide con el neto y no con el bruto, o no coincide con ninguno (±5 %) | Revisar |
| ETo del ciclo | el ciclo se calculó con la ETo pico o faltan meses de ETo | Criterio |
| ETo de diseño | la ETo de diseño es el MAX de la serie | Criterio |
| Partes no revisadas | el archivo trae hidráulica o reservorio, que la app todavía no revisa | Criterio |
| Datos completados | se usó un valor de referencia porque faltaba el dato | Criterio |

## 5. Hallazgos en la hoja original

| # | Celda | Hallazgo | Tipo |
| --- | --- | --- | --- |
| 1 | Cultivo F20 | Altura de la planta = 250, rotulada en metros | Error de unidad |
| 2 | Diseño E24 | Área por sector escrita a mano (`=12.43/E23`) | Valor fijo |
| 3 | Diseño E26 | Volumen por ciclo pegado (`=4896.45…×12`): es la ETc del ciclo de la cubicación del reservorio (489.6 mm × 10), con 12 ha en vez de 12.43 y sin eficiencia | Valor copiado |
| 4 | Lote I6 | Pendiente rotulada en %, calculada como fracción | Error de unidad |
| 5 | Cultivo F15 | p = 0.55 sin ajustar por ETc | Ajuste omitido |
| 6 | Diseño E5 | ETo de diseño = máximo diario del año | Criterio (conservador, válido) |
| 7 | Cultivo F21 | Profundidad radicular de 0.6 m | Criterio (válido en goteo si se justifica) |
| 8 | Referencia | Bibliografía vacía | Fuente faltante |
| 9 | Lote C24:F24 | LAA "zona radicular" sin multiplicar por la profundidad | Error de fórmula |

La app detecta sola los hallazgos 1, 2, 3, 5, 6, 7 y 9 al cargar el Excel.

## Fuentes

- [FAO-56, cap. 6, Tablas 11 y 12](https://www.fao.org/4/x0490e/x0490e0b.htm)
- [FAO-56, cap. 8, Tabla 22](https://www.fao.org/4/x0490e/x0490e0e.htm)
- CIMMYT (2012), tabla de propiedades por textura usada en el Lab de Riego, Zamorano.
