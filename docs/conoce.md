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
├─ instalar.js     botón «Instalar Trofaxis» y pasos por navegador
├─ rueda-demo.js   geometría de la rueda del año (la misma de src/ui/rueda.js)
├─ datos-demo.js   GENERADO: números de la finca demostrativa, cifras y citas
└─ media/          videos, carteles y capturas de la app
scripts/conoce-datos.mjs   genera conoce/datos-demo.js
tests/conoce.test.js       29 pruebas
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

| Navegador | Qué hace el botón |
|---|---|
| Chrome y Edge (Windows, Mac, Linux, Android) | Abre el cuadro de instalación del navegador (evento `beforeinstallprompt`). Si la persona acepta, se registra el service worker para que la app abra sin conexión desde la primera vez. |
| Safari en Mac, iPhone y iPad | El navegador no ofrece ese cuadro: se muestran los tres pasos («Añadir al Dock» o «Añadir a pantalla de inicio»). |
| Firefox en computadora | No instala aplicaciones web: se dice así y se sugiere Chrome o Edge, o usarla en el navegador. |
| Ya instalada | El botón pasa a «Abrir Trofaxis». |

El navegador decide cuándo ofrece la instalación (exige HTTPS y un manifiesto válido). En `localhost` no se registra el service worker, igual que en `pwa.js`. **Pendiente de probar en el sitio publicado**: la instalación real desde `/conoce/` en Chrome y en Edge solo se puede confirmar con HTTPS.

## Iniciar sesión y crear cuenta

La app no tiene contraseñas: se entra con Google o con un enlace de un solo uso (`docs/nube.md`). Los enlaces «Iniciar sesión» y «Crear cuenta» abren `/?entrar`, que muestra la pantalla de entrada de la app aunque sea la primera visita o se hubiera elegido «seguir sin cuenta» (`entradaPedida` y `mostrarEntrada` en `src/core/cuenta.js`). La app quita `?entrar` de la dirección antes de iniciar sesión. Si en una primera visita la persona elige «seguir sin cuenta», continúa con la bienvenida normal.

## Pantalla de carga

La rueda del año de la finca demostrativa se arma mes a mes mientras cargan las tipografías y la imagen de la portada (2,2 s la primera vez, 0,9 s las siguientes en la misma sesión; tope de 4,2 s). Sigue al puntero, marca el mes señalado y tiene «Entrar ya». También aparece, con «Abriendo Trofaxis», al pasar a la app. Si el JavaScript no llega, se quita sola a los 7 s; sin JavaScript no se muestra.

## Movimiento y peso

- Todas las animaciones y transiciones están dentro de `@media (prefers-reduced-motion:no-preference)`. Con «reducir movimiento» no se descarga ningún video: quedan las imágenes fijas. Hay un botón «Pausar movimiento».
- Los videos van mudos, sin `autoplay` en el HTML y con `preload="none"`: `conoce.js` los carga cuando entran en pantalla. Con ahorro de datos (`saveData`) no se cargan. En pantallas angostas la portada usa el video de 480p.
- Presupuesto con prueba: `conoce/media` ≤ 12 MB en total (hoy 10 MB), cada video ≤ 4 MB, cada imagen ≤ 200 KB.

## Seguridad

Política de contenido propia en el HTML: todo `'self'`. No hay guiones ni estilos en línea, ni recursos de otros dominios (las tipografías son las de `src/fonts/`). La página no hace peticiones a ningún servidor ni guarda datos de quien la visita; solo recuerda en `sessionStorage` que ya mostró la pantalla de carga.

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
