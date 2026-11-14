// Generado por `node scripts/cerebro.mjs` desde cerebro/Tesis/. No editar a mano: edita las notas de las tesis.
// Solo trae lo verificado: cada frase está en la página indicada del PDF de la tesis.
export const TESIS = {
  "tesis": [
    {
      "clave": "alpizar-2000",
      "cita": "Alpízar Vargas, N. F. (2000). Uso de lisímetros para evaluar el movimiento de nitrógeno y potasio en suelos bananeros de Coyoles, Honduras, con potencial de lixiviación. Proyecto especial de Ingeniero Agrónomo, Zamorano, Honduras.",
      "tema": "suelo",
      "cultivo": "banano",
      "lugar": "Coyoles, Yoro, Honduras (Standard Fruit Company)",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "8",
          "cita": "Los resultados del estudio con los lisímetros de drenaje mostraron que la concentración en los lixiviados no es diferente significativamente (P<0.05) cuando la fertilización se fracciona.",
          "de": "fert.frecuencia",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "0",
          "base": "medido",
          "resultado": "Fraccionar urea y KCl (semanal o quincenal por fertirriego, cada 28 días o trimestral a mano) no cambió la concentración de nitrato y potasio en el lixiviado",
          "coincidencia": "aproximada (OCR, 0.83)"
        },
        {
          "seccion": "Relaciones",
          "pagina": "8",
          "cita": "El movimiento del agua a través del perfil del suelo es el factor que causa mayor lixiviación",
          "de": "riego.drenaje",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "El agua que atraviesa el perfil es lo que más arrastra nitrato y potasio (lo dice el resumen; no lo midió por separado)",
          "coincidencia": "aproximada (OCR, 0.86)"
        },
        {
          "seccion": "Relaciones",
          "pagina": "33",
          "cita": "el regadío puede facilitar la contaminación de las aguas por nitrato debido a percolación hacia capas más profundas",
          "de": "riego.drenaje",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "citado",
          "resultado": "El regadío facilita que el nitrato llegue al agua subterránea por percolación (Aragón 1997, de segunda mano)",
          "coincidencia": "aproximada (OCR, 0.84)"
        },
        {
          "seccion": "Umbrales",
          "pagina": "8",
          "cita": "Los nutrientes concentrados a profundidades mayores de 40 cm no son aprovechados por las raíces del banano",
          "variable": "suelo.nutrientesLixiviados",
          "umbral": "En banano, el nutriente que baja de 40 cm se considera perdido (afirmado en el resumen)",
          "coincidencia": "aproximada (OCR, 0.94)"
        },
        {
          "seccion": "Umbrales",
          "pagina": "33",
          "cita": "El fertilizante no debe ser puesto en el agua desde el comienzo del riego, sino después de haber aplicado el 20-25% del volumen de agua",
          "variable": "fert.fertirriego",
          "umbral": "Inyectar el fertilizante después del 20–25 % del volumen de riego y terminar al 80–90 % (Sagardoy 1992, de segunda mano)",
          "coincidencia": "aproximada (OCR, 0.90)"
        },
        {
          "seccion": "Datos",
          "pagina": "53",
          "cita": "La frecuencia trimestral resultó en promedio con los valores más altos de concentración de NO3",
          "dato": "Frecuencia con más nitrato en el lixiviado",
          "valor": "trimestral, en promedio (sin diferencia estadística con las demás)",
          "coincidencia": "aproximada (OCR, 0.90)"
        },
        {
          "seccion": "Datos",
          "pagina": "53",
          "cita": "El estudio reconfirmó que el NO3- se mueve más que el K+ con el agua del suelo",
          "dato": "Movilidad de los nutrientes",
          "valor": "el nitrato se mueve más que el potasio con el agua del suelo",
          "coincidencia": "aproximada (OCR, 0.82)"
        },
        {
          "seccion": "Datos",
          "pagina": "53",
          "cita": "Los suelos bajo estudio indican tener una buena capacidad para retener el K aplicado.",
          "dato": "Retención de potasio",
          "valor": "los suelos estudiados retienen bien el K aplicado",
          "coincidencia": "aproximada (OCR, 0.96)"
        }
      ],
      "alertas": [
        "Los lisímetros de succión no sacaron solución del suelo: todo sale de los de drenaje, con dos réplicas por tratamiento. La tesis dice que el muestreo de lixiviados no se hizo bien y que hubo efecto residual de aplicaciones anteriores (pág. 51).",
        "En los lisímetros se regó a mano con regadera, no con el microaspersor de la finca (pág. 40)."
      ]
    },
    {
      "clave": "benavides-jara-2014",
      "cita": "Benavides Cabezas, Á. V. y Jara Velasteguí, E. I. (2014). Comparación de tres sistemas de riego para la producción de arroz con tres densidades de siembra en Zamorano. Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "arroz",
      "lugar": "Zamorano, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "17",
          "cita": "En general los tratamientos con riego por inundación intermitente tuvieron los mejores rendimientos seguidos del riego por aspersión y finalmente secano favorecido.",
          "de": "riego.lamina",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "Arroz Playitas: inundación intermitente (1 812,5 mm de riego) rindió más que aspersión (928 mm) y secano favorecido (406 mm); todos recibieron además 610,6 mm de lluvia",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "17",
          "cita": "Se observó que en todos los sistemas de riego se obtuvieron los mejores rendimientos con la densidad de siembra más alta (300 lb/ha) siendo significativa en aspersión",
          "de": "cultivo.densidad",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "300 lb/ha rindió más en los tres sistemas; la diferencia solo fue significativa en aspersión",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "12",
          "cita": "Eficiencia en uso del agua: se tomaron los datos de rendimiento y se dividieron para el total de agua aplicado al cultivo",
          "nombre": "Eficiencia en uso del agua",
          "formula": "m³ de agua total (riego + lluvia) por kg de grano al 13 % de humedad (ver alertas)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "13",
          "cita": "Para el sistema de inundación intermitente se aplicó 1812.5 mm de agua.",
          "dato": "Riego aplicado por sistema",
          "valor": "inundación intermitente 1 812,5 mm; aspersión 928 mm; secano favorecido 406 mm; lluvia 610,6 mm",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "4",
          "cita": "La eficiencia en uso de agua fue de 3.11 a 4.27 m³/kg.",
          "dato": "Eficiencia en uso del agua",
          "valor": "de 3,11 a 4,27 m³ por kg de arroz",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "La fórmula dice rendimiento ÷ agua, pero las unidades (m³/kg) son agua ÷ rendimiento (pág. 12).",
        "El sistema de riego y la cantidad de agua van juntos: la relación es de lámina total, no de un sistema aislado.",
        "El resumen nombra una densidad de 200 lb/ha que no se probó (las densidades fueron 220, 260 y 300 lb/ha)."
      ]
    },
    {
      "clave": "brenes-2004",
      "cita": "Brenes Muñoz, T. (2004). Evaluación de biodisponibilidad de nutrientes bajo tres sistemas de riego y dos niveles de ácido húmico para caña de azúcar en el Valle de Cantarranas, Honduras. Trabajo de graduación, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "caña de azúcar",
      "lugar": "Compañía Azucarera Tres Valles, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "31",
          "cita": "La humedad del suelo influye directamente en la disponibilidad de nutrientes, en los tratamientos donde la humedad en el suelo fue mayor obtuvieron mejores promedios en todas las variables medidas.",
          "de": "suelo.humedad",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "Donde el suelo tuvo más humedad (aspersión) hubo mejores promedios en todas las variables; sistema, suelo y manejo van mezclados (ver alertas)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "31",
          "cita": "La lámina en teoría aplicada no se relaciona con la humedad del suelo.",
          "de": "riego.lamina",
          "a": "suelo.humedad",
          "sentido": "0",
          "base": "medido",
          "resultado": "La lámina teórica aplicada no se reflejó en la humedad del suelo medida",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "31",
          "cita": "los suelos de riego por gravedad y aspersión de texturas media a gruesas y sin compactación, le proporcionan a la planta una mejor absorción de los nutrimentos en comparación con los suelos arcillosos y compactados del riego con goteo",
          "de": "suelo.compactacion",
          "a": "cultivo.absorcionNutrientes",
          "sentido": "−",
          "base": "afirmado",
          "resultado": "Los lotes con goteo (arcillosos y compactados) absorbieron peor los nutrientes que los de gravedad y aspersión (textura media a gruesa, sin compactación); es una comparación entre lotes",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "7",
          "cita": "La humedad en aspersión fue mayor que en gravedad y goteo, debido a una mejor eficiencia del sistema y características del suelo",
          "dato": "Humedad del suelo por sistema",
          "valor": "aspersión más alta que gravedad y goteo",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Cada sistema de riego estaba en un lote distinto con su propio suelo. La tesis dice que no se puede atribuir el resultado al sistema de riego, porque también influye el manejo (pág. 31).",
        "El goteo trabajó con lámina deficitaria y con problemas de manejo (pág. 7 y 31)."
      ]
    },
    {
      "clave": "castillo-2007",
      "cita": "Castillo Samudio, R. R. (2007). Efecto de la aplicación de TRICHOZAM® (Trichoderma harzianum) en la producción de maíz dulce (Zea mays) variedad Golden Baby. Proyecto especial, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "cultivo",
      "cultivo": "maíz dulce",
      "lugar": "Hortifresh, Francisco Morazán, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "7",
          "cita": "Los tratamientos con tres y cuatro aplicaciones con TRICHOZAM® se obtuvieron mazorcas de mayor longitud",
          "de": "cultivo.biologicoAlRiego",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "Tres y cuatro aplicaciones de Trichoderma por el goteo dieron mazorcas más largas",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "7",
          "cita": "Las raíces de maíz dulce aumentaron de peso con mayores dosis de Trichoderma harzianum.",
          "de": "cultivo.biologicoAlRiego",
          "a": "cultivo.raices",
          "sentido": "+",
          "base": "medido",
          "resultado": "Más dosis de Trichoderma, raíces más pesadas",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "7",
          "cita": "Las aplicaciones se realizaron con el riego por goteo usando 240 g/ha/aplicación de TRICHOZAM®",
          "dato": "Dosis por aplicación con el riego",
          "valor": "240 g/ha de TRICHOZAM®",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
    },
    {
      "clave": "cerrato-2022",
      "cita": "Cerrato Dubon, E. A. (2022). Efecto de la sombra en la conservación de humedad de suelo y la productividad de café en el sistema agroforestal de la finca Santa Teresa, El Paraíso, Honduras. Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "suelo",
      "cultivo": "café",
      "lugar": "finca Santa Teresa, El Paraíso, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "9",
          "cita": "se encontraron diferencias significativas (p<0.05) en la humedad del suelo, específicamente de la sombra mixta al 65% con respecto a los demás tratamientos",
          "de": "finca.sombra",
          "a": "suelo.humedad",
          "sentido": "+",
          "base": "medido",
          "resultado": "Sombra mixta al 65 % mantuvo más humedad (56 %) que Inga, mixta al 45 % y plátano (p<0,05), de enero a mayo de 2022",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "9",
          "cita": "el mejor tratamiento fue café con sombra de plátano con un total de 2,599.57 kg/ha",
          "dato": "Mayor productividad de café",
          "valor": "con sombra de plátano, 2 599,57 kg/ha",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "El resumen da 56,05 % de humedad y las conclusiones 56,01 % (pág. 9 y 33).",
        "No dice si la diferencia de productividad entre sombras es significativa. Una finca y una temporada."
      ]
    },
    {
      "clave": "chi-bautista-2011",
      "cita": "Chi Serrano, A. A. y Bautista Delcid, S. E. (2011). Efecto de dos descargas y dos distanciamientos entre surcos y cuatro láminas de riego en caña de azúcar. Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "caña de azúcar",
      "lugar": "Compañía Azucarera Tres Valles, Honduras",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "En el ensayo de cuatro láminas de riego no hubo diferencia significativa (P≤0.05) para variables agronómicas ni de producción.",
          "de": "riego.lamina",
          "a": "cultivo.rendimiento",
          "sentido": "0",
          "base": "medido",
          "resultado": "Láminas de 50, 80, 100 y 120 % de la ETc: sin diferencia en producción",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "Los beneficios netos más altos y costos variables totales más bajos se obtuvieron con la lámina de 50%",
          "de": "riego.lamina",
          "a": "finca.rentabilidad",
          "sentido": "−",
          "base": "medido",
          "resultado": "La lámina de 50 % dio el mayor beneficio neto (solo 211 mm en las primeras 15 semanas)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "el distanciamiento de 1.8 m mostró un aumento de 17% más en toneladas de azúcar por hectárea comparado con el de 2.4 m",
          "de": "cultivo.distanciamiento",
          "a": "cultivo.rendimiento",
          "sentido": "−",
          "base": "medido",
          "resultado": "Surcos a 1,8 m: 17 % más toneladas de azúcar por hectárea que a 2,4 m",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "11",
          "cita": "Lámina (100%) = Evaporación diaria acumulada semanalmente × Kc",
          "nombre": "Lámina de riego al 100 %",
          "formula": "Lámina (100 %) = evaporación diaria acumulada por semana × Kc",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
    },
    {
      "clave": "echeverria-2015",
      "cita": "Echeverría Bodden, O. A. (2015). Efecto de tres sistemas de riego y dos variedades en el rendimiento de arroz (Oryza sativa) bajo dos métodos de siembra. Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "arroz",
      "lugar": "Zamorano, Honduras",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "19",
          "cita": "El sistema de goteo fue el que utilizó la menor cantidad de agua durante el ciclo usando un total de 9,075 m³/ha que es un 59% menos de agua utilizada que el sistema de riego por inundación, y un 31% menos que el sistema de riego por aspersión.",
          "de": "riego.sistema",
          "a": "riego.volumenAplicado",
          "sentido": "−",
          "base": "medido",
          "resultado": "Goteo usó 9 075 m³/ha: 59 % menos que inundación (22 125) y 31 % menos que aspersión (13 218); un ciclo, sin análisis estadístico del agua",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "15",
          "cita": "Las parcelas a las que se les implementó el sistema de riego por inundación tuvieron un mayor rendimiento con 12.02 t/ha, en comparación con los sistemas de goteo y aspersión con un rendimiento de 7.1 t/ha y 4.93 t/ha, respectivamente",
          "de": "riego.sistema",
          "a": "cultivo.rendimiento",
          "sentido": "?",
          "base": "medido",
          "resultado": "En arroz rindió más la inundación (12,02 t/ha) que el goteo (7,1) y la aspersión (4,93): el sistema más eficiente no fue el de más rendimiento",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "19",
          "cita": "el sistema de riego más eficiente fue el de goteo utilizando 6.14 L/kg en comparación con los sistemas de inundación y aspersión que usaron 8.85 L/kg y 12.92 L/kg, respectivamente.",
          "dato": "Agua por kilo de grano (Cuadro 2)",
          "valor": "goteo 6,14; inundación 8,85; aspersión 12,92 L/kg (ver alertas)",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Las cifras en L/kg del Cuadro 2 no salen de dividir agua entre rendimiento: 22 125 m³/ha ÷ 12 000 kg/ha ≈ 1,84 m³/kg (cálculo propio). No usarlas sin revisar el PDF.",
        "El texto dice que goteo y aspersión no difieren en rendimiento (pág. 15), pero la Figura 6 les pone letras distintas (b y c).",
        "El resumen en inglés dice 34,1 % menos agua que aspersión; el texto dice 31 % (13 218 → 9 075 m³/ha da 31 %, cálculo propio).",
        "La conclusión de que Playitas en surcos dio más rendimiento choca con el Cuadro 1, donde variedad y método no son significativos (pág. 15 y 20)."
      ]
    },
    {
      "clave": "flores-2002",
      "cita": "Flores Fukuda, V. (2002). Evaluación de cuatro medios de enraizamiento y tres instalaciones para la producción de la Flor de Pascua (Euphorbia pulcherrima). Proyecto especial, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "cultivo",
      "cultivo": "flor de pascua",
      "lugar": "Zamorano, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "7",
          "cita": "Esto favorece el ataque de enfermedades como hongos y bacterias que reducen su enraizamiento.",
          "de": "sustrato.exceso",
          "a": "cultivo.enfermedades",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "El agua acumulada en el medio favorece hongos y bacterias que reducen el enraizamiento",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "7",
          "cita": "El Jiffy-7 y la arena gruesa resultaron ser los mejores medios de enraizamiento (P<0.001)",
          "dato": "Mejores medios de enraizamiento",
          "valor": "Jiffy-7 y arena gruesa (P < 0,001)",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
    },
    {
      "clave": "godoy-garzon-2015",
      "cita": "Godoy Franco, G. C. y Garzón Andrade, R. M. (2015). Diagnóstico del estado de la parcela de conservación de Zamorano: estudio de suelos, producción de cultivos y prácticas de conservación de suelos. Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "suelo",
      "cultivo": "hortalizas, plátano y café",
      "lugar": "Zamorano, Honduras",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "En relieve accidentado, la producción de cultivos en laderas se ve afectada por la erosión y degradación acelerada de los suelos.",
          "de": "finca.pendiente",
          "a": "riesgo.suelo",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "En ladera la erosión y la degradación del suelo se aceleran (premisa del estudio, no medida)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "23",
          "cita": "Cuadro 5. Clasificación de la pendiente según el porcentaje de inclinación.",
          "variable": "finca.pendiente",
          "umbral": "Clases: 0–3 % plana o casi plana; 3–7 % ligeramente plana; 7–12 % moderadamente inclinada; 12–25 % inclinada; 25–50 % fuertemente inclinada; 50–75 % escarpada; > 75 % fuertemente escarpada (Bronzoni et al. 1994, adaptado; de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "22",
          "cita": "Cuadro 4. Determinación de las obras de conservación de suelos según la pendiente y la distancia de separación entre las obras.",
          "variable": "finca.pendiente",
          "umbral": "Barreras vivas cada 15–30 m con pendiente < 15 %, 10–15 m con 15–30 % y 4–10 m con 30–50 % (Raudes y Sagastume 2011, de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "4",
          "cita": "Las pendientes predominantes fueron de 3 a 12%",
          "dato": "Pendientes predominantes de la parcela",
          "valor": "3 a 12 %",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "4",
          "cita": "La condición del suelo es limitada por texturas franco arcillosas y franco arcillo arenosas predominantes, drenaje lento y profundidad efectiva <90 cm.",
          "dato": "Limitantes del suelo",
          "valor": "franco arcilloso, drenaje lento, profundidad efectiva < 90 cm",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "4",
          "cita": "Los suelos se clasificaron como Entisoles de aptitud de uso de Clase IV",
          "dato": "Clasificación del suelo",
          "valor": "Entisoles, aptitud de uso clase IV",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
    },
    {
      "clave": "kuniyoshi",
      "cita": "Kuniyoshi Aguilar, A. S. (2026). Fenología de Spathodea campanulata en el campus de la Universidad Zamorano, Honduras, y presencia de abejas muertas asociadas a sus flores. Proyecto Especial de Graduación, Universidad Zamorano. Asesores: D. Obando y O. Komar.",
      "tema": "polinizadores",
      "cultivo": "Spathodea campanulata (árbol ornamental)",
      "lugar": "campus de la Universidad Zamorano, Honduras",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "33",
          "cita": "Esta relación no fue estadísticamente significativa (p > .05), por lo que no se pudo afirmar que el aumento de la abundancia floral estuviera asociado de manera consistente con un mayor número de abejas muertas.",
          "de": "spathodea.floresVisibles",
          "a": "poli.abejasMuertas",
          "sentido": "+ n.s.",
          "base": "medido",
          "resultado": "Flores visibles en copas cercanas frente a abejas muertas: pendiente 0,077, R² = 0,2147, Spearman positiva débil y no significativa (Resultados, Figura 10)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "40",
          "cita": "La mortalidad y disminución de las poblaciones de abejas se han relacionado con la acción conjunta de factores como la pérdida de hábitat y recursos florales, la exposición a plaguicidas, los parásitos, las enfermedades y las alteraciones climáticas",
          "de": "plag.meses",
          "a": "riesgo.poli",
          "sentido": "+",
          "base": "citado",
          "resultado": "La mortalidad de abejas se asocia a plaguicidas, falta de flores, parásitos, enfermedades y clima (cita a Goulson et al. 2015); no lo midió (Discusión)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "40",
          "cita": "la pérdida de hábitat y recursos florales, la exposición a plaguicidas, los parásitos, las enfermedades y las alteraciones climáticas",
          "de": "poli.sinOtrasFlores",
          "a": "riesgo.poli",
          "sentido": "+",
          "base": "citado",
          "resultado": "Misma frase: pérdida de recursos florales (Goulson et al. 2015, de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "40",
          "cita": "los parásitos, las enfermedades y las alteraciones climáticas (Goulson et al., 2015)",
          "de": "clima.alteraciones",
          "a": "riesgo.poli",
          "sentido": "+",
          "base": "citado",
          "resultado": "Misma frase: alteraciones climáticas (Goulson et al. 2015, de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "44",
          "cita": "La floración visible se concentró principalmente entre septiembre de 2025 y enero de 2026, con mayor intensidad visual durante octubre y noviembre de 2025.",
          "dato": "Meses de floración en el campus",
          "valor": "septiembre de 2025 a enero de 2026, más intensa en octubre y noviembre (Conclusiones)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "25",
          "cita": "De éstos, 14 árboles presentaron floración o fructificación visible, mientras que 10 no mostraron estructuras reproductivas durante las evaluaciones.",
          "dato": "Árboles con flor o fruto",
          "valor": "14 de 24 (Resultados)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "31",
          "cita": "El valor más alto se observó el 16 de enero de 2026, con 12 individuos",
          "dato": "Mayor número de abejas muertas en un día",
          "valor": "12 en 20 flores caídas, el 16 de enero de 2026 (Resultados, Figura 9)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "31",
          "cita": "se contabilizaron 531 flores y se encontraron 14 abejas muertas",
          "dato": "Muestreo destructivo",
          "valor": "14 abejas muertas en 531 flores de un árbol (Resultados)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "32",
          "cita": "el coeficiente de determinación fue bajo (R² = .2147)",
          "dato": "Coeficiente de determinación flores-abejas",
          "valor": "R² = 0,2147 (Resultados, Figura 10)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "20",
          "cita": "La identificación taxonómica de las abejas no se realizó en este estudio",
          "dato": "Especie de las abejas muertas",
          "valor": "no se identificó (Metodología)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "40",
          "cita": "en el presente estudio no se evaluaron variables como la condición de las flores, la hora del muestreo, la actividad diaria de las abejas, la disponibilidad de otras especies vegetales en floración o la posible exposición a agroquímicos",
          "dato": "Variables que no midió",
          "valor": "condición de las flores, hora, actividad de las abejas, otras flores, agroquímicos (Discusión)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "12",
          "cita": "también pueden influir la edad de las flores, la acumulación de líquidos dentro de la corola, la cantidad de flores disponibles, la hora de actividad de las abejas",
          "dato": "Otros factores posibles en Spathodea",
          "valor": "edad de las flores, líquido acumulado en la corola, cantidad de flores, hora de actividad (Introducción)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "12",
          "cita": "cambios en el hábitat, variaciones climáticas, disponibilidad de agua y competencia por alimento",
          "dato": "Factores de muerte de abejas en general",
          "valor": "clima, disponibilidad de agua, competencia por alimento (cita a Goulson et al. 2015; Introducción)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "43",
          "cita": "Tampoco se midieron sistemáticamente variables como temperatura, humedad, precipitación, hora exacta de visita floral, disponibilidad de otras plantas en floración, exposición a agroquímicos, condición de las flores o altura de vuelo.",
          "dato": "Variables que no se midieron",
          "valor": "temperatura, humedad, lluvia, hora de visita, otras flores, agroquímicos, condición de las flores, altura de vuelo (Incertidumbre y alcance)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "45",
          "cita": "También se recomienda incluir en posteriores análisis variables ambientales y ecológicas, como temperatura, humedad, precipitación, disponibilidad de otras especies en floración, condición de las flores y posible exposición a agroquímicos.",
          "dato": "Lo que recomienda medir después",
          "valor": "clima, otras especies en floración, condición de las flores, agroquímicos (Recomendaciones)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "34",
          "cita": "ChatGPT™ presentó el menor RMSE, con 8.14 flores, seguido por ZapCount®, con 11.85 flores.",
          "dato": "Conteo de flores en fotos",
          "valor": "menor error: ChatGPT™ (RMSE 8,14 flores) y ZapCount® (11,85); CountThings® sobreestima (128,99) (Resultados)",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
    },
    {
      "clave": "mata-2021",
      "cita": "Mata Vigil, I. I. (2021). Evaluación de tres láminas de riego en suelos de diferentes texturas en el desarrollo de frijol (Phaseolus vulgaris L.). Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "frijol",
      "lugar": "Zamorano, Honduras (macrotúnel)",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "9",
          "cita": "En suelo franco-arenoso la lámina de 352 mm favoreció al cultivo con altura de planta de 83.6 cm vs 56.8 cm con 288 mm",
          "de": "riego.lamina",
          "a": "cultivo.crecimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "En suelo franco-arenoso, 352 mm dio 83,6 cm de altura frente a 56,8 cm con 288 mm (P<0,05)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "35",
          "cita": "El desarrollo en general del cultivo de frijol var. Amadeus-77, fue mejor en suelos con texturas francas y franco-arcillosas, bajo el régimen de riego con lámina de 320 mm por ciclo de cultivo.",
          "variable": "riego.lamina",
          "umbral": "Frijol Amadeus-77 en macrotúnel, hasta 67 días: 320 mm por ciclo en suelos franco y franco-arcilloso",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "35",
          "cita": "En suelos con textura franco-arenosa es requerida una lámina de 352 mm por ciclo de cultivo",
          "variable": "riego.lamina",
          "umbral": "Mismo ensayo: 352 mm por ciclo en suelo franco-arenoso; 288 mm limitó el desarrollo en todas las texturas",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "No se formaron vainas, probablemente por el calor dentro del macrotúnel en floración (pág. 36): no hay dato de rendimiento.",
        "El resumen da el largo de raíz con 288 mm como «111.2 m»; por el contexto la unidad debe ser cm."
      ]
    },
    {
      "clave": "mejia-reyes-2020",
      "cita": "Mejía Suazo, D. A. y Reyes Zelaya, A. N. (2020). Exploración para la producción de forraje verde hidropónico de maíz y sorgo para la alimentación de ganado lechero: revisión de literatura. Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "cultivo",
      "cultivo": "forraje verde hidropónico (maíz y sorgo)",
      "lugar": "Zamorano, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "los principales factores que afectan el desarrollo óptimo del FVH que son la iluminación, temperatura y riego.",
          "de": "riego.lamina",
          "a": "cultivo.rendimiento",
          "sentido": "?",
          "base": "citado",
          "resultado": "Luz, temperatura y riego son los factores principales del forraje hidropónico",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
    },
    {
      "clave": "molina-2009",
      "cita": "Molina Llano, D. (2009). Evaluación del efecto productivo y económico de dos métodos de riego en crisantemos (Chrysanthemum morifolium) en macro túnel, en la finca Los Silos, Antioquia, Colombia. Proyecto especial, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "crisantemo",
      "lugar": "Antioquia, Colombia",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "se logró un ahorro de agua del 58.2% en relación al sistema de riego por codo",
          "de": "riego.sistema",
          "a": "riego.volumenAplicado",
          "sentido": "−",
          "base": "medido",
          "resultado": "El goteo (regado según ETc) usó 58,2 % menos agua que el riego por codo",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "En ninguna de las variables analizadas hubo diferencias (P≤0.05) entre los dos métodos.",
          "de": "riego.sistema",
          "a": "cultivo.rendimiento",
          "sentido": "0",
          "base": "medido",
          "resultado": "Sin diferencias en ninguna variable de producción entre goteo y codo",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "sin cobrar el agua, incrementa la rentabilidad en 4% en relación al sistema de riego por codo y si se cobra el agua, la rentabilidad aumenta 7%.",
          "de": "riego.sistema",
          "a": "finca.rentabilidad",
          "sentido": "+",
          "base": "medido",
          "resultado": "El goteo sube la rentabilidad 4 % sin cobrar el agua y 7 % cobrándola",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "4",
          "cita": "Con el método de riego por goteo, el consumo de agua fue de 2,043 m3/ha/ciclo",
          "dato": "Consumo de agua con goteo",
          "valor": "2 043 m³/ha por ciclo",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
    },
    {
      "clave": "ordonez-ventura-2015",
      "cita": "Ordoñez Bonilla, J. A. y Ventura Hernández, A. J. (2015). Evaluación técnica de tres laterales de riego por goteo a baja presión en un huerto biointensivo. Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "lechuga escarola",
      "lugar": "Monte Redondo, Zamorano, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "24",
          "cita": "No se encontraron diferencias significativas (P>0.05) entre los tratamientos. Eolos 60% utilizo un menor volumen de agua",
          "de": "riego.lamina",
          "a": "cultivo.rendimiento",
          "sentido": "0",
          "base": "medido",
          "resultado": "Regar al 60 % de la ETc (1,92 m³ por 100 m²) no bajó el rendimiento frente al 100 % (3,19 m³ por 100 m²); cada lámina iba con un lateral distinto",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "Los sistemas de riego por goteo de baja presión tienden a presentar coeficientes de uniformidad bajos y variaciones en el caudal que afectan el rendimiento de los cultivos.",
          "de": "riego.uniformidad",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "En goteo a baja presión, uniformidad baja y caudal variable afectan el rendimiento (lo dice el resumen; no lo midió)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "16",
          "cita": "Tarjuelo (1990) recomienda coeficiente de uniformidad mayores a 88%.",
          "variable": "riego.uniformidad",
          "umbral": "CU mayor a 88 % (Tarjuelo 1990, de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "23",
          "cita": "Eolos presentó CU mayores a 88%, presentando un promedio semanal de 90%",
          "dato": "CU del lateral Eolos (el único sobre 88 %)",
          "valor": "90 % de promedio semanal",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "La lámina (60, 80 y 100 % de la ETc) y la marca del lateral van juntas: no se puede separar el efecto de una y otra. Presión de 2,1 a 3,4 PSI."
      ]
    },
    {
      "clave": "osorio",
      "cita": "Osorio Banegas, N. E. (2025). Evaluación de la distribución de Spathodea campanulata P. Beauv. (Bignoniaceae) en el campus de la Universidad Zamorano, Honduras. Proyecto Especial de Graduación, Universidad Zamorano. Asesores: D. Obando y J. Díaz.",
      "tema": "polinizadores",
      "cultivo": "Spathodea campanulata (árbol ornamental)",
      "lugar": "campus de la Universidad Zamorano, Honduras",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "27",
          "cita": "a mayor volumen de copa se esperaría mayor floración.",
          "de": "poli.abundanciaRiesgo",
          "a": "poli.floracionRiesgo",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "Espera más floración con más volumen de copa; no lo midió",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "35",
          "cita": "manejar los árboles mediante podas o control de rebrotes, lo cual ayudaría a reducir significativamente la cantidad de flores durante la época de floración.",
          "de": "spathodea.poda",
          "a": "poli.floracionRiesgo",
          "sentido": "−",
          "base": "afirmado",
          "resultado": "Recomienda podas o control de rebrotes para reducir las flores; no lo midió",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "23",
          "cita": "La especie se reporta como poco tolerante a la sombra, lo que significa que sus plántulas no logran desarrollarse bajo el dosel cerrado de árboles existentes.",
          "de": "spathodea.sombra",
          "a": "spathodea.establecimiento",
          "sentido": "−",
          "base": "citado",
          "resultado": "Las plántulas no prosperan bajo dosel cerrado (cita a Larrue et al. 2014)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "16",
          "cita": "V = Volumen de copa (m³)",
          "nombre": "Volumen de copa",
          "formula": "V = 4/3 · π · (D/2)² · (H/2); D diámetro promedio de copa, H altura de copa (ecuación 3)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "15",
          "cita": "D = Diámetro a la altura del pecho (DAP) en metros",
          "nombre": "Área basal",
          "formula": "AB = π/4 · D²; D = DAP en metros (ecuación 1)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "17",
          "cita": "Valor 44 = masa molecular del dióxido de carbono (CO₂), expresada en g/mol.",
          "nombre": "CO₂ almacenado",
          "formula": "CO₂ = C × 44/12 (ecuación 4)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "21",
          "cita": "Fueron encontrados y registrados 124 individuos de Spathodea campanulata distribuidos en el área seleccionada de muestreo correspondiente a 421.15 ha.",
          "dato": "Árboles de Spathodea censados",
          "valor": "124 en 421,15 ha",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "28",
          "cita": "registra apenas 0.29 árboles por hectárea",
          "dato": "Densidad de árboles",
          "valor": "0,29 por hectárea",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "34",
          "cita": "ubicados principalmente en áreas cercanas a edificaciones y caminos.",
          "dato": "Ubicación de los árboles",
          "valor": "cerca de edificaciones y caminos",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "26",
          "cita": "La mayoría de los individuos posee copas moderadas (≤ 1,000 m³), mientras que unos pocos superan ampliamente este valor",
          "dato": "Volumen de copa de los árboles",
          "valor": "la mayoría ≤ 1 000 m³; unos pocos lo superan mucho",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "24",
          "cita": "las semillas apenas se alejan entre 0.5 y 26 m del árbol progenitor",
          "dato": "Dispersión de semillas bajo dosel",
          "valor": "0,5 a 26 m del árbol (Larrue et al. 2020, de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "32",
          "cita": "En el caso de Argentina, se prohibió su cultivo y se eliminaron ejemplares tras comprobarse que causaba la muerte de insectos nativos, especialmente abejas",
          "dato": "Manejo en Argentina",
          "valor": "se prohibió y se eliminaron árboles por muerte de abejas (Ayala et al. 2024, de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "34",
          "cita": "sugiere la sustitución de esta especie invasora por alternativas nativas y sostenibles, como Tabebuia rosea y Swietenia macrophylla",
          "dato": "Especies propuestas para sustituirla",
          "valor": "Tabebuia rosea y Swietenia macrophylla",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "7",
          "cita": "La densidad de la madera osciló entre 0.27 y 0.48 g/cm³",
          "dato": "Densidad de la madera (Resumen)",
          "valor": "0,27 a 0,48 g/cm³",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "30",
          "cita": "con densidades que oscilan entre 0.20 y 1.03 g/cm³",
          "dato": "Densidad de la madera (Resultados)",
          "valor": "0,20 a 1,03 g/cm³",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "34",
          "cita": "La densidad de la madera de la especie Spathodea campanulata varió entre 0.40 y 1.03 g/cm³",
          "dato": "Densidad de la madera (Conclusiones)",
          "valor": "0,40 a 1,03 g/cm³",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "La densidad de la madera tiene tres rangos distintos en la misma tesis (pág. 7, 30 y 34). Trofaxis no usa este dato; si se usa, preguntar a la autora cuál es el correcto."
      ]
    },
    {
      "clave": "plaza-2004",
      "cita": "Plaza Tumbaco, F. X. (2004). Determinación del requerimiento hídrico de cuatro pastos mediante el uso de lisímetros bajo condiciones de El Zamorano, Honduras. Proyecto especial de Ingeniero Agrónomo, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "pastos (Andropogon, Mulato, Transvala y Tobiatá)",
      "lugar": "Zamorano, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "7",
          "cita": "Se encontró una correlación positiva de 0.338 (P<0.05) entre la producción de MS y la ETc.",
          "de": "riego.etc",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "Correlación positiva baja (0,338; P<0,05) entre materia seca y ETc en cuatro pastos",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "10",
          "cita": "Puerto (2000) tampoco encontró diferencia en la producción del guinea aplicando láminas de 5, 7, 9 y 11 mm/día bajo condiciones de invernadero.",
          "de": "riego.lamina",
          "a": "cultivo.rendimiento",
          "sentido": "0",
          "base": "citado",
          "resultado": "Puerto (2000): láminas de 5 a 11 mm/día no cambiaron la producción de guinea en invernadero",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "12",
          "cita": "El riego se hizo cada vez que la lectura de los tensiómetros excedía 32 centibares.",
          "variable": "riego.programacion",
          "umbral": "Regar cuando el tensiómetro pasa de 32 centibares (criterio del ensayo, suelo franco arenoso con pastos)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "10",
          "cita": "en la EAP se utiliza como referencia de riego en los pastos un requerimiento diario de 4 – 5 mm",
          "variable": "riego.lamina",
          "umbral": "Referencia de riego para pastos en la EAP: 4–5 mm por día (práctica de la escuela, según la tesis)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "12",
          "cita": "La evapotraspiración puede ser representada mediante la siguiente ecuación",
          "nombre": "Balance hídrico del lisímetro",
          "formula": "ETc = P + R − D (lluvia + riego − drenaje); el cambio de humedad se toma como cero porque se regaba al pasar de 32 cbar",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "12",
          "cita": "Donde ETc es la evapotranspiración medida por los lisímetros y la ETo es la evapotranspiración potencial calculada mediante el método de Penman",
          "nombre": "Coeficiente de cultivo",
          "formula": "Kc = ETc / ETo, con ETo de Penman (Doorenbos y Pruitt 1977)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "7",
          "cita": "Los Kc promedio de los pastos fueron de 1.28, 1.52 y 1.89 para la primera, segunda y tercera semana, respectivamente",
          "dato": "Kc promedio de los cuatro pastos",
          "valor": "1,28; 1,52 y 1,89 en la 1.ª, 2.ª y 3.ª semana después del corte (más altos que los de FAO)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "7",
          "cita": "en Mulato de 49, 50 y 61 mm/semana en la 1era, 2da y 3era semana, respectivamente",
          "dato": "ETc semanal de Mulato, la más alta",
          "valor": "49, 50 y 61 mm/semana",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Ensayo corto: tres cortes de 21 días, de mayo a julio de 2004 (pág. 12)."
      ]
    },
    {
      "clave": "poquiviqui-1998",
      "cita": "Poquiviqui López, G. V. (1998). Comportamiento de dos variedades de algodón (Gossypium hirsutum L.) sembradas a tres densidades con el uso de un regulador de crecimiento en Zamorano. Proyecto especial, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "cultivo",
      "cultivo": "algodón",
      "lugar": "Zamorano, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "6",
          "cita": "A mayor densidad se obtuvo mayor numero de bellotas cosechables por planta y se redujo la pudricion.",
          "de": "cultivo.densidad",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "Más densidad: más bellotas cosechables por planta y menos pudrición",
          "coincidencia": "aproximada (OCR, 0.94)"
        },
        {
          "seccion": "Relaciones",
          "pagina": "6",
          "cita": "A menor densidad de siembra la densidad poblacional de insectos por planta fue mayor, pero por unidad de area esta se redujo.",
          "de": "cultivo.densidad",
          "a": "plagas.porPlanta",
          "sentido": "−",
          "base": "medido",
          "resultado": "Con menos densidad hubo más insectos por planta, pero menos por área",
          "coincidencia": "aproximada (OCR, 0.94)"
        },
        {
          "seccion": "Datos",
          "pagina": "6",
          "cita": "En total se realizaron cuatro aplicaciones de plaguicidas contra las plagas que sobrepasaron los niveles criticos.",
          "dato": "Aplicaciones de plaguicidas en el ciclo",
          "valor": "4, solo contra plagas sobre el nivel crítico",
          "coincidencia": "aproximada (OCR, 0.95)"
        }
      ],
      "alertas": []
    },
    {
      "clave": "rios-2024",
      "cita": "Ríos Morantes, F. J. (2024). Caracterización de la capacidad de retención de agua de cinco lotes contrastantes en manejo en Zamorano. Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "suelo",
      "cultivo": "varios (bosque, monocultivo, frutales, pastura y agricultura orgánica)",
      "lugar": "Zamorano, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "27",
          "cita": "Los sitios bajo agricultura convencional presentaron una menor retención de humedad en comparación con los suelos menos intervenidos",
          "de": "suelo.usoIntensivo",
          "a": "suelo.retencionAgua",
          "sentido": "−",
          "base": "medido",
          "resultado": "A saturación (0 kPa) y de 0 a 20 cm, los lotes de agricultura convencional retuvieron menos agua que bosque y agricultura orgánica",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "27",
          "cita": "El manejo del suelo no mostró efectos significativos en la capacidad de retención de agua a tensiones de 33 y 50 kPa en ambas profundidades estudiadas",
          "de": "suelo.usoIntensivo",
          "a": "suelo.retencionAgua",
          "sentido": "0",
          "base": "medido",
          "resultado": "A 33 y 50 kPa el manejo no cambió la retención en ninguna de las dos profundidades",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Estudio cuasiexperimental: un lote por uso del suelo. La tesis recomienda repetirlo con muestras sin disturbar (pág. 28)."
      ]
    },
    {
      "clave": "saltos-2009",
      "cita": "Saltos Intriago, J. M. (2009). Evaluación del efecto de dos láminas de riego y dos sustratos en la producción de pepino bajo condiciones de macro túnel en El Zamorano, Honduras. Proyecto especial de Ingeniero Agrónomo, Escuela Agrícola Panamericana, El Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "pepino",
      "lugar": "Zamorano, Honduras (macrotúnel)",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "22",
          "cita": "El tratamiento con lámina reducida y arena presentó el rendimiento más bajo. Los otros tratamientos no mostraron diferencias significativas entre si.",
          "de": "riego.lamina",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "Bajar 15 % la lámina solo bajó el rendimiento en arena (36 100 frente a unos 52 000 kg/ha); con el sustrato con compost no hubo diferencia",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "9",
          "cita": "En medios muy finos como los que llevan mezclas de compost, debe existir un drenaje de 20 a 30%, para arenas el agua de drenaje no debe superar el 8 a 10% del total aplicado",
          "variable": "riego.drenaje",
          "umbral": "Drenaje del sustrato: 20–30 % de lo aplicado con mezclas con compost; en arena no más de 8–10 % (Resh 1997, de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "13",
          "cita": "Una reducción del 15% en la lámina significa 229 m³/ha/ciclo menos.",
          "dato": "Agua que ahorra la lámina reducida",
          "valor": "229 m³/ha por ciclo",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "22",
          "cita": "La lámina reducida siempre fue menor que la demanda hídrica.",
          "dato": "Lámina reducida frente a la demanda del cultivo",
          "valor": "siempre por debajo de la ETc",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "El resumen intercambia L1 y L2 (dice que L2 es la lámina actual). En Materiales y métodos L1 es la testigo y L2 la reducida (pág. 13), que es lo que coincide con las conclusiones.",
        "Resumen y conclusiones se contradicen sobre en qué sustrato el drenaje fue excesivo (pág. 4 y 22): el drenaje medido no se usa como relación."
      ]
    },
    {
      "clave": "t215-1990",
      "cita": "[Autor no legible en el escaneo] (1990). Densidades de siembra de pepino (Cucumis sativus L.) cultivar Super Poinsett para el valle de Yeguare. Tesis de Ingeniero Agrónomo, Escuela Agrícola Panamericana, El Zamorano, Honduras.",
      "tema": "cultivo",
      "cultivo": "pepino",
      "lugar": "valle de Yeguare, Honduras",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "31",
          "cita": "predomino la reduccion de produccion en las bajas densidades de siembra, pero por otro lado estas densidades alcanzaron mayores rendimientos por planta",
          "de": "cultivo.densidad",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "Densidades bajas: menos producción por área, más rendimiento por planta",
          "coincidencia": "aproximada (OCR, 0.88)"
        }
      ],
      "alertas": [
        "El nombre del autor no se lee en el escaneo: la cita queda incompleta hasta revisar el PDF a mano."
      ]
    },
    {
      "clave": "vargas-2008",
      "cita": "Vargas Loyo, A. J. (2008). Evaluación de la uniformidad de distribución del agua de seis cintas de goteo en condiciones de El Zamorano. Proyecto de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "ninguno (laboratorio)",
      "lugar": "Zamorano, Honduras",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "La uniformidad de la distribución del agua en el riego influye directamente en el crecimiento de las plantas y en el uso de energía y aplicación de fertilizantes.",
          "de": "riego.uniformidad",
          "a": "fert.fertirriego",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "La uniformidad del riego influye en cómo se reparte el fertilizante (lo dice el resumen; no lo midió)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "Se recomienda que la marca T-Tape modelo 506-15-340 se use en dos ciclos en campo y la marca Queen Gil se descarte al primer ciclo de uso.",
          "de": "riego.ciclosUso",
          "a": "riego.uniformidad",
          "sentido": "−",
          "base": "medido",
          "resultado": "Queen Gil pierde uniformidad desde el primer ciclo; T-Tape aguanta dos ciclos (recomendación de la tesis)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "11",
          "cita": "El valor mínimo aceptable para CU es de 87%",
          "variable": "riego.uniformidad",
          "umbral": "CU mínimo aceptable: 87 % (Álvarez 2008, comunicación personal; de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "14",
          "cita": "valor mínimo aceptable de UD (no menor de 79%)",
          "variable": "riego.uniformidad",
          "umbral": "UD mínimo aceptable: 79 % (Álvarez 2008, comunicación personal; de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "22",
          "cita": "Anexo 5. Clasificación de la calidad de cinta.",
          "variable": "riego.calidadCinta",
          "umbral": "Cinta: bueno Qd < 5 % y CVf < 10 %; medio 5–10 y 10–15; marginal 10–15 y 15–20; pobre > 15 y > 20 (Boswell 1990, de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "11",
          "cita": "CU = Coeficiente de uniformidad, en %.",
          "nombre": "Coeficiente de uniformidad (CU)",
          "formula": "CU = (1 − Σ|Xi − X̄| / (X̄ · n)) × 100; Xi caudal de cada gotero, X̄ promedio, n goteros aforados (transcrita de la ecuación 1)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "11",
          "cita": "UD = Uniformidad de la distribución, en %.",
          "nombre": "Uniformidad de distribución (UD)",
          "formula": "UD = 100 × Lp25% / X̄; Lp25% promedio del 25 % de goteros con menor caudal (ecuación 2)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "11",
          "cita": "UE = Uniformidad en la emisión, en %.",
          "nombre": "Uniformidad de emisión (UE)",
          "formula": "UE = 100 × (1 − 1,27 · CVf / √n) × qm / qa (ecuación 3)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "4",
          "cita": "siendo Aqua Traxx la que obtuvo el mayor CU, 98.30%",
          "dato": "Mayor CU de las cintas nuevas",
          "valor": "Aqua Traxx, 98,30 %",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "4",
          "cita": "El mayor UD obtenido fue por Aqua Traxx con 97.66% que no difiere de la cinta T-Tape con un UD de 96.80%.",
          "dato": "Mayor UD de las cintas nuevas",
          "valor": "Aqua Traxx, 97,66 % (no difiere de T-Tape, 96,80 %)",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
    },
    {
      "clave": "vargas-cazar-2019",
      "cita": "Vargas Cazar, J. J. (2019). Efecto de la aplicación foliar de silicio y VIUSID®agro en el desarrollo y rendimiento del cultivo de arroz (Oryza sativa L.) bajo dos sistemas de riego. Proyecto especial de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "arroz",
      "lugar": "Zamorano, Honduras",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "sin embargo, el rendimiento no fue estadísticamente superior al riego por goteo.",
          "de": "riego.sistema",
          "a": "cultivo.rendimiento",
          "sentido": "0",
          "base": "medido",
          "resultado": "La inundación no rindió más que el goteo",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "La aplicación de VIUSID®agro (10,022 kg/ha) y silicio (9,725 kg/ha) resultó en mayor rendimiento que el tratamiento control (8,573 kg/ha).",
          "de": "cultivo.bioestimulanteFoliar",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "Silicio y VIUSID®agro foliares rindieron más que el control",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "3",
          "cita": "La concentración de arsénico en el tejido vegetal fue de 0.38 mg/kg.",
          "dato": "Arsénico en el tejido vegetal",
          "valor": "0,38 mg/kg",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
    },
    {
      "clave": "villarreal-2023",
      "cita": "Villarreal Araúz, A. (2023). Programación del riego a través del uso de sensores de humedad y monitoreo de la evapotranspiración para la aplicación de un riego deficitario en sorgo. Proyecto Especial de Graduación, Escuela Agrícola Panamericana, Zamorano, Honduras.",
      "tema": "riego",
      "cultivo": "sorgo",
      "lugar": "Zamorano, Honduras",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "35",
          "cita": "siendo la programación de riego real la que obtuvo un menor volumen de agua, en comparación a lo que teóricamente se debió aplicar.",
          "de": "riego.programacion",
          "a": "riego.volumenAplicado",
          "sentido": "−",
          "base": "medido",
          "resultado": "Programar con sensores de humedad aplicó 188,1 m³/ha menos que la programación teórica",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "26",
          "cita": "basándose en los rangos establecido por Merriam y Keller (1978) el cual establece que, valores entre el 90% y 100% son considerados excelentes",
          "variable": "riego.uniformidad",
          "umbral": "CUC de 90 a 100 %: excelente (Merriam y Keller 1978, de segunda mano)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "22",
          "cita": "ETC= Evapotranspiración del cultivo",
          "nombre": "Evapotranspiración del cultivo",
          "formula": "ETc = Kc × ETo, con Kc de FAO 56 por etapa (ecuación 6)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Fórmulas",
          "pagina": "17",
          "cita": "Para determinar la uniformidad de riego que se está aplicando se utilizó la ecuación 5",
          "nombre": "Coeficiente de uniformidad de Christiansen (CUC)",
          "formula": "CUC = 100 × (1 − Σ|Xi − X̄| / (X̄ · n)); mínimo 16 goteros, se usaron 48 (ecuación 5)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "8",
          "cita": "Se obtuvo en promedio CUC de 95.8%",
          "dato": "CUC promedio del ensayo",
          "valor": "95,8 %",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "8",
          "cita": "encontrando una diferencia de 188.1 m3ha-1 de agua de la programación real, comparado con la programación teórica.",
          "dato": "Diferencia de agua entre programación real y teórica",
          "valor": "188,1 m³/ha",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
    }
  ],
  "relaciones": [
    {
      "de": "riego.lamina",
      "a": "cultivo.rendimiento",
      "tesis": [
        "benavides-jara-2014",
        "chi-bautista-2011",
        "mejia-reyes-2020",
        "ordonez-ventura-2015",
        "plaza-2004",
        "saltos-2009"
      ],
      "medido": {
        "sube": 2,
        "baja": 0,
        "sinEfecto": 2
      },
      "otras": 2,
      "vinculos": []
    },
    {
      "de": "cultivo.densidad",
      "a": "cultivo.rendimiento",
      "tesis": [
        "benavides-jara-2014",
        "poquiviqui-1998",
        "t215-1990"
      ],
      "medido": {
        "sube": 3,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "riego.sistema",
      "a": "cultivo.rendimiento",
      "tesis": [
        "echeverria-2015",
        "molina-2009",
        "vargas-cazar-2019"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 2
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "riego.sistema",
      "a": "riego.volumenAplicado",
      "tesis": [
        "echeverria-2015",
        "molina-2009"
      ],
      "medido": {
        "sube": 0,
        "baja": 2,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "clima.alteraciones",
      "a": "riesgo.poli",
      "tesis": [
        "kuniyoshi"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": []
    },
    {
      "de": "cultivo.bioestimulanteFoliar",
      "a": "cultivo.rendimiento",
      "tesis": [
        "vargas-cazar-2019"
      ],
      "medido": {
        "sube": 1,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "cultivo.biologicoAlRiego",
      "a": "cultivo.rendimiento",
      "tesis": [
        "castillo-2007"
      ],
      "medido": {
        "sube": 1,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "cultivo.biologicoAlRiego",
      "a": "cultivo.raices",
      "tesis": [
        "castillo-2007"
      ],
      "medido": {
        "sube": 1,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "cultivo.densidad",
      "a": "plagas.porPlanta",
      "tesis": [
        "poquiviqui-1998"
      ],
      "medido": {
        "sube": 0,
        "baja": 1,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "cultivo.distanciamiento",
      "a": "cultivo.rendimiento",
      "tesis": [
        "chi-bautista-2011"
      ],
      "medido": {
        "sube": 0,
        "baja": 1,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "fert.frecuencia",
      "a": "suelo.nutrientesLixiviados",
      "tesis": [
        "alpizar-2000"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 1
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "finca.pendiente",
      "a": "riesgo.suelo",
      "tesis": [
        "godoy-garzon-2015"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": [
        "suelo-pendiente"
      ]
    },
    {
      "de": "finca.sombra",
      "a": "suelo.humedad",
      "tesis": [
        "cerrato-2022"
      ],
      "medido": {
        "sube": 1,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "plag.meses",
      "a": "riesgo.poli",
      "tesis": [
        "kuniyoshi"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": [
        "poli-coincidencia"
      ]
    },
    {
      "de": "poli.abundanciaRiesgo",
      "a": "poli.floracionRiesgo",
      "tesis": [
        "osorio"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": []
    },
    {
      "de": "poli.sinOtrasFlores",
      "a": "riesgo.poli",
      "tesis": [
        "kuniyoshi"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": [
        "poli-sin-alternativas"
      ]
    },
    {
      "de": "riego.ciclosUso",
      "a": "riego.uniformidad",
      "tesis": [
        "vargas-2008"
      ],
      "medido": {
        "sube": 0,
        "baja": 1,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "riego.drenaje",
      "a": "suelo.nutrientesLixiviados",
      "tesis": [
        "alpizar-2000"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 2,
      "vinculos": []
    },
    {
      "de": "riego.etc",
      "a": "cultivo.rendimiento",
      "tesis": [
        "plaza-2004"
      ],
      "medido": {
        "sube": 1,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "riego.lamina",
      "a": "suelo.humedad",
      "tesis": [
        "brenes-2004"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 1
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "riego.lamina",
      "a": "finca.rentabilidad",
      "tesis": [
        "chi-bautista-2011"
      ],
      "medido": {
        "sube": 0,
        "baja": 1,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "riego.lamina",
      "a": "cultivo.crecimiento",
      "tesis": [
        "mata-2021"
      ],
      "medido": {
        "sube": 1,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "riego.programacion",
      "a": "riego.volumenAplicado",
      "tesis": [
        "villarreal-2023"
      ],
      "medido": {
        "sube": 0,
        "baja": 1,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "riego.sistema",
      "a": "finca.rentabilidad",
      "tesis": [
        "molina-2009"
      ],
      "medido": {
        "sube": 1,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "riego.uniformidad",
      "a": "cultivo.rendimiento",
      "tesis": [
        "ordonez-ventura-2015"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": []
    },
    {
      "de": "riego.uniformidad",
      "a": "fert.fertirriego",
      "tesis": [
        "vargas-2008"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": []
    },
    {
      "de": "spathodea.floresVisibles",
      "a": "poli.abejasMuertas",
      "tesis": [
        "kuniyoshi"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 1
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "spathodea.poda",
      "a": "poli.floracionRiesgo",
      "tesis": [
        "osorio"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": []
    },
    {
      "de": "spathodea.sombra",
      "a": "spathodea.establecimiento",
      "tesis": [
        "osorio"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": []
    },
    {
      "de": "suelo.compactacion",
      "a": "cultivo.absorcionNutrientes",
      "tesis": [
        "brenes-2004"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": []
    },
    {
      "de": "suelo.humedad",
      "a": "cultivo.rendimiento",
      "tesis": [
        "brenes-2004"
      ],
      "medido": {
        "sube": 1,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "suelo.usoIntensivo",
      "a": "suelo.retencionAgua",
      "tesis": [
        "rios-2024"
      ],
      "medido": {
        "sube": 0,
        "baja": 1,
        "sinEfecto": 1
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "sustrato.exceso",
      "a": "cultivo.enfermedades",
      "tesis": [
        "flores-2002"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 1,
      "vinculos": []
    }
  ],
  "candidatas": [
    {
      "id": "clima.alteraciones",
      "nombre": "Alteraciones del clima",
      "tesis": [
        "kuniyoshi"
      ]
    },
    {
      "id": "cultivo.absorcionNutrientes",
      "nombre": "Absorción de nutrientes por la planta",
      "tesis": [
        "brenes-2004"
      ]
    },
    {
      "id": "cultivo.bioestimulanteFoliar",
      "nombre": "Silicio o bioestimulante foliar",
      "tesis": [
        "vargas-cazar-2019"
      ]
    },
    {
      "id": "cultivo.biologicoAlRiego",
      "nombre": "Biológico aplicado por el riego (Trichoderma)",
      "tesis": [
        "castillo-2007"
      ]
    },
    {
      "id": "cultivo.crecimiento",
      "nombre": "Crecimiento de la planta (altura o largo de raíz)",
      "tesis": [
        "mata-2021"
      ]
    },
    {
      "id": "cultivo.densidad",
      "nombre": "Densidad de siembra",
      "tesis": [
        "benavides-jara-2014",
        "poquiviqui-1998",
        "t215-1990"
      ]
    },
    {
      "id": "cultivo.distanciamiento",
      "nombre": "Distancia entre surcos",
      "tesis": [
        "chi-bautista-2011"
      ]
    },
    {
      "id": "cultivo.enfermedades",
      "nombre": "Enfermedades del cultivo",
      "tesis": [
        "flores-2002"
      ]
    },
    {
      "id": "cultivo.raices",
      "nombre": "Peso de las raíces",
      "tesis": [
        "castillo-2007"
      ]
    },
    {
      "id": "cultivo.rendimiento",
      "nombre": "Rendimiento del cultivo",
      "tesis": [
        "benavides-jara-2014",
        "brenes-2004",
        "castillo-2007",
        "chi-bautista-2011",
        "echeverria-2015",
        "mejia-reyes-2020",
        "molina-2009",
        "ordonez-ventura-2015",
        "plaza-2004",
        "poquiviqui-1998",
        "saltos-2009",
        "t215-1990",
        "vargas-cazar-2019"
      ]
    },
    {
      "id": "fert.frecuencia",
      "nombre": "Frecuencia o fraccionamiento de la fertilización",
      "tesis": [
        "alpizar-2000"
      ]
    },
    {
      "id": "finca.rentabilidad",
      "nombre": "Rentabilidad de la finca",
      "tesis": [
        "chi-bautista-2011",
        "molina-2009"
      ]
    },
    {
      "id": "finca.sombra",
      "nombre": "Cobertura de sombra de árboles sobre el cultivo",
      "tesis": [
        "cerrato-2022"
      ]
    },
    {
      "id": "plagas.porPlanta",
      "nombre": "Insectos plaga por planta",
      "tesis": [
        "poquiviqui-1998"
      ]
    },
    {
      "id": "poli.abejasMuertas",
      "nombre": "Abejas muertas en las flores",
      "tesis": [
        "kuniyoshi"
      ]
    },
    {
      "id": "riego.calidadCinta",
      "nombre": "Calidad de fabricación de la cinta (Qd y CVf)",
      "tesis": [
        "vargas-2008"
      ]
    },
    {
      "id": "riego.ciclosUso",
      "nombre": "Ciclos de uso de la cinta de goteo",
      "tesis": [
        "vargas-2008"
      ]
    },
    {
      "id": "riego.drenaje",
      "nombre": "Agua que drena bajo las raíces (% de lo aplicado)",
      "tesis": [
        "alpizar-2000",
        "saltos-2009"
      ]
    },
    {
      "id": "riego.etc",
      "nombre": "Evapotranspiración del cultivo (ETc)",
      "tesis": [
        "plaza-2004"
      ]
    },
    {
      "id": "riego.lamina",
      "nombre": "Lámina de riego",
      "tesis": [
        "benavides-jara-2014",
        "brenes-2004",
        "chi-bautista-2011",
        "mata-2021",
        "mejia-reyes-2020",
        "ordonez-ventura-2015",
        "plaza-2004",
        "saltos-2009"
      ]
    },
    {
      "id": "riego.programacion",
      "nombre": "Programación del riego con sensores de humedad",
      "tesis": [
        "plaza-2004",
        "villarreal-2023"
      ]
    },
    {
      "id": "riego.uniformidad",
      "nombre": "Uniformidad del riego (CU, UD o CUC)",
      "tesis": [
        "ordonez-ventura-2015",
        "vargas-2008",
        "villarreal-2023"
      ]
    },
    {
      "id": "riego.volumenAplicado",
      "nombre": "Volumen de agua aplicado",
      "tesis": [
        "echeverria-2015",
        "molina-2009",
        "villarreal-2023"
      ]
    },
    {
      "id": "spathodea.establecimiento",
      "nombre": "Establecimiento de plántulas de Spathodea",
      "tesis": [
        "osorio"
      ]
    },
    {
      "id": "spathodea.floresVisibles",
      "nombre": "Flores visibles en copas de Spathodea",
      "tesis": [
        "kuniyoshi"
      ]
    },
    {
      "id": "spathodea.poda",
      "nombre": "Poda de Spathodea",
      "tesis": [
        "osorio"
      ]
    },
    {
      "id": "spathodea.sombra",
      "nombre": "Sombra de un dosel cerrado",
      "tesis": [
        "osorio"
      ]
    },
    {
      "id": "suelo.compactacion",
      "nombre": "Compactación del suelo",
      "tesis": [
        "brenes-2004"
      ]
    },
    {
      "id": "suelo.humedad",
      "nombre": "Humedad del suelo",
      "tesis": [
        "brenes-2004",
        "cerrato-2022"
      ]
    },
    {
      "id": "suelo.nutrientesLixiviados",
      "nombre": "Nitrato y potasio lixiviados bajo la zona de raíces",
      "tesis": [
        "alpizar-2000"
      ]
    },
    {
      "id": "suelo.retencionAgua",
      "nombre": "Capacidad del suelo para retener agua",
      "tesis": [
        "rios-2024"
      ]
    },
    {
      "id": "suelo.usoIntensivo",
      "nombre": "Uso agrícola intensivo del suelo (monocultivo convencional)",
      "tesis": [
        "rios-2024"
      ]
    },
    {
      "id": "sustrato.exceso",
      "nombre": "Agua acumulada en el sustrato",
      "tesis": [
        "flores-2002"
      ]
    }
  ]
};
