// Diccionario único de variables del cerebro: una ficha por cada variable que usa Trofaxis (VARIABLES de vinculos.js)
// o que traen las tesis (candidatas de tesis.js). El nombre se queda donde está; aquí va lo que hace falta para
// auditar y, más adelante, para pedir el dato de un lote:
//   unidad → en qué se mide (convención del diccionario, criterio propio; si una tesis usa otra, se convierte).
//   tipo   → abiótica (clima, suelo, agua, aire), biótica (organismos), manejo (decisión de la finca),
//            riesgo (índice o aviso de Trofaxis) o económica.
//   capa   → bloque del grafo clima–suelo–agua–riego–fertilización–plaguicidas–cultivo–plagas–polinizadores.
//   escala → punto (planta, árbol o muestra), lote, finca o región.
//   dato   → de dónde saldría el valor para un lote concreto. No quiere decir que Trofaxis ya lo tenga.
//   rango  → solo límites físicos o de definición (0–100 %, 0–12 meses, pH 0–14), nunca valores «normales»
//            sin fuente. `rangoFuente` dice por qué.
// No contiene datos medidos. Una prueba exige que cada variable usada tenga ficha y que no sobren fichas.

export const TIPOS_VAR = ['abiótica', 'biótica', 'manejo', 'riesgo', 'económica'];
export const CAPAS = {
  clima: 'Clima', suelo: 'Suelo', agua: 'Agua', aire: 'Aire', riego: 'Riego', fertilizacion: 'Fertilización',
  plaguicidas: 'Plaguicidas', cultivo: 'Cultivo', plagas: 'Plagas', polinizadores: 'Polinizadores',
  paisaje: 'Terreno y paisaje', riesgo: 'Índices de Trofaxis', economia: 'Economía',
};
export const ESCALAS = ['punto', 'lote', 'finca', 'región'];
export const DATOS = {
  openmeteo: 'Open-Meteo (modelo por coordenada, no estación en el lote)',
  satelite: 'Satélite (p. ej. Sentinel-2; Trofaxis todavía no lo usa)',
  mapa: 'Mapa o modelo de elevación',
  registro: 'Registro de la finca',
  laboratorio: 'Análisis de laboratorio',
  muestreo: 'Muestreo en campo',
  sensor: 'Sensor o lisímetro en campo',
  calculo: 'Cálculo de Trofaxis con otras variables',
  ninguna: 'Sin fuente por lote por ahora',
};

const PCT = { rango: [0, 100], rangoFuente: 'límite de definición (porcentaje)' };
const MESES = { unidad: 'meses del año', rango: [0, 12], rangoFuente: 'límite de definición (meses del año)' };
const f = (unidad, tipo, capa, escala, dato, extra = {}) => ({ unidad, tipo, capa, escala, dato, ...extra });

