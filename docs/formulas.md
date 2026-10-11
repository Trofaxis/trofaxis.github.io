# Fórmulas del motor de riesgo

**Rúbrica aditiva.** Cada módulo es una lista de variables. Cada variable recibe un puntaje de **0, 50 o 100** y tiene un **peso** (suman 100 por módulo).

**Riesgo del módulo = Σ peso × puntaje ÷ Σ peso**, solo con las variables que tienen dato.

**Confianza de datos = peso con dato ÷ peso total.** Un dato faltante baja la confianza; no cuenta como riesgo cero. Una variable que **no aplica** a la finca (p. ej. fertirriego si no se usa) no cuenta para nada.

Niveles: **Alto** ≥ 67 · **Medio** ≥ 34 · **Bajo** < 34. Pesos, cortes y niveles se ajustan en `src/core/config.js`.

Cortes [a, b]: valor ≤ a → 0; ≤ b → 50; mayor → 100. Inverso: valor ≥ a → 0; ≥ b → 50; menor → 100.

> Pesos y cortes son **criterio propio** salvo que se indique fuente. Están por validar con especialistas y por calibrar con casos reales (Etapa 3).

## Polinizadores

Basado en Kuniyoshi (2025) y Osorio (2025), PEG de Zamorano. Kuniyoshi encontró una relación positiva pero débil entre la abundancia floral de *Spathodea campanulata* y las abejas muertas (R² = 0.21, no significativa), y señaló como factores **no medidos** la exposición a agroquímicos, la disponibilidad de otras especies en floración, la disponibilidad de agua, el clima y la condición de las flores. Las variables basadas en esos factores son **hipótesis** y se marcan "No verificado".

