// Configuración del motor de riesgo.
// Este archivo es el punto de personalización: activar o desactivar módulos,
// mover umbrales de nivel y ajustar factores, sin tocar las fórmulas.
// Los pesos y cortes son criterio propio salvo que se indique la fuente; están por calibrar con datos reales.

export const CONFIG = {
  // Propósitos de manejo para fincas sin cultivos: cada uno enfoca el dashboard en sus módulos.
  // Para agregar uno nuevo basta con sumarlo aquí.
  propositos: [
    { id: 'polinizadores', nombre: 'Manejo de polinizadores', detalle: 'Abejas nativas, especies de riesgo y enemigos naturales', modulos: ['poli', 'troficas'] },
    { id: 'hidrografico', nombre: 'Manejo hidrográfico', detalle: 'Fuentes de agua, escorrentía y suelo', modulos: ['agua', 'suelo'] },
    { id: 'riego', nombre: 'Manejo de riego', detalle: 'Diseño y eficiencia del riego', modulos: ['agua'] },
  ],

  // NIVEL DE PRESENCIA (baja / media / alta) por grupo, para especies y plagas (issue #13).
  // Cortes [a, b]: valor < a → baja; < b → media; desde b → alta.
  // CRITERIO PROPIO, POR VALIDAR con especialistas de Zamorano. Solo el método de muestreo de
  // plagas tiene fuente (estaciones de monitoreo del curso de Protección Vegetal); los cortes no.
  // Hoy el nivel de presencia es informativo: no entra en ninguna fórmula de riesgo.
  presencia: {
    polinizadores: { medida: 'Individuos vistos en flores durante 10 minutos de observación', unidad: 'individuos / 10 min', cortes: [5, 20] },
    arboles: { medida: 'Individuos por hectárea en la finca y sus bordes', unidad: 'individuos / ha', cortes: [5, 20] },
    malezas: { medida: 'Cobertura del suelo estimada a la vista en el lote', unidad: '% de cobertura', cortes: [10, 30] },
    plagas: { medida: 'Plantas con la plaga o el síntoma en 15 a 20 estaciones de monitoreo de 2 a 5 plantas', unidad: '% de plantas', cortes: [5, 20],
      fuenteMetodo: 'Monitoreo en Cultivos Hortícolas, AH Protección Vegetal (Zamorano), diapositiva 5' },
  },

  // ApiRadar: diagnóstico del problema "Spathodea campanulata y abejas nativas" (src/apiradar/diagnostico.js).
  // No agrega pesos: reutiliza la rúbrica del módulo Polinizadores. Aquí solo van los valores propios del ApiRadar.
  apiradar: {
    // Radio de exclusión alrededor de los árboles de riesgo para ubicar colonias o refugios. FUENTE: Barrantes-Vásquez
    // et al. (2018) dan 300-500 m como rango de vuelo de Trigona fulviventris (resumen del artículo, Guanacaste, Costa Rica).
    // Para Plebeia melanica no hay cifra en los documentos del proyecto: se usa el mismo radio como referencia (criterio propio).
    radioExclusionM: [300, 500],
    // Riesgo de cada árbol del censo por volumen de copa, RELATIVO al propio censo: los de más volumen (tercio superior) son
    // «alto», los del medio «medio» y el resto «bajo». Los cortes son CRITERIO PROPIO (percentiles), no un valor de la literatura.
    // Sirve para priorizar qué árbol atender primero; el radio de exclusión se aplica igual a todos los árboles censados.
    percentilesRiesgo: [1 / 3, 2 / 3],
    // Meses de floración de riesgo desde los que se pide registrar la fecha de las abejas muertas (solo texto de ayuda).
    topeAcciones: 6,
  },

  // Módulos activos, en el orden en que aparecen en el dashboard.
  modulosActivos: ['poli', 'fert', 'agua', 'suelo', 'troficas'],

  // Peso de cada módulo en el índice ambiental global (ilustrativos, por calibrar).
  // Si se desactivan módulos, el índice se recalcula con los pesos de los activos.
  pesos: { poli: 0.25, fert: 0.2, agua: 0.2, suelo: 0.15, troficas: 0.2 },

  // Confianza mínima de un módulo para calificarlo: con menos datos se muestra «Sin datos suficientes» y no entra al índice
  // global (un módulo sin datos no es riesgo cero). Criterio propio, por validar.
  confianzaMinima: 0.25, // una cuarta parte del peso de la rúbrica con dato

  // Umbrales del índice 0-100.
  niveles: { alto: 67, medio: 34 },

  // RÚBRICA ADITIVA por módulo. Cada variable tiene un peso (suman 100 por módulo) y un
  // puntaje de 0, 50 o 100 según sus cortes. Riesgo del módulo = Σ peso·puntaje / Σ peso,
  // solo con las variables que tienen dato. Confianza = peso con dato / peso total
  // (un dato faltante baja la confianza, no cuenta como riesgo cero).
  // Cortes [a, b]: valor ≤ a → 0; ≤ b → 50; mayor → 100. Con "inverso": valor ≥ a → 0; ≥ b → 50; menor → 100.
  // Salvo que diga otra cosa, pesos y cortes son CRITERIO PROPIO, por validar con especialistas.
  rubrica: {
    poli: {
      coincidencia: { peso: 25, cortes: [0, 1] }, // meses con aplicación no biológica en floración visitada
      claseEnFloracion: { peso: 15 }, // producto más agresivo aplicado en floración
      especiesRiesgo: { peso: 10, cortes: [0, 2] }, // meses de floración de especies de riesgo
      abundanciaRiesgo: { peso: 15, cortes: [0, 1000] }, // m³ de copa de especies de riesgo (Osorio 2025: la mayoría ≤ 1 000 m³)
      abundanciaConteo: { cortes: [0, 1] }, // sin medidas de copa: n.º de árboles de riesgo
      alternativas: { peso: 15, cortes: [0, 0.5] }, // fracción de meses de floración de riesgo sin otra floración segura
      aguaSeca: { peso: 10, cortes: [0, 0.5] }, // fracción de meses de floración de riesgo sin lluvia
      foliarEnFloracion: { peso: 5 }, // aplicaciones foliares (fertilizantes) en floración visitada
      abejasNativas: { peso: 5 }, // receptor: abejas nativas registradas
      climaFloracion: { peso: 0 }, // clima en la floración de riesgo: solo informa (hipótesis de Kuniyoshi 2025, no medida)
    },
    fert: {
      dosis: { peso: 30, cortes: [1, 1.2] }, // N aplicado / N objetivo
      lluvia: { peso: 20, cortes: [0, 0.5] }, // fracción del N (o de las fertilizaciones) en meses de lluvia fuerte
      fraccionamiento: { peso: 10, cortes: [0.5, 0.75] }, // mayor fracción del N aplicada en un solo mes (plan)
      metodo: { peso: 10, cortes: [0, 0.5] }, // fracción del N como urea al voleo sin incorporar (plan)
      fosforo: { peso: 10, cortes: [1, 1.2] }, // P2O5 aplicado / P2O5 objetivo (plan)
      pendiente: { peso: 10 },
      distancia: { peso: 10, cortes: [100, 30], inverso: true }, // m al cuerpo de agua
    },
    agua: {
      sistema: { peso: 25 }, // sistema de riego según su eficiencia de aplicación (FAO)
      distancia: { peso: 20, cortes: [100, 30], inverso: true }, // m al cuerpo de agua
      proporcionProductiva: { peso: 15, cortes: [0.5, 0.8] }, // área productiva / área total
      disenoRiego: { peso: 30 }, // validación del módulo Riego contra FAO-56
      fertirriegoEscorrentia: { peso: 10 }, // fertirriego con un diseño que escurre (solo si hay fertirriego)
    },
    suelo: {
      sueloDesnudoLluvia: { peso: 35, cortes: [0, 1] }, // meses de suelo desnudo con lluvia fuerte
      labranza: { peso: 25 },
      pendiente: { peso: 25 },
      fertSueloDesnudo: { peso: 15, cortes: [0, 0.25] }, // fracción de N+P2O5 aplicada sobre suelo desnudo en lluvias (plan)
    },
    troficas: {
      amplioEspectro: { peso: 35, cortes: [0, 0.5] }, // fracción de productos de amplio espectro
      amplioEnPlaga: { peso: 25, cortes: [0, 0.5] }, // fracción de meses de amplio espectro con plaga presente
      nativas: { peso: 25, cortes: [0.6, 0.3], inverso: true }, // fracción de especies silvestres nativas
      aplicacionCosecha: { peso: 15, cortes: [0, 0] }, // meses con aplicación en cosecha
    },
  },
  // Puntajes por categoría (0 = menor riesgo, 100 = mayor).
  categorias: {
    pendiente: { plana: 0, ondulada: 50, fuerte: 100 },
    labranza: { cero: 0, minima: 50, convencional: 100 },
    // Eficiencia de aplicación FAO (TM4, Tabla 8): goteo 90 %, aspersión 75 %, superficie 60 %.
    sistemaRiego: { goteo: 0, aspersion: 50, gravedad: 100, ninguno: 0 },
    clasePlaguicida: { ninguno: 0, biologico: 0, selectivo: 50, amplio: 100 },
  },

  // Reglas GLOBALG.A.P. IFA v6 usadas por el panel de certificación.
  globalgap: { margenMinorMusts: 0.05, diasCierreNC: 28 },

  // Mapa satelital de la finca (Issue #10). Las coordenadas se guardan solo en este navegador.
  mapa: {
    // Capa: EOxCloudless 2024 (Sentinel-2, ~10 m por píxel). Licencia CC BY-NC-SA 4.0 para uso
    // no comercial (proyectos universitarios); uso comercial requiere licencia de EOX.
    // Fuente: https://cloudless.eox.at/documentation/license
    capa: {
      url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg',
      atribucion: 'EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2024)',
      enlace: 'https://cloudless.eox.at',
    },
    zoomMin: 3, zoomMax: 16, // con ~10 m por píxel, más allá de 16 solo se ve borroso
    inicio: { lat: 14.75, lon: -86.6, zoom: 7 }, // vista general de Honduras
    // Rectángulo aproximado de Honduras continental e islas (criterio propio, solo para avisar).
    honduras: { latMin: 12.9, latMax: 17.5, lonMin: -89.4, lonMax: -83.1 },
    toleranciaArea: 0.2, // aviso si el área dibujada difiere más de 20 % de la declarada (criterio propio)
  },

  // Clima por ubicación (Issue #8, crítica 3): Open-Meteo, clima histórico (ERA5 / ERA5-Land de Copernicus).
  // Datos con licencia CC BY 4.0; la API es gratis para uso no comercial (https://open-meteo.com/en/licence).
  clima: {
    url: 'https://archive-api.open-meteo.com/v1/archive',
    atribucion: 'Weather data by Open-Meteo.com (CC BY 4.0), con datos de Copernicus Climate Change Service (ERA5)',
    enlace: 'https://open-meteo.com/',
    anios: 10, // años completos que se promedian (criterio propio; la normal de la OMM usa 30)
    minDias: 0.8, // fracción de días con dato para usar un mes de un año (criterio propio)
    minAnios: 5, // años válidos para dar el promedio de un mes (criterio propio)
    lluviaFuerteMm: 100, // mes de "lluvia fuerte": 100 mm o más (criterio propio, por validar)
    percentilEtoDiseno: 0.9, // ETo de diseño = percentil 90 de la ETo diaria del mes más exigente (criterio propio)
    alturaViento: 10, // m: Open-Meteo da el viento a 10 m; se pasa a 2 m con FAO-56, ec. 47
    decimalesCoord: 2, // coordenadas que se envían al servicio: 2 decimales (~1 km)
    esperaMs: 30000, // tiempo máximo de espera de la descarga
    cacheDias: 180, // días que se reutiliza una descarga del mismo punto
  },

  // Riego: hidráulica y reservorio. Fuente de cada valor al lado.
  riego: {
    hfMaxFraccion: 0.1, // pérdida máxima = 10 % de la presión de operación (hoja Lateral C11 del Lab de Riego, Zamorano)
    velocidadMax: 1.5, // m/s en tuberías de PVC: criterio propio, valor común de diseño; la hoja del Lab usa 2 m/s para dimensionar principales
    fraccionEvaporacion: 0.8, // fracción de la radiación que evapora agua del reservorio (cubicación del Lab, G30)
    bordeLibre: 0.1, // aumento de profundidad para que no desborde (cubicación del Lab, R20)
  },

  // Plaguicidas: peligro para himenópteros polinizadores y condiciones de aplicación. Fuente de cada valor al lado.
  plag: {
    // HQ = dosis (g i.a./ha) ÷ DL50 por contacto (µg/abeja). Umbral de la UE para adultos por contacto:
    // 42 en aspersión hacia abajo y 85 hacia arriba o de lado (FAO, Pesticide Registration Toolkit).
    umbralHQ: { abajo: 42, arriba: 85 },
    // Clases de la EPA por DL50 de contacto (µg/abeja): ≤ 2 altamente tóxico; > 2 y < 11 tóxico; ≥ 11 relativamente
    // no tóxico (EPA, citado por Pesticide Stewardship).
    epa: { alta: 2, baja: 11 },
    // Margen para abejas sin aguijón registradas en la finca: HQ × 10. Derivado de Arena y Sgolastra (2014): en ~95 %
    // de los casos la sensibilidad relativa a Apis fue menor de 10. Es una derivación, no una norma.
    factorSinAguijon: 10,
    gusAlto: 2.8, // índice GUS > 2.8: lixiviación alta (Gustafson 1989; interpretación del PPDB)
    copaMl: 25, bombaL: 18, barrilL: 200, // copa de 25 ml, bomba de mochila de 18 L y barril de 200 L (tabla SAG)
    // Volumen de agua por hectárea según los días después del trasplante (clase: Correcta aplicación).
    volumenClase: [{ ddt: 7, litros: 100 }, { ddt: 28, litros: 300 }, { ddt: 70, litros: 600 }],
    horario: [[5, 9.5], [15.5, 18]], // horas de aplicación: 5:00-9:30 y 15:30-18:00 (clase: Correcta aplicación)
    vientoMax: 10, // km/h (clase: Correcta aplicación)
    temp: [15, 25], // °C (clase: Correcta aplicación)
    hrMin: 50, // % de humedad relativa (clase: Correcta aplicación)
    lluviaMinH: 4, // horas sin lluvia después de aplicar (clase: Correcta aplicación)
    ph: [5.5, 6.5], // pH del agua de la mezcla (clase: Correcta aplicación; la tabla SAG dice 5-6)
    phCobre: [6.5, 7], // pH para productos a base de cobre (tabla SAG)
    toleranciaCopas: 0.15, // diferencia aceptada entre copas por bomba y dosis por barril de la tabla SAG (criterio propio)
  },

  // Memoria de casos (k-NN). Criterio propio, por calibrar con casos reales (Etapa 3).
  casos: {
    k: 3, // fincas parecidas que se muestran
    // Peso de cada rasgo del perfil (suman 1). "scores" se reparte entre los módulos activos.
    pesos: { cultivo: 0.2, riego: 0.1, pendiente: 0.1, distAgua: 0.1, propNativas: 0.1, mesesCoincidencia: 0.1, scores: 0.3 },
    topeDistAgua: 500, // m; más allá, la distancia ya no distingue fincas
    umbralParecido: 0.1, // distancia de un rasgo hasta la que se considera "parecido"
    coberturaMinima: 0.5, // fracción del peso que debe poder compararse
  },

  // Relación entre módulos: un gráfico de dispersión por cada par, n(n−1)/2 pares (3 módulos → 3 gráficos).
  // Cada punto es una finca de la memoria de casos más la tuya. Solo muestra asociación: no cambia ningún puntaje.
  relaciones: {
    modulos: ['poli', 'fert', 'agua', 'suelo', 'troficas'], // los 5 módulos → 10 gráficos (decisión de Diego, 2026-10-11)
    minPuntos: 20, // criterio propio: con menos fincas, la r se muestra pero se avisa que es muy inestable
    cortes: { moderada: 0.3, fuerte: 0.7 }, // |r| para llamar la asociación débil, moderada o fuerte. Criterio propio (regla práctica usual).
    // Datos que entran a los dos módulos del par (revisado en src/modules/): parte de la asociación sale de la
    // misma fórmula, no de la finca. Un par que no aparece no comparte datos de entrada.
    compartidos: {
      'poli|fert': ['meses de lluvia fuerte', 'plan de fertilización'],
      'poli|agua': ['plan de fertilización'],
      'poli|suelo': ['meses de lluvia fuerte', 'plan de fertilización'],
      'poli|troficas': ['plaguicidas (productos y meses)', 'inventario de especies'],
      'fert|agua': ['distancia al cuerpo de agua', 'plan de fertilización'],
      'fert|suelo': ['meses de lluvia fuerte', 'pendiente', 'plan de fertilización'],
      'agua|suelo': ['plan de fertilización'],
    },
  },

  // Nube (Etapa 2 de la memoria de casos): proyecto Supabase "biogap".
  // La clave publicable es pública por diseño; el acceso lo limita la seguridad por filas (RLS) de la base.
  // NUNCA pongas aquí la clave service_role. Con url o clave vacías, la app funciona solo en local.
  nube: {
    url: 'https://kfybqlknlkxrqphwopfx.supabase.co',
    clavePublicable: 'sb_publishable_GZY64ytTNLaL9898VrIGKA_P0ZdFOXb',
    maxCasos: 500, // casos de la comunidad que se descargan
  },
};
