# Cerebro de Trofaxis

Trofaxis no usa Claude ni ninguna IA cuando corre. Todo lo que calcula sale de datos y reglas guardados en el repo
y evaluados en el navegador. El «cerebro» junta esos datos en una sola lista de hechos, cada uno con su fuente.

## Qué es

- `src/cerebro/hechos.js`: lista `HECHOS`. No copia cifras: lee `config.js`, el catálogo de plaguicidas (PPDB/BPDB),
  las referencias de riego (FAO-56, Lab de Riego) y la tabla de plagas. Si cambias un valor en su archivo, el cerebro cambia solo.
- `src/cerebro/consulta.js`: `buscar(texto)` encuentra hechos por palabras, sin tildes ni mayúsculas; `resumen()` cuenta
  cuántos tienen fuente.
- Cada hecho dice su estado: **con fuente** (cita y enlace), **criterio propio** (por validar) o **por validar** (sugerido, no puntúa).
  Una prueba falla si un hecho no trae ninguno de los tres.
- Datos de tesis: van en `src/core/fuentes.js`, en el campo `datos` de cada fuente, con la página o la sección donde
  se leyeron (`donde`). Entran solos al cerebro como hechos `poli.<fuente>.<id>`. Hoy están Osorio (2025) y Kuniyoshi (2026).
  Nunca se copian coordenadas de árboles: una prueba lo revisa.

- `src/cerebro/vinculos.js`: la **matriz de vínculos**. Es la regla «una variable no afecta a otra sin fundamento»
  escrita como datos. Cada fila dice qué variables de la finca (al coincidir) suben o bajan qué riesgo, por qué mecanismo,
  con qué estado (con fuente, criterio propio o hipótesis por validar), con qué evidencia (a favor, en contra o «menciona»),
  en qué contexto y dónde actúa en el código (variable de la rúbrica o aviso). `VARIABLES` es el diccionario de variables:
  un id por cosa medida o decidida, para que dos fuentes que dicen lo mismo con otras palabras caigan en la misma.
  Las pruebas exigen que cada vínculo apunte a una variable que existe en su archivo y que cada variable marcada «Vínculo»
  en `src/modules/` tenga su fila. Una fuente nueva confirma una fila (evidencia a favor), la contradice (en contra: el panel
  la marca en conflicto) o propone una nueva (entra como «por validar»).
- `src/cerebro/grafo.js`: el grafo, como el de Obsidian. Nodos = hechos y variables de la finca. Líneas solo de relaciones
  reales: las fórmulas que usan dos valores juntos (cada regla nombra su archivo), los vínculos de la matriz (con flecha,
  causa → efecto) y los valores que usa cada variable. El tema y la fuente son agrupaciones, no relaciones: el panel los
  muestra solo al marcar «Ver también temas y fuentes». La descarga para Obsidian lleva todo.
- `src/admin/cerebro.js`: vista del cerebro para el **panel de administración**, que vive en un sitio aparte con inicio
  de sesión (`https://diegoguevara912-pixel.github.io/trofaxis-admin/`) y la importa desde la app publicada. Arrastrar puntos o el fondo, acercar con la rueda o dos dedos, tocar un punto
  para ver el hecho, su fuente y sus vecinos. Cada conteo (hechos, vínculos, «5 hipótesis»…) se toca y abre su lista;
  el buscador encuentra variables, vínculos, fuentes y hechos («hipótesis» trae los vínculos por validar) y resalta en el grafo
  lo que coincide. Una fuente muestra los hechos y vínculos que se apoyan en ella.
- `src/cerebro/obsidian.js`: botón «Descargar para Obsidian (.zip)»: una copia para mirar, con una nota .md por nodo. Para cambiar
  vínculos se edita la bóveda `cerebro/` (abajo).

Primera versión (184 hechos): 140 con fuente, 15 criterio propio, 29 por validar.

- Pendientes del administrador: lo que está por validar y lo que es criterio propio, por tema, los vínculos sin validar
  por un especialista (primero las hipótesis que ya suman al puntaje) y la fecha de consulta de las fichas PPDB. Revisión sugerida una vez al mes; los valores se cambian en el repo con un PR.

**Acceso:** el panel pide inicio de sesión y solo entran las cuentas de la tabla `admins` de Supabase. La app ya no
tiene `/admin/`.

## Bóveda de Obsidian (fuente de verdad de los vínculos)

- La carpeta `cerebro/` es una bóveda de Obsidian. Cada vínculo tiene su nota en `cerebro/Vínculos/<id>.md`.
- Ahí se editan el `estado`, `validado_por`, `validado_fecha` y la lista «## Evidencia» (`- postura | [[fuente]] | página | nota`).
  Las fuentes nuevas se agregan como notas en `cerebro/Fuentes/` con `origen: bóveda`, `cita` y `acceso`.
