// Pantalla de entrada (como la de OpenAI Platform: cuenta recordada, «Usar otra cuenta», seguir sin cuenta)
// y el menú de cuenta de la barra lateral con su confirmación para cerrar sesión.
import { esc } from '../core/utils.js';
import { S } from '../core/state.js';
import { inicial } from '../core/cuenta.js';

const avatar = (email, cls = '') => `<span class="cta-avatar ${cls}" aria-hidden="true">${esc(inicial(email))}</span>`;
const quien = (email) => `<span class="cta-quien"><b>${esc(email.split('@')[0])}</b><span class="muted small">${esc(email)}</span></span>`;

export function viewEntrar() {
  const c = S.cuenta, n = S.nube, dis = n.ocupado ? 'disabled' : '';
  const recordada = c.email
    ? `<div class="cta-tarjeta">
        <button type="button" class="cta-elegir" data-act="entrar-cuenta" ${dis}>${avatar(c.email)}${quien(c.email)}</button>
        <button type="button" class="cta-x" data-act="entrar-olvidar" aria-label="Quitar ${esc(c.email)} de este dispositivo">×</button>
      </div>
      <div class="cta-o" role="separator"><span>o</span></div>` : '';
  const correo = S.entrarCorreo
    ? `<div class="f"><label for="e-email">Tu correo</label><input id="e-email" type="email" autocomplete="email" data-bind="nube.email" value="${esc(n.email)}" placeholder="tucorreo@ejemplo.com"><span class="hint">Te enviamos un enlace de un solo uso. No hay contraseñas.</span></div>
       <button class="btn primary bv-btn" data-act="nube-enlace" ${dis}>Enviarme el enlace</button>`
    : `<button class="btn bv-btn" data-act="entrar-correo">Entrar con un enlace a mi correo</button>`;
  return `<section class="bv cta" aria-labelledby="cta-titulo">
    <div class="cta-centro">
      <span class="logo bv-logo" aria-hidden="true"><svg class="ic"><use href="#i-hoja"/></svg></span>
      <h1 id="cta-titulo">${c.email ? 'Te damos la bienvenida de nuevo' : 'Entra a Trofaxis'}</h1>
      <p class="muted">${c.email ? 'Elige una cuenta para continuar en Trofaxis.' : 'Con tu cuenta, tu finca se guarda en la nube y la abres desde cualquier equipo.'}</p>
      ${S.msg ? `<div class="notice" role="status"><span>${esc(S.msg)}</span></div>` : ''}
      ${recordada}
      <button class="btn ${c.email ? '' : 'primary'} bv-btn" data-act="nube-google" ${dis}>${c.email ? 'Usar otra cuenta de Google' : 'Continuar con Google'}</button>
      ${correo}
      <button class="btn bv-btn bv-fantasma" data-act="entrar-sin-cuenta">Seguir sin cuenta</button>
      <p class="muted small t-centro">Sin cuenta, todo se guarda solo en este navegador. <a href="privacidad/">Política de privacidad</a></p>
    </div>
  </section>`;
}

const TEMAS = [['light', 'Claro'], ['dark', 'Oscuro']];

