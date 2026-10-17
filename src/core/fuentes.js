// Fuentes de los vínculos ecológicos. Solo lo que dicen los documentos leídos; lo demás se marca.
export const FUENTES = {
  kuniyoshi: {
    cita: 'Kuniyoshi Aguilar, A. S. (2026). Fenología de Spathodea campanulata en el campus de la Universidad Zamorano, Honduras, y presencia de abejas muertas asociadas a sus flores. Proyecto Especial de Graduación, Universidad Zamorano. Asesores: D. Obando y O. Komar.',
    corta: 'Kuniyoshi (2026), PEG Zamorano',
    // Datos leídos en el documento (portada: «Honduras, agosto de 2026»). El .docx no trae páginas: se cita la sección o la figura.
    datos: [
      { id: 'floracion', titulo: 'Meses de floración de Spathodea en el campus de Zamorano', valor: 'septiembre de 2025 a enero de 2026, con más flores en octubre y noviembre', unidad: '', donde: 'Resumen y Conclusiones', claves: ['spathodea', 'floración', 'fenología'] },
      { id: 'asincronia', titulo: 'Árboles de Spathodea con flor o fruto durante el estudio', valor: '14 de 24', unidad: 'árboles', donde: 'Resumen', nota: 'La floración no es simultánea entre árboles.', claves: ['spathodea', 'fenología'] },
      { id: 'maxAbejas', titulo: 'Mayor número de abejas muertas en un día de muestreo', valor: '12 en 20 flores caídas (16 de enero de 2026)', unidad: 'abejas', donde: 'Resultados, Figura 9', claves: ['spathodea', 'abejas'] },
      { id: 'destructivo', titulo: 'Abejas muertas en el muestreo destructivo', valor: '14 en 531 flores de un árbol', unidad: 'abejas', donde: 'Resumen y Discusión', nota: 'Muestreo puntual; la autora advierte que no permite una relación proporcional.', claves: ['spathodea', 'abejas'] },
      { id: 'regresion', titulo: 'Flores visibles en árboles cercanos frente a abejas muertas', valor: 'pendiente 0,077; R² = 0,2147; Spearman positiva débil, no significativa (p > 0,05)', unidad: '', donde: 'Resultados, Figura 10', nota: 'Midió flores visibles en copas cercanas, no volumen de copa. Muestreos de enero y febrero de 2026.', claves: ['spathodea', 'abejas', 'copa'] },
      { id: 'especies', titulo: 'Especies de las abejas muertas', valor: 'no identificadas', unidad: '', donde: 'Limitaciones', claves: ['abejas'] },
    ],
  },
  osorio: {
    cita: 'Osorio Banegas, N. E. (2025). Evaluación de la distribución de Spathodea campanulata P. Beauv. (Bignoniaceae) en el campus de la Universidad Zamorano, Honduras. Proyecto Especial de Graduación, Universidad Zamorano. Asesores: D. Obando y J. Díaz.',
    corta: 'Osorio (2025), PEG Zamorano',
    url: 'https://bdigital.zamorano.edu/items/8d53e565-4559-43ab-833e-b0e58ae2f6f3',
    // Páginas impresas del PDF. Los anexos traen coordenadas de árboles: no se copian.
    datos: [
      { id: 'ecuacion3', titulo: 'Volumen de copa de un árbol', valor: 'V = 4/3 · π · (D/2)² · (H/2), con D el diámetro y H la altura de copa', unidad: 'm³', donde: 'pág. 15, Ecuación 3', nota: 'La usan el módulo Polinizadores y el censo del ApiRadar.', claves: ['spathodea', 'copa', 'censo'] },
      { id: 'censo', titulo: 'Árboles de Spathodea en el campus de Zamorano', valor: '124 en 421,15 ha (0,29 por hectárea)', unidad: 'árboles', donde: 'pág. 28 y 34', claves: ['spathodea', 'censo'] },
      { id: 'copas', titulo: 'Volumen de copa de los árboles del campus', valor: 'la mayoría ≤ 1 000; unos pocos lo superan mucho', unidad: 'm³', donde: 'pág. 26, Figura 6', claves: ['spathodea', 'copa'] },
      { id: 'copaFloracion', titulo: 'Más volumen de copa, más floración', valor: 'expectativa de la autora, no medida', unidad: '', donde: 'pág. 27', nota: 'Es el paso que une el volumen de copa con las abejas muertas; nadie lo ha medido todavía.', claves: ['spathodea', 'copa', 'floración'] },
      { id: 'sustitucion', titulo: 'Especies nativas propuestas para sustituir a Spathodea', valor: 'Tabebuia rosea y Swietenia macrophylla', unidad: '', donde: 'pág. 32 a 34', claves: ['spathodea', 'sustitución'] },
      { id: 'poda', titulo: 'Podas o control de rebrotes para reducir la floración', valor: 'recomendación, no medida', unidad: '', donde: 'pág. 35', claves: ['spathodea', 'poda', 'floración'] },
    ],
  },
  barrantes: {
    cita: 'Barrantes-Vásquez, A., Sánchez-Chaves, L., Hernández-Sánchez, G. y Montero-Flores, W. (2018). Plantas alimenticias de la abeja sin aguijón Trigona fulviventris (Guérin-Méneville) en Pocosol, Guanacaste, Costa Rica. Revista Forestal Mesoamericana Kurú, 16(38), 13-23. https://doi.org/10.18845/rfmk.v16i38.3992',
    corta: 'Barrantes-Vásquez et al. (2018), Kurú 16(38)',
    // El resumen en inglés del registro (kimuk.conare.ac.cr) dice "within the flight range of this species (300-500 m)".
    // El resumen en español de la revista no trae la cifra. Verificado en el resumen, no en el texto completo.
  },
};
