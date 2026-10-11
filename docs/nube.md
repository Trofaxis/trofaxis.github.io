# Etapa 2: casos en la nube (Supabase)

Cierra el Issue #15. La nube es opcional: sin sesión o sin conexión, la app funciona igual que en la Etapa 1.

## Qué hay en Supabase

Proyecto `biogap` (organización personal de Diego, plan gratis, región us-east-1). La URL y la clave **publicable** están en `src/core/config.js` (`CONFIG.nube`). Esa clave es pública por diseño; lo que protege los datos es la seguridad por filas (RLS). Nunca va la clave `service_role`.

| Tabla | Qué guarda | Quién la ve |
|---|---|---|
| `fincas` | La finca completa (JSON validado) de cada usuario. Una por usuario: guardar reemplaza la anterior. | Solo su dueño (RLS por `auth.uid()`) |
| `casos` | Caso anonimizado: `perfil`, `acciones`, `resultado`, fecha de `consentimiento` | Lectura pública, pero **sin la columna `user_id`**. Escribe y borra solo su dueño |

Garantías puestas en la base, no solo en la app:

- `casos.perfil` solo admite las claves `cultivo, riego, pendiente, distAgua, propNativas, mesesCoincidencia, scores, overall`, y `casos.resultado` solo `ncAntes, ncDespues, laminaAntes, laminaDespues` (restricción CHECK). Un nombre o una coordenada en el perfil lo rechaza la base.
- `anon` no puede leer `user_id` ni `consentimiento` (privilegios por columna), y no toca `fincas`.
- Un usuario solo inserta y borra casos con su propio `user_id`.

## Sesión

El enlace del correo inicia la sesión en ese navegador. El token de acceso dura cerca de una hora (valor por defecto de Supabase), pero la app guarda también el token de renovación y lo cambia por uno nuevo sola, al abrir la app y antes de cada acción de la nube. Así no hay que volver a escribir el correo salvo que se cierre la sesión o Supabase rechace la renovación (por ejemplo, tras 30 días sin entrar o si se cierra la sesión en otro lado). Supabase rota ese token (sirve una sola vez), por eso la app lo guarda de inmediato y nunca lanza dos renovaciones a la vez. Sin conexión, la sesión no se pierde.

## Consentimiento y anonimización

Solo se comparte un caso si la persona inicia sesión, marca la casilla de consentimiento y pulsa *Compartir mi caso anónimo*. Antes puede ver exactamente el JSON que se enviaría. El consentimiento se pide en cada envío y queda su fecha. *Retirar todos mis casos compartidos* los borra. La finca demostrativa no se comparte.

Sale: cultivo principal (normalizado), riego, pendiente, distancia al agua, proporción de nativas, meses de coincidencia (todos en escala 0-1), riesgo por módulo, acciones y resultado. No sale: nombre de la finca o de personas, departamento, fuente de agua, especies, ubicación ni coordenadas (el mapa guarda su ubicación aparte y nunca entra a la finca).

**Riesgo conocido:** las acciones son texto libre. Se les quitan coordenadas, correos, teléfonos y enlaces, y la interfaz avisa que no se escriban nombres ni lugares, pero un nombre propio escrito en una acción no se puede detectar de forma fiable. Antes de abrirlo a muchos usuarios conviene moderar o reducir las acciones a una lista de opciones.

## Decisiones tomadas por defecto (criterio propio, por revisar)

- Una finca en la nube por usuario (la última guardada).
- Los casos de la comunidad entran al k-NN con el origen «Comunidad», distinto de «Ejemplo» y «Tu caso». Los ficticios siguen con `origen: 'ejemplo'`.
- Lo que baja de la nube se valida campo por campo (`perfilDeNube`), como un archivo importado.
- Sin dependencias nuevas: Auth y REST con `fetch` (`src/nube/cliente.js`).

## Para que el enlace del correo funcione (lo hace Diego en el panel de Supabase)

En Authentication → URL Configuration: poner como **Site URL** la dirección de GitHub Pages de la app y agregarla a **Redirect URLs** (y `http://localhost:8000` para pruebas locales). Mientras no se haga, el enlace del correo no vuelve a la app. El correo del plan gratis lo envía Supabase con un límite bajo por hora; para muchos usuarios hará falta un servicio de correo propio.

## Qué probar en el navegador

1. Pestaña Casos → Nube y comunidad: debe decir cuántos casos de la comunidad se descargaron (hoy 0).
2. Escribir un correo → llega el enlace → al abrirlo en el mismo navegador la sesión queda iniciada.
3. Guardar la finca en la nube, borrar los datos locales, cargarla desde la nube.
4. Marcar el consentimiento, abrir *Ver exactamente qué se enviaría*, compartir, y comprobar que aparece un caso «Comunidad». Retirarlo.
5. Con Wi-Fi apagado: la app debe seguir funcionando y mostrar un aviso entendible.