// Bloque de cuenta al pie de la barra lateral: botón, menú desplegable y confirmación de cierre de sesión.
export function htmlCuenta() {
  const ses = S.nube.sesion;
  const email = ses ? ses.email || 'tu cuenta' : '';
  const menu = S.cuentaMenu ? `<div class="cta-menu" role="menu" aria-label="Cuenta">
      <p class="muted small cta-menu-email">${ses ? esc(email) : 'Sin cuenta: tus datos están solo en este navegador.'}</p>
      <div class="cta-temas" role="group" aria-label="Tema">${TEMAS.map(([id, t]) => `<button type="button" data-act="tema-set" data-tema="${id}" aria-pressed="${S.theme === id}">${t}</button>`).join('')}</div>
      <hr>
      <button type="button" role="menuitem" data-view="ajustes">Ajustes</button>
      ${ses ? '<button type="button" role="menuitem" data-view="casos">Mi finca en la nube</button>' : ''}
      <a role="menuitem" href="privacidad/">Política de privacidad</a>
      ${ses ? '<button type="button" role="menuitem" data-act="cuenta-borrar">Borrar cuenta</button>' : ''}
      <hr>
      ${ses ? '<button type="button" role="menuitem" data-act="cuenta-salir">Cerrar sesión</button>' : '<button type="button" role="menuitem" data-act="cuenta-entrar">Iniciar sesión</button>'}
    </div>` : '';
  const confirmar = S.confirmarSalir ? `<div class="cta-fondo" data-act="salir-cancelar"></div>
    <div class="cta-dialogo" role="dialog" aria-modal="true" aria-labelledby="cta-salir-t">
      <h2 id="cta-salir-t">¿Cerrar sesión en Trofaxis?</h2>
      <p class="muted">Tu finca sigue en este navegador y en la nube. Para volver a guardarla en la nube tendrás que iniciar sesión de nuevo.</p>
      <div class="cta-tarjeta cta-fija">${avatar(email)}${quien(email)}</div>
      <div class="row cta-acciones"><button type="button" class="btn" data-act="salir-cancelar">Cancelar</button><button type="button" class="btn danger-solido" data-act="salir-confirmar">Cerrar sesión</button></div>
    </div>` : '';
  const uiBorrar = S.borrarCuentaUI;
  const confirmarBorrar = uiBorrar.abierto && ses ? `<div class="cta-fondo" data-act="cuenta-borrar-cancelar"></div>
    <div class="cta-dialogo" role="alertdialog" aria-modal="true" aria-labelledby="cta-borrar-t" aria-describedby="cta-borrar-detalle">
      <h2 id="cta-borrar-t">¿Borrar tu cuenta de Trofaxis?</h2>
      <div id="cta-borrar-detalle">
        <p class="muted">La cuenta que se borrará es <b>${esc(email)}</b>. También se eliminarán tu finca guardada en la nube y tus casos compartidos.</p>
        <p class="muted">La finca, el mapa y el censo de este equipo se conservarán. Las respuestas anónimas de bienvenida no se borran.</p>
      </div>
      <div class="row cta-acciones">
        <button type="button" class="btn sm" data-act="export" ${uiBorrar.ocupado ? 'disabled' : ''}>Exportar finca</button>
        <button type="button" class="btn sm" data-act="cuenta-borrar-mapa" ${uiBorrar.ocupado ? 'disabled' : ''}>Guardar mapa y censo</button>
      </div>
      <div class="f"><label for="cuenta-borrar-confirmacion">Para continuar, escribe BORRAR</label><input id="cuenta-borrar-confirmacion" type="text" autocomplete="off" autocapitalize="characters" value="${esc(uiBorrar.texto)}" ${uiBorrar.ocupado ? 'disabled' : ''}></div>
      ${uiBorrar.error ? `<p class="notice" role="alert">${esc(uiBorrar.error)}</p>` : ''}
      <div class="row cta-acciones"><button type="button" class="btn" data-act="cuenta-borrar-cancelar" ${uiBorrar.ocupado ? 'disabled' : ''}>Cancelar</button><button type="button" id="cuenta-borrar-confirmar" class="btn danger-solido" data-act="cuenta-borrar-confirmar" ${uiBorrar.texto !== 'BORRAR' || uiBorrar.ocupado ? 'disabled' : ''}>${uiBorrar.ocupado ? 'Borrando…' : 'Borrar cuenta'}</button></div>
    </div>` : '';
  const cara = ses ? `${avatar(email)}<span class="cta-quien"><b>${esc(email.split('@')[0])}</b><span class="small">${esc(email)}</span></span>`
    : `${avatar('?', 'cta-vacio')}<span class="cta-quien"><b>Sin cuenta</b><span class="small">Entrar o cambiar tema</span></span>`;
  return `<button type="button" class="cta-boton" data-act="cuenta-menu" aria-haspopup="menu" aria-expanded="${S.cuentaMenu ? 'true' : 'false'}" aria-label="Cuenta y tema">${cara}</button>${menu}${confirmar}${confirmarBorrar}`;
}
