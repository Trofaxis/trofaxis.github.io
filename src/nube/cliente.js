// Cliente mínimo de Supabase (Auth y REST) con fetch: sin dependencias ni build.
// Sin url o clave en CONFIG.nube, nada de esto corre y la app sigue igual que siempre, con localStorage.
// La sesión (enlace mágico por correo) se guarda solo en este navegador, con clave aparte de la finca.

import { CONFIG } from '../core/config.js';
import { normalizarFinca } from '../core/storage.js';
import { casoDeNube } from '../casos/anonimo.js';

const CLAVE_SESION = 'biogap:sesion:v1';
export const VERSION_NUBE = 1;

export const nubeConfigurada = (cfg = CONFIG) => Boolean(cfg.nube?.url && cfg.nube?.clavePublicable);

export class ErrorNube extends Error {
  constructor(mensaje, estado = 0) { super(mensaje); this.estado = estado; }
}

// Sesión guardada. Una sesión mal formada se descarta. Una vencida se conserva si trae `refresh`:
// el token de acceso dura cerca de una hora, pero con el de renovación la app la extiende sola.
export function cargarSesion(ahora = Date.now()) {
  try {
    const o = JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null');
    if (!o || typeof o.token !== 'string' || typeof o.uid !== 'string' || !Number.isFinite(o.expira)) return null;
    const refresh = typeof o.refresh === 'string' && o.refresh ? o.refresh.slice(0, 500) : '';
    if (!refresh && !(o.expira * 1000 > ahora)) return null;
    return { token: o.token, refresh, uid: o.uid, email: typeof o.email === 'string' ? o.email.slice(0, 200) : '', expira: o.expira };
  } catch { return null; }
}

// ¿Hay que renovar el token antes de usarlo? Con un margen para que no venza a medio camino.
export const necesitaRenovar = (s, ahora = Date.now(), margenSeg = 60) => Boolean(s) && s.expira - margenSeg <= Math.floor(ahora / 1000);
export function guardarSesion(s) { try { localStorage.setItem(CLAVE_SESION, JSON.stringify(s)); } catch { /* sin almacenamiento */ } }
export function borrarSesion() { try { localStorage.removeItem(CLAVE_SESION); } catch { /* sin almacenamiento */ } }

