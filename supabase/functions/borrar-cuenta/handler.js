const ORIGENES = new Set([
  'https://trofaxis.github.io',
  'https://localhost',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function valorEnv(env, nombre) {
  return typeof env?.get === 'function' ? env.get(nombre) : env?.[nombre];
}

function respuestaJson(status, cuerpo, cabeceras) {
  return new Response(JSON.stringify(cuerpo), { status, headers: { ...cabeceras, 'Content-Type': 'application/json; charset=utf-8' } });
}

function errorSeguro(status, mensaje, cabeceras) {
  return respuestaJson(status, { error: mensaje }, cabeceras);
}

async function borrar(url, ruta, clave, fetchFn) {
  const response = await fetchFn(`${url}${ruta}`, {
    method: 'DELETE',
    headers: { apikey: clave, Authorization: `Bearer ${clave}` },
  });
  return response.ok;
}

export async function handleBorrarCuenta(request, { env = globalThis.Deno?.env, fetchFn = globalThis.fetch } = {}) {
  const origen = request.headers.get('Origin') || '';
  const permitido = ORIGENES.has(origen);
  const cors = {
    'Access-Control-Allow-Origin': permitido ? origen : 'https://trofaxis.github.io',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (!permitido) return errorSeguro(403, 'No se pudo verificar el origen de la solicitud.', cors);
  if (request.method !== 'POST') return errorSeguro(405, 'Usa una solicitud de borrado válida.', cors);

  const autorizacion = request.headers.get('Authorization') || '';
  const coincidencia = autorizacion.match(/^Bearer\s+([^\s]+)$/i);
  if (!coincidencia) return errorSeguro(401, 'Inicia sesión para solicitar el borrado de tu cuenta.', cors);
  const token = coincidencia[1];

  let cuerpo;
  try { cuerpo = await request.json(); } catch { return errorSeguro(400, 'Confirma el borrado escribiendo BORRAR.', cors); }
  if (cuerpo?.confirmacion !== 'BORRAR') return errorSeguro(400, 'Confirma el borrado escribiendo BORRAR.', cors);

  const url = String(valorEnv(env, 'SUPABASE_URL') || '').replace(/\/$/, '');
  const clavePublica = valorEnv(env, 'SUPABASE_ANON_KEY') || valorEnv(env, 'SUPABASE_PUBLISHABLE_KEY');
  const clavePrivada = valorEnv(env, 'SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !clavePublica || !clavePrivada) return errorSeguro(503, 'El servicio de cuentas no está listo. Inténtalo más tarde o escribe a support.trofaxis@gmail.com.', cors);

  let usuario;
  try {
    const verificacion = await fetchFn(`${url}/auth/v1/user`, { headers: { apikey: clavePublica, Authorization: `Bearer ${token}` } });
    if (!verificacion.ok) {
      if ([400, 401, 403].includes(verificacion.status)) return errorSeguro(401, 'Tu sesión venció. Inicia sesión de nuevo para solicitar el borrado.', cors);
      return errorSeguro(503, 'No se pudo verificar tu sesión. Inténtalo más tarde.', cors);
    }
    usuario = await verificacion.json();
  } catch {
    return errorSeguro(503, 'No se pudo verificar tu sesión. Inténtalo más tarde.', cors);
  }
  if (typeof usuario?.id !== 'string' || !usuario.id || usuario.id.length > 200) return errorSeguro(401, 'No se pudo verificar tu sesión.', cors);

  try {
    const casosOk = await borrar(url, `/rest/v1/casos?user_id=eq.${encodeURIComponent(usuario.id)}`, clavePrivada, fetchFn);
    if (!casosOk) return errorSeguro(502, 'No se pudieron borrar tus casos compartidos. No se continuó con el borrado de la cuenta.', cors);

    const fincaOk = await borrar(url, `/rest/v1/fincas?user_id=eq.${encodeURIComponent(usuario.id)}`, clavePrivada, fetchFn);
    if (!fincaOk) return errorSeguro(502, 'No se pudo borrar tu finca de la nube. No se continuó con el borrado de la cuenta.', cors);

    // Auth invalida los tokens de renovación al eliminar la cuenta. Los JWT ya emitidos
    // siguen siendo válidos hasta su vencimiento normal.
    const auth = await fetchFn(`${url}/auth/v1/admin/users/${encodeURIComponent(usuario.id)}`, {
      method: 'DELETE', headers: { apikey: clavePrivada, Authorization: `Bearer ${clavePrivada}` },
    });
    if (!auth.ok) return errorSeguro(502, 'No se pudo borrar la cuenta. Contacta a support.trofaxis@gmail.com para completar la solicitud.', cors);
  } catch {
    return errorSeguro(502, 'No se pudo completar el borrado. Contacta a support.trofaxis@gmail.com antes de volver a intentarlo.', cors);
  }

  return respuestaJson(200, { ok: true }, cors);
}