- `node scripts/cerebro.mjs` lee la bóveda, reescribe lo que viene del código (mecanismo, variables, dónde actúa, fuentes del código)
  y genera `src/cerebro/boveda.js`, que es lo único que la app lee. Lista los pendientes (evidencias «a favor» sin página).
- `tests/cerebro-boveda.test.js` falla si la bóveda y `boveda.js` no coinciden, si una evidencia enlaza una fuente que no existe,
  si «con fuente» no tiene una evidencia «a favor» con página, si «por validar» tiene una «a favor», o si el estado del vínculo
  contradice el que la app muestra en la rúbrica.
- Al crear la bóveda (2026-11-01) se corrigió una contradicción: `agua-sistema` decía «con fuente» en el cerebro pero la app lo
  muestra como «criterio propio» (las eficiencias son de FAO; pasarlas a 0, 50 y 100 puntos no). Quedó «criterio propio».

## Tesis leídas (piloto, 2026-11-02)

Primer paso para que el cerebro reciba cientos de tesis sin inventar nada. La IA (o una persona) solo **lee**;
un programa **comprueba** y una persona **aprueba**. La app no usa IA.

1. **Nota por tesis** en `cerebro/Tesis/<clave>.md`: secciones `## Relaciones` (`- de | a | sentido | base | resultado | pág. N | "frase"`),
   `## Umbrales`, `## Fórmulas`, `## Datos` y `## Alertas`. `sentido`: `+`, `−`, `0` (sin efecto significativo), `?`, `+ n.s.`, `− n.s.`.
   `base`: `medido` (lo midió la tesis), `citado` (lo dice otra fuente que la tesis cita) o `afirmado` (sin medir).
   Las variables usan el id de Trofaxis si existe; si no, el id queda como **variable candidata**.
2. **Verificador**: `node scripts/cerebro.mjs --verificar <carpeta con los .txt>` busca cada frase en esa página del PDF
   (texto de `pdftotext -layout`, páginas separadas por `\f`; las páginas son las del archivo PDF). Sin tildes, mayúsculas
   ni espacios; en tesis escaneadas (`ocr: sí`) acepta letras mal leídas (parecido ≥ 0,8) pero exige cada cifra tal cual.
   Guarda `cerebro/Tesis/_verificacion.json` con una huella por línea: cambiar la frase o la página obliga a verificar de nuevo.
3. **Agregado**: `node scripts/cerebro.mjs` genera `cerebro/Tesis/_Resumen.md` (pares de variables con cuántas tesis los
   midieron y en qué sentido, umbrales por variable, fórmulas, variables candidatas y alertas) y `src/cerebro/tesis.js`,
   que el explorador del cerebro muestra en el tipo «Tesis».
4. **Evidencia en vínculos**: una tesis se cita como `[[clave]]`, y la evidencia debe decir `pág. N` de una página donde la
   tesis tiene una frase verificada. Nada de esto cambia un estado ni un puntaje: eso sigue siendo un PR revisado.

Piloto: 13 tesis (11 de riego y suelos de la carpeta CPA de Diego, Osorio 2025 y Kuniyoshi 2026), 75 líneas, todas verificadas.
Los PDF y los textos completos no se suben al repositorio (derechos de autor): viven en la carpeta del proyecto. Solo van
frases cortas con su página.

## Evidencia del puntaje en la app

- `src/core/evidencia.js` suma el peso de cada variable de una rúbrica según su estado: **con fuente** (verificado o fuente
  secundaria), **criterio propio** o **hipótesis** (no verificado). No cambia ningún puntaje.
- En cada «¿Por qué?» y en «Ver rúbrica» sale una barra «Evidencia del puntaje». En la vista técnica, el KPI «Puntaje con
  fuente» da la misma suma para todo el índice, ponderada por el peso de cada módulo.
- Finca demo (2026-11-01): 11 % del índice con fuente, 78 % criterio propio, 11 % hipótesis. Fertilización, Suelo y
  Cadenas tróficas son 100 % criterio propio. Para subir ese número hay que cargar fuentes reales, no cambiar el texto.

## Qué no puede hacer sin IA

- Responder preguntas libres o explicar con sus propias palabras: solo encuentra hechos que contienen las palabras buscadas.
- Razonar sobre un caso nuevo que no tenga regla escrita: cada diagnóstico tiene que estar programado.
- Leer un PDF o una tesis y sacar datos: alguien (o una IA, fuera de la app) escribe la nota de la tesis y el verificador comprueba cada frase.
- Aprender solo: la memoria de casos compara fincas, pero no cambia pesos ni umbrales por sí misma.

## Qué todavía necesita conexión

- Clima típico de la ubicación (Open-Meteo): la primera vez; luego se reutiliza 180 días.
- Mapa satelital (EOX) y la nube de casos (Supabase).
- Abrir la app: falta un service worker para que funcione sin conexión desde la segunda visita.

## Pendiente

- Tejeda et al. (2025): con embargo en bdigital.zamorano.edu (handle 11036/8207); no se cita hasta tener el documento.