// Al volver del enlace del correo, Supabase deja los datos de la sesión en el hash de la URL.
export function sesionDeHash(hash, ahora = Date.now()) {
  const q = new URLSearchParams(String(hash || '').replace(/^#/, ''));
  const token = q.get('access_token');
  if (!token) return null;
  const partes = token.split('.');
  let carga = {};
  try { carga = JSON.parse(atob(partes[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return null; }
  if (typeof carga.sub !== 'string') return null;
  const dur = Number(q.get('expires_in'));
  const expira = Number.isFinite(dur) && dur > 0 ? Math.floor(ahora / 1000) + dur : Number(carga.exp);
  if (!(expira * 1000 > ahora)) return null;
  return { token, refresh: (q.get('refresh_token') || '').slice(0, 500), uid: carga.sub, email: typeof carga.email === 'string' ? carga.email : '', expira };
}

export function crearCliente({ cfg = CONFIG, fetchFn = globalThis.fetch } = {}) {
  const { url, clavePublicable } = cfg.nube ?? {};
  const activo = nubeConfigurada(cfg);

  async function pedir(ruta, { metodo = 'GET', cuerpo, sesion, extra = {} } = {}) {
    if (!activo) throw new ErrorNube('La nube no está configurada.');
    let r;
    try {
      r = await fetchFn(url + ruta, {
        method: metodo,
        headers: {
          apikey: clavePublicable,
          // La clave publicable no es un JWT: solo con sesión se manda Authorization.
          ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {}),
          ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...extra,
        },
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      });
    } catch { throw new ErrorNube('Sin conexión con la nube. La app sigue funcionando en este navegador.'); }
    if (r.status === 401) throw new ErrorNube('Tu sesión venció: vuelve a iniciar sesión.', 401);
    if (!r.ok) throw new ErrorNube(`La nube respondió con un error (${r.status}).`, r.status);
    const texto = await r.text();
    return texto ? JSON.parse(texto) : null;
  }

  return {
    activo,
    // Cambia el token de renovación por una sesión nueva. Supabase rota el token de renovación (sirve una sola vez):
    // quien llame debe guardar la sesión devuelta de inmediato y no lanzar dos renovaciones a la vez.
    // Solo si Supabase lo rechaza se pide volver a entrar (401); sin conexión la sesión se conserva.
    async renovarSesion(sesion, ahora = Date.now()) {
      const vuelve = new ErrorNube('Tu sesión venció: vuelve a iniciar sesión.', 401);
      if (!sesion?.refresh) throw vuelve;
      let r;
      try { r = await pedir('/auth/v1/token?grant_type=refresh_token', { metodo: 'POST', cuerpo: { refresh_token: sesion.refresh } }); }
      catch (e) { throw e instanceof ErrorNube && [400, 401, 403].includes(e.estado) ? vuelve : e; }
      const dur = Number(r?.expires_in);
      if (typeof r?.access_token !== 'string' || typeof r?.refresh_token !== 'string' || !(dur > 0)) throw vuelve;
      return {
        token: r.access_token, refresh: r.refresh_token.slice(0, 500), uid: typeof r.user?.id === 'string' ? r.user.id : sesion.uid,
        email: typeof r.user?.email === 'string' ? r.user.email.slice(0, 200) : sesion.email, expira: Math.floor(ahora / 1000) + dur,
      };
    },
    // Envía el enlace mágico al correo. No crea contraseñas.
    enviarEnlace: (email, volverA) => pedir(`/auth/v1/otp?redirect_to=${encodeURIComponent(volverA)}`, { metodo: 'POST', cuerpo: { email, create_user: true } }),

    // Una finca por usuario: la más reciente. Se crea si no existe y se actualiza si ya existe.
    async guardarFinca(finca, sesion) {
      const f = normalizarFinca(finca);
      const fila = { nombre: f.nombre.slice(0, 200), datos: f, version: VERSION_NUBE, actualizado: new Date().toISOString() };
      const previas = await pedir('/rest/v1/fincas?select=id&order=actualizado.desc&limit=1', { sesion });
      if (previas?.[0]?.id) await pedir(`/rest/v1/fincas?id=eq.${encodeURIComponent(previas[0].id)}`, { metodo: 'PATCH', cuerpo: fila, sesion });
      else await pedir('/rest/v1/fincas', { metodo: 'POST', cuerpo: fila, sesion });
    },
    async cargarFinca(sesion) {
      const filas = await pedir('/rest/v1/fincas?select=datos&order=actualizado.desc&limit=1', { sesion });
      return filas?.[0]?.datos ? normalizarFinca(filas[0].datos) : null;
    },

    // Comparte un caso ya anonimizado. El consentimiento lo decide el usuario en la interfaz; aquí queda su fecha.
    compartirCaso: (anonimo, sesion) => pedir('/rest/v1/casos', {
      metodo: 'POST', sesion,
      cuerpo: { perfil: anonimo.perfil, acciones: anonimo.acciones, resultado: anonimo.resultado, consentimiento: new Date().toISOString(), version: VERSION_NUBE },
    }),
    // La seguridad por filas limita el borrado a los casos del propio usuario.
    retirarMisCasos: (sesion) => pedir('/rest/v1/casos?id=not.is.null', { metodo: 'DELETE', sesion }),

    // Lectura pública: no necesita sesión. Lo que baja se valida antes de usarse.
    async casosComunidad() {
      const max = cfg.nube?.maxCasos ?? 500;
      const filas = await pedir(`/rest/v1/casos?select=id,perfil,acciones,resultado&order=creado.desc&limit=${max}`);
      return Array.isArray(filas) ? filas.map(casoDeNube).filter(Boolean) : [];
    },
  };
}