export const FICHAS = {
  // Clima
  'clima.mesesLluvia': f(MESES.unidad, 'abiótica', 'clima', 'finca', 'openmeteo', MESES),
  'clima.mesesSecos': f(MESES.unidad, 'abiótica', 'clima', 'finca', 'openmeteo', MESES),
  'clima.floracion': f('°C, % de humedad relativa y mm', 'abiótica', 'clima', 'finca', 'openmeteo'),
  'clima.lluvia': f('mm', 'abiótica', 'clima', 'finca', 'openmeteo'),
  'clima.alteraciones': f('cualitativa', 'abiótica', 'clima', 'región', 'ninguna'),

  // Suelo
  'suelo.desnudoMeses': f(MESES.unidad, 'manejo', 'suelo', 'lote', 'registro', MESES),
  'suelo.balanceNutrientes': f('kg/ha por año', 'abiótica', 'suelo', 'lote', 'calculo'),
  'suelo.biocarbon': f('t/ha', 'manejo', 'suelo', 'lote', 'registro'),
  'suelo.boroAdsorbido': f('mg/kg', 'abiótica', 'suelo', 'punto', 'laboratorio'),
  'suelo.compactacion': f('MPa o g/cm³ (indicar cuál)', 'abiótica', 'suelo', 'punto', 'muestreo'),
  'suelo.desnitrificacion': f('kg N/ha', 'abiótica', 'suelo', 'lote', 'laboratorio'),
  'suelo.erosion': f('t/ha por año', 'abiótica', 'suelo', 'lote', 'ninguna'),
  'suelo.escorrentia': f('% de la lluvia', 'abiótica', 'suelo', 'lote', 'ninguna', PCT),
  'suelo.fosforo': f('mg/kg', 'abiótica', 'suelo', 'punto', 'laboratorio'),
  'suelo.fosforoLixiviado': f('mg/L o kg P/ha (indicar cuál)', 'abiótica', 'suelo', 'lote', 'laboratorio'),
  'suelo.humedad': f('% volumétrico', 'abiótica', 'suelo', 'punto', 'sensor', PCT),
  'suelo.nitrogenoMineral': f('mg/kg o kg N/ha (indicar cuál)', 'abiótica', 'suelo', 'punto', 'laboratorio'),
  'suelo.nutrientesLixiviados': f('mg/L o kg/ha (indicar cuál)', 'abiótica', 'suelo', 'lote', 'laboratorio'),
  'suelo.pH': f('unidades de pH', 'abiótica', 'suelo', 'punto', 'laboratorio', { rango: [0, 14], rangoFuente: 'límite de la escala de pH' }),
  'suelo.retencionAgua': f('% o mm por m de suelo (indicar cuál)', 'abiótica', 'suelo', 'punto', 'laboratorio'),
  'suelo.saturacionFosforo': f('%', 'abiótica', 'suelo', 'punto', 'laboratorio', PCT),
  'suelo.usoIntensivo': f('categoría', 'manejo', 'suelo', 'lote', 'registro'),
  'suelo.zincLixiviado': f('mg/L', 'abiótica', 'suelo', 'lote', 'laboratorio'),
  'sustrato.exceso': f('% de agua en el sustrato', 'abiótica', 'suelo', 'punto', 'sensor', PCT),

  // Agua y aire
  'agua.fosforoSubterranea': f('mg/L', 'abiótica', 'agua', 'finca', 'laboratorio'),
  'agua.nutrientesEscorrentia': f('mg/L o kg/ha (indicar cuál)', 'abiótica', 'agua', 'lote', 'laboratorio'),
  'aire.amoniaco': f('kg N/ha', 'abiótica', 'aire', 'lote', 'ninguna'),
  'aire.oxidoNitroso': f('kg N/ha', 'abiótica', 'aire', 'lote', 'ninguna'),

  // Riego
  'riego.sistema': f('% de eficiencia de aplicación', 'manejo', 'riego', 'lote', 'registro', PCT),
  'riego.escorrentia': f('sí o no', 'manejo', 'riego', 'lote', 'calculo'),
  'riego.calidadCinta': f('Qd (L/h) y CVf (%)', 'manejo', 'riego', 'lote', 'registro'),
  'riego.ciclosUso': f('ciclos', 'manejo', 'riego', 'lote', 'registro'),
  'riego.drenaje': f('% del agua aplicada', 'abiótica', 'riego', 'lote', 'sensor', PCT),
  'riego.etc': f('mm/día', 'abiótica', 'riego', 'lote', 'calculo'),
  'riego.lamina': f('mm', 'manejo', 'riego', 'lote', 'registro'),
  'riego.programacion': f('categoría (calendario o sensores)', 'manejo', 'riego', 'lote', 'registro'),
  'riego.uniformidad': f('%', 'manejo', 'riego', 'lote', 'muestreo', PCT),
  'riego.volumenAplicado': f('m³/ha', 'manejo', 'riego', 'lote', 'registro'),

  // Fertilización
  'fert.meses': f(MESES.unidad, 'manejo', 'fertilizacion', 'lote', 'registro', MESES),
  'fert.foliar': f('sí o no', 'manejo', 'fertilizacion', 'lote', 'registro'),
  'fert.fertirriego': f('sí o no', 'manejo', 'fertilizacion', 'lote', 'registro'),
  'fert.abonoOrganico': f('t/ha o m³/ha (indicar cuál)', 'manejo', 'fertilizacion', 'lote', 'registro'),
  'fert.dosisN': f('kg N/ha', 'manejo', 'fertilizacion', 'lote', 'registro'),
  'fert.dosisP': f('kg/ha (indicar si es P o P₂O₅)', 'manejo', 'fertilizacion', 'lote', 'registro'),
  'fert.dosisK': f('kg/ha (indicar si es K, K₂O o KCl)', 'manejo', 'fertilizacion', 'lote', 'registro'),
  'fert.frecuencia': f('aplicaciones por ciclo', 'manejo', 'fertilizacion', 'lote', 'registro'),
  'fert.incorporacion': f('categoría (voleo, banda, incorporado o inyectado)', 'manejo', 'fertilizacion', 'lote', 'registro'),

  // Plaguicidas
  'plag.meses': f(MESES.unidad, 'manejo', 'plaguicidas', 'lote', 'registro', MESES),
  'plag.hq': f('adimensional (dosis ÷ DL50)', 'manejo', 'plaguicidas', 'lote', 'calculo'),
  'plag.amplio': f('sí o no', 'manejo', 'plaguicidas', 'lote', 'calculo'),
  'plag.gus': f('adimensional', 'abiótica', 'plaguicidas', 'lote', 'calculo'),
  'plag.alSuelo': f('sí o no', 'manejo', 'plaguicidas', 'lote', 'registro'),

  // Cultivo
  'cultivo.absorcionNutrientes': f('kg/ha', 'biótica', 'cultivo', 'lote', 'laboratorio'),
  'cultivo.bioestimulanteFoliar': f('sí o no', 'manejo', 'cultivo', 'lote', 'registro'),
  'cultivo.biologicoAlRiego': f('sí o no', 'manejo', 'cultivo', 'lote', 'registro'),
  'cultivo.crecimiento': f('cm', 'biótica', 'cultivo', 'punto', 'muestreo'),
  'cultivo.densidad': f('plantas/ha', 'manejo', 'cultivo', 'lote', 'registro'),
  'cultivo.distanciamiento': f('m', 'manejo', 'cultivo', 'lote', 'registro'),
  'cultivo.eficienciaN': f('kg de cosecha por kg de N', 'biótica', 'cultivo', 'lote', 'calculo'),
  'cultivo.enfermedades': f('% de incidencia', 'biótica', 'cultivo', 'lote', 'muestreo', PCT),
  'cultivo.fijacionN': f('kg N/ha', 'biótica', 'cultivo', 'lote', 'laboratorio'),
  'cultivo.raices': f('g por planta', 'biótica', 'cultivo', 'punto', 'muestreo'),
  'cultivo.rendimiento': f('t/ha', 'biótica', 'cultivo', 'lote', 'registro'),

  // Plagas y polinizadores
  'plagas.meses': f(MESES.unidad, 'biótica', 'plagas', 'lote', 'muestreo', MESES),
  'plagas.porPlanta': f('insectos por planta', 'biótica', 'plagas', 'punto', 'muestreo'),
  'poli.floracionVisitada': f(MESES.unidad, 'biótica', 'polinizadores', 'finca', 'muestreo', MESES),
  'poli.floracionRiesgo': f(MESES.unidad, 'biótica', 'polinizadores', 'finca', 'muestreo', MESES),
  'poli.abundanciaRiesgo': f('m³ de copa', 'biótica', 'polinizadores', 'punto', 'muestreo'),
  'poli.sinOtrasFlores': f(MESES.unidad, 'biótica', 'polinizadores', 'finca', 'muestreo', MESES),
  'poli.abejasMuertas': f('abejas por árbol o por flor (indicar cuál)', 'biótica', 'polinizadores', 'punto', 'muestreo'),
  'spathodea.establecimiento': f('plántulas por m²', 'biótica', 'polinizadores', 'punto', 'muestreo'),
  'spathodea.floresVisibles': f('flores por copa', 'biótica', 'polinizadores', 'punto', 'muestreo'),
  'spathodea.poda': f('sí o no', 'manejo', 'polinizadores', 'punto', 'registro'),
  'spathodea.sombra': f('% de cobertura del dosel', 'biótica', 'polinizadores', 'punto', 'muestreo', PCT),

  // Terreno, paisaje y economía
  'finca.pendiente': f('%', 'abiótica', 'paisaje', 'lote', 'mapa'),
  'finca.distAgua': f('m', 'abiótica', 'paisaje', 'lote', 'mapa'),
  'finca.drenes': f('sí o no', 'manejo', 'paisaje', 'lote', 'registro'),
  'finca.humedalNatural': f('ha o % del área (indicar cuál)', 'biótica', 'paisaje', 'finca', 'satelite'),
  'finca.sombra': f('% de cobertura', 'manejo', 'paisaje', 'lote', 'muestreo', PCT),
  'finca.rentabilidad': f('moneda por ha', 'económica', 'economia', 'finca', 'registro'),

  // Índices y avisos de Trofaxis
  'riesgo.poli': f('índice de la rúbrica', 'riesgo', 'riesgo', 'finca', 'calculo'),
  'riesgo.fert': f('índice de la rúbrica', 'riesgo', 'riesgo', 'finca', 'calculo'),
  'riesgo.agua': f('índice de la rúbrica', 'riesgo', 'riesgo', 'finca', 'calculo'),
  'riesgo.suelo': f('índice de la rúbrica', 'riesgo', 'riesgo', 'finca', 'calculo'),
  'riesgo.troficas': f('índice de la rúbrica', 'riesgo', 'riesgo', 'finca', 'calculo'),
  'riesgo.lixiviacion': f('aviso (sí o no)', 'riesgo', 'riesgo', 'lote', 'calculo'),
};

