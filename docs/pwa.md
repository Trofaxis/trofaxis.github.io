# Trofaxis sin conexión

Trofaxis sigue siendo un sitio estático en GitHub Pages; desde el 2026-10-22 se publica la copia que arma `npm run build` ([build.md](build.md)). `manifest.webmanifest` permite instalarlo y `sw.js` guarda el app shell para abrirlo sin red. La finca continúa en el `localStorage` de ese navegador o equipo con sus claves actuales; instalarla en otro navegador no copia los datos automáticamente.

## Caché y actualizaciones

- El app shell enumera la página, los estilos, iconos y módulos propios que necesita la app, incluidas las vistas que se cargan al abrirlas por primera vez. Una prueba confirma que incluya cada archivo `.js`, `.css` y `.woff2` dentro de `src/`.
- El manifiesto usa íconos normales y versiones maskable separadas. En las adaptables, el logo queda dentro de la zona central segura sobre un fondo sólido.
- El service worker solo atiende solicitudes `GET` del mismo origen y de esa lista. No intercepta ni guarda respuestas de Supabase, Open-Meteo ni del proveedor de mapas.
- Caché primero: los archivos del app shell y la entrada a la app (`/` o `/index.html`, con o sin parámetros en la dirección) se entregan desde la caché de la versión instalada, sin esperar a la red. Solo busca en su propia caché (`CACHE_NAME`) para no mezclar archivos de dos versiones. Si falta un archivo, lo pide a la red con `cache: 'no-cache'` y lo guarda. Las demás páginas del sitio consultan primero la red. Sin conexión reciben la página de la app, pero desde otra dirección sus estilos y módulos no cargan: sin red, Trofaxis se abre desde la dirección principal o el ícono instalado.
- Por qué: con red lenta, revalidar los 80 archivos en cada visita hacía que Trofaxis tardara unos 3 s en volver a abrir en 3G. Con caché primero tarda unos 0,2 s (medido el 2026-10-22 en un servidor local con 3G simulado: 562 ms de latencia y 1,44 Mbps; no es una medición con usuarios reales). En el campo, con señal débil, la app tampoco se queda esperando a una red que no responde.
- Al instalar una versión, el service worker pide cada archivo con `cache: 'no-cache'`. GitHub Pages permite que el navegador reutilice sus copias HTTP durante 10 minutos; sin esa revalidación, una versión publicada en ese lapso podría guardar archivos viejos y, como la app abre desde la caché, quedarse con ellos hasta la publicación siguiente.
- `CACHE_NAME` lleva los primeros 12 caracteres de un SHA-256 calculado sobre las rutas y contenidos del `APP_SHELL`. La prueba `tests/pwa.test.js` calcula ese valor y falla con el nombre esperado si cambia un archivo precargado y no se actualiza `CACHE_NAME`. Así el cambio del app shell también cambia `sw.js` y permite que el navegador descubra e instale la versión nueva. En la copia publicada, `npm run build` genera su propio `sw.js` con la lista de `dist/` y calcula `CACHE_NAME` con la misma regla.
- Al abrir Trofaxis, y al volver al frente (`visibilitychange` visible o `pageshow` persistido), se busca una actualización. Las búsquedas se limitan a una por minuto; al recuperar conexión también se revisa con el mismo límite.
- Cuando el navegador encuentra la versión nueva, la instala aparte y Trofaxis sigue abierta con la anterior hasta que la persona toca «Actualizar» o cierra por completo todas sus ventanas. Por eso, después de publicar, cada persona ve el cambio una visita más tarde que con una estrategia de red primero. Trofaxis muestra «Hay una versión nueva» y «Actualizar». No recarga por su cuenta: la persona toca el aviso. Si toca mientras tiene un campo de texto activo, Trofaxis le pide terminar o guardar primero y deja el aviso disponible. La recarga ocurre una sola vez después de activar el nuevo service worker. Si la persona tiene otra ventana abierta, esa muestra «Trofaxis se actualizó en otra ventana» y «Recargar», con la misma protección para lo que está escribiendo. Las claves `biogap:*`, la sesión y la finca local no se borran ni se modifican.
- En Android con Capacitor, `pwa.js` no se carga; esta comprobación de PWA aplica al navegador, iPhone instalado desde Safari y escritorio.
- Si el usuario vuelve a conectarse con sesión, la app compara la copia local con la nube o reintenta la subida pendiente. Si ambas copias cambiaron, conserva el conflicto existente para que el usuario elija; no pisa datos en silencio.

## Publicar y recuperar una versión

1. Diego no necesita hacer pasos manuales después de cada publicación: GitHub Actions publica cada cambio a `main` ([build.md](build.md)).
2. Si un cambio modifica archivos enumerados en `APP_SHELL`, ejecuta `npm test`. Si el hash cambió, la prueba informa el `CACHE_NAME` esperado; copia ese valor en `sw.js` y vuelve a correr las pruebas. Esa actualización de `sw.js` forma parte del mismo PR.
3. Si una app instalada sigue mostrando la versión anterior después de que GitHub Pages publique, ciérrala por completo y ábrela otra vez. Espera el aviso «Hay una versión nueva» y toca «Actualizar». No borres los datos del sitio ni la finca local.

## Comprobación manual antes de cerrar la fase

Usar la finca demostrativa o datos ficticios, nunca datos de una finca real.

### Escritorio

1. Abrir la versión de prueba con conexión (en `localhost`, con `?sw` en la dirección; sin eso el service worker no se registra) y esperar a que el service worker quede activo. Recargar una vez para que la pestaña quede controlada por él.
2. Confirmar que aparece la última finca guardada. Abrir las herramientas del navegador y activar el modo sin conexión.
3. Recargar: Trofaxis debe abrir con la copia local y mostrar el aviso sin conexión. Repetir sin sesión y con una sesión de prueba; comprobar el texto correspondiente.
4. Tomar una captura de la ventana completa en la que se lea el aviso y se vea la app.
5. Volver a conectar y comprobar el reintento de nube o, si hay dos copias distintas, la pantalla de conflicto.

### Móvil

1. Instalar la versión de prueba desde el navegador del teléfono y abrirla conectada. Esperar a que cargue la finca demostrativa y recargar una vez.
2. Activar el modo avión, cerrar y volver a abrir Trofaxis. Confirmar que carga la finca guardada y muestra el aviso sin conexión.
3. Tomar una captura de pantalla donde se vean el aviso y la app instalada.
4. Quitar el modo avión y confirmar la comparación o sincronización de nube.

Guardar las capturas de escritorio y teléfono con el PR de la fase. El emulador móvil del navegador ayuda a revisar el diseño, pero no reemplaza la comprobación de instalación y modo avión en un teléfono.
