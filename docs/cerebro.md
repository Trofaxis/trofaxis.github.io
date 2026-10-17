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
  para ver el hecho, su fuente y sus vecinos. La búsqueda resalta los puntos que coinciden.
- `src/cerebro/obsidian.js`: botón «Descargar para Obsidian (.zip)»: una nota .md por nodo con [[enlaces]]. Obsidian es
  opcional; editar esas notas no cambia la app.

Primera versión (184 hechos): 140 con fuente, 15 criterio propio, 29 por validar.

- Pendientes del administrador: lo que está por validar y lo que es criterio propio, por tema, los vínculos sin validar
  por un especialista (primero las hipótesis que ya suman al puntaje) y la fecha de consulta de las fichas PPDB. Revisión sugerida una vez al mes; los valores se cambian en el repo con un PR.

**Acceso:** el panel pide inicio de sesión y solo entran las cuentas de la tabla `admins` de Supabase. La app ya no
tiene `/admin/`.

## Qué no puede hacer sin IA

- Responder preguntas libres o explicar con sus propias palabras: solo encuentra hechos que contienen las palabras buscadas.
- Razonar sobre un caso nuevo que no tenga regla escrita: cada diagnóstico tiene que estar programado.
- Leer un PDF o una tesis y sacar datos: alguien los carga a mano, con su página.
- Aprender solo: la memoria de casos compara fincas, pero no cambia pesos ni umbrales por sí misma.

## Qué todavía necesita conexión

- Clima típico de la ubicación (Open-Meteo): la primera vez; luego se reutiliza 180 días.
- Mapa satelital (EOX) y la nube de casos (Supabase).
- Abrir la app: falta un service worker para que funcione sin conexión desde la segunda visita.

## Pendiente

- Datos de Osorio (2025) y Kuniyoshi (2025): se cargarán como hechos con su página cuando estén en el repo.
- Tejeda et al. (2025): no está en los archivos del proyecto; no se cita.
