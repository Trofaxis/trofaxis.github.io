# Trofaxis en tiendas de apps: auditoría y plan

**Fase:** 0, auditoría sin cambios de código  
**Fecha de auditoría:** 2026-10-20  
**Fuentes de código:** `Trofaxis/trofaxis.github.io` (`main`, `84b82bdb`) y `diegoguevara912-pixel/trofaxis-admin` (`main`, ver PRs relacionados abajo).

## Decisiones y límites recibidos de Diego

- Mantener el motor, las rúbricas, fórmulas, validaciones y casos actuales. No cambiar los resultados de cálculo.
- Migrar JavaScript a TypeScript gradualmente: archivos nuevos en `.ts`, `strict` activo y los archivos existentes solo se migran con pruebas verdes y comportamiento idéntico.
- Usar Capacitor para Android e iOS, PWA empaquetada como MSIX con PWABuilder para Windows y GitHub Pages para la web.
- Un PR por fase. No hacer push a `main`, no unir PRs y detener el trabajo al final de cada fase para esperar aprobación.
- Mantener las claves `biogap:` y los formatos `biogap-finca` y `biogap-mapa`.
- No editar producción de Supabase ni ejecutar SQL. Las migraciones futuras se entregan como archivos nuevos para que Diego las aplique.
- No añadir información real a la finca de ejemplo ni modificar o debilitar pruebas.
- Preservar los archivos que el panel carga desde la app publicada: `src/nube/cliente.js`, `src/admin/cerebro.js`, `src/styles.css` y `src/admin/cerebro.css`.

## Estado real de los repositorios

### App web

`trofaxis.github.io` es una aplicación estática de módulos ES nativos. `index.html` carga `src/app.js` y `src/styles.css`; el punto de entrada conecta el estado de la finca con vistas y módulos de dominio. `src/core/engine.js`, `src/core/rubrica.js`, `src/core/config.js` y `src/modules/` contienen el cálculo. Hay pruebas de regresión para el motor en `tests/engine.test.js`; la constante `EXPECT_DEMO` fija los resultados de la finca demostrativa.

Hoy no hay bundler, `tsconfig`, manifiesto PWA, service worker ni proyecto Capacitor. `package.json` solo declara `npm test` y no tiene dependencias de ejecución ni de desarrollo. GitHub Pages publica directamente desde `main`. La app usa JavaScript, HTML y CSS estáticos, con servicios externos opcionales para Supabase, Open-Meteo y las teselas del mapa EOX.

### Panel de administración

`trofaxis-admin` es otro sitio estático, con otro origen, otra sesión de navegador y su propio `index.html`, `src/main.js`, `src/nube.js` y `src/vistas.js`. Tampoco tiene build ni dependencias npm. `src/main.js` importa en tiempo de ejecución `src/nube/cliente.js` y `src/admin/cerebro.js` desde `https://trofaxis.github.io`; `index.html` carga desde la misma app las hojas `src/fonts/fuentes.css`, `src/styles.css` y `src/admin/cerebro.css`.

**Contrato de publicación:** cualquier build de la app debe conservar esas cuatro URLs públicas con contenido, rutas, MIME y dependencias ESM utilizables por el panel. En particular, cambiar la publicación a `dist/` sin copiar `src/` a la raíz publicada rompería los imports del panel. Los archivos y sus rutas públicas no se renombrarán ni moverán. Una prueba de contrato debe comprobar que cada URL responde y que el panel todavía puede cargar sus módulos y estilos.

### PRs ajenos abiertos al inicio de la auditoría

Se revisó el estado y los archivos de cada PR. No se trabajó en esas ramas ni se modificaron sus archivos.

