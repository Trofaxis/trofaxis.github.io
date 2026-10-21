# Trofaxis sin conexión

Trofaxis sigue siendo un sitio estático publicado desde la raíz de `main` en GitHub Pages. `manifest.webmanifest` permite instalarlo y `sw.js` guarda el app shell para abrirlo sin red. La finca continúa en el `localStorage` de ese navegador o equipo con sus claves actuales; instalarla en otro navegador no copia los datos automáticamente.

## Caché y actualizaciones

- El app shell enumera la página, los estilos, iconos y módulos propios que necesita la app, incluidas las vistas que se cargan al abrirlas por primera vez. Una prueba confirma que incluya cada archivo `.js`, `.css` y `.woff2` dentro de `src/`.
- El manifiesto usa íconos normales y versiones maskable separadas. En las adaptables, el logo queda dentro de la zona central segura sobre un fondo sólido.
- El service worker solo atiende solicitudes `GET` del mismo origen y de esa lista. Primero consulta la red con `cache: 'no-cache'`, para que el navegador revalide su copia HTTP con el servidor y aproveche ETag cuando el archivo no cambió; luego guarda una respuesta nueva en la caché de Trofaxis. Si falla la conexión, usa la copia guardada. Las navegaciones siguen la misma regla. No intercepta ni guarda respuestas de Supabase, Open-Meteo ni del proveedor de mapas.
- `CACHE_NAME` lleva los primeros 12 caracteres de un SHA-256 calculado sobre las rutas y contenidos del `APP_SHELL`. La prueba `tests/pwa.test.js` calcula ese valor y falla con el nombre esperado si cambia un archivo precargado y no se actualiza `CACHE_NAME`. Así el cambio del app shell también cambia `sw.js` y permite que el navegador descubra e instale la versión nueva; no hace falta un build, una acción de GitHub ni un servicio externo.
- Al abrir Trofaxis, y al volver al frente (`visibilitychange` visible o `pageshow` persistido), se busca una actualización. Las búsquedas se limitan a una por minuto; al recuperar conexión también se revisa con el mismo límite.
- Cuando el navegador encuentra la versión nueva, Trofaxis muestra «Hay una versión nueva» y «Actualizar». No recarga por su cuenta: la persona toca el aviso. Si toca mientras tiene un campo de texto activo, Trofaxis le pide terminar o guardar primero y deja el aviso disponible. La recarga ocurre una sola vez después de activar el nuevo service worker. Las claves `biogap:*`, la sesión y la finca local no se borran ni se modifican.
- En Android con Capacitor, `pwa.js` no se carga; esta comprobación de PWA aplica al navegador, iPhone instalado desde Safari y escritorio.
- Si el usuario vuelve a conectarse con sesión, la app compara la copia local con la nube o reintenta la subida pendiente. Si ambas copias cambiaron, conserva el conflicto existente para que el usuario elija; no pisa datos en silencio.

## Publicar y recuperar una versión

1. Diego no necesita hacer pasos manuales después de cada publicación: GitHub Pages sigue publicando desde `main` como hoy.
2. Si un cambio modifica archivos enumerados en `APP_SHELL`, ejecuta `npm test`. Si el hash cambió, la prueba informa el `CACHE_NAME` esperado; copia ese valor en `sw.js` y vuelve a correr las pruebas. Esa actualización de `sw.js` forma parte del mismo PR.
3. Si una app instalada sigue mostrando la versión anterior después de que GitHub Pages publique, ciérrala por completo y ábrela otra vez. Espera el aviso «Hay una versión nueva» y toca «Actualizar». No borres los datos del sitio ni la finca local.

## Comprobación manual antes de cerrar la fase

Usar la finca demostrativa o datos ficticios, nunca datos de una finca real.

### Escritorio

1. Abrir la versión de prueba con conexión y esperar a que el service worker quede activo. Recargar una vez para que la pestaña quede controlada por él.
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
