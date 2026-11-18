# Página de presentación (`/conoce/`)

Página pública que explica qué es Trofaxis, con un botón «Instalar Trofaxis» y enlaces para iniciar sesión o crear cuenta. Vive en `https://trofaxis.github.io/conoce/`. La app sigue en la raíz (`/`): su instalación, su inicio de sesión con Google y su service worker no cambian. Decisión de Diego del 2026-11-14.

La estructura comercial (pantalla de carga, portada con video, prueba de confianza, temas, pasos, comparación, cifras, planes, preguntas) sigue la de páginas de agrotecnología como la de Kaax. Los textos, los colores, la tipografía y las imágenes son de Trofaxis: no se tomó ninguna frase ni recurso de otra página.

## Archivos

```
conoce/
├─ index.html      contenido; se lee completo sin JavaScript
├─ conoce.css      estilos (mismos colores y tipografías de la app)
├─ sin-js.css      solo sin JavaScript: quita la pantalla de carga
├─ conoce.js       pantalla de carga, videos, temas, rueda, cifras
├─ instalar.js     botón «Instalar Trofaxis»: un clic, sin listas de pasos
├─ rueda-demo.js   geometría de la rueda del año (la misma de src/ui/rueda.js)
├─ datos-demo.js   GENERADO: números de la finca demostrativa, cifras y citas
└─ media/          videos, carteles y capturas de la app
scripts/conoce-datos.mjs   genera conoce/datos-demo.js
tests/conoce.test.js       35 pruebas
```

No usa dependencias ni compilación. `npm run build` la copia tal cual a `dist/conoce/`. No entra en el app shell del service worker: los videos no ocupan el almacenamiento de la app instalada.

Verla en local: `python3 -m http.server 8000` y abrir `http://localhost:8000/conoce/`.

## Regla principal: la página no dice nada que la app no respalde

- **Números.** El índice (69), los cinco temas, los doce meses de la rueda y las seis cifras de «Evidencia» salen de `conoce/datos-demo.js`, que genera `node scripts/conoce-datos.mjs` con el motor de la app y la finca demostrativa (ficticia), los catálogos y el cerebro. El HTML trae los mismos valores escritos, para que se lean sin JavaScript; una prueba compara cada `data-dato` con el archivo generado y el archivo con el motor. Si cambia una fórmula, un catálogo o el cerebro: correr el script y, si la prueba lo pide, corregir el número en el HTML.
- **Citas.** Las tres frases son citas textuales verificadas en el cerebro (`src/cerebro/tesis.js`), con su tesis y su página. El script falla si una deja de estar verificada. La de Osorio empieza a mitad de oración y por eso lleva «[…]».
- **Rueda del año.** Usa la geometría de `src/ui/rueda.js`. Una prueba comprueba que cada trazo de la rueda de la página existe, idéntico, en la rueda de la app para la finca demostrativa. La rueda de la pantalla de carga enciende los mismos meses (también con prueba).
- **Finca demostrativa.** Siempre se muestra como «Ejemplo» y con la nota «Datos ficticios».
- **Capturas.** `app-inicio`, `app-movil`, `paso-cuestionario`, `paso-urgente` y `paso-auditoria` son capturas reales de la app con la finca demostrativa (2026-11-14, Chromium, 1440×900 y 390×844, tema claro, sin red para mapa, clima ni nube). Si la app cambia de aspecto, hay que volver a tomarlas.

### Lo que la página no dice, y por qué

| Tema | Qué dice hoy | Por qué |
|---|---|---|
| Precios | «Sin costo durante el piloto» y «Por definir» | Los planes de pago no están definidos. No se inventó ningún precio. |
| Clientes y testimonios | Nada | No hay usuarios que se puedan citar. Rajuanse Estates no se nombra sin permiso. |
| Logos de respaldo | Nada | Zamorano y CADS solo aparecen dentro de las referencias de las tesis. Usar su nombre o su logo como respaldo requiere permiso. |
| GLOBALG.A.P. | «Alineado a GLOBALG.A.P. IFA v6» y «Trofaxis no está afiliada ni avalada por GLOBALG.A.P.» | Es la norma a la que apunta la app; no hay relación con su titular. |
| Confiabilidad | «Es un prototipo» y «criterio propio» | Los pesos y parte de los umbrales están por calibrar (`docs/formulas.md`). |
| Cultivos, integraciones | Nada | La app no tiene una lista de cultivos ni integraciones que mostrar. |