| Repo y PR | Archivos que toca | Tratamiento en esta fase |
|---|---|---|
| [App #115](https://github.com/Trofaxis/trofaxis.github.io/pull/115), menú de 4 tareas | `index.html`, `src/app.js`, `src/styles.css`, vistas y prueba de grupos | Intacto. Este documento nuevo no coincide con esos archivos. |
| [App #116](https://github.com/Trofaxis/trofaxis.github.io/pull/116), documentación del guardado en nube | `README.md`, `docs/nube.md`, `privacidad/index.html`, `tests/docs-nube.test.js` | Intacto. Este documento nuevo no coincide con esos archivos. |
| [Panel #5](https://github.com/diegoguevara912-pixel/trofaxis-admin/pull/5), SQL 003 y lista blanca | workflow, `README.md`, SQL, `src/vistas.js` y pruebas SQL | Intacto. Ningún cambio de esta fase se hace en el repo del panel. |

El código actual de `src/app.js` ya sube automáticamente la finca, con sesión, después de los cambios y una espera; al entrar primero compara la finca local con la nube y no pisa una diferencia sin resolver. Sin embargo, `docs/nube.md` en `main` todavía describe el guardado manual; el PR #116 documenta la diferencia. Para este plan se toma el código de `main` como comportamiento y se deja el PR #116 a su autor y a Diego.

### Línea base de pruebas

- App, commit `84b82bdb`: `npm test` pasa con 467 pruebas y 0 fallos.
- Panel, rama `main`: 8 pruebas pasan y una falla en `tests/vistas.test.js` en Windows porque el test construye una ruta `C:\C:\...` al leer `new URL('..', import.meta.url).pathname`. El fallo es del test/plataforma y no se modificó en esta auditoría. Debe corregirse en una tarea propia antes de usar el resultado completo del panel como criterio de CI; no se atribuye a los PR abiertos.

## Cómo se guardan los datos hoy

- **Finca y preferencias locales:** autoguardado en `localStorage` bajo `biogap:v1`. Incluye datos de finca, módulos y umbrales ajustables, plantillas, acciones marcadas, tema, borradores y datos de riego guardables. La clave queda bajo el origen del navegador; no se sincroniza entre navegador web y WebView nativo por sí sola.
- **Casos propios:** `biogap:casos:v1`.
- **Bienvenida:** `biogap:bienvenida:v1`.
- **Sesión Supabase:** `biogap:sesion:v1`, con token de acceso y token de renovación. La cuenta recordada usa `biogap:cuenta:v1`.
- **Mapa y censo:** `biogap:mapa:v1`, separado de la finca. Guarda punto, contorno, árboles y sitios; sus coordenadas exactas permanecen localmente. Su respaldo separado usa el formato `biogap-mapa`.
- **Respaldo de finca:** JSON con formato `biogap-finca`, versión 1. Incluye la finca, preferencias y plantillas, pero no el mapa/censo exacto. Importar valida los campos antes de incorporarlos.
- **Clima:** la consulta de Open-Meteo usa coordenadas redondeadas a dos decimales (aproximadamente 1 km) y guarda una caché local. Las solicitudes de teselas del mapa revelan al servidor de EOX qué zona del mapa se está consultando; la política actual ya lo menciona.

Las claves y formatos anteriores son contratos de compatibilidad. No cambiar, renombrar ni reutilizar como claves nuevas. Al instalar la versión móvil, el almacenamiento local nativo será independiente del almacenamiento del navegador. La finca puede recuperarse mediante la nube o el archivo JSON, pero el mapa/censo requiere además su respaldo propio; el primer inicio nativo debe explicarlo y ofrecer una ruta de importación sin borrar el origen.

## Login, nube y privacidad

- La nube es opcional. El usuario puede seguir sin cuenta y usar la finca local.
- La app permite Google OAuth y enlace de un solo uso por correo, sin contraseña. `src/nube/cliente.js` usa REST de Supabase mediante `fetch`; no incorpora `supabase-js`. El proveedor de Google y el correo llegan a Supabase Auth; la app guarda su sesión localmente y renueva el token cuando hace falta.
- El enlace de vuelta del login web llega al URL de GitHub Pages y la app lee la sesión del fragmento de URL. En Capacitor hay que integrar el navegador de sistema y el retorno mediante App Links/Universal Links o un esquema nativo. Las URLs de retorno permitidas de Supabase y Google deben configurarse para cada plataforma; no asumir que el callback web actual funcionará dentro de una WebView.
- Con sesión, una finca privada por usuario se guarda en Supabase con RLS; la app también compara las copias local y nube y presenta conflicto si ambas cambiaron. Los casos de comunidad solo se comparten con consentimiento explícito y son anonimizados por la app.
- La clave publicable de Supabase puede estar en código cliente; `service_role`, secretos de OAuth y llaves de firma nunca deben estar en el repo ni en el binario. Cualquier operación administrativa futura debe ejecutarse en un servidor/Edge Function con secretos configurados por Diego.
- La privacidad actual describe finca, ubicación, clima, mapa, nube y servicios externos en `privacidad/index.html`. Antes de las tiendas se debe revisar cada flujo móvil, las declaraciones de Apple y Google y los permisos del sistema contra el código real.

### Riesgos de publicación y datos

| Cambio | Qué puede romper | Criterio para darlo por seguro |
|---|---|---|
| Vite o cualquier build y cambio de publicación | Ruta raíz de GitHub Pages, archivos relativos, CSP, carga ESM del panel y las cuatro URLs que este importa en vivo | Publicación de prueba con la raíz web existente, archivos públicos intactos y pruebas automatizadas de rutas/estilos/imports del panel. |
| Capacitor y nuevo origen de almacenamiento | `localStorage` de los usuarios no se comparte automáticamente con el navegador; archivos, importación/exportación, mapas, GPS, enlaces de login y permisos cambian en móvil | Pruebas de instalación/actualización en Android y iOS; importación de ambos respaldos; nube y login con redirección completa; sin limpiar ni sobreescribir datos del navegador. |
| TypeScript gradual | Tipos equivocados pueden alterar entradas/salidas o rutas de módulos si se aprovecha la migración para refactorizar | Empezar con un módulo auxiliar nuevo, `strict: true`, pruebas de contrato y resultados idénticos; migrar JS existente solo en PRs posteriores, pequeños y con pruebas verdes. |
| PWA + MSIX | Cache de service worker obsoleta, instalación incompleta, offline defectuoso y fallo de certificación de Store | HTTPS, manifiesto e iconos válidos, service worker con actualización controlada, prueba offline de funciones locales y paquete validado por PWABuilder. |
| Privacidad y borrado de cuenta | Mostrar datos de finca en administración, declarar de forma incorrecta la recolección o dejar datos de Auth/finquero/casos después de una solicitud | Revisar las salidas contra la regla de no mostrar nombre/ubicación/correo; borrado probado en entorno local/de prueba; declaraciones alineadas con política y código. Nunca ejecutar migraciones en producción desde Codex. |
| Fórmulas, pesos o datos demostrativos | Cambia el resultado científico o la referencia congelada | Sin cambios de fórmula; `npm test` verde y `EXPECT_DEMO` idéntico. Si una futura solicitud toca cálculos, detenerse y pedir la fuente y aprobación de Diego. |

### Hallazgos que bloquean la publicación en tiendas

1. **Borrado de cuenta.** La app puede crear cuentas (Google y OTP con `create_user: true`), pero el código revisado no ofrece borrado de la cuenta Auth ni una página pública para solicitarlo. Apple exige que las apps que crean cuentas permitan iniciar el borrado dentro de la app. Google Play exige una ruta dentro de la app y una URL web externa, además de eliminar los datos asociados. Esto necesita diseño y pruebas antes de enviar a tiendas; el cliente nunca debe recibir `service_role`.
2. **Inicio de sesión en iOS.** Apple pide una opción equivalente con protección de privacidad cuando Google u otro login social autentica la cuenta principal. Como Trofaxis ofrece Google para esa cuenta, planificar `Sign in with Apple` para iOS y validarlo con las reglas vigentes de App Review; el enlace por correo no se debe asumir como excepción.
3. **App Store 4.2.** Apple puede rechazar una app que solo empaquete un sitio. El producto debe conservar utilidad y una experiencia adecuada al dispositivo: flujos de archivo, navegación/retorno, accesibilidad, permisos oportunos y funcionamiento local/offline deben probarse en un dispositivo real. Esto no garantiza aceptación; la decisión final es de Apple.
4. **Privacidad y datos de tienda.** Google exige completar Data safety y las declaraciones de borrado; Apple pide los detalles de privacidad y una política accesible; Microsoft requiere certificación y datos/listado de Store. La política debe mencionar Supabase Auth y almacenamiento en nube, la ubicación aproximada enviada a Open-Meteo y la carga de teselas de EOX. No declarar que no se recopilan datos solo porque la finca se guarda localmente por defecto.
5. **Privacidad del panel.** El SQL actual `001_admin.sql` quita solo algunas claves exactas del primer nivel antes de devolver la finca, y la vista puede mostrar el JSON recibido en «Datos completos». El PR #5 propone la lista blanca y el filtrado profundo en `003_admin_fincas_lista_blanca.sql`; está abierto y no se aplicó desde esta tarea. No tocar su PR ni aplicar SQL en producción. El código de `src/vistas.js` también muestra el correo de la sesión administradora en el encabezado; confirmar para la fase de privacidad si la regla de no mostrar correo incluye también el del propio administrador.

## Arquitectura recomendada y fases siguientes

**Decisión propuesta para esta migración:** introducir Vite como build acotado y mantener `src/` en la raíz del artefacto de GitHub Pages como fuentes ESM públicas del panel. Vite facilitaría compilar los `.ts` nuevos y generar assets para Capacitor, pero solo se adopta si la prueba del contrato del panel demuestra que las rutas remotas siguen intactas. La app web no se reescribe y el motor sigue sin cambios. Volver a evaluar la versión estable de Capacitor y los requisitos de las tiendas al iniciar cada fase.

### Fase 1 — Build reproducible y base TypeScript

- Agregar Vite, Capacitor todavía no; fijar versiones de dependencias y actualizar el entorno de CI a Node 22 o superior.
- Añadir `tsconfig` con `strict: true`. Dejar el JS actual intacto; los `.ts` nuevos se typecheckean estrictamente. No habilitar una migración masiva de JS.
- El build genera la app en `dist/` y conserva bajo `dist/src/` los módulos, estilos, fuentes y dependencias públicas originales que utiliza el panel. Configurar GitHub Pages para publicar el artefacto de build, sin quitar el sitio estático ni cambiar los URLs públicos.
- **Aceptación:** `npm test` no cambia los resultados (incluido `EXPECT_DEMO`); build repetible; vista de GitHub Pages equivalente; URLs de cliente, cerebro y CSS siguen respondiendo; panel carga sin cambios en su repo; no se cambian los cuatro archivos protegidos ni rutas; PR a revisión de Diego antes de merge.

### Fase 2 — Privacidad y ciclo de vida de cuenta

- Resolver borrado de cuenta de punta a punta, desde la interfaz de cuenta y un recurso web accesible hasta la eliminación de la cuenta de Supabase y sus filas asociadas. Diseñar la función privilegiada como Edge Function/server-side; los secretos viven únicamente en Supabase. El PR agrega código y pasos, pero Diego despliega secrets/función y realiza toda acción de producción.
- Revisar si el email propio del administrador debe ocultarse en el encabezado del panel; cualquier cambio a `src/vistas.js` se pospone si sigue en un PR ajeno.
- Alinear `privacidad/` y `privacidad/index.html` con los datos y terceros reales; preparar borradores verificables para Data safety y App Privacy, sin completar formularios de tienda todavía.
- **Aceptación:** pruebas con Supabase local o mock demuestran borrado y manejo de casos/fincas; página externa explica cómo pedirlo; RLS permanece intacto; no se ejecutó SQL ni se alteraron datos de producción; texto de privacidad cubre las salidas y retenciones.

### Fase 3 — PWA y paquete Microsoft Store

- Agregar manifiesto PWA, iconos, `start_url`/`scope` de la raíz GitHub Pages y service worker con política de cache/actualización documentada. No cachear credenciales ni respuestas privadas de Supabase.
- Probar instalación y modo offline para la finca local, cuestionario, cálculos, respaldos y archivos; las funciones de nube, clima y mapa explican cuándo requieren conexión.
- Generar y validar paquete MSIX con PWABuilder sin cambiar la publicación web.
- **Aceptación:** Lighthouse/validación PWA sin errores bloqueantes; instalación desde navegador; paquete de PWABuilder pasa su validación; actualizar el sitio no deja al usuario atrapado con assets antiguos; URL web sigue funcionando.

### Fase 4 — Capacitor para Android

- Añadir Capacitor a la app construida; generar proyecto Android y mantener el mismo código web. Usar solo plugins nativos necesarios, con permisos en el momento de uso.
- Implementar retorno OAuth mediante App Links/deep links y probar Google, correo, renovación y cierre de sesión en dispositivo. Hacer explícita la transferencia de finca y mapa desde los respaldos del navegador.
- Mantener `targetSdk` al nivel requerido vigente al publicar; a la fecha de esta auditoría, Google Play anuncia API 36 para apps nuevas y actualizaciones desde el 31-08-2026.
- **Aceptación:** APK de desarrollo y Android App Bundle verificables; pruebas en dispositivo/emulador de permisos, GPS, archivos, teclado, offline, login y sincronización; actualización no borra localStorage; no requiere service_role; capturas de móvil para el PR.

### Fase 5 — Capacitor para iOS

- Generar proyecto iOS desde el mismo web build. Para Capacitor 8, la documentación consultada indica Node 22+, Xcode 26+, macOS y deployment target iOS 15+.
- Configurar dominio asociado/deep links, callbacks de Supabase y Google, y `Sign in with Apple` como opción equivalente para el login social. Revisar plugins nativos y manifiestos de privacidad que exija cada SDK agregado.
- **Aceptación:** build instalado en dispositivo y distribuido en TestFlight; login y retorno probados con cuentas de prueba; acceso sin login a las funciones locales; backups, GPS/permisos, accesibilidad y modo sin conexión verificados; App Privacy consistente con la política; capturas para PR.

### Fase 6 — Expedientes y envío a tiendas

- Preparar metadatos, categorías, edad, capturas reales en móvil/escritorio, iconos, soporte, política, notas de revisión, cuenta de demostración para revisores y declaraciones de datos/borrado.
- Comprobar licencias/costos de Open-Meteo, EOX y Supabase antes de distribución comercial; el README actual advierte que EOX/Open-Meteo tienen condiciones no comerciales.
- **Aceptación:** todas las páginas y declaraciones concuerdan con las versiones publicadas; pruebas finales de Play Console, App Store Connect/TestFlight y Partner Center; ningún envío, compra o publicación externa se hace sin que Diego lo realice o lo autorice expresamente.

Cada fase tendrá su propio PR, sus capturas en los tamaños que corresponden y el resultado de `npm test` antes/después. Después de crear cada PR, detenerse y esperar la aprobación de Diego. Un merge del PR de la app publica GitHub Pages, así que el merge siempre queda en manos de Diego.

## Tareas manuales de Diego

### Antes de compilar

- Confirmar nombre visible, propietario legal del producto, identificadores estables (`applicationId` Android y `bundleId` iOS), mercados e idioma. Los identificadores deben elegirse antes de reservar listados; no se inventan en el código.
- Conseguir acceso a macOS con Xcode para compilar y firmar iOS (local, equipo de Zamorano o runner macOS confiable). Este entorno actual es Windows.
- Confirmar dominio/callback que se usará. Si se usa App Links/Universal Links, verificar que Diego puede servir los archivos de asociación en el dominio HTTPS y mantenerlo bajo control.

### Cuentas y certificados

- Google Play Console: cuenta de desarrollador verificada, crear la app, elegir Play App Signing, administrar la clave de carga y crear un canal de pruebas internas/cerradas.
- Apple Developer Program/App Store Connect: inscribir cuenta individual u organización. Para una organización, completar verificación legal, D‑U‑N‑S si corresponde y correo/web del dominio organizacional; crear identificador, certificados y perfiles de firma; habilitar `Sign in with Apple` y dominios asociados.
- Microsoft Partner Center: crear/verificar cuenta de desarrollador, reservar el nombre de Store y crear la ficha. El flujo actual de Microsoft indica que la nueva inscripción individual/empresa no tiene cuota de registro; revisar la pantalla de Partner Center al momento de inscribirse.
- Mantener certificados, llaves de firma y credenciales de Google/Apple en los portales y gestores de secretos; no enviarlos en chat ni guardarlos en Git.

### Supabase, OAuth y política

- Configurar en Supabase Auth las URLs de retorno por plataforma, y el proveedor Google (y Apple para iOS). La configuración se hace manualmente en los paneles; ningún PR cambia producción.
- Decidir y después desplegar la Edge Function de borrado con sus secretos server-side. Publicar un URL web externo de solicitud/eliminación y revisar retención de respaldos/casos.
- Revisar/publicar la política de privacidad y el contacto de soporte. Completar en Play Console Data safety + borrado de cuenta, en App Store Connect App Privacy y en Microsoft Store los campos y URL de privacidad. Proporcionar una cuenta de prueba/datos de ejemplo ficticios a revisores.
- Aprobar o rechazar los PR existentes por separado. En particular, la protección propuesta por el PR #5 requiere que Diego aplique su SQL en Supabase solo si decide aprobarlo; Codex no lo ejecutará.

### Contenido de las tiendas

- Preparar icono, nombre corto/largo, descripción, categoría, clasificación por edad, capturas de pantalla, correo de soporte y URLs legales. Hacer capturas en teléfono y escritorio después de cada fase de interfaz.
- Verificar licencias de EOX, Open-Meteo y Supabase para el modelo de distribución que se decida. La licencia gratuita actual no autoriza automáticamente un uso comercial.
- Enviar a certificación y publicar la primera versión desde los portales solo después de revisar los binarios, declaraciones y PRs.

## Fuentes consultadas

### Código del proyecto

- [App: README](../README.md), [estado y motor](../src/core/state.js), [persistencia y formatos](../src/core/storage.js), [mapa y formato](../src/mapa/ubicacion.js), [cliente Supabase](../src/nube/cliente.js), [reglas de sincronización](../src/nube/sincronia.js), [privacidad](../privacidad/index.html).
- [Panel: README](https://github.com/diegoguevara912-pixel/trofaxis-admin/blob/main/README.md), [imports en vivo](https://github.com/diegoguevara912-pixel/trofaxis-admin/blob/main/src/main.js), [CSS de la app consumido](https://github.com/diegoguevara912-pixel/trofaxis-admin/blob/main/index.html), [RPC de administración actual](https://github.com/diegoguevara912-pixel/trofaxis-admin/blob/main/sql/001_admin.sql).

### Requisitos de plataformas (consultados el 2026-10-20)

- [Capacitor: documentación actual (v8)](https://capacitorjs.com/docs), [entorno y versiones mínimas](https://capacitorjs.com/docs/getting-started/environment-setup), [deep links iOS/Android](https://capacitorjs.com/docs/guides/deep-links).
- [Apple: App Review Guidelines, 4.2/4.8/5.1.1](https://developer.apple.com/app-store/review/guidelines/), [privacidad y Privacy Nutrition Labels](https://developer.apple.com/app-store/user-privacy-and-data-use/), [programa de desarrolladores y alta](https://developer.apple.com/programs/enroll/).
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469), [borrado de cuenta](https://support.google.com/googleplay/android-developer/answer/13327111), [requisitos de API objetivo](https://support.google.com/googleplay/android-developer/answer/11926878).
- [Microsoft: distribuir una PWA en Microsoft Store](https://learn.microsoft.com/en-us/windows/apps/publish/), [requisitos de cuenta Partner Center](https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/open-a-developer-account).
