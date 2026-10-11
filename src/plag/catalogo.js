// Catálogo de ingredientes activos con su toxicidad aguda por contacto para la abeja melífera (Apis mellifera).
// Cada valor se copió de su ficha del PPDB o del BPDB (Universidad de Hertfordshire), con enlace y fecha de
// actualización de la ficha; consultados el 2026-10-07. La etiqueta solo trae un pictograma, por eso el número sale de aquí.
// dl50: DL50 aguda por contacto en µg de ingrediente activo por abeja. mayor: la ficha la da como "> valor".
// gus: índice GUS de lixiviación (null si la ficha no lo da). Si un ingrediente no está, el usuario puede escribir
// la DL50 de la hoja de seguridad; sin ella, el peligro queda "sin dato".

export const CONSULTA_PPDB = '2026-10-07';

const PPDB = (n) => `https://sitem.herts.ac.uk/aeru/ppdb/en/Reports/${n}.htm`;
const BPDB = (n) => `https://sitem.herts.ac.uk/aeru/bpdb/Reports/${n}.htm`;

export const INGREDIENTES = [
  // Insecticidas y acaricidas
  { id: 'abamectina', nombre: 'Abamectina', uso: 'insecticida', grupo: '6', dl50: 0.001, mayor: false, gus: null, url: BPDB(8), actualizado: '2026-07-31', sinonimos: ['abamectin'], nota: 'La ficha no da el número del GUS; la califica como de lixiviación baja.' },
  { id: 'acetamiprid', nombre: 'Acetamiprid', uso: 'insecticida', grupo: '4A', dl50: 8.09, mayor: false, gus: 0.94, url: PPDB(11), actualizado: '2026-08-26', sinonimos: ['acetamiprida'] },
  { id: 'bt-kurstaki', nombre: 'Bacillus thuringiensis var. kurstaki', uso: 'insecticida', grupo: '11A', dl50: 100, mayor: true, gus: null, url: BPDB(57), actualizado: '2026-09-23', sinonimos: ['bacillus thuringiensis kurstaki', 'bacillus thuringiensis var kurstaki', 'bacillus thuringiensis subsp kurstaki', 'bt kurstaki'], nota: 'Ficha de la cepa ABTS 351; las cepas EG2348, SA11 y SA12 dan los mismos valores. La ficha no da el GUS. Si la etiqueta da la concentración en UI/mg, no se puede pasar a gramos: deja la concentración vacía.' },
  { id: 'beauveria', nombre: 'Beauveria bassiana', uso: 'insecticida', grupo: 'UNF', dl50: 9285, mayor: true, gus: null, url: BPDB(2514), actualizado: '2026-08-18', sinonimos: ['beauveria bassiana gha'], nota: 'No hay ficha general: es la de la cepa GHA, y el BPDB marca el dato como de fuente no verificada (L3). La ficha no da el GUS. Si la etiqueta da la concentración en conidias o UFC, no se puede pasar a gramos: deja la concentración vacía.' },
  { id: 'bifentrina', nombre: 'Bifentrina', uso: 'insecticida', grupo: '3A', dl50: 0.016, mayor: false, gus: -2.66, url: PPDB(78), actualizado: '2026-07-30', sinonimos: ['bifenthrin'] },
  { id: 'buprofezin', nombre: 'Buprofezin', uso: 'insecticida', grupo: '16', dl50: 200, mayor: true, gus: 0.45, url: PPDB(100), actualizado: '2026-10-02', sinonimos: ['buprofezina'] },
  { id: 'cipermetrina', nombre: 'Cipermetrina', uso: 'insecticida', grupo: '3A', dl50: 0.023, mayor: false, gus: -1.99, url: PPDB(197), actualizado: '2026-08-30', sinonimos: ['cypermethrin'] },
  { id: 'clorantraniliprol', nombre: 'Clorantraniliprol', uso: 'insecticida', grupo: '28', dl50: 4.0, mayor: true, gus: 3.51, url: PPDB(1138), actualizado: '2026-09-21', sinonimos: ['chlorantraniliprole', 'clorantraniliprole'] },
  { id: 'clorpirifos', nombre: 'Clorpirifós', uso: 'insecticida', grupo: '1B', dl50: 0.068, mayor: false, gus: 0.58, url: PPDB(154), actualizado: '2026-07-27', sinonimos: ['chlorpyrifos', 'clorpirifos'] },
  { id: 'deltametrina', nombre: 'Deltametrina', uso: 'insecticida', grupo: '3A', dl50: 0.0015, mayor: false, gus: -3.98, url: PPDB(205), actualizado: '2026-09-16', sinonimos: ['deltamethrin'] },
  { id: 'emamectina', nombre: 'Benzoato de emamectina', uso: 'insecticida', grupo: '6', dl50: 0.0036, mayor: false, gus: -0.04, url: PPDB(1326), actualizado: '2026-10-05', sinonimos: ['emamectin benzoate', 'emamectina benzoato', 'emamectina'] },
  { id: 'imidacloprid', nombre: 'Imidacloprid', uso: 'insecticida', grupo: '4A', dl50: 0.081, mayor: false, gus: 3.69, url: PPDB(397), actualizado: '2026-10-02', sinonimos: ['imidaclopride'] },
  { id: 'lambda-cihalotrina', nombre: 'Lambda-cihalotrina', uso: 'insecticida', grupo: '3A', dl50: 0.038, mayor: false, gus: -2.12, url: PPDB(415), actualizado: '2026-10-05', sinonimos: ['lambda-cyhalothrin', 'lambda cihalotrina', 'lambdacihalotrina', 'lambda cyhalothrin'] },
  { id: 'malation', nombre: 'Malatión', uso: 'insecticida', grupo: '1B', dl50: 0.16, mayor: false, gus: 0.0, url: PPDB(421), actualizado: '2026-08-12', sinonimos: ['malathion', 'malation'] },
  { id: 'metomilo', nombre: 'Metomilo', uso: 'insecticida', grupo: '1A', dl50: 0.16, mayor: false, gus: 2.19, url: PPDB(458), actualizado: '2026-06-29', sinonimos: ['methomyl', 'metomil'] },
  { id: 'metoxifenocida', nombre: 'Metoxifenocida', uso: 'insecticida', grupo: '18', dl50: 100, mayor: true, gus: 3.0, url: PPDB(461), actualizado: '2026-07-21', sinonimos: ['methoxyfenozide', 'metoxifenozida'] },
  { id: 'oxamilo', nombre: 'Oxamilo', uso: 'nematicida', grupo: '1A', dl50: 0.47, mayor: false, gus: 2.23, url: PPDB(498), actualizado: '2026-05-21', sinonimos: ['oxamyl', 'oxamil'] },
  { id: 'piriproxifen', nombre: 'Piriproxifén', uso: 'insecticida', grupo: '7C', dl50: 74, mayor: false, gus: -0.2, url: PPDB(574), actualizado: '2026-07-11', sinonimos: ['pyriproxyfen', 'piriproxifen', 'piriproxyfen'] },
  { id: 'spinosad', nombre: 'Spinosad', uso: 'insecticida', grupo: '5A', dl50: 0.0036, mayor: false, gus: null, url: BPDB(596), actualizado: '2026-09-20', sinonimos: ['espinosad'], nota: 'De origen biológico (bacteria del suelo) y altamente tóxico para abejas. La ficha no da el GUS.' },
  { id: 'spirotetramat', nombre: 'Spirotetramat', uso: 'insecticida', grupo: '23', dl50: 100, mayor: true, gus: -0.24, url: PPDB(1119), actualizado: '2026-09-19', sinonimos: ['espirotetramat'] },
  { id: 'tiametoxam', nombre: 'Tiametoxam', uso: 'insecticida', grupo: '4A', dl50: 0.024, mayor: false, gus: 3.58, url: PPDB(631), actualizado: '2026-09-21', sinonimos: ['thiamethoxam'] },
  // Fungicidas
  { id: 'azoxistrobina', nombre: 'Azoxistrobina', uso: 'fungicida', grupo: '11', dl50: 200, mayor: true, gus: 3.1, url: PPDB(54), actualizado: '2026-10-01', sinonimos: ['azoxystrobin'] },
  { id: 'azufre', nombre: 'Azufre', uso: 'fungicida', grupo: 'M2', dl50: 100, mayor: true, gus: null, url: PPDB(605), actualizado: '2026-09-30', sinonimos: ['sulphur', 'sulfur'], nota: 'La ficha no da el GUS.' },
  { id: 'boscalid', nombre: 'Boscalid', uso: 'fungicida', grupo: '7', dl50: 200, mayor: true, gus: 2.68, url: PPDB(86), actualizado: '2026-09-17', sinonimos: ['boscalida'] },
  { id: 'carbendazim', nombre: 'Carbendazim', uso: 'fungicida', grupo: '1', dl50: 50, mayor: true, gus: 2.21, url: PPDB(116), actualizado: '2026-08-20', sinonimos: ['carbendazima'] },
  { id: 'cimoxanil', nombre: 'Cimoxanil', uso: 'fungicida', grupo: '27', dl50: 100, mayor: true, gus: 1.47, url: PPDB(196), actualizado: '2026-08-30', sinonimos: ['cymoxanil'] },
  { id: 'ciproconazol', nombre: 'Ciproconazol', uso: 'fungicida', grupo: '3', dl50: 100, mayor: true, gus: 3.04, url: PPDB(198), actualizado: '2026-10-01', sinonimos: ['cyproconazole', 'cyproconazol', 'ciproconazole'] },
  { id: 'clorotalonil', nombre: 'Clorotalonil', uso: 'fungicida', grupo: 'M5', dl50: 101, mayor: true, gus: 1.12, url: PPDB(150), actualizado: '2026-09-20', sinonimos: ['chlorothalonil', 'clorotalonilo', 'chlorotalonilo', 'chlorotalonil'] },
  { id: 'difenoconazol', nombre: 'Difenoconazol', uso: 'fungicida', grupo: '3', dl50: 100, mayor: true, gus: 0.89, url: PPDB(230), actualizado: '2026-10-04', sinonimos: ['difenoconazole'] },
  { id: 'dimetomorf', nombre: 'Dimetomorf', uso: 'fungicida', grupo: '40', dl50: 102, mayor: true, gus: 2.26, url: PPDB(245), actualizado: '2026-08-20', sinonimos: ['dimethomorph', 'dimetomorph', 'dimetomorfo'] },
  { id: 'epoxiconazol', nombre: 'Epoxiconazol', uso: 'fungicida', grupo: '3', dl50: 100, mayor: true, gus: 2.09, url: PPDB(267), actualizado: '2026-09-09', sinonimos: ['epoxiconazole'] },
  { id: 'fludioxonil', nombre: 'Fludioxonil', uso: 'fungicida', grupo: '12', dl50: 100, mayor: true, gus: 0.67, url: PPDB(330), actualizado: '2026-10-05', sinonimos: [] },
  { id: 'fluopicolide', nombre: 'Fluopicolide', uso: 'fungicida', grupo: '43', dl50: 100, mayor: true, gus: 3.2, url: PPDB(337), actualizado: '2026-08-26', sinonimos: ['fluopicolida', 'fluopicolid'] },
  { id: 'fluopyram', nombre: 'Fluopyram', uso: 'fungicida', grupo: '7', dl50: 100, mayor: true, gus: 3.23, url: PPDB(1362), actualizado: '2026-08-26', sinonimos: ['fluopiram'] },
  { id: 'fluxapyroxad', nombre: 'Fluxapyroxad', uso: 'fungicida', grupo: '7', dl50: 100, mayor: true, gus: 2.57, url: PPDB(2002), actualizado: '2026-09-30', sinonimos: ['fluxapiroxad'] },
  { id: 'fosetil-al', nombre: 'Fosetil aluminio', uso: 'fungicida', grupo: 'P07', dl50: 100, mayor: true, gus: -6.99, url: PPDB(363), actualizado: '2026-07-31', sinonimos: ['fosetyl-al', 'fosetyl-aluminium', 'fosetyl aluminium', 'fosetil-al', 'fosetil aluminio', 'fosetil-aluminio'], nota: 'En el cuadro SAG aparece con el grupo FRAC 33.' },
  { id: 'hidroxido-cobre', nombre: 'Hidróxido de cobre', uso: 'fungicida', grupo: 'M1', dl50: 44.46, mayor: true, gus: 0.08, url: PPDB(175), actualizado: '2026-06-29', sinonimos: ['copper hydroxide', 'hidroxido de cobre', 'copper ii hydroxide'], cobre: true },
  { id: 'iprodiona', nombre: 'Iprodiona', uso: 'fungicida', grupo: '2', dl50: 100, mayor: true, gus: 0.43, url: PPDB(403), actualizado: '2026-06-29', sinonimos: ['iprodione'] },
  { id: 'mancozeb', nombre: 'Mancozeb', uso: 'fungicida', grupo: 'M3', dl50: 85.3, mayor: true, gus: -1.45, url: PPDB(424), actualizado: '2026-09-13', sinonimos: [] },
  { id: 'mandipropamid', nombre: 'Mandipropamid', uso: 'fungicida', grupo: '40', dl50: 200, mayor: true, gus: 1.22, url: PPDB(425), actualizado: '2026-09-20', sinonimos: ['mandipropamida'] },
  { id: 'metalaxil-m', nombre: 'Metalaxil-M', uso: 'fungicida', grupo: '4', dl50: 100, mayor: true, gus: 2.42, url: PPDB(445), actualizado: '2026-09-21', sinonimos: ['metalaxyl-m', 'mefenoxam', 'metalaxil m', 'metalaxyl m'], nota: 'No es lo mismo que el metalaxil (mezcla racémica), que tiene otra ficha.' },
  { id: 'piraclostrobina', nombre: 'Piraclostrobina', uso: 'fungicida', grupo: '11', dl50: 100, mayor: true, gus: 0.08, url: PPDB(564), actualizado: '2026-09-17', sinonimos: ['pyraclostrobin', 'piraclostrobin'] },
  { id: 'propamocarb', nombre: 'Propamocarb (clorhidrato)', uso: 'fungicida', grupo: '28', dl50: 100, mayor: true, gus: 1.5, url: PPDB(544), actualizado: '2026-08-31', sinonimos: ['propamocarb hydrochloride', 'clorhidrato de propamocarb'] },
  { id: 'propiconazol', nombre: 'Propiconazol', uso: 'fungicida', grupo: '3', dl50: 100, mayor: true, gus: 1.58, url: PPDB(551), actualizado: '2026-08-09', sinonimos: ['propiconazole'] },
  { id: 'propineb', nombre: 'Propineb', uso: 'fungicida', grupo: 'M3', dl50: 100, mayor: true, gus: null, url: PPDB(552), actualizado: '2026-07-23', sinonimos: [], nota: 'La ficha no da el GUS.' },
  { id: 'protioconazol', nombre: 'Protioconazol', uso: 'fungicida', grupo: '3', dl50: 200, mayor: true, gus: -0.09, url: PPDB(559), actualizado: '2026-10-05', sinonimos: ['prothioconazole', 'protioconazole'] },
  { id: 'pydiflumetofen', nombre: 'Pydiflumetofen', uso: 'fungicida', grupo: '7', dl50: 100, mayor: true, gus: 2.99, url: PPDB(3086), actualizado: '2026-09-20', sinonimos: ['pidiflumetofen'] },
  { id: 'tebuconazol', nombre: 'Tebuconazol', uso: 'fungicida', grupo: '3', dl50: 200, mayor: true, gus: 1.86, url: PPDB(610), actualizado: '2026-10-01', sinonimos: ['tebuconazole'] },
  { id: 'tiofanato-metilico', nombre: 'Tiofanato metílico', uso: 'fungicida', grupo: '1', dl50: 100, mayor: true, gus: 0.5, url: PPDB(640), actualizado: '2026-10-04', sinonimos: ['thiophanate-methyl', 'thiophanate methyl', 'tiofanato metil', 'tiofanato-metil', 'metil tiofanato', 'metil-thiophanato', 'metil thiophanato'] },
  { id: 'trifloxistrobina', nombre: 'Trifloxistrobina', uso: 'fungicida', grupo: '11', dl50: 200, mayor: true, gus: 0.15, url: PPDB(664), actualizado: '2026-09-19', sinonimos: ['trifloxystrobin', 'trifloxistrobin'] },
  // Herbicidas: grupo con el número de la WSSA, como en la ficha; la letra de la HRAC va en la nota.
  { id: 'glifosato', nombre: 'Glifosato', uso: 'herbicida', grupo: '9', dl50: 200, mayor: true, gus: 0.29, url: PPDB(373), actualizado: '2026-07-30', sinonimos: ['glyphosate'], nota: 'Ficha del ácido glifosato. Grupo 9 de la WSSA (G de la HRAC). Si la etiqueta da la concentración como sal, la ficha de la sal es otra.' },
  { id: 'oxifluorfen', nombre: 'Oxifluorfén', uso: 'herbicida', grupo: '14', dl50: 100, mayor: true, gus: 0.23, url: PPDB(502), actualizado: '2026-07-17', sinonimos: ['oxyfluorfen', 'oxifluorfen'], nota: 'Grupo 14 de la WSSA (E de la HRAC).' },
  { id: 'paraquat', nombre: 'Paraquat', uso: 'herbicida', grupo: '22', dl50: 9.26, mayor: false, gus: -6.89, url: PPDB(505), actualizado: '2026-06-13', sinonimos: ['paraquat dichloride', 'dicloruro de paraquat', 'paraquat dicloruro', 'paraquat ion'], nota: 'Ficha del ion paraquat, con datos de la UE. Grupo 22 de la WSSA (D de la HRAC). La ficha del dicloruro (PPDB 1524, datos de la EPA) da 72 µg/abeja: se usa el valor más tóxico (criterio propio). Si la etiqueta da los dos valores, escribe la concentración del ion.' },
];

export const ingrediente = (id) => INGREDIENTES.find((x) => x.id === id) ?? null;

// Texto en minúsculas, sin tildes ni signos, para comparar nombres.
export const normalizar = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9 -]+/g, ' ').replace(/\s+/g, ' ').trim();

// Busca un ingrediente por su nombre en español o en inglés (coincidencia exacta del nombre, no de una parte:
// "alfa-cipermetrina" no es "cipermetrina").
export function buscarIngrediente(texto) {
  const n = normalizar(texto);
  if (!n) return null;
  return INGREDIENTES.find((x) => [x.nombre, x.id, ...x.sinonimos].some((s) => normalizar(s) === n)) ?? null;
}
