# Trofaxis sin conexión

Trofaxis sigue siendo un sitio estático publicado desde la raíz de `main` en GitHub Pages. `manifest.webmanifest` permite instalarlo y `sw.js` guarda el app shell para abrirlo sin red. La finca continúa en el `localStorage` de ese navegador o equipo con sus claves actuales; instalarla en otro navegador no copia los datos automáticamente.

## Caché y actualizaciones

- El app shell enumera la página, los estilos, iconos y módulos propios que necesita la app, incluidas las vistas que se cargan al abrirlas por primera vez. Una prueba confirma que incluya cada archivo `.js`, `.css` y `.woff2` dentro de `src/`.
- El manifiesto usa íconos normales y versiones maskable separadas. En las adaptables, el logo queda dentro de la zona central segura sobre un fondo sólido.
- El service worker solo atiende solicitudes `GET` del mismo origen y de esa lista. Primero consulta la red y actualiza la copia guardada con la respuesta recibida; solo usa la copia guardada si falla la conexión. Las navegaciones también prueban la red primero y, si no está disponible, abren la página guardada. No intercepta ni guarda respuestas de Supabase, Open-Meteo ni del proveedor de mapas.
- `CACHE_NAME` identifica la caché propia de Trofaxis para que el service worker pueda retirar cachés anteriores. No es necesario cambiarlo en cada despliegue: cada recurso se actualiza en caché cuando se solicita con conexión, aunque el nombre de la caché no cambie. Los recursos que aún no se solicitan conservan su copia anterior hasta que se consulten conectados. El aviso de versión nueva depende de que cambie `sw.js`, no del nombre de caché.
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
