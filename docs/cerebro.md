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

- `src/cerebro/grafo.js`: el grafo, como el de Obsidian. Nodos = hechos, temas y fuentes. Líneas solo de relaciones reales:
  el tema del hecho, su fuente y las fórmulas que usan dos valores juntos (cada regla nombra el archivo de la fórmula).
- `src/admin/cerebro.js`: vista del cerebro para el **panel de administración**, que vive en un sitio aparte con inicio
  de sesión (`https://diegoguevara912-pixel.github.io/trofaxis-admin/`) y la importa desde la app publicada. Arrastrar puntos o el fondo, acercar con la rueda o dos dedos, tocar un punto
  para ver el hecho, su fuente y sus vecinos. La búsqueda resalta los puntos que coinciden.
- `src/cerebro/obsidian.js`: botón «Descargar para Obsidian (.zip)»: una nota .md por nodo con [[enlaces]]. Obsidian es
  opcional; editar esas notas no cambia la app.

Primera versión (184 hechos): 140 con fuente, 15 criterio propio, 29 por validar.

- Pendientes del administrador: lo que está por validar y lo que es criterio propio, por tema, y la fecha de consulta
  de las fichas PPDB. Revisión sugerida una vez al mes; los valores se cambian en el repo con un PR.

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
