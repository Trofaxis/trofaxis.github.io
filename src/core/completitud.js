// Pasos para completar la finca (estilo «te faltan 3 de 8 pasos»). Mientras falte alguno, el resultado es preliminar.
// Cada paso revisa datos que usan las rúbricas y dice dónde se llenan (paso del cuestionario completo o pestaña).
import { tieneClima } from '../clima/normales.js';

const detallado = (p) => p.dosis > 0 && (p.componentes ?? []).some((c) => c.ia || c.nombre);

export function pasosFinca(f) {
  const cult = f.tieneCultivos ? f.cultivos.length > 0 && f.cultivos.every((c) => c.siembra.length && c.cosecha.length) : f.proposito.length > 0;
  const fauna = f.especies.some((e) => e.tipo === 'Fauna'), flora = f.especies.some((e) => e.tipo !== 'Fauna');
  return [
    { id: 'finca', titulo: 'Datos de la finca', pista: 'Área, pendiente, fuente de agua y distancia al agua', hecho: f.area > 0 && f.pendiente != null && !!f.fuenteAgua && f.distAgua != null, paso: 0 },
    { id: 'ubicacion', titulo: 'Ubicación y clima', pista: 'Marca la finca en el mapa: el clima se llena solo', hecho: tieneClima(f.clima), paso: 0 },
    { id: 'cultivos', titulo: f.tieneCultivos ? 'Cultivos con meses de siembra y cosecha' : 'Propósito de la finca', pista: f.tieneCultivos ? 'Cada cultivo con sus meses' : 'Para qué usas la app en esta finca', hecho: cult, paso: 1 },
    { id: 'especies', titulo: 'Especies de la finca', pista: 'Fauna (como las abejas), árboles o malezas' + (f.tieneCultivos ? ' y plagas' : ''), hecho: fauna && flora && (!f.tieneCultivos || f.plagas.length > 0), paso: 2 },
    { id: 'practicas', titulo: 'Riego y labranza', pista: 'Cómo riegas y cómo preparas el suelo', hecho: f.riego != null && f.labranza != null, paso: 3 },
    { id: 'fert', titulo: 'Fertilización', pista: 'Qué aplicas, cuánto y en qué meses, con tu objetivo de nitrógeno', hecho: f.nObjetivo > 0 && (f.fertPlan.length > 0 || (f.nAplicado > 0 && f.fertMeses.length > 0)), vista: 'fertilizacion' },
    { id: 'plag', titulo: 'Plaguicidas con producto y dosis', pista: f.plaguicidas.length ? 'Cada aplicación con su ingrediente activo y dosis' : 'Registra tus aplicaciones, o responde «No» en lo básico si no aplicas', hecho: f.plaguicidas.length ? f.plaguicidas.every(detallado) : f.sinPlaguicidas === true, vista: 'plaguicidas' },
    { id: 'calendarios', titulo: 'Meses de lluvia fuerte', pista: 'Con la ubicación se sugieren solos', hecho: f.lluviaMeses.length > 0, paso: 4 },
  ];
}
