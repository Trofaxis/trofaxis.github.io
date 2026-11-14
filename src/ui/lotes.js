// Tarjetas de la vista de lotes (src/ui/mapa.js las pone sobre el mapa). Solo HTML: reciben datos y devuelven texto.
import { esc } from '../core/utils.js';
import { describirTiempo, rumbo } from '../clima/ahora.js';
import { NOMBRES_MES } from '../mapa/lotes.js';
import { CONFIG } from '../core/config.js';

const fmt = (x, d = 0) => (x == null ? '—' : x.toLocaleString('es-HN', { maximumFractionDigits: d, minimumFractionDigits: d }));
const conU = (x, u, d = 0) => (x == null ? '—' : `${fmt(x, d)} ${u}`);
const ha = (x) => (x >= 10 ? fmt(x, 1) : fmt(x, 2));

// estado: { estado: '' | 'cargando' | 'listo' | 'error' | 'sin-punto', lugar, datos, msg, aviso }
export function tarjetaClima(e = {}) {
  const en = e.lugar ? ` en ${esc(e.lugar)}` : '';
  const pie = `<p class="lc-pie">Modelo de <a href="${CONFIG.clima.enlace}" target="_blank" rel="noopener">Open-Meteo</a> para el punto, no una estación en el lote.</p>`;
  if (e.estado === 'sin-punto') return `<div class="lc-tarjeta lc-clima"><p class="lc-etq">Clima de ahora</p><p class="small">Marca la ubicación de la finca o dibuja un lote para ver el clima.</p></div>`;
  if (e.estado === 'cargando' || !e.estado) return `<div class="lc-tarjeta lc-clima" aria-busy="true"><p class="lc-etq">Clima de ahora${en}</p><p class="small muted">Cargando…</p></div>`;
  if (e.estado === 'error') return `<div class="lc-tarjeta lc-clima"><p class="lc-etq">Clima de ahora${en}</p><p class="small">${esc(e.msg)}</p><button type="button" class="btn sm" data-mapa="clima-ahora">Reintentar</button></div>`;
  const d = e.datos;
  const dato = (t, v) => `<div><dt>${t}</dt><dd>${v}</dd></div>`;
  return `<div class="lc-tarjeta lc-clima">
    <div class="lc-ahora"><p class="lc-etq">Ahora${en}${d.hora ? ` · ${esc(d.hora)}` : ''}</p><p class="lc-temp">${conU(d.temp, '°C').replace(' °C', '°C')}</p><p class="small">${esc(describirTiempo(d.codigo))}</p></div>
    <dl class="lc-datos">
      ${dato('Lluvia hoy', conU(d.lluviaHoy, 'mm', 1))}
      ${dato('Humedad', conU(d.humedad, '%'))}
      ${dato('Nubes', conU(d.nubes, '%'))}
      ${dato('Viento', `${conU(d.viento, esc(d.vientoUnidad))}${d.viento != null && d.vientoDir != null ? ` del ${rumbo(d.vientoDir)}` : ''}`)}
    </dl>
    ${e.aviso ? `<p class="lc-pie">${esc(e.aviso)}</p>` : ''}${pie}
  </div>`;
}

// Tarjeta del lote elegido. cultivos: nombres de los cultivos de la finca, para el selector.
export function tarjetaLote(lote, r, { mes, cultivos = [], riesgo = null } = {}) {
  const opciones = [...new Set([...cultivos, lote.cultivo].filter(Boolean))];
  const lista = (xs) => xs.map((x) => `<li>${esc(x)}</li>`).join('');
  return `<div class="lc-tarjeta lc-lote">
    <div class="lc-cab"><p class="lc-etq">Lote · ${ha(r.area)} ha dibujadas</p>
      <button type="button" class="btn sm" data-mapa="lote-cerrar" aria-label="Cerrar la tarjeta del lote">×</button></div>
    <div class="f"><label for="lote-nombre">Nombre</label><input id="lote-nombre" data-lote="nombre" maxlength="40" value="${esc(lote.nombre)}"></div>
    <div class="f"><label for="lote-cultivo">Cultivo</label><select id="lote-cultivo" data-lote="cultivo">
      <option value="">Sin asignar</option>${opciones.map((c) => `<option${c === lote.cultivo ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
      ${cultivos.length ? '' : '<span class="hint">Agrega cultivos en el cuestionario para poder asignarlos.</span>'}
      ${r.cultivoSinRegistro ? '<span class="hint">Ese cultivo ya no está en la finca.</span>' : ''}</div>
    <h4>En ${NOMBRES_MES[mes]}</h4>
    ${r.delLote.length ? `<ul class="lc-act">${lista(r.delLote)}</ul>` : `<p class="small muted">${r.cultivo ? 'Sin siembra ni cosecha este mes.' : 'Asigna un cultivo para ver su siembra y cosecha.'}</p>`}
    ${r.deFinca.length ? `<p class="small muted">En la finca (se registran por finca, no por lote):</p><ul class="lc-act lc-finca">${lista(r.deFinca)}</ul>` : ''}
    ${riesgo ? `<p class="small">Riesgo de la finca: <b>${esc(riesgo.texto)}</b>. <span class="muted">El índice se calcula por finca; por lote hará falta registrar las actividades de cada lote.</span></p>` : ''}
    <div class="row"><button type="button" class="btn sm danger" data-mapa="lote-quitar">Borrar lote</button></div>
  </div>`;
}

// Lista de lotes debajo del mapa: un botón por lote para elegirlo.
export function listaLotes(lotes, sel) {
  if (!lotes.length) return '<p class="small muted">Todavía no hay lotes. Pulsa «Dibujar lote» y toca cada esquina del lote en el mapa.</p>';
  return `<ul class="lc-lista">${lotes.map((l, i) => `<li><button type="button" class="btn sm" data-mapa="lote-sel" data-id="${esc(l.id)}" aria-pressed="${l.id === sel}"><i class="lc-color lote-c${i % 6}" aria-hidden="true"></i>${esc(l.nombre)}${l.cultivo ? ` <span class="muted">· ${esc(l.cultivo)}</span>` : ''}</button></li>`).join('')}</ul>`;
}
