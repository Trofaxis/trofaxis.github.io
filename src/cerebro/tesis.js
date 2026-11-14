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
      "clave": "anderson-2013",
      "cita": "Anderson, T. R. (2013). Denitrification in riparian zones and other saturated soils of a northeastern agricultural landscape. Tesis doctoral, Cornell University, Estados Unidos.",
      "tema": "suelo",
      "cultivo": "finca lechera con cultivos y pasturas",
      "lugar": "noreste de Estados Unidos",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "Annual rates of denitrification showed a strong positive relationship with topographic index",
          "de": "suelo.humedad",
          "a": "suelo.desnitrificacion",
          "sentido": "+",
          "base": "medido",
          "resultado": "La desnitrificación anual sube con el índice topográfico de humedad, es decir, en los suelos que más se saturan (isótopos de 15N en el agua subterránea somera)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "4",
          "cita": "resulted in a N flux that was nearly half of the total denitrification from the landscape",
          "dato": "Desnitrificación en la zona saturada somera",
          "valor": "casi la mitad del total de la finca, en un tercio del área",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "4",
          "cita": "the contribution of riparian areas to total landscape denitrification was less than 10 percent",
          "dato": "Desnitrificación en zonas ribereñas saturadas",
          "valor": "tasas entre las más altas, pero menos del 10 % del total del paisaje",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "La franja ribereña elimina nitrato con tasas altas, pero es poca área: una franja junto al cauce no compensa el nitrato que sale del resto de la finca (pág. 4)."
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
      "clave": "fallas-2022",
      "cita": "Fallas Corrales, R. A. (2022). Fertilizer interactions with micronutrients in tropical volcanic soils. Tesis doctoral, Wageningen University, Países Bajos.",
      "tema": "fertilización",
      "cultivo": "suelos agrícolas de ceniza volcánica aluvial (ensayos de laboratorio y columnas)",
      "lugar": "San Bosco y La Sonia, Pococí, Costa Rica",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "149",
          "cita": "adding highly concentrated potassium chloride solutions promotes zinc desorption and leaching from these alluvial volcanic ash soils",
          "de": "fert.dosisK",
          "a": "suelo.zincLixiviado",
          "sentido": "+",
          "base": "medido",
          "resultado": "Las soluciones concentradas de KCl desorbieron y lavaron zinc en columnas sin disturbar de suelo volcánico aluvial",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "149",
          "cita": "a lower pH and a higher ionic strength promote increased zinc solution concentrations in both volcanic soils",
          "de": "suelo.pH",
          "a": "suelo.zincLixiviado",
          "sentido": "−",
          "base": "medido",
          "resultado": "Con pH más bajo (y más sales en la solución) quedó más zinc disuelto en los dos suelos",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "148",
          "cita": "the high phosphate rates commonly applied to this volcanic soil have minor effects on boron adsorption at the typical low boron concentrations observed in the sampled region",
          "de": "fert.dosisP",
          "a": "suelo.boroAdsorbido",
          "sentido": "0",
          "base": "medido",
          "resultado": "Las dosis altas de fosfato que se usan en ese suelo casi no cambian la adsorción de boro a las concentraciones bajas de la zona",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "148",
          "cita": "Under such conditions, where leaching of elements can be significant, the mobility of fertilizers in soil and their interaction with other nutrients is an important factor to consider",
          "dato": "Suelos volcánicos tropicales con lluvia alta (régimen údico)",
          "valor": "la lixiviación puede ser importante y la movilidad del fertilizante cuenta para el manejo",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Son ensayos de laboratorio (adsorción y columnas), no de campo; dicen qué pasa con dosis altas, no cuánto se pierde en una finca (pág. 148–149)."
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
      "clave": "flores-lopez-2009",
      "cita": "Flores-Lopez, F. J. (2009). Soluble phosphorus and nitrate transport by monitoring ground water and stream flow discharges in the New York City source watersheds. Tesis doctoral, Cornell University, Estados Unidos.",
      "tema": "fertilización",
      "cultivo": "lechería con pasturas (más de 100 años de estiércol)",
      "lugar": "montes Catskill, Nueva York, Estados Unidos",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "SRP concentrations increased as the distance to the streams decreased",
          "de": "finca.distAgua",
          "a": "agua.fosforoSubterranea",
          "sentido": "−",
          "base": "medido",
          "resultado": "El fósforo soluble del agua subterránea sube a medida que baja la distancia al arroyo (37 pozos en una finca de valle aluvial)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "4",
          "cita": "resulted in a 33% reduction (0.008 mg L-1) in stream SRP concentrations during the growing season",
          "dato": "Cercas que sacan al ganado del cauce",
          "valor": "−33 % de fósforo soluble en el arroyo en la época de crecimiento; sin efecto fuera de ella ni en el nitrato",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "3",
          "cita": "stream SRP concentrations were generally below 0.1 mg L-1, with an average of 0.037",
          "dato": "Fósforo soluble en el arroyo pese a más de 100 años de estiércol",
          "valor": "casi siempre bajo 0,1 mg/L, promedio 0,037 mg/L",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "3",
          "cita": "The highest SRP concentrations were consistently measured at the shallowest groundwater depths",
          "dato": "Dónde está el fósforo más alto",
          "valor": "en el agua subterránea más somera",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "3",
          "cita": "The NO3--N concentrations varied from the detection limit of 0.05 to 5 mg L-1",
          "dato": "Nitrato en el agua subterránea",
          "valor": "de 0,05 a 5 mg/L de N",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "El fósforo del agua subterránea junto al arroyo no se correlacionó con el del arroyo: la cercanía sube el P del agua del suelo, pero eso no dice cuánto llega al cauce (pág. 3–4)."
      ]
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
      "clave": "huijsmans-2003",
      "cita": "Huijsmans, J. F. M. (2003). Manure application and ammonia volatilization. Tesis doctoral, Wageningen University, Países Bajos.",
      "tema": "fertilización",
      "cultivo": "pastura y tierra arable (estiércol líquido)",
      "lugar": "Países Bajos",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "150",
          "cita": "The mean cumulative volatilization for surface spreading was estimated to be 77% of the total ammoniacal nitrogen (TAN) applied by the manure, 20% for narrow-band application and 6% for shallow injection",
          "de": "fert.incorporacion",
          "a": "aire.amoniaco",
          "sentido": "−",
          "base": "medido",
          "resultado": "En pastura, el estiércol esparcido en superficie perdió 77 % del N amoniacal; en bandas angostas 20 % y con inyección superficial 6 % (base de datos de ensayos de campo 1989–1998)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "151",
          "cita": "On arable land, the mean total volatilization, expressed as % of TAN applied, was 68% for surface spreading, 17% for surface incorporation and 2% for deep placement",
          "de": "fert.incorporacion",
          "a": "aire.amoniaco",
          "sentido": "−",
          "base": "medido",
          "resultado": "En tierra arable: 68 % en superficie, 17 % incorporado superficialmente y 2 % enterrado a fondo",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "151",
          "cita": "The volatilization rate increased with an increase in TAN content of the manure, manure application rate and air temperature",
          "de": "fert.abonoOrganico",
          "a": "aire.amoniaco",
          "sentido": "+",
          "base": "medido",
          "resultado": "En tierra arable la tasa de volatilización sube con más N amoniacal en el estiércol, más dosis de estiércol y más temperatura del aire",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "152",
          "cita": "the costs of manure application by volatilization-reducing techniques were ca 2 € per m3 higher than for broadcast spreading",
          "dato": "Costo de las técnicas que reducen el amoníaco",
          "valor": "unos 2 € por m3 más que esparcir en superficie (fincas con 1000 a 3000 m3 de estiércol al año)",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "El tiempo entre esparcir e incorporar cuenta: un arado de vertedera (más lento) no siempre pierde menos amoníaco que un cultivador, porque tarda más en enterrar el estiércol (pág. 151).",
        "Es estiércol líquido en clima templado (Países Bajos); los porcentajes no se pasan tal cual a urea en el trópico."
      ]
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
      "clave": "major-2009",
      "cita": "Major, J. (2009). Biochar application to a Colombian savanna Oxisol: fate and effect on soil fertility, crop production, nutrient leaching and soil hydrology. Tesis doctoral, Cornell University, Estados Unidos.",
      "tema": "suelo",
      "cultivo": "maíz",
      "lugar": "sabana de los Llanos Orientales, Colombia (Oxisol)",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "Leaching below the rooting zone was reduced by 17% for P, 19% for Sr, 8% for NO3-N, 23% for Ca, 28% for Mg, and 36% for K, over two years, with biochar application",
          "de": "suelo.biocarbon",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "−",
          "base": "medido",
          "resultado": "Con 20 t/ha de biocarbón, la lixiviación bajo la zona de raíces bajó en dos años: P 17 %, nitrato 8 %, Ca 23 %, Mg 28 % y K 36 %",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "The application of 20 t ha-1 of biochar resulted in maize yield increases of 28, 30 and 140% in the second, third and fourth year after biochar application",
          "de": "suelo.biocarbon",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "El maíz rindió 28, 30 y 140 % más en el segundo, tercer y cuarto año después de aplicar el biocarbón",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "3",
          "cita": "The retention of nutrients by biochar and greater pH thus resulted in reduced leaching and greater crop uptake",
          "dato": "Mecanismo",
          "valor": "el biocarbón retiene nutrientes y sube el pH: menos lixiviación y más absorción, sobre todo de Ca y Mg",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "En esta arcilla pesada el biocarbón no cambió la hidrología del suelo (pág. 3–4).",
        "El biocarbón no es una práctica que Trofaxis pregunte hoy; queda como relación de suelo para el futuro."
      ]
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
      "clave": "molodovskaya-2010",
      "cita": "Molodovskaya, M. (2010). The emissions of nitrous oxide from agricultural fields in New York State: effect of fertilization and analysis of temporal and spatial variability. Tesis doctoral, Cornell University, Estados Unidos.",
      "tema": "fertilización",
      "cultivo": "maíz y alfalfa abonados con estiércol de lechería",
      "lugar": "Nueva York, Estados Unidos",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "areas which received more manure N were stronger N2O emitters",
          "de": "fert.abonoOrganico",
          "a": "aire.oxidoNitroso",
          "sentido": "+",
          "base": "medido",
          "resultado": "Las áreas que recibieron más N de estiércol emitieron más N2O (covarianza turbulenta 2006–2009 y cámaras estáticas)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "The greatest N2O emissions were observed when flux-triggering weather events coincided with or followed manure application",
          "de": "clima.mesesLluvia",
          "a": "aire.oxidoNitroso",
          "sentido": "+",
          "base": "medido",
          "resultado": "Los picos de N2O los disparan la lluvia fuerte y el calor; los mayores llegaron cuando esa lluvia coincidió con la aplicación de estiércol o vino justo después",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "The most intense single N2O peak event was produced from combination of summer manure spreading and strong rainfall",
          "de": "fert.meses",
          "a": "aire.oxidoNitroso",
          "sentido": "+",
          "base": "medido",
          "resultado": "El pico más intenso vino de esparcir estiércol en verano y que luego cayera una lluvia fuerte",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "3",
          "cita": "manure nitrogen (N) was the most important factor controlling the extent of N2O formation",
          "dato": "Factor que más controla el N2O",
          "valor": "el N del estiércol; la humedad y la temperatura del suelo solo disparan los eventos",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Mide gases, no pérdidas al agua. Sirve para el vínculo de lluvia y fertilización por el lado del aire (pág. 4)."
      ]
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
      "clave": "pacenka-2012",
      "cita": "Pacenka, S. (2012). Can soil test phosphorus track phosphorus changes for water quality management? Tesis de maestría, Cornell University, Estados Unidos.",
      "tema": "fertilización",
      "cultivo": "fincas lecheras (maíz y pasturas)",
      "lugar": "cuencas que abastecen de agua a Nueva York, Estados Unidos",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "Morgan's P concentration with: corn frequency, higher recommended manure rate, and higher aluminum",
          "de": "fert.abonoOrganico",
          "a": "suelo.fosforo",
          "sentido": "+",
          "base": "medido",
          "resultado": "En más de 1200 series de análisis de campos (6 años o más, muestreo cada 3 años), el P Morgan sube con más dosis recomendada de estiércol, más frecuencia de maíz y más aluminio",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "and higher aluminum; and a negative effect of soil wetness",
          "de": "suelo.humedad",
          "a": "suelo.fosforo",
          "sentido": "−",
          "base": "medido",
          "resultado": "En la misma regresión, los suelos más húmedos tienen menos P Morgan",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "3",
          "cita": "The breakpoint is around 12 kg P/ha",
          "variable": "suelo.fosforo",
          "umbral": "Punto de quiebre cerca de 12 kg P/ha (Morgan): los suelos con P bajo tienden a subir y los de P alto a bajar",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "El exceso de fósforo de las fincas causó floraciones de algas en las fuentes de agua potable de Nueva York (pág. 3)."
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
      "clave": "recha-2011",
      "cita": "Recha, J. W. (2011). Streamwater dynamics and carbon and nutrient losses in tropical headwater catchments at a soil degradation gradient. Tesis doctoral, Cornell University, Estados Unidos.",
      "tema": "suelo",
      "cultivo": "maíz (5, 10 y 50 años después de talar el bosque) y bosque como testigo",
      "lugar": "Kapchorwa, distrito de Nandi, oeste de Kenia (cuencas de cabecera)",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "at a depth of 0-0.1 m increased by 46%, while soil organic carbon (SOC) concentrations and total porosity decreased by 75% and 20%, respectively",
          "de": "suelo.usoIntensivo",
          "a": "suelo.compactacion",
          "sentido": "+",
          "base": "medido",
          "resultado": "Con más años de maíz, la densidad aparente de 0–10 cm subió 46 %, y el carbono orgánico y la porosidad bajaron 75 % y 20 %",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "The average runoff ratio was 0.033 in the forest and increased gradually to 0.095 with increasing duration of cultivation",
          "de": "suelo.usoIntensivo",
          "a": "suelo.escorrentia",
          "sentido": "+",
          "base": "medido",
          "resultado": "La escorrentía pasó de 0,033 de la lluvia en el bosque a 0,095 con más años de cultivo",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "Total C and nutrient exports increased with longer cultivation (P<0.05) due to greater",
          "de": "suelo.usoIntensivo",
          "a": "agua.nutrientesEscorrentia",
          "sentido": "+",
          "base": "medido",
          "resultado": "Las salidas de carbono y nutrientes al arroyo subieron con los años de cultivo, por el mayor caudal",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "3",
          "cita": "all N species, total P, K and Na significantly (P<0.05) increased in streams after forest conversion and long-term cultivation",
          "dato": "Nutrientes en el arroyo después de talar",
          "valor": "todas las formas de N, el P total y el K subieron",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Es una cronosecuencia de cuatro cuencas (bosque, 5, 10 y 50 años de maíz), no un ensayo con repeticiones: muestra la tendencia de la degradación, no el efecto de una práctica (pág. 3)."
      ]
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
      "clave": "schoumans-2015",
      "cita": "Schoumans, O. F. (2015). Phosphorus leaching from soils: process description, risk assessment and mitigation. Tesis doctoral, Wageningen University, Países Bajos.",
      "tema": "fertilización",
      "cultivo": "tierras agrícolas en general",
      "lugar": "Países Bajos",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "244",
          "cita": "as a simple index to determine the potential risk of increased P concentrations in groundwater that exceed the background concentration in the long term",
          "de": "suelo.saturacionFosforo",
          "a": "suelo.fosforoLixiviado",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "Pasado el grado de saturación crítico, el P del agua subterránea supera el nivel natural a largo plazo (es la base del protocolo neerlandés, no una medición nueva)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "245",
          "cita": "The most important or sensitive input variables for the assessment of P losses are the historical P surpluses, groundwater table and actual P application rates",
          "de": "fert.dosisP",
          "a": "suelo.fosforoLixiviado",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "En su modelo SIMPLE, lo que más pesa en las pérdidas de P son los excedentes históricos de P, el nivel freático y la dosis actual de P (modelo, no medición de campo)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "244",
          "cita": "The critical PSD of non-calcareous sandy soils was found to be 25%",
          "variable": "suelo.saturacionFosforo",
          "umbral": "Grado de saturación crítico de 25 % en suelos arenosos no calcáreos",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "244",
          "cita": "peat soils (5%), calcareous sandy soils (23%), acid sandy soils (25%), non-calcareous clay soils (31%) and calcareous clay soils (78%)",
          "variable": "suelo.saturacionFosforo",
          "umbral": "Crítico por tipo de suelo: turba 5 %, arenoso calcáreo 23 %, arenoso ácido 25 %, arcilla no calcárea 31 % y arcilla calcárea 78 %",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "244",
          "cita": "both soil types can be considered as vulnerable to P losses",
          "dato": "Suelos más vulnerables a perder P",
          "valor": "arcillas turbosas de tierras bajas (mucho P retenido de forma reversible) y arenosos calcáreos (lo retienen débilmente)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "245",
          "cita": "In about 43% of the agricultural land in the Netherlands, the critical PSD for the given soil type was exceeded",
          "dato": "Tierra agrícola de Países Bajos sobre el grado crítico",
          "valor": "cerca de 43 %",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "246",
          "cita": "source-oriented measures, such as reducing P application rates or lowering the P content of the soil, are needed to decrease P losses in the long term",
          "dato": "Qué baja las pérdidas a largo plazo",
          "valor": "bajar la dosis de P o el P del suelo; las medidas en el cauce o el paisaje ayudan a corto plazo",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Los umbrales son de suelos de Países Bajos, y la tesis muestra que el crítico cambia con el tipo de suelo y con su aluminio y hierro extraíbles con oxalato (pág. 244). Usarlos en suelos tropicales sería criterio propio."
      ]
    },
    {
      "clave": "schroder-1998",
      "cita": "Schröder, J. J. (1998). Towards improved nitrogen management in silage maize production on sandy soils. Tesis doctoral, Wageningen Agricultural University, Países Bajos.",
      "tema": "fertilización",
      "cultivo": "maíz para ensilaje",
      "lugar": "Países Bajos (suelos arenosos)",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "214",
          "cita": "Split applications of mineral fertiliser N had a significant positive effect in one experiment where rainfall was excessive but not in the others",
          "de": "fert.frecuencia",
          "a": "cultivo.rendimiento",
          "sentido": "0",
          "base": "medido",
          "resultado": "Fraccionar el N mineral (40 kg/ha en banda a las 4–6 hojas) subió el rendimiento solo en uno de cuatro ensayos, el de lluvia excesiva",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "214",
          "cita": "spring-applied slurry without DCD was on average associated with even lower N losses and higher maize DM yields",
          "de": "fert.meses",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "medido",
          "resultado": "Aplicar el purín en otoño (antes del invierno lluvioso, sin cultivo) perdió más N que en primavera; en primavera hubo menos pérdidas y más rendimiento (ocho ensayos)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "215",
          "cita": "At low N input levels, cover crops reduced N leaching in accordance with their N uptake",
          "de": "suelo.desnudoMeses",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "medido",
          "resultado": "Dejar el suelo sin cultivo de cobertura en invierno lixivia más N: con centeno o pasto la lixiviación bajó en proporción al N que absorbieron (dosis bajas de N, seis años)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "213",
          "cita": "Positioning fertiliser N close to the plant increased the recovery by a factor of 1.3 to 1.4",
          "de": "fert.incorporacion",
          "a": "cultivo.absorcionNutrientes",
          "sentido": "+",
          "base": "medido",
          "resultado": "Colocar el N cerca de la planta subió su recuperación 1,3 a 1,4 veces (Rhizolab de Wageningen)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "213",
          "cita": "Dry matter (DM) yields of maize were not significantly affected by the application method of N, however",
          "de": "fert.incorporacion",
          "a": "cultivo.rendimiento",
          "sentido": "0",
          "base": "medido",
          "resultado": "La forma de aplicar el N no cambió el rendimiento de materia seca",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "217",
          "cita": "the soil mineral N residue at the end of the growing season (0-60 cm) decreased by 24 kg N ha-1",
          "de": "fert.dosisN",
          "a": "suelo.nitrogenoMineral",
          "sentido": "+",
          "base": "medido",
          "resultado": "Abonar 100 kg N/ha por debajo del óptimo económico dejó 24 kg N/ha menos de N mineral en 0–60 cm al final del ciclo (25 ensayos en arena)",
          "coincidencia": "aproximada (OCR, 0.96)"
        },
        {
          "seccion": "Relaciones",
          "pagina": "217",
          "cita": "The associated reduction in DM yield averaged 16%",
          "de": "fert.dosisN",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "Con esos 100 kg N/ha menos, el rendimiento de materia seca bajó 16 % en promedio",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "103",
          "cita": "A 100 mm increase of rainfall reduced residual SMN with 25 kg ha-1",
          "de": "clima.lluvia",
          "a": "suelo.nitrogenoMineral",
          "sentido": "−",
          "base": "medido",
          "resultado": "Cada 100 mm más de lluvia entre mayo y el muestreo dejaron 25 kg/ha menos de N mineral residual (el N se fue con el agua o lo tomó el cultivo)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "217",
          "cita": "These soils have a limited capacity to retain water and therefore N may easily be lost to greater depths when it is available or applied too early",
          "de": "suelo.retencionAgua",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "−",
          "base": "afirmado",
          "resultado": "Los suelos arenosos retienen poca agua, así que el N baja a capas profundas si sobra o se aplica temprano (síntesis del capítulo 9)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "217",
          "cita": "The values obtained for the economically optimal SUMN in the upper 30 and 60 cm of soil were respectively 173 and 195 kg N ha-1",
          "variable": "fert.dosisN",
          "umbral": "Óptimo económico del N disponible (N mineral del suelo en marzo–abril más N del fertilizante): 173 kg N/ha midiendo 0–30 cm y 195 kg N/ha midiendo 0–60 cm (25 ensayos en arena)",
          "coincidencia": "aproximada (OCR, 0.98)"
        },
        {
          "seccion": "Umbrales",
          "pagina": "215",
          "cita": "the financial return from a 40 kg ha-1 supplementation with mineral fertiliser N, is questionable if there is more than 175 kg N ha-1 in the upper 0.6 m soil layer at the 4-6 leaf stage",
          "variable": "suelo.nitrogenoMineral",
          "umbral": "Con más de 175 kg N/ha en 0–60 cm a las 4–6 hojas, agregar 40 kg N/ha de fertilizante mineral tiene un retorno dudoso",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "215",
          "cita": "results provide insufficient evidence to justify recommending farmers to split applications",
          "dato": "Recomendación sobre fraccionar",
          "valor": "no hay evidencia suficiente para recomendarlo de rutina",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "215",
          "cita": "rye and grass cover crops were able to absorb on average 40 kg N ha-1 in the aboveground plant parts",
          "dato": "N absorbido por los cultivos de cobertura",
          "valor": "40 kg N/ha en promedio en la parte aérea",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "217",
          "cita": "adjusting the N input to a level below the economically optimal rate can reduce the risks for N losses to the environment associated with conventional maize production, with a limited effect on silage yields",
          "dato": "Conclusión sobre la dosis",
          "valor": "bajar el N por debajo del óptimo económico reduce el riesgo de pérdidas con poco efecto en el rendimiento",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "214",
          "cita": "Postponing slurry applications to spring and adjusting N inputs to crop requirements were insufficient to keep the nitrate concentration in groundwater below the EC threshold for drinking water",
          "dato": "Nitrato en el agua subterránea",
          "valor": "siguió sobre el límite de la UE para agua potable aun aplicando en primavera y con la dosis ajustada",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Clima templado y suelos arenosos de Países Bajos, con purín de vaca; el fraccionamiento solo ayudó en el ensayo de lluvia excesiva, que es la condición que más se parece a la época lluviosa del trópico.",
        "La banda de purín después de la emergencia, la única forma en que fraccionar el purín subió el rendimiento, no estaba permitida por la ley neerlandesa de entonces (pág. 214)."
      ]
    },
    {
      "clave": "sigunga-1997",
      "cita": "Sigunga, D. O. (1997). Fertilizer nitrogen use efficiency and nutrient uptake by maize (Zea mays L.) in Vertisols in Kenya. Tesis doctoral, Wageningen Agricultural University, Países Bajos.",
      "tema": "fertilización",
      "cultivo": "maíz",
      "lugar": "Kenia (vertisoles)",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "8",
          "cita": "Denitrification rate depended primarily on soil moisture content and available C",
          "de": "suelo.humedad",
          "a": "suelo.desnitrificacion",
          "sentido": "+",
          "base": "medido",
          "resultado": "La tasa de desnitrificación depende sobre todo de la humedad del suelo y del carbono disponible (laboratorio)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "8",
          "cita": "NH3 volatilization depended primarily on soil pH and fertilizer properties",
          "de": "suelo.pH",
          "a": "aire.amoniaco",
          "sentido": "?",
          "base": "medido",
          "resultado": "La volatilización de NH3 depende sobre todo del pH del suelo y del tipo de fertilizante; el resumen no dice la dirección",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "8",
          "cita": "Incorporating fertilizer materials within the 0-5 cm soil layer significantly reduced NH3-N losses",
          "de": "fert.incorporacion",
          "a": "aire.amoniaco",
          "sentido": "−",
          "base": "medido",
          "resultado": "Incorporar el fertilizante en los primeros 0–5 cm bajó de forma significativa las pérdidas de NH3",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "8",
          "cita": "bypass flow can be an important avenue of NO3-N loss from Vertisols especially if applied early in the season when the characteristic cracks of Vertisols have not closed",
          "de": "fert.meses",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "medido",
          "resultado": "En vertisoles el nitrato se pierde por flujo preferente en las grietas, sobre todo si se aplica temprano, cuando las grietas todavía no se han cerrado",
          "coincidencia": "aproximada (OCR, 0.94)"
        },
        {
          "seccion": "Relaciones",
          "pagina": "8",
          "cita": "the amount of N recovered increased with increasing rate of NO3-N application",
          "de": "fert.dosisN",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "medido",
          "resultado": "Más nitrato aplicado, más N recuperado en el flujo preferente; el amonio no tuvo efecto",
          "coincidencia": "aproximada (OCR, 0.92)"
        },
        {
          "seccion": "Relaciones",
          "pagina": "8",
          "cita": "Drains, 40 and 60 cm deep, led to deeper rooting depth and higher yields of maize than the 0 and 20 cm deep drains",
          "de": "finca.drenes",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "medido",
          "resultado": "Drenes de 40 y 60 cm dieron raíces más profundas y más rendimiento de maíz que drenes de 0 y 20 cm",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "8",
          "cita": "the uptake of N, P, and K was higher on drained than undrained plots",
          "de": "finca.drenes",
          "a": "cultivo.absorcionNutrientes",
          "sentido": "+",
          "base": "medido",
          "resultado": "La absorción de N, P y K fue mayor en parcelas drenadas",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "8",
          "cita": "the critical soil moisture content for denitrification to commence was 60% of the water holding capacity (WHC), but substantial denitrification occurred at > 80% WHC",
          "variable": "suelo.humedad",
          "umbral": "La desnitrificación empieza a 60 % de la capacidad de retención de agua y es fuerte sobre 80 %",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "9",
          "cita": "It is recommended that 40 cm deep drains with inter-drain spacing of 15 - 20 metres be provided as prerequisite step in the management of Vertisols for maize production",
          "variable": "finca.drenes",
          "umbral": "Drenes de 40 cm de profundidad cada 15 a 20 m como paso previo para sembrar maíz en vertisoles",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "8",
          "cita": "Kenya Vertisols have pH ranging between 5.5 and 9.1",
          "dato": "pH de los vertisoles de Kenia",
          "valor": "de 5,5 a 9,1, con distinto potencial de volatilización",
          "coincidencia": "exacta"
        }
      ],
      "alertas": []
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
      "clave": "trinh-2007",
      "cita": "Trinh Van Mai (2007). Soil erosion and nitrogen leaching in northern Vietnam: experimentation and modelling. Tesis doctoral, Wageningen University, Países Bajos.",
      "tema": "fertilización",
      "cultivo": "arroz, maíz, yuca, hortalizas y flores",
      "lugar": "Tam Duong, norte de Vietnam (cuenca del río Rojo)",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "180",
          "cita": "Experimental results showed regular high N concentrations in deeper soil layers, indicative for substantial leaching losses, associated with high rainfall and/or irrigation, low crop demand and high fertilizer doses",
          "de": "fert.dosisN",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "medido",
          "resultado": "En las terrazas se midió N alto en capas profundas, señal de lixiviación fuerte, ligado a lluvia o riego altos, poca demanda del cultivo y dosis altas de fertilizante",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "180",
          "cita": "associated with high rainfall and/or irrigation, low crop demand and high fertilizer doses",
          "de": "clima.mesesLluvia",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "medido",
          "resultado": "Misma frase: la lluvia (o el riego) alta va con la lixiviación de N",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "180",
          "cita": "showed increased N leaching with increasing fertilizer doses",
          "de": "fert.dosisN",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "Con un modelo de balance de N calibrado con sus datos, la lixiviación sube con la dosis: en arroz–arroz–maíz, de 52–60 a 58–154 kg N/ha de dosis baja a alta (simulado)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "180",
          "cita": "The high values for 2005 were associated with one extraordinary rainfall event",
          "de": "clima.mesesLluvia",
          "a": "suelo.erosion",
          "sentido": "+",
          "base": "medido",
          "resultado": "Las pérdidas altas de 2005 vinieron de una sola lluvia extraordinaria",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "180",
          "cita": "annual leaching losses were calculated of up to 193 kg ha-1 in flowers and 115 in vegetables, compared to about 50 in rice",
          "dato": "Lixiviación anual calculada por cultivo",
          "valor": "hasta 193 kg N/ha en flores y 115 en hortalizas, frente a unos 50 en arroz",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "180",
          "cita": "was 538 and 3324 m3 ha-1 and the associated sediment loss 163 and 1722 kg ha-1",
          "dato": "Escorrentía y sedimento de la cuenca",
          "valor": "538 y 3324 m3/ha de agua; 163 y 1722 kg/ha de sedimento (2004 y 2005)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "181",
          "cita": "Percolation was the main process leading to high N leaching losses to groundwater",
          "dato": "Vía principal de pérdida de N en la zona plana",
          "valor": "la percolación hacia el agua subterránea",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "La erosión fue muy fuerte en cada parcela pero mucho menor a escala de cuenca, porque el sedimento queda atrapado en el camino, sobre todo en los arrozales en terraza (pág. 180).",
        "Las cifras por cultivo salen de un modelo que la tesis dice que todavía necesita calibración y validación (pág. 181)."
      ]
    },
    {
      "clave": "uwimana-2019",
      "cita": "Uwimana, A. (2019). Effects of wetland conversion to farming on water quality and sediment and nutrient retention in a tropical catchment. Tesis doctoral, Wageningen University e IHE Delft, Países Bajos.",
      "tema": "fertilización",
      "cultivo": "arroz, hortalizas y estanques de peces en humedales convertidos",
      "lugar": "Ruanda (cuenca tropical)",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "10",
          "cita": "with 93%, 60% and 67% of the annual TSS, TP and TN yields, respectively, transported during 115 days with rain",
          "de": "clima.mesesLluvia",
          "a": "agua.nutrientesEscorrentia",
          "sentido": "+",
          "base": "medido",
          "resultado": "El 93 % del sedimento, el 60 % del P total y el 67 % del N total que salen en un año salieron en los 115 días con lluvia",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "11",
          "cita": "with peaks of concentrations associated with the periods of land ploughing, weeding and fertilizer application",
          "de": "fert.meses",
          "a": "agua.nutrientesEscorrentia",
          "sentido": "+",
          "base": "medido",
          "resultado": "Los picos de N y P en el agua coincidieron con arar, deshierbar y abonar (y con vaciar y dragar los estanques)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "10",
          "cita": "Valley bottoms dominated by grass/forest and ponds/reservoir types were generally associated with positive net yields of nutrients and sediments, while those with agricultural land covers had a net negative yield, resulting in net export",
          "de": "finca.humedalNatural",
          "a": "agua.nutrientesEscorrentia",
          "sentido": "−",
          "base": "medido",
          "resultado": "Los fondos de valle con pasto o bosque, y con estanques, retuvieron nutrientes y sedimento; los cultivados los exportaron",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "11",
          "cita": "In wetland plots, TSS and TN significantly decreased from the inlet to the outlet",
          "dato": "Parcelas de humedal sin disturbar",
          "valor": "los sólidos y el N total bajaron de la entrada a la salida",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "10",
          "cita": "total suspended solids (TSS) related positively to discharge, increasing 2-8 times during high flow periods",
          "dato": "Sólidos en suspensión en época de caudal alto",
          "valor": "de 2 a 8 veces más",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "En caudal bajo todos los usos del suelo retuvieron sedimento y nutrientes, y en caudal alto todos los exportaron (pág. 10–11)."
      ]
    },
    {
      "clave": "van-der-eijk-1997",
      "cita": "van der Eijk, D. (1997). Phosphate fixation and the response of maize to fertilizer phosphate in Kenyan soils. Tesis doctoral, Wageningen Agricultural University, Países Bajos.",
      "tema": "fertilización",
      "cultivo": "maíz híbrido",
      "lugar": "Kisii, suroeste de Kenia (Ultisoles y Mollisoles)",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "9",
          "cita": "Subseed placement at the start of each growing season is recommended, either placed alone or together with small amounts of cowdung",
          "de": "fert.incorporacion",
          "a": "cultivo.rendimiento",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "Recomienda colocar el P bajo la semilla al inicio de cada ciclo, solo o con un poco de estiércol de vaca, para aprovechar el P nuevo y el residual",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "9",
          "cita": "P application rates of 20 to 40 kg/ha (in P2O5: 45 to 90 kg/ha) are advised for maize",
          "variable": "fert.dosisP",
          "umbral": "Para maíz, 20 a 40 kg P/ha por ciclo (45 a 90 kg P2O5/ha), colocado bajo la semilla: un poco más de lo que la planta necesita, y el P del suelo sube poco a poco",
          "coincidencia": "aproximada (OCR, 0.96)"
        },
        {
          "seccion": "Datos",
          "pagina": "9",
          "cita": "Thus, P fixation is much less of a problem for farmers than expected",
          "dato": "Fijación de P en los suelos de Kisii",
          "valor": "mucho menos problema para el productor de lo esperado: la fase lenta de fijación avanza muy despacio en el campo",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "9",
          "cita": "The efficiency of utilization increased with P application to about 550 kg/kg at P rates of 22 to 131 kg/ha and decreased at higher rates due to a luxurious P uptake",
          "dato": "Eficiencia de uso del P absorbido",
          "valor": "sube hasta unos 550 kg de grano por kg de P con 22 a 131 kg P/ha y baja con más P (consumo de lujo)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "9",
          "cita": "They were about 10% each growing season at a P rate of 22 kg/ha",
          "dato": "Recuperación aparente del P del fertilizante",
          "valor": "cerca de 10 % por ciclo con 22 kg P/ha",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "9",
          "cita": "They were low in available native P (P-Olsen 1.6 to 3.2 mg/kg) and had medium to high P sorption capacities (445 to 870 mg/kg)",
          "dato": "Suelos del estudio",
          "valor": "P Olsen nativo bajo (1,6 a 3,2 mg/kg) y capacidad de sorción de P media a alta (445 a 870 mg/kg)",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "El P del fertilizante quedó concentrado alrededor de los gránulos (más de 8000 mg/kg de P total) hasta unos 600 días después de aplicarlo: el residuo existe pero pocas raíces llegan a él (pág. 9)."
      ]
    },
    {
      "clave": "vanek-2011",
      "cita": "Vanek, S. J. (2011). Legume-phosphorus synergies in mountain agroecosystems: field nutrient balances, soil fertility gradients, and effects on legume attributes and nutrient cycling in the Bolivian Andes. Tesis doctoral, Cornell University, Estados Unidos.",
      "tema": "suelo",
      "cultivo": "papa, cereales y leguminosas con ganado",
      "lugar": "Andes de Bolivia (pequeños productores de montaña)",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "Field nutrient balances showed that manuring rates, rangeland productivity, and soil erosion were dominant drivers of soil nutrient trends",
          "de": "suelo.erosion",
          "a": "suelo.balanceNutrientes",
          "sentido": "−",
          "base": "medido",
          "resultado": "La dosis de estiércol, la productividad del pastizal y la erosión fueron lo que más movió el balance de nutrientes de los campos",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "3",
          "cita": "Fields near to communities received more manure and were less steep than far fields, resulting in more positive near field balances",
          "de": "finca.pendiente",
          "a": "suelo.balanceNutrientes",
          "sentido": "−",
          "base": "medido",
          "resultado": "Los campos cercanos al pueblo, menos empinados y con más estiércol, tuvieron balances más positivos que los lejanos (pendiente y estiércol van juntos, no se separan)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "4",
          "cita": "Soil texture and Ca-P levels determined impacts of P fertilization: the largest increases in N fixed were 67% for RP and 150% for TSP in soils with low levels of clay and Ca-P",
          "de": "fert.dosisP",
          "a": "cultivo.fijacionN",
          "sentido": "+",
          "base": "medido",
          "resultado": "Abonar con P subió el N fijado por las leguminosas hasta 67 % con roca fosfórica y 150 % con superfosfato triple, sobre todo en suelos con poca arcilla y poco fósforo de calcio",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "El balance de potasio fue negativo por la cosecha de tubérculos y porque los rastrojos se dan al ganado (pág. 3)."
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
    },
    {
      "clave": "xiao-2016",
      "cita": "Xiao, M. (2016). Nutrient runoff and leachate after land-application of digestate in a laboratory study using rainfall simulations. Tesis de maestría, Purdue University, Estados Unidos.",
      "tema": "fertilización",
      "cultivo": "sin cultivo (bandejas de suelo franco limoso en laboratorio)",
      "lugar": "Indiana, Estados Unidos (laboratorio de erosión del USDA-ARS)",
      "aporta": "conocimiento",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "16",
          "cita": "Application of liquid digestate significantly reduced the phosphorus losses for runoff",
          "de": "fert.abonoOrganico",
          "a": "agua.nutrientesEscorrentia",
          "sentido": "−",
          "base": "medido",
          "resultado": "El digestato líquido perdió menos fósforo por escorrentía que el fertilizante químico (nueve lluvias simuladas en seis meses)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "66",
          "cita": "did not ameliorate the nutrient losses from leachate. It even caused more losses for NO3-N",
          "de": "fert.abonoOrganico",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "medido",
          "resultado": "En el lixiviado no mejoró al químico y perdió más nitrato",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "65",
          "cita": "all the treatments had higher losses for runoff and leachate when soil was under wet condition. This consequently caused more nutrient losses from soil trays",
          "de": "suelo.humedad",
          "a": "agua.nutrientesEscorrentia",
          "sentido": "+",
          "base": "medido",
          "resultado": "Con el suelo húmedo todos los tratamientos perdieron más agua por escorrentía y lixiviado, y por eso más nutrientes",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "65",
          "cita": "a rainfall happened within 24 hours after fertilizer application was made",
          "dato": "Primera lluvia simulada",
          "valor": "dentro de las 24 horas después de abonar",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "28",
          "cita": "The trays were positioned on shelves with a 3% slope",
          "dato": "Pendiente de las bandejas",
          "valor": "3 %",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Ensayo de laboratorio con suelo tamizado en bandejas de 1 m y sin cultivo (pág. 28): sirve para comparar fuentes de abono, no para estimar pérdidas de una finca.",
        "Uno de los cuatro digestatos (D3) perdió más amonio y nitrógeno Kjeldahl por escorrentía que el químico (pág. 65)."
      ]
    },
    {
      "clave": "zhu-2024",
      "cita": "Zhu, X. (2024). Impacts of management, climate and soil properties on nitrogen use efficiency and soil acidification in croplands in China. Tesis doctoral, Wageningen University, Países Bajos.",
      "tema": "fertilización",
      "cultivo": "arroz, cultivos de secano y rotaciones (13 ensayos de largo plazo)",
      "lugar": "sur de China",
      "aporta": "puntaje",
      "items": [
        {
          "seccion": "Relaciones",
          "pagina": "172",
          "cita": "N transformation was the main driver of soil acidification in non-calcareous upland soils, accounting for 72% of total acid production rate",
          "de": "fert.dosisN",
          "a": "suelo.pH",
          "sentido": "−",
          "base": "medido",
          "resultado": "En suelos de secano no calcáreos, la transformación del N del fertilizante fue la causa principal de la acidificación (72 % del ácido producido; balance con datos de 13 ensayos y lixiviación modelada)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "170",
          "cita": "Excessive nitrogen (N) fertilizer application in China's croplands has led to low nitrogen use efficiency (NUE), leading to enhanced nitrate leaching which is accompanied by soil acidification",
          "de": "fert.dosisN",
          "a": "suelo.nutrientesLixiviados",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "El exceso de N baja la eficiencia de uso y sube la lixiviación de nitrato, con acidificación si el estiércol o la cal no reponen las bases (premisa de la tesis)",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "170",
          "cita": "The use of manure, which contains base cations and HCO3-, mitigates the acidifying impact of N fertilizer inputs",
          "de": "fert.abonoOrganico",
          "a": "suelo.pH",
          "sentido": "+",
          "base": "afirmado",
          "resultado": "El estiércol trae cationes básicos y bicarbonato que frenan la acidificación del N, pero puede acumular P en suelos con P alto",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Relaciones",
          "pagina": "171",
          "cita": "In addition to pH, an increase in phosphorus availability increased NUE",
          "de": "suelo.fosforo",
          "a": "cultivo.eficienciaN",
          "sentido": "+",
          "base": "medido",
          "resultado": "Además del pH, más P disponible subió la eficiencia de uso del N",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "171",
          "cita": "soil pH was the most important factor controlling NUE with an optimum pH around 6",
          "variable": "suelo.pH",
          "umbral": "El pH fue lo que más controló la eficiencia de uso del N, con un óptimo cerca de 6",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Umbrales",
          "pagina": "171",
          "cita": "the highest NUE was found when 25 to 30% of the total N input was supplied in organic form",
          "variable": "fert.abonoOrganico",
          "umbral": "La mayor eficiencia de uso del N se dio con 25 a 30 % del N total en forma orgánica",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "171",
          "cita": "Current NUE equalled on average 30% in paddy soils, 39% in upland soils and 42% in paddy upland soils",
          "dato": "Eficiencia de uso del N actual",
          "valor": "30 % en arrozales, 39 % en secano y 42 % en arroz con secano",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "172",
          "cita": "the need for total fertilizer and manure N and P inputs in China decreased by 49% and 70% respectively",
          "dato": "Con manejo óptimo en China",
          "valor": "el N y el P totales que se aplican bajarían 49 % y 70 %",
          "coincidencia": "exacta"
        },
        {
          "seccion": "Datos",
          "pagina": "172",
          "cita": "reduced soil acidification rates by 84%",
          "dato": "Acidificación con manejo óptimo",
          "valor": "−84 %, por menos nitrato lixiviado y más bases del estiércol",
          "coincidencia": "exacta"
        }
      ],
      "alertas": [
        "Los porcentajes del manejo óptimo salen de un cálculo por provincia (capítulo 4, en preparación al publicarse la tesis), no de ensayos (pág. 172)."
      ]
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
      "de": "fert.dosisN",
      "a": "suelo.nutrientesLixiviados",
      "tesis": [
        "sigunga-1997",
        "trinh-2007",
        "zhu-2024"
      ],
      "medido": {
        "sube": 2,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 2,
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
      "de": "fert.incorporacion",
      "a": "aire.amoniaco",
      "tesis": [
        "huijsmans-2003",
        "sigunga-1997"
      ],
      "medido": {
        "sube": 0,
        "baja": 3,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "fert.incorporacion",
      "a": "cultivo.rendimiento",
      "tesis": [
        "schroder-1998",
        "van-der-eijk-1997"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 1
      },
      "otras": 1,
      "vinculos": []
    },
    {
      "de": "fert.meses",
      "a": "suelo.nutrientesLixiviados",
      "tesis": [
        "schroder-1998",
        "sigunga-1997"
      ],
      "medido": {
        "sube": 2,
        "baja": 0,
        "sinEfecto": 0
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
      "de": "suelo.humedad",
      "a": "suelo.desnitrificacion",
      "tesis": [
        "anderson-2013",
        "sigunga-1997"
      ],
      "medido": {
        "sube": 2,
        "baja": 0,
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
      "de": "clima.lluvia",
      "a": "suelo.nitrogenoMineral",
      "tesis": [
        "schroder-1998"
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
      "de": "clima.mesesLluvia",
      "a": "aire.oxidoNitroso",
      "tesis": [
        "molodovskaya-2010"
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
      "de": "clima.mesesLluvia",
      "a": "suelo.nutrientesLixiviados",
      "tesis": [
        "trinh-2007"
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
      "de": "clima.mesesLluvia",
      "a": "suelo.erosion",
      "tesis": [
        "trinh-2007"
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
      "de": "clima.mesesLluvia",
      "a": "agua.nutrientesEscorrentia",
      "tesis": [
        "uwimana-2019"
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
      "de": "fert.abonoOrganico",
      "a": "aire.amoniaco",
      "tesis": [
        "huijsmans-2003"
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
      "de": "fert.abonoOrganico",
      "a": "aire.oxidoNitroso",
      "tesis": [
        "molodovskaya-2010"
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
      "de": "fert.abonoOrganico",
      "a": "suelo.fosforo",
      "tesis": [
        "pacenka-2012"
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
      "de": "fert.abonoOrganico",
      "a": "agua.nutrientesEscorrentia",
      "tesis": [
        "xiao-2016"
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
      "de": "fert.abonoOrganico",
      "a": "suelo.nutrientesLixiviados",
      "tesis": [
        "xiao-2016"
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
      "de": "fert.abonoOrganico",
      "a": "suelo.pH",
      "tesis": [
        "zhu-2024"
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
      "de": "fert.dosisK",
      "a": "suelo.zincLixiviado",
      "tesis": [
        "fallas-2022"
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
      "de": "fert.dosisN",
      "a": "suelo.nitrogenoMineral",
      "tesis": [
        "schroder-1998"
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
      "de": "fert.dosisN",
      "a": "cultivo.rendimiento",
      "tesis": [
        "schroder-1998"
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
      "de": "fert.dosisN",
      "a": "suelo.pH",
      "tesis": [
        "zhu-2024"
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
      "de": "fert.dosisP",
      "a": "suelo.boroAdsorbido",
      "tesis": [
        "fallas-2022"
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
      "de": "fert.dosisP",
      "a": "suelo.fosforoLixiviado",
      "tesis": [
        "schoumans-2015"
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
      "de": "fert.dosisP",
      "a": "cultivo.fijacionN",
      "tesis": [
        "vanek-2011"
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
      "de": "fert.frecuencia",
      "a": "cultivo.rendimiento",
      "tesis": [
        "schroder-1998"
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
      "de": "fert.incorporacion",
      "a": "cultivo.absorcionNutrientes",
      "tesis": [
        "schroder-1998"
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
      "de": "fert.meses",
      "a": "aire.oxidoNitroso",
      "tesis": [
        "molodovskaya-2010"
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
      "de": "fert.meses",
      "a": "agua.nutrientesEscorrentia",
      "tesis": [
        "uwimana-2019"
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
      "de": "finca.distAgua",
      "a": "agua.fosforoSubterranea",
      "tesis": [
        "flores-lopez-2009"
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
      "de": "finca.drenes",
      "a": "cultivo.rendimiento",
      "tesis": [
        "sigunga-1997"
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
      "de": "finca.drenes",
      "a": "cultivo.absorcionNutrientes",
      "tesis": [
        "sigunga-1997"
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
      "de": "finca.humedalNatural",
      "a": "agua.nutrientesEscorrentia",
      "tesis": [
        "uwimana-2019"
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
      "de": "finca.pendiente",
      "a": "suelo.balanceNutrientes",
      "tesis": [
        "vanek-2011"
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
      "de": "suelo.biocarbon",
      "a": "suelo.nutrientesLixiviados",
      "tesis": [
        "major-2009"
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
      "de": "suelo.biocarbon",
      "a": "cultivo.rendimiento",
      "tesis": [
        "major-2009"
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
      "de": "suelo.desnudoMeses",
      "a": "suelo.nutrientesLixiviados",
      "tesis": [
        "schroder-1998"
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
      "de": "suelo.erosion",
      "a": "suelo.balanceNutrientes",
      "tesis": [
        "vanek-2011"
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
      "de": "suelo.fosforo",
      "a": "cultivo.eficienciaN",
      "tesis": [
        "zhu-2024"
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
      "de": "suelo.humedad",
      "a": "suelo.fosforo",
      "tesis": [
        "pacenka-2012"
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
      "de": "suelo.humedad",
      "a": "agua.nutrientesEscorrentia",
      "tesis": [
        "xiao-2016"
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
      "de": "suelo.pH",
      "a": "suelo.zincLixiviado",
      "tesis": [
        "fallas-2022"
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
      "de": "suelo.pH",
      "a": "aire.amoniaco",
      "tesis": [
        "sigunga-1997"
      ],
      "medido": {
        "sube": 0,
        "baja": 0,
        "sinEfecto": 0
      },
      "otras": 0,
      "vinculos": []
    },
    {
      "de": "suelo.retencionAgua",
      "a": "suelo.nutrientesLixiviados",
      "tesis": [
        "schroder-1998"
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
      "de": "suelo.saturacionFosforo",
      "a": "suelo.fosforoLixiviado",
      "tesis": [
        "schoumans-2015"
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
      "de": "suelo.usoIntensivo",
      "a": "suelo.compactacion",
      "tesis": [
        "recha-2011"
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
      "a": "suelo.escorrentia",
      "tesis": [
        "recha-2011"
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
      "a": "agua.nutrientesEscorrentia",
      "tesis": [
        "recha-2011"
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
      "id": "agua.fosforoSubterranea",
      "nombre": "Fósforo soluble en el agua subterránea",
      "tesis": [
        "flores-lopez-2009"
      ]
    },
    {
      "id": "agua.nutrientesEscorrentia",
      "nombre": "Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce",
      "tesis": [
        "recha-2011",
        "uwimana-2019",
        "xiao-2016"
      ]
    },
    {
      "id": "aire.amoniaco",
      "nombre": "Amoníaco (NH3) que se volatiliza del fertilizante o del estiércol",
      "tesis": [
        "huijsmans-2003",
        "sigunga-1997"
      ]
    },
    {
      "id": "aire.oxidoNitroso",
      "nombre": "Óxido nitroso (N2O) que emite el suelo",
      "tesis": [
        "molodovskaya-2010"
      ]
    },
    {
      "id": "clima.alteraciones",
      "nombre": "Alteraciones del clima",
      "tesis": [
        "kuniyoshi"
      ]
    },
    {
      "id": "clima.lluvia",
      "nombre": "Lluvia acumulada en el período (mm)",
      "tesis": [
        "schroder-1998"
      ]
    },
    {
      "id": "cultivo.absorcionNutrientes",
      "nombre": "Absorción de nutrientes por la planta",
      "tesis": [
        "brenes-2004",
        "schroder-1998",
        "sigunga-1997"
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
      "id": "cultivo.eficienciaN",
      "nombre": "Eficiencia de uso del nitrógeno (NUE)",
      "tesis": [
        "zhu-2024"
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
      "id": "cultivo.fijacionN",
      "nombre": "Nitrógeno fijado por las leguminosas",
      "tesis": [
        "vanek-2011"
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
        "major-2009",
        "mejia-reyes-2020",
        "molina-2009",
        "ordonez-ventura-2015",
        "plaza-2004",
        "poquiviqui-1998",
        "saltos-2009",
        "schroder-1998",
        "sigunga-1997",
        "t215-1990",
        "van-der-eijk-1997",
        "vargas-cazar-2019"
      ]
    },
    {
      "id": "fert.abonoOrganico",
      "nombre": "Estiércol, purín o digestato aplicado como abono",
      "tesis": [
        "huijsmans-2003",
        "molodovskaya-2010",
        "pacenka-2012",
        "xiao-2016",
        "zhu-2024"
      ]
    },
    {
      "id": "fert.dosisK",
      "nombre": "Dosis de potasio aplicada (KCl)",
      "tesis": [
        "fallas-2022"
      ]
    },
    {
      "id": "fert.dosisN",
      "nombre": "Dosis de nitrógeno aplicada",
      "tesis": [
        "schroder-1998",
        "sigunga-1997",
        "trinh-2007",
        "zhu-2024"
      ]
    },
    {
      "id": "fert.dosisP",
      "nombre": "Dosis de fósforo aplicada",
      "tesis": [
        "fallas-2022",
        "schoumans-2015",
        "van-der-eijk-1997",
        "vanek-2011"
      ]
    },
    {
      "id": "fert.frecuencia",
      "nombre": "Frecuencia o fraccionamiento de la fertilización",
      "tesis": [
        "alpizar-2000",
        "schroder-1998"
      ]
    },
    {
      "id": "fert.incorporacion",
      "nombre": "Fertilizante incorporado, inyectado o colocado en banda (frente a dejarlo al voleo en la superficie)",
      "tesis": [
        "huijsmans-2003",
        "schroder-1998",
        "sigunga-1997",
        "van-der-eijk-1997"
      ]
    },
    {
      "id": "finca.drenes",
      "nombre": "Drenes abiertos en el campo",
      "tesis": [
        "sigunga-1997"
      ]
    },
    {
      "id": "finca.humedalNatural",
      "nombre": "Humedal, pasto o bosque natural en el fondo del valle",
      "tesis": [
        "uwimana-2019"
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
      "id": "suelo.balanceNutrientes",
      "nombre": "Balance de nutrientes del campo (entradas menos salidas)",
      "tesis": [
        "vanek-2011"
      ]
    },
    {
      "id": "suelo.biocarbon",
      "nombre": "Biocarbón (biochar) aplicado al suelo",
      "tesis": [
        "major-2009"
      ]
    },
    {
      "id": "suelo.boroAdsorbido",
      "nombre": "Boro retenido (adsorbido) por el suelo",
      "tesis": [
        "fallas-2022"
      ]
    },
    {
      "id": "suelo.compactacion",
      "nombre": "Compactación del suelo",
      "tesis": [
        "brenes-2004",
        "recha-2011"
      ]
    },
    {
      "id": "suelo.desnitrificacion",
      "nombre": "Desnitrificación (nitrato que el suelo convierte en gas)",
      "tesis": [
        "anderson-2013",
        "sigunga-1997"
      ]
    },
    {
      "id": "suelo.erosion",
      "nombre": "Suelo perdido por erosión",
      "tesis": [
        "trinh-2007",
        "vanek-2011"
      ]
    },
    {
      "id": "suelo.escorrentia",
      "nombre": "Lluvia que escurre sobre el suelo (fracción de la lluvia)",
      "tesis": [
        "recha-2011"
      ]
    },
    {
      "id": "suelo.fosforo",
      "nombre": "Fósforo disponible en el suelo (análisis de suelo)",
      "tesis": [
        "pacenka-2012",
        "zhu-2024"
      ]
    },
    {
      "id": "suelo.fosforoLixiviado",
      "nombre": "Fósforo que se lava del suelo hacia el agua",
      "tesis": [
        "schoumans-2015"
      ]
    },
    {
      "id": "suelo.humedad",
      "nombre": "Humedad del suelo",
      "tesis": [
        "anderson-2013",
        "brenes-2004",
        "cerrato-2022",
        "pacenka-2012",
        "sigunga-1997",
        "xiao-2016"
      ]
    },
    {
      "id": "suelo.nitrogenoMineral",
      "nombre": "Nitrógeno mineral del suelo (nitrato y amonio, por análisis)",
      "tesis": [
        "schroder-1998"
      ]
    },
    {
      "id": "suelo.nutrientesLixiviados",
      "nombre": "Nitrato y potasio lixiviados bajo la zona de raíces",
      "tesis": [
        "alpizar-2000",
        "major-2009",
        "schroder-1998",
        "sigunga-1997",
        "trinh-2007",
        "xiao-2016",
        "zhu-2024"
      ]
    },
    {
      "id": "suelo.pH",
      "nombre": "pH del suelo",
      "tesis": [
        "fallas-2022",
        "sigunga-1997",
        "zhu-2024"
      ]
    },
    {
      "id": "suelo.retencionAgua",
      "nombre": "Capacidad del suelo para retener agua",
      "tesis": [
        "rios-2024",
        "schroder-1998"
      ]
    },
    {
      "id": "suelo.saturacionFosforo",
      "nombre": "Grado de saturación de fosfato del suelo (PSD)",
      "tesis": [
        "schoumans-2015"
      ]
    },
    {
      "id": "suelo.usoIntensivo",
      "nombre": "Uso agrícola intensivo del suelo (monocultivo convencional)",
      "tesis": [
        "recha-2011",
        "rios-2024"
      ]
    },
    {
      "id": "suelo.zincLixiviado",
      "nombre": "Zinc que se desorbe y se lava del suelo",
      "tesis": [
        "fallas-2022"
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