Una prueba impide agregar precios, nombres de usuarios reales o frases de aval sin tocar también la prueba.

## Instalar Trofaxis

La página enlaza el manifiesto de la app (`/manifest.webmanifest`, alcance `/`). Lo que se instala es Trofaxis, que abre en `/`, no la página.

**Regla (Diego, 2026-11-15): instalar es un clic. La página no muestra listas de pasos en ningún navegador.** Una prueba falla si vuelve a aparecer una lista en la sección «Instalar» o en la hoja del botón.

| Caso | Qué hace el botón |
|---|---|
| Chrome y Edge con la oferta del navegador (`beforeinstallprompt`) | «Instalar Trofaxis» abre el cuadro de instalación del navegador. La persona confirma ahí y la pestaña pasa a ser la ventana de la app: la página entra sola a Trofaxis (`/`). Al aceptar se registra el service worker para que la app abra sin conexión desde la primera vez. |
| Navegador con `navigator.install()` (Web Install API) | Igual, sin depender de la oferta. Si ya estaba instalada, el navegador la abre. |
| Chrome o Edge de computadora sin oferta | El navegador no avisa a la página cuando la app ya está instalada: simplemente no manda la oferta. Pasado el plazo, el botón dice «Abrir Trofaxis», un clic la abre en su propia ventana y la página dice que ya está instalada (ver «Ya instalada» abajo). |
| iPhone, iPad, Safari en Mac, Firefox en Android, otros | Ningún sitio puede instalar desde un botón. Se muestra una hoja con **un gesto en una frase** (en iPhone, el ícono de Compartir y «Agregar a Inicio») y el botón «Abrir Trofaxis ahora». |
| Android sin oferta todavía | La misma hoja con el gesto del menú. Si la oferta llega con la hoja abierta, la hoja cambia a «Ya puedes instalarla» con el botón «Instalar Trofaxis». |
| Firefox en computadora | No instala aplicaciones web. El botón dice «Abrir Trofaxis» desde el principio y la abre en la misma pestaña. |
| Dentro de la app instalada | «Abrir Trofaxis» lleva a `/`. |

Un clic que llega antes que la oferta la espera («Preparando…») en vez de perderse. Si la persona cancela el cuadro del navegador, se le dice y el botón sigue sirviendo.

### Ya instalada: que no parezca que instalar falló

Diego lo probó publicado el 2026-11-15 en una computadora donde Trofaxis ya estaba instalada: el botón la abrió en su ventana y él entendió que «no se instala». La página no decía por qué. Ahora, cuando el botón abre la app en vez de instalarla:

- junto a los botones de la portada y en la sección «Instalar» aparece «Trofaxis ya está instalada en este equipo.»;
- el aviso al abrirla dice «Trofaxis ya está instalada en este equipo. La abrimos.».

La página no puede preguntarle al navegador si la app está instalada. Lo sabe por una marca en `localStorage` (`biogap:instalada:v1`) que deja la app (`pwa.js`) cuando corre en su propia ventana o cuando el navegador confirma la instalación, y que se borra cuando el navegador vuelve a ofrecer instalarla. Con la marca, el botón dice «Abrir Trofaxis» desde que carga la página. Sin ella (app instalada antes de este cambio), la página lo presume pasado el plazo y lo dice así: «Tu navegador no ofrece instalarla aquí: lo usual es que ya esté instalada en este equipo.»; al abrirse la app en su ventana deja la marca y el texto pasa a ser el seguro.

Otras formas de saberlo, probadas y descartadas en Chromium 153: `getInstalledRelatedApps()` devuelve vacío, y abrir la app con `window.open` **sin** `noopener` para preguntarle a la ventana nueva no sirve, porque entonces el navegador la abre como pestaña normal y no en la ventana de la app.

