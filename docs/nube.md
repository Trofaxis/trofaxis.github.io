# Etapa 2: casos en la nube (Supabase)

Cierra el Issue #15. La nube es opcional: sin sesión o sin conexión, la app funciona igual que en la Etapa 1.

## Qué hay en Supabase

Proyecto `biogap` (organización personal de Diego, plan gratis, región us-east-1). La URL y la clave **publicable** están en `src/core/config.js` (`CONFIG.nube`). Esa clave es pública por diseño; lo que protege los datos es la seguridad por filas (RLS). Nunca va la clave `service_role`.

| Tabla | Qué guarda | Quién la ve |
|---|---|---|
| `fincas` | La finca completa (JSON validado) de cada usuario. Una por usuario: guardar reemplaza la anterior. Se sube sola mientras hay sesión (ver «Guardado automático»). | Su dueño (RLS por `auth.uid()`). El administrador, solo con `admin_fincas()` del panel aparte: sin nombre, correo ni coordenadas y con registro de cada lectura |
| `casos` | Caso anonimizado: `perfil`, `acciones`, `resultado`, fecha de `consentimiento` | Lectura pública, pero **sin la columna `user_id`**. Escribe y borra solo su dueño |
| `bienvenida` | Respuestas de la bienvenida de primera vez: `fuente` (cómo conoció la app) y `usos` (para qué la usará), con fecha. Sin `user_id`, nombre ni ubicación. | Nadie con la clave publicable: `anon` y `authenticated` solo pueden insertar. Diego la lee en el panel de Supabase (Table Editor) |

Garantías puestas en la base, no solo en la app:

- `casos.perfil` solo admite las claves `cultivo, riego, pendiente, distAgua, propNativas, mesesCoincidencia, scores, overall`, y `casos.resultado` solo `ncAntes, ncDespues, laminaAntes, laminaDespues` (restricción CHECK). Un nombre o una coordenada en el perfil lo rechaza la base.
- `anon` no puede leer `user_id` ni `consentimiento` (privilegios por columna), y no toca `fincas`.
- Un usuario solo inserta y borra casos con su propio `user_id`.
- `bienvenida.fuente` y `bienvenida.usos` solo admiten las opciones de `src/core/bienvenida.js` (CHECK), y una fila vacía se rechaza. Se envía una sola vez, al terminar la bienvenida la primera vez y solo si respondió algo; verla otra vez desde Ajustes no envía nada. Riesgo conocido: como no pide sesión, alguien podría insertar filas falsas a mano; los valores están acotados, pero los conteos son orientativos.

## Guardado automático (PR 105, decisión de Diego del 2026-10-16)

El guardado es **mixto**: automático mientras hay sesión, con botones manuales de respaldo. La lógica está en `src/nube/sincronia.js` (funciones puras, con pruebas) y las llamadas en `src/app.js`.

- Cada cambio guarda en el navegador y, si hay sesión, pide una subida unos segundos después (`debeSubir`). Solo sube si ya se comparó con la nube al entrar, la finca no es la de ejemplo, tiene datos, no hay conflicto pendiente y cambió desde la última subida.
- Al entrar (o abrir la app con sesión) se compara con la nube (`decidirAlEntrar`): se **carga** si este navegador tiene la de ejemplo o una vacía; se **sube** si la nube está vacía y aquí hay datos; si las dos tienen datos distintos queda un **conflicto** y no se pisa ninguna hasta que el usuario elija.
- Si falla la subida (sin conexión), la finca sigue en el navegador y se reintenta con el próximo cambio. Un 401 cierra la sesión.
- *Guardar mi finca en la nube* y *Cargar mi finca desde la nube* siguen disponibles y resuelven un conflicto a mano.
- Sin sesión no sale nada. Para que deje de subirse, cerrar la sesión.

## Sesión

El enlace del correo o «Continuar con Google» inicia la sesión en ese navegador. El token de acceso dura cerca de una hora (valor por defecto de Supabase), pero la app guarda también el token de renovación y lo cambia por uno nuevo sola, al abrir la app y antes de cada acción de la nube. Así no hay que volver a escribir el correo salvo que se cierre la sesión o Supabase rechace la renovación (por ejemplo, tras 30 días sin entrar o si se cierra la sesión en otro lado). Supabase rota ese token (sirve una sola vez), por eso la app lo guarda de inmediato y nunca lanza dos renovaciones a la vez. Sin conexión, la sesión no se pierde.

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
3. Con sesión, cambiar un dato y esperar unos segundos: el estado dice «Guardada en la nube». Borrar los datos locales, volver a entrar y comprobar que se carga sola. Probar también los botones manuales y el conflicto (dos navegadores con fincas distintas).
4. Marcar el consentimiento, abrir *Ver exactamente qué se enviaría*, compartir, y comprobar que aparece un caso «Comunidad». Retirarlo.
5. Con Wi-Fi apagado: la app debe seguir funcionando y mostrar un aviso entendible.

## Tabla `bienvenida` (migración `bienvenida_respuestas`, 2026-10-14)

```sql
create table public.bienvenida (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  fuente text check (fuente is null or fuente in ('zamorano','colega','evento','redes','buscador','otro')),
  usos text[] not null default '{}' check (
    cardinality(usos) <= 5 and usos <@ array['certificacion','riesgo','abejas','asesorar','estudiar']::text[]
  ),
  version smallint not null default 1 check (version between 1 and 100),
  check (fuente is not null or cardinality(usos) > 0)
);
alter table public.bienvenida enable row level security;
revoke all on public.bienvenida from anon, authenticated;
grant insert (fuente, usos, version) on public.bienvenida to anon, authenticated;
create policy "insertar respuesta anonima" on public.bienvenida for insert to anon, authenticated with check (true);
```

Si se agrega una opción en `FUENTES_BV` o `USOS_BV`, hay que agregarla también en estos CHECK; si no, la base rechaza el envío (la app no se rompe, solo no se guarda esa respuesta).
