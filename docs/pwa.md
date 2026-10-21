# Trofaxis sin conexión

Trofaxis sigue siendo un sitio estático publicado desde la raíz de `main` en GitHub Pages. `manifest.webmanifest` permite instalarlo y `sw.js` guarda el app shell para abrirlo sin red. La finca continúa en el `localStorage` de ese navegador o equipo con sus claves actuales; instalarla en otro navegador no copia los datos automáticamente.

## Caché y actualizaciones

- El app shell enumera la página, los estilos, iconos y módulos propios que necesita la app, incluidas las vistas que se cargan al abrirlas por primera vez.
- El service worker solo atiende solicitudes `GET` del mismo origen y de esa lista. No intercepta ni guarda respuestas de Supabase, Open-Meteo ni del proveedor de mapas.
- En cada despliegue se debe cambiar `CACHE_NAME` en `sw.js`. Esa etiqueta provoca que el navegador instale el app shell nuevo; luego elimina las versiones anteriores. Sin cambiarla, un navegador podría conservar archivos viejos.
- Cuando el navegador detecta la versión nueva, Trofaxis muestra «Hay una versión nueva» y el botón «Actualizar». El usuario elige cuándo recargar.
- Si el usuario vuelve a conectarse con sesión, la app compara la copia local con la nube o reintenta la subida pendiente. Si ambas copias cambiaron, conserva el conflicto existente para que el usuario elija; no pisa datos en silencio.

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