// Pares que pueden ser la misma variable o partir una relación en dos nodos. No se unen solos:
// cada uno lo decide Diego en un PR (unir, renombrar o dejar separados con su diferencia escrita).
export const POR_REVISAR = [
  { ids: ['riego.lamina', 'riego.volumenAplicado'], motivo: 'Son la misma cantidad en dos unidades (1 mm de lámina = 10 m³/ha).' },
  { ids: ['suelo.fosforoLixiviado', 'agua.fosforoSubterranea'], motivo: 'Puede ser el mismo flujo de fósforo medido en dos puntos: lo que sale del suelo y lo que llega al acuífero.' },
  { ids: ['suelo.nutrientesLixiviados', 'suelo.fosforoLixiviado', 'suelo.zincLixiviado'], motivo: 'Una variable general y dos por nutriente: decidir si se separa por nutriente.' },
  { ids: ['clima.lluvia', 'clima.mesesLluvia'], motivo: 'Misma magnitud física en dos medidas: mm del período frente a meses con lluvia fuerte.' },
  { ids: ['suelo.escorrentia', 'riego.escorrentia'], motivo: 'Escorrentía por lluvia frente a escorrentía por goteo: ¿una variable con dos causas o dos variables?' },
  { ids: ['finca.sombra', 'spathodea.sombra'], motivo: 'Sombra de árboles sobre el cultivo frente a dosel cerrado que frena a Spathodea.' },
];