### Por qué salían instrucciones (causa, 2026-11-15)

La versión anterior mostraba tres pasos cada vez que el navegador no mandaba la oferta, y además una lista «Cómo se instala» fija en la sección. El caso más común sin oferta en Chrome y Edge es que **Trofaxis ya está instalada en ese equipo**: quien ya la tenía veía «Instalar Trofaxis» y, al pulsar, una lista de pasos. Reproducido en Chromium 153.

### Lo que se midió y lo que no

Probado en Chromium 153 de escritorio (Linux, ventana real, con el bloqueo de ventanas emergentes activo), 2026-11-15:

- Perfil nuevo: la oferta llega en menos de 1 s después de cargar, sin ninguna interacción previa. La guía de web.dev (<https://web.dev/articles/install-criteria>, actualizada el 2024-09-19) todavía habla de un clic y 30 s de uso; en escritorio no se observó ese requisito. **En Android no se midió.**
- Un clic en «Instalar Trofaxis» abre el cuadro del navegador; al aceptar, la ventana de la app queda abierta en `/`.
- Con la app ya instalada no llega ninguna oferta. `window.open('/', '_blank', 'noopener')` desde el clic abre la ventana de la app instalada.
- Con la marca de la app, la página dice «ya está instalada» desde que carga. Sin la marca lo presume a los 4 s y, al abrir la app, el texto pasa al seguro en menos de 1 s.
- `navigator.getInstalledRelatedApps()` devolvió una lista vacía con la app instalada (con `related_applications` en el manifiesto, URL relativa y absoluta), así que no sirve para saber si ya está instalada. No se usa.

Sin probar: Chrome en Android, iPhone y Safari reales, Edge, Firefox, y `navigator.install()` sin opciones experimentales (envío previsto para Chrome 156 de escritorio, fecha estimada; aviso de envío del 2026-09-21 en blink-dev: <https://groups.google.com/a/chromium.org/d/msgid/blink-dev/dc40448e-61c3-468f-929c-b17bfa21771fn%40chromium.org>). Estos casos solo tienen pruebas con un navegador simulado (`tests/conoce.test.js`). En `localhost` no se registra el service worker, igual que en `pwa.js`.

### Tiempos (criterio propio)

Están como constantes en `conoce/instalar.js`:

| Constante | Valor | Para qué |
|---|---|---|
| `GRACIA_MS` | 4000 ms | Plazo desde que carga la página para dar por hecho que el navegador no va a ofrecer la instalación. La oferta medida llega en menos de 1 s; el resto es margen para redes lentas. Si llega después, el botón vuelve a «Instalar Trofaxis». |
| `ESPERA_OFERTA_MS` | 2500 ms | Cuánto espera un clic temprano. Queda por debajo del tiempo que el navegador da a un clic para abrir una ventana (unos 5 s en Chromium); abrir la app después de esa espera se probó. |
| `AVISO_VISIBLE_MS` | 8000 ms | Cuánto se ve el aviso («Trofaxis quedó instalada…»). |

### Límites que la página no puede saltar

- El cuadro «Instalar» lo pone el navegador y exige que la persona confirme. Ninguna página puede instalar sin esa confirmación.
- En iPhone y iPad, Apple no permite que un sitio se instale desde un botón: el mínimo son dos toques desde Compartir. Con un solo toque solo se llega por la App Store.
- Riesgo aceptado: si en una computadora nunca se instaló y aun así el navegador no manda la oferta (casos no medidos; por ejemplo, una ventana de incógnito), «Abrir Trofaxis» la abre en una pestaña. Funciona igual, pero no queda instalada.
- La descarga con un clic «de tienda» depende de publicar en Microsoft Store y Google Play (`docs/microsoft-store.md`, `docs/android.md`).

## Iniciar sesión y crear cuenta

La app no tiene contraseñas: se entra con Google o con un enlace de un solo uso (`docs/nube.md`). Los enlaces «Iniciar sesión» y «Crear cuenta» abren `/?entrar`, que muestra la pantalla de entrada de la app aunque sea la primera visita o se hubiera elegido «seguir sin cuenta» (`entradaPedida` y `mostrarEntrada` en `src/core/cuenta.js`). La app quita `?entrar` de la dirección antes de iniciar sesión. Si en una primera visita la persona elige «seguir sin cuenta», continúa con la bienvenida normal.

## Pantalla de carga

La rueda del año de la finca demostrativa se arma mes a mes mientras cargan las tipografías y la imagen de la portada (2,2 s la primera vez, 0,9 s las siguientes en la misma sesión; tope de 4,2 s). Sigue al puntero, marca el mes señalado y tiene «Entrar ya». También aparece, con «Abriendo Trofaxis», al pasar a la app. Si el JavaScript no llega, se quita sola a los 7 s; sin JavaScript no se muestra.

## Movimiento y peso

- Todas las animaciones y transiciones están dentro de `@media (prefers-reduced-motion:no-preference)`. Con «reducir movimiento» no se descarga ningún video: quedan las imágenes fijas. Hay un botón «Pausar movimiento».
- Los videos van mudos, sin `autoplay` en el HTML y con `preload="none"`: `conoce.js` los carga cuando entran en pantalla. Con ahorro de datos (`saveData`) no se cargan. En pantallas angostas la portada usa el video de 480p.
- Presupuesto con prueba: `conoce/media` ≤ 12 MB en total (hoy 10 MB), cada video ≤ 4 MB, cada imagen ≤ 200 KB.

## Seguridad

Política de contenido propia en el HTML: todo `'self'`. No hay guiones ni estilos en línea, ni recursos de otros dominios (las tipografías son las de `src/fonts/`). La página no hace peticiones a ningún servidor ni guarda datos de quien la visita. Solo recuerda dos cosas, en el propio equipo: en `sessionStorage`, que ya mostró la pantalla de carga; y en `localStorage`, la marca `biogap:instalada:v1` (Trofaxis está instalada en este equipo), la misma que deja la app. Una prueba falla si la página usa `localStorage` para cualquier otra cosa.

## Videos

Son videos de archivo: **no muestran fincas de Honduras ni usuarios de Trofaxis**, y la página no dice que lo sean. El pie los acredita («Videos de Mixkit y Pixabay»).

| Archivo | Fuente | Licencia |
|---|---|---|
| `portada-720.mp4`, `portada-480.mp4` (montaje de 4 tomas) | Mixkit 827, «A road between a big green agriculture field»: https://mixkit.co/free-stock-video/a-road-between-a-big-green-agriculture-field-827/ | Mixkit Stock Video Free License |
| | Pixabay 246479, «Plantation, Trees, Drone», de ammarvid: https://pixabay.com/videos/plantation-trees-drone-nature-246479/ | Pixabay Content License |
| | Pixabay 300448, «Banana Field, Banana, Flycam», de chuduyen215: https://pixabay.com/videos/banana-field-banana-flycam-green-300448/ | Pixabay Content License |
| | Pixabay 333648, «Plantation, Palm, Malaysia», de VCOMAR: https://pixabay.com/videos/plantation-palm-malaysia-333648/ | Pixabay Content License |
| `tema-polinizadores.mp4` | Pixabay 110865, «Bee, Insect, Honey Bee», de Charly4u: https://pixabay.com/videos/bee-insect-honey-bee-nature-bees-110865/ | Pixabay Content License |
| `tema-agua.mp4` | Pixabay 87793, «Mountain, Field, Irrigation», de Camera-man: https://pixabay.com/videos/mountain-field-irrigation-water-87793/ | Pixabay Content License |
| `tema-fertilizacion.mp4` | Pixabay 339460, «Coffee Trees, Coffee, Trees», de kanz10102002: https://pixabay.com/videos/coffee-trees-coffee-trees-nature-339460/ | Pixabay Content License |
| `tema-suelo.mp4` | Mixkit 2851, «A person sowing a seed»: https://mixkit.co/free-stock-video/a-person-sowing-a-seed-2851/ | Mixkit Stock Video Free License |
| `tema-troficas.mp4` | Mixkit 2788, «Aerial view of a forest with cabins»: https://mixkit.co/free-stock-video/aerial-view-of-a-forest-with-cabins-2788/ | Mixkit Stock Video Free License |
| `cierre-720.mp4` | Mixkit 100409, «Lush green mountains beneath misty skies»: https://mixkit.co/free-stock-video/lush-green-mountains-beneath-misty-skies-100409/ | Mixkit Stock Video Free License |

Los carteles (`.webp`) y `compartir.jpg` son fotogramas de esos mismos videos. Ninguna de las diez páginas marca su video como generado con inteligencia artificial (revisado en el texto de cada página).

### Qué se verificó de las licencias

- **Mixkit (2026-11-14).** La página de cada uno de los cuatro videos dice: «Download this free stock video clip for commercial or personal use, under the Mixkit Stock Video Free License». Se descartaron los videos de Mixkit que dicen «for personal use only» (Mixkit Restricted License). **No verificado:** el texto completo de esa licencia (https://mixkit.co/license/ solo mostró los títulos), que es el que define el uso en sitios web y si pide atribución. Los términos de uso (https://mixkit.co/terms/) no traen ese texto; entre lo que prohíben está vender copias de los videos sin transformarlos y ponerlos a disposición de terceros.
- **Pixabay (2026-11-15).** La página de cada uno de los seis videos dice «Free for use under the Pixabay Content License». El resumen de esa licencia (https://pixabay.com/service/license-summary/) permite: «Use Content for free», «Use Content without having to attribute the author» y «Modify or adapt Content into new works». Prohíbe, entre otras cosas, vender o distribuir el contenido tal cual («on a Standalone basis»), usarlo «in a misleading or deceptive way», usarlo con fines comerciales si muestra marcas o logos reconocibles, y usarlo como parte de una marca. **No verificado:** el texto completo (https://pixabay.com/service/terms/), que según el resumen es el único vinculante.
- **Cómo cumple la página.** Los videos van recortados, comprimidos y montados dentro de la página, no se ofrecen para descargar, no muestran marcas ni personas reconocibles (son paisajes, cultivos, una abeja, aspersores y unas manos sembrando) y la página no los presenta como fincas de Trofaxis. El crédito del pie es voluntario.
- Antes de cobrar por Trofaxis o de pagar publicidad con esta página, conviene leer el texto completo de las dos licencias. El reemplazo natural son videos propios de fincas reales, con permiso de sus dueños.

### Cómo se comprimieron

`ffmpeg` con `libx264`, perfil alto, 24 cuadros por segundo, sin audio, `-movflags +faststart` y reducción suave de ruido (`hqdn3d`):

| Video | Tamaño | CRF | Tope de tasa | Duración |
|---|---|---|---|---|
| Portada | 1280×720 | 28 | 1900 kb/s | 15,8 s (4 tomas de 4,4 s con fundidos de 0,6 s) |
| Portada chica | 854×480 | 29 | 800 kb/s | igual |
| Temas | 960×540 | 28 | 950 kb/s | 7 s cada uno |
| Cierre | 1280×720 | 29 | 1300 kb/s | 12 s |

Carteles en WebP, calidad 55 a 70; capturas de la app en WebP, calidad 82. Los originales (unos 900 MB) no están en el repositorio.

## Al publicar o cambiar de dominio

- La página usa direcciones absolutas de `https://trofaxis.github.io` en la dirección canónica y en las etiquetas para compartir (`og:url`, `og:image`). Con dominio propio hay que cambiarlas.
- Antes del lanzamiento, verificar la marca de la app en Google (nombre y logo en «Elegir cuenta»): requiere dominio propio.
- Los planes y precios se anuncian en la sección «Planes»; al definirlos, actualizar también la pregunta «¿Cuánto cuesta?».
- Si Trofaxis se cobra, revisar antes [docs/licencias.md](licencias.md): mapa (EOX), clima (Open-Meteo), nube (Supabase), valores del PPDB y los videos de esta página.