| Variable | Peso | Puntaje | Estado |
|---|---|---|---|
| Meses con aplicación que expone a los polinizadores en floración visitada (lo biológico cuenta solo si su HQ supera el umbral o la etiqueta advierte por abejas) | 25 | ≤ 0 → 0 · ≤ 1 → 50 · mayor → 100 | Criterio propio |
| Peligro del producto aplicado en floración (el peor de los aplicados en floración; ver [Plaguicidas](#plaguicidas-pestaña-plaguicidas)) | 15 | HQ supera el umbral 100 · no lo supera 0 · sin resolver 50; etiqueta con aviso por abejas 100; sin ingrediente o dosis: ninguno/biológico 0 · selectivo 50 · amplio 100 | HQ y umbral: verificado (FAO). El 50 de "sin resolver" y la escala por clase: criterio propio |
| Meses de floración de especies de riesgo | 10 | ≤ 0 → 0 · ≤ 2 → 50 · mayor → 100 | Criterio propio |
| Abundancia de la especie de riesgo: volumen de copa V = 4/3·π·(D/2)²·(H/2) (Osorio, Ec. 3); sin medidas, n.º de árboles | 15 | m³: ≤ 0 → 0 · ≤ 1 000 → 50 · mayor → 100 (árboles: 0 / 1 / más) | Verificado (relación débil); corte criterio propio |
| Meses de floración de riesgo sin otra floración segura (fracción) | 15 | ≤ 0 → 0 · ≤ 0.5 → 50 · mayor → 100 | No verificado (hipótesis) |
| Meses de floración de riesgo sin lluvia (fracción) | 10 | ≤ 0 → 0 · ≤ 0.5 → 50 · mayor → 100 | No verificado (hipótesis) |
| **Vínculo con Fertilización:** aplicación foliar en floración visitada (solo con plan) | 5 | ninguna 0 · alguna 100 | No verificado (hipótesis) |
| Abejas nativas registradas (receptor) | 5 | nativas 100 · solo no nativas 50 · sin fauna: sin dato | Criterio propio |

## Fertilización

| Variable | Peso | Puntaje |
|---|---|---|
| N aplicado / N objetivo | 30 | ≤ 1 → 0 · ≤ 1.2 → 50 · mayor → 100 |
| Fracción del N (con plan) o de las fertilizaciones en meses de lluvia fuerte | 20 | ≤ 0 → 0 · ≤ 0.5 → 50 · mayor → 100 |
| Mayor fracción del N aplicada en un solo mes (requiere plan) | 10 | ≤ 0.5 → 0 · ≤ 0.75 → 50 · mayor → 100 |
| Fracción del N como urea al voleo sin incorporar (requiere plan) | 10 | ≤ 0 → 0 · ≤ 0.5 → 50 · mayor → 100 |
| P₂O₅ aplicado / P₂O₅ objetivo (requiere plan) | 10 | ≤ 1 → 0 · ≤ 1.2 → 50 · mayor → 100 |
| Pendiente | 10 | plana 0 · ondulada 50 · fuerte 100 |
| Distancia al cuerpo de agua (m) | 10 | ≥ 100 → 0 · ≥ 30 → 50 · menor → 100 |

## Agua

| Variable | Peso | Puntaje |
|---|---|---|
| Sistema de riego (eficiencia FAO 90/75/60 %) | 25 | goteo 0 · aspersión 50 · gravedad 100 · sin riego 0 |
| Distancia al cuerpo de agua (m) | 20 | ≥ 100 → 0 · ≥ 30 → 50 · menor → 100 |
| Área productiva / área total | 15 | ≤ 0.5 → 0 · ≤ 0.8 → 50 · mayor → 100 |
| Hallazgos del módulo Riego (FAO-56) | 30 | sin hallazgos 0 · advertencias 50 · error 100 · sin cargar: sin dato |
| **Vínculo con Fertilización:** fertirriego con un diseño de riego que escurre (solo si hay fertirriego) | 10 | no escurre 0 · escurre 100 |

## Suelo

| Variable | Peso | Puntaje |
|---|---|---|
| Meses de suelo desnudo con lluvia | 35 | ≤ 0 → 0 · ≤ 1 → 50 · mayor → 100 |
| Labranza | 25 | cero 0 · mínima 50 · convencional 100 |
| Pendiente | 25 | plana 0 · ondulada 50 · fuerte 100 |
| **Vínculo con Fertilización:** fracción de N + P₂O₅ aplicada sobre suelo desnudo en meses de lluvia (solo con plan) | 15 | ≤ 0 → 0 · ≤ 0.25 → 50 · mayor → 100 |

## Cadenas tróficas

| Variable | Peso | Puntaje |
|---|---|---|
| Fracción de productos de amplio espectro | 35 | ≤ 0 → 0 · ≤ 0.5 → 50 · mayor → 100 |
| Fracción de meses de amplio espectro con plaga | 25 | ≤ 0 → 0 · ≤ 0.5 → 50 · mayor → 100 |
| Fracción de especies silvestres nativas | 25 | ≥ 0.6 → 0 · ≥ 0.3 → 50 · menor → 100 |
| Meses con aplicación en cosecha | 15 | ≤ 0 → 0 · ≤ 0 → 50 · mayor → 100 |

## Plaguicidas (pestaña Plaguicidas)

Cada aplicación guarda el producto y los meses (obligatorios) y, si el usuario los tiene, el ingrediente activo, la concentración, la dosis, el agua por hectárea, cómo y hacia dónde se aplica, lo que dice la etiqueta y las condiciones del día. Con menos datos la app no inventa: el peligro queda "sin dato" y el módulo Polinizadores usa la clase que eligió el usuario. Código en `src/plag/`; pruebas en `tests/plaguicidas.test.js` (casos 1 a 13 del documento de diseño).

**Dosis por hectárea**

- Producto por ha = dosis por tanque × agua por ha ÷ tamaño del tanque. Barril de 200 L, bomba de 18 L y copa de 25 ml (tabla SAG). Agua de la clase: 100, 300 y 600 L/ha a los 7, 28 y 70 días después del trasplante.
- g de i.a./ha = producto por ha (L o kg) × concentración (g/L o g/kg). Una concentración en % se multiplica por 10 (p/v en líquidos, p/p en sólidos).
- Las copas miden volumen: en un polvo o un granulado no se convierten a gramos. Una unidad de volumen con una formulación sólida (o al revés) da aviso y no se calcula.

**Peligro para himenópteros polinizadores**

- **HQ = g de i.a./ha ÷ DL50 aguda por contacto (µg/abeja).** Umbral de la UE para adultos por contacto: 42 en aspersión hacia abajo y 85 hacia arriba o de lado (FAO, Pesticide Registration Toolkit).
- DL50 de *Apis mellifera* tomada de la ficha del PPDB o del BPDB (Universidad de Hertfordshire) de cada ingrediente, con enlace y fecha de la ficha (`src/plag/catalogo.js`, 53 ingredientes). Si el ingrediente no está, el usuario escribe la DL50 de la hoja de seguridad.
- DL50 "mayor que": el HQ es un máximo. Si aun así queda bajo el umbral, no lo supera; si no, queda **sin resolver** (no se sabe).
- Mezcla: manda el ingrediente que supera el umbral; si ninguno, el de mayor HQ. Si a uno le falta la DL50, el resultado no se da por bueno.
- **Abejas sin aguijón** registradas en el inventario de especies de la finca (géneros de Meliponini como *Melipona*, *Trigona*, *Plebeia*, *Scaptotrigona* o *Tetragonisca*): HQ × 10. Derivado de Arena y Sgolastra (2014): en cerca del 95 % de los casos la sensibilidad relativa a *Apis* fue menor de 10. Es una derivación, no una norma.
- Clase de la EPA por la DL50 de contacto (solo informativa): ≤ 2 µg/abeja, altamente tóxico; > 2 y < 11, tóxico; ≥ 11, relativamente no tóxico (Pesticide Stewardship).
- Lo biológico no es seguro por definición: el spinosad es de origen biológico y su DL50 es 0.0036 µg/abeja. Si su HQ supera el umbral, cuenta como exposición aunque esté marcado como biológico.

**Avisos** (no suman al puntaje; cada uno trae su fuente en pantalla)

| Aviso | Regla | Fuente |
|---|---|---|
| Peligro alto en floración (rojo) | El HQ supera el umbral en un mes con floración visitada | FAO |
| La etiqueta advierte por abejas (rojo) | Pictograma o "no aplicar en floración", en un mes con floración visitada | Clase: Interpretación de etiquetas |
| Horario y condiciones del día | Fuera de 5:00-9:30 y 15:30-18:00 (de noche si hay floración visitada); viento > 10 km/h; temperatura fuera de 15-25 °C; HR < 50 %; lluvia antes de 4 h | Clase: Correcta aplicación |
| pH del agua de la mezcla | Rango de la etiqueta; si no hay, cobres 6.5-7 (tabla SAG); si no, 5.5-6.5 (clase; la tabla SAG dice 5-6) | Etiqueta, SAG, clase |
| No sirve para la enfermedad (rojo) | Sin eficacia en el cuadro SAG para esa enfermedad; eficacia ≤ 2, aviso | SAG (escala APS de 1 a 5) |
| Cosecha, aplicaciones por ciclo, franja al agua | Mes de cosecha; más meses que aplicaciones permitidas; distancia al agua menor que la franja | Etiqueta |
| Sin monitoreo previo | Insecticida, fungicida, acaricida, nematicida o bactericida sin monitoreo marcado | Clase: Monitoreo |
| Mismo grupo seguido | Aplicaciones seguidas (por mes) del mismo grupo, dentro de FRAC, IRAC o HRAC. Fosetil: 33 en el cuadro SAG y P07 en el PPDB cuentan como un grupo | FRAC: tabla SAG. IRAC y HRAC: criterio propio |
| Producto móvil al suelo o por el riego | GUS > 2.8 (lixiviación alta) | Gustafson (1989), interpretación del PPDB. El umbral de lámina no está verificado |
| Aspersión después de aplicar | Riego por aspersión y aplicación foliar | Inferencia, no verificada |
| Aplicación por el riego | Válvula antirretorno | Sin fuente verificada |
| Foliar en los mismos meses | Prueba de mezcla y orden: WP y WG primero, luego EC, SC y SL | Clase: Correcta aplicación |
| Agua de fuente superficial | Clorar (25 ml por barril de 200 L, 30 minutos) y medir el pH | Clase: Correcta aplicación |

**Cuadro SAG de fungicidas** (`src/plag/sag.js`): 132 productos, 41 enfermedades y eficacia de 1 a 5. Al elegir un producto se llenan el ingrediente, la concentración (del nombre, en %), el grupo FRAC, la formulación, la dosis y los días a cosecha. Si el nombre no dice la formulación y la dosis por barril no trae unidad (29 productos, como Zampro "330"), la app no adivina si son ml o g: pide la formulación de la etiqueta y con ella llena la dosis (ml si es líquida, g si es polvo). Una dosis que escribe el usuario no se reemplaza. Las celdas dañadas se corrigieron con una nota visible (Domark "2-Jan", Mertec "}", Zampro "???", Bolco 240 h, Merivon sin reingreso, Banrot y Emesto con la dosis en celdas combinadas, Rhyme quizá invertido). La "S" de reingreso (35 productos) no se convierte en horas: la leyenda no la define y se interpreta como "hasta que seque la aspersión" (criterio propio; aparece en biológicos, cobres, clorotalonil y sistémicos, así que no es azufre).

**No implementado, por falta de fundamento:** la regla "sistémico más contacto" (los códigos de movilidad de la tabla no están verificados) y un puntaje por lixiviación (por ahora solo es aviso).

## Plan de fertilización (pestaña Fertilización)

- Se escribe a mano o se carga una plantilla Excel/CSV (columnas Mes, Producto, Dosis, Unidad, Método).
- Nutriente aplicado (kg/ha) = dosis de producto (kg/ha) × grado (%) ÷ 100. El grado N-P₂O₅-K₂O viene en la etiqueta. Conversión de grado a producto verificada contra UT Extension, Fertilizer Cost Calculator v1.0 (University of Tennessee).
- Unidades: 1 quintal = 100 lb = 45.359237 kg; 1 manzana = 10 000 varas² = 0.69873 ha; 1 qq/mz ≈ 64.9 kg/ha; 1 lb/acre ≈ 1.121 kg/ha.
- Los objetivos por nutriente los pone el usuario (análisis de suelo o agrónomo); la app no recomienda dosis.
- Objetivo de sostenibilidad: el plan alimenta Fertilización y, por sus efectos en el ecosistema, Suelo y Agua. Con Polinizadores se vincula por las aplicaciones foliares en floración visitada.

## Mapa de la finca (Issue #10)

- Proyección Web Mercator con teselas de 256 px (esquema "slippy map" de OpenStreetMap).
- Área del contorno sobre la esfera (Chamberlain y Duquette 2007, JPL Publication 07-03): A = |Σ (λᵢ₊₁ − λᵢ)·(2 + sen φᵢ + sen φᵢ₊₁)| · R² / 2, con R = 6 378 137 m. Probada contra la fórmula exacta de un rectángulo lat-lon.
- Avisos (criterio propio): punto fuera del rectángulo aproximado de Honduras (y si con la longitud en negativo cae dentro, sugiere el signo menos); área dibujada vs. declarada con diferencia > 20 %.
- El contorno **no** alimenta ninguna rúbrica todavía. El punto sí se usa para el clima (Issue #8, abajo).

## Clima por ubicación (Issue #8, crítica 3)

Con el punto de la finca (mapa, coordenadas o GPS) la app descarga el clima y el usuario ya no escribe temperatura, humedad, lluvia, viento, radiación ni ETo.

- **Fuente:** API de clima histórico de Open-Meteo (`archive-api.open-meteo.com/v1/archive`), basada en los reanálisis ERA5 y ERA5-Land de Copernicus. Datos con licencia CC BY 4.0; la API es gratis para uso **no comercial**. La ETo es la FAO-56 Penman-Monteith que calcula Open-Meteo.
- **Qué se calcula** (`src/clima/normales.js`): promedio de los últimos 10 años completos (2016-2025 en 2026) por mes: temperatura media, máxima y mínima, humedad relativa media, lluvia (mm/mes), viento, ETo media, radiación (MJ/m²/día) y el percentil 90 de la ETo diaria.
  - Un mes de un año cuenta si tiene ≥ 80 % de días con dato; el promedio del mes necesita ≥ 5 años (criterio propio).
  - Lluvia del mes = promedio diario × días del mes, para que un día faltante no la baje.
  - Viento de 10 m a 2 m con FAO-56, ec. 47: u₂ = u_z · 4.87 / ln(67.8 z − 5.42) (factor 0.748 a 10 m).
  - Si el servicio no reconoce las medias diarias, se piden la humedad y el viento por hora y se promedian por día; la temperatura media pasa a (máx + mín) / 2.
- **Qué llena solo** (nunca pisa lo que el usuario escribió o lo que vino de su archivo):
  - Meses de lluvia fuerte del cuestionario: meses con ≥ 100 mm (criterio propio, `CONFIG.clima.lluviaFuerteMm`). Si el usuario ya los marcó, la app solo sugiere.
  - Altitud: elevación de la celda que devuelve Open-Meteo, si estaba vacía.
  - Riego: ETo de cada mes, temperatura y radiación del reservorio, y ETo de diseño = mayor percentil 90 de la ETo diaria (criterio propio: un día exigente, no el promedio). El caso de ejemplo del Lab no se mezcla con el clima de otra ubicación salvo que el usuario lo pida.
- **Dónde más se usa:**
  - Plaguicidas: si no se anotaron las condiciones del día, avisa con el clima típico de los meses de aplicación contra los límites de la clase (máx. > 25 °C, HR < 50 %, viento > 10 km/h, mes lluvioso). Es nivel "criterio": un promedio diario no es la hora de aplicación.
  - Polinizadores: variable "Clima en la floración de riesgo" con **peso 0** (no verificado). Kuniyoshi (2025) menciona temperatura, humedad y precipitación como factores no medidos; no suma al riesgo hasta que se mida su efecto.
- **Límites:** es una celda de ~11 km, no una estación en la finca; en montaña puede diferir varios grados. Son 10 años, no una normal de 30 años de la OMM. Todo valor se puede corregir a mano (queda marcado), y sin internet se usa la última descarga o se escribe la tabla a mano.
- **Privacidad:** se envían a Open-Meteo las coordenadas redondeadas a 2 decimales (~1 km). La finca guarda el clima por mes, no las coordenadas; la caché del punto vive solo en el navegador.

## Fuentes de los vínculos ecológicos

- Kuniyoshi Aguilar, A. S. (2025; publicado en 2026). *Fenología de Spathodea campanulata en el campus de la Universidad Zamorano y presencia de abejas muertas asociadas a sus flores.* PEG, Zamorano.
- Osorio Banegas, N. E. (2025). *Evaluación de la distribución de Spathodea campanulata en el campus de la Universidad Zamorano.* PEG, Zamorano.
