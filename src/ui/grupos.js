// Menú de 4 tareas (plan de facilidad de uso, punto 3): cada grupo junta pantallas que ya existían.
// Ninguna pantalla ni cálculo se quita; Ajustes queda en el menú de la cuenta.
export const GRUPOS = [
  { id: 'inicio', titulo: 'Inicio', vistas: [['dashboard', 'Inicio']] },
  { id: 'finca', titulo: 'Mi finca', vistas: [['wizard', 'Cuestionario'], ['riego', 'Riego'], ['casos', 'Fincas parecidas']] },
  { id: 'registrar', titulo: 'Registrar', vistas: [['plaguicidas', 'Plaguicidas'], ['fertilizacion', 'Fertilización'], ['plantillas', 'Plantillas']] },
  { id: 'auditoria', titulo: 'Auditoría', vistas: [['auditoria', 'GLOBALG.A.P.']] },
];

export const grupoDe = (vista) => GRUPOS.find((g) => g.vistas.some(([id]) => id === vista)) ?? null;

// Botones arriba de la vista para cambiar entre las pantallas del mismo grupo (solo si tiene más de una).
export function subMenu(vista) {
  const g = grupoDe(vista);
  if (!g || g.vistas.length < 2) return '';
  return `<nav class="subtabs" aria-label="${g.titulo}">${g.vistas.map(([id, t]) => `<button type="button" data-view="${id}" aria-current="${id === vista ? 'page' : 'false'}">${t}</button>`).join('')}</nav>`;
}
