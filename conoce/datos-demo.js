// Generado por scripts/conoce-datos.mjs. No editar a mano: corre `node scripts/conoce-datos.mjs`.
// Finca demostrativa (ficticia) evaluada con el motor de la app, y cifras tomadas de los catálogos y del cerebro.
export const DEMO = {
  "finca": {
    "nombre": "Finca demostrativa",
    "depto": "Francisco Morazán",
    "area": 45,
    "cultivos": [
      {
        "nombre": "Melón",
        "ha": 20
      },
      {
        "nombre": "Maíz",
        "ha": 8
      }
    ]
  },
  "indice": {
    "v": 69,
    "nivel": "Alto",
    "cortes": {
      "medio": 34,
      "alto": 67
    }
  },
  "temas": [
    {
      "id": "poli",
      "nombre": "Polinizadores",
      "v": 88,
      "nivel": "Alto"
    },
    {
      "id": "fert",
      "nombre": "Fertilización",
      "v": 60,
      "nivel": "Medio"
    },
    {
      "id": "agua",
      "nombre": "Agua",
      "v": 71,
      "nivel": "Alto"
    },
    {
      "id": "suelo",
      "nombre": "Suelo",
      "v": 63,
      "nivel": "Medio"
    },
    {
      "id": "troficas",
      "nombre": "Cadenas tróficas",
      "v": 58,
      "nivel": "Medio"
    }
  ],
  "meses": [
    {
      "lluvia": false,
      "flor": true,
      "florRiesgo": true,
      "aplic": false,
      "siembra": true,
      "cosecha": false,
      "coinc": []
    },
    {
      "lluvia": false,
      "flor": true,
      "florRiesgo": true,
      "aplic": true,
      "siembra": true,
      "cosecha": false,
      "coinc": [
        "Aplicación durante floración visitada",
        "Amplio espectro con plaga presente"
      ]
    },
    {
      "lluvia": false,
      "flor": true,
      "florRiesgo": true,
      "aplic": true,
      "siembra": false,
      "cosecha": true,
      "coinc": [
        "Aplicación durante floración visitada",
        "Amplio espectro con plaga presente",
        "Aplicación en mes de cosecha"
      ]
    },
    {
      "lluvia": false,
      "flor": true,
      "florRiesgo": true,
      "aplic": false,
      "siembra": false,
      "cosecha": true,
      "coinc": []
    },
    {
      "lluvia": false,
      "flor": false,
      "florRiesgo": false,
      "aplic": false,
      "siembra": true,
      "cosecha": false,
      "coinc": []
    },
    {
      "lluvia": true,
      "flor": false,
      "florRiesgo": false,
      "aplic": false,
      "siembra": true,
      "cosecha": false,
      "coinc": [
        "Fertilización con lluvia fuerte",
        "Suelo desnudo con lluvia"
      ]
    },
    {
      "lluvia": true,
      "flor": false,
      "florRiesgo": false,
      "aplic": true,
      "siembra": false,
      "cosecha": false,
      "coinc": [
        "Fertilización con lluvia fuerte"
      ]
    },
    {
      "lluvia": false,
      "flor": false,
      "florRiesgo": false,
      "aplic": true,
      "siembra": false,
      "cosecha": false,
      "coinc": []
    },
    {
      "lluvia": true,
      "flor": false,
      "florRiesgo": false,
      "aplic": false,
      "siembra": false,
      "cosecha": true,
      "coinc": []
    },
    {
      "lluvia": true,
      "flor": false,
      "florRiesgo": false,
      "aplic": false,
      "siembra": false,
      "cosecha": true,
      "coinc": []
    },
    {
      "lluvia": false,
      "flor": false,
      "florRiesgo": false,
      "aplic": false,
      "siembra": false,
      "cosecha": false,
      "coinc": []
    },
    {
      "lluvia": false,
      "flor": false,
      "florRiesgo": false,
      "aplic": false,
      "siembra": false,
      "cosecha": false,
      "coinc": []
    }
  ],
  "cifras": {
    "temas": 5,
    "productosSag": 132,
    "ingredientes": 53,
    "aniosClima": 10,
    "tesis": 40,
    "frases": 215
  },
  "citas": [
    {
      "clave": "alpizar-2000",
      "pagina": "8",
      "frase": "El movimiento del agua a través del perfil del suelo es el factor que causa mayor lixiviación",
      "fuente": "Alpízar Vargas, N. F. (2000). Uso de lisímetros para evaluar el movimiento de nitrógeno y potasio en suelos bananeros de Coyoles, Honduras, con potencial de lixiviación. Proyecto especial de Ingeniero Agrónomo, Zamorano, Honduras."
    },
    {
      "clave": "echeverria-2015",
      "pagina": "19",
      "frase": "El sistema de goteo fue el que utilizó la menor cantidad de agua durante el ciclo usando un total de 9,075 m³/ha que es un 59% menos de agua utilizada que el sistema de riego por inundación, y un 31% menos que el sistema de riego por aspersión.",
      "fuente": "Echeverría Bodden, O. A. (2015). Efecto de tres sistemas de riego y dos variedades en el rendimiento de arroz (Oryza sativa) bajo dos métodos de siembra. Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras."
    },
    {
      "clave": "osorio",
      "pagina": "35",
      "frase": "manejar los árboles mediante podas o control de rebrotes, lo cual ayudaría a reducir significativamente la cantidad de flores durante la época de floración.",
      "fuente": "Osorio Banegas, N. E. (2025). Evaluación de la distribución de Spathodea campanulata P. Beauv. (Bignoniaceae) en el campus de la Universidad Zamorano, Honduras. Proyecto Especial de Graduación, Universidad Zamorano. Asesores: D. Obando y J. Díaz."
    }
  ]
};
