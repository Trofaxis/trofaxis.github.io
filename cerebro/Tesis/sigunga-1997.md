---
clave: sigunga-1997
tipo: tesis
cita: "Sigunga, D. O. (1997). Fertilizer nitrogen use efficiency and nutrient uptake by maize (Zea mays L.) in Vertisols in Kenya. Tesis doctoral, Wageningen Agricultural University, Países Bajos."
texto: wur-211145
archivo: wur-211145.pdf
tema: fertilización
cultivo: maíz
lugar: Kenia (vertisoles)
aporta: puntaje
ocr: sí
revisado_por: 
revisado_fecha: 
---

# Sigunga (1997): humedad, pH, grietas y drenaje en las pérdidas de N de vertisoles

Páginas: del archivo PDF. Documento escaneado (OCR): las frases se escriben limpias y se verifican por parecido.
Repositorio: https://doi.org/10.18174/211145 (Wageningen University & Research). Leída el 2026-11-14 (lote de fertilización y suelo: Cornell, Purdue y Wageningen).

## Variables nuevas

<!-- Variables que esta tesis trae y Trofaxis todavía no tiene: - id | nombre en palabras -->
- suelo.humedad | Humedad del suelo
- suelo.desnitrificacion | Desnitrificación (nitrato que el suelo convierte en gas)
- suelo.pH | pH del suelo
- aire.amoniaco | Amoníaco (NH3) que se volatiliza del fertilizante o del estiércol
- fert.incorporacion | Fertilizante incorporado, inyectado o colocado en banda (frente a dejarlo al voleo en la superficie)
- fert.dosisN | Dosis de nitrógeno aplicada
- suelo.nutrientesLixiviados | Nitrato y potasio lixiviados bajo la zona de raíces
- finca.drenes | Drenes abiertos en el campo
- cultivo.rendimiento | Rendimiento del cultivo
- cultivo.absorcionNutrientes | Absorción de nutrientes por la planta

## Relaciones

- suelo.humedad | suelo.desnitrificacion | + | medido | La tasa de desnitrificación depende sobre todo de la humedad del suelo y del carbono disponible (laboratorio) | pág. 8 | "Denitrification rate depended primarily on soil moisture content and available C"
- suelo.pH | aire.amoniaco | ? | medido | La volatilización de NH3 depende sobre todo del pH del suelo y del tipo de fertilizante; el resumen no dice la dirección | pág. 8 | "NH3 volatilization depended primarily on soil pH and fertilizer properties"
- fert.incorporacion | aire.amoniaco | − | medido | Incorporar el fertilizante en los primeros 0–5 cm bajó de forma significativa las pérdidas de NH3 | pág. 8 | "Incorporating fertilizer materials within the 0-5 cm soil layer significantly reduced NH3-N losses"
- fert.meses | suelo.nutrientesLixiviados | + | medido | En vertisoles el nitrato se pierde por flujo preferente en las grietas, sobre todo si se aplica temprano, cuando las grietas todavía no se han cerrado | pág. 8 | "bypass flow can be an important avenue of NO3-N loss from Vertisols especially if applied early in the season when the characteristic cracks of Vertisols have not closed"
- fert.dosisN | suelo.nutrientesLixiviados | + | medido | Más nitrato aplicado, más N recuperado en el flujo preferente; el amonio no tuvo efecto | pág. 8 | "the amount of N recovered increased with increasing rate of NO3-N application"
- finca.drenes | cultivo.rendimiento | + | medido | Drenes de 40 y 60 cm dieron raíces más profundas y más rendimiento de maíz que drenes de 0 y 20 cm | pág. 8 | "Drains, 40 and 60 cm deep, led to deeper rooting depth and higher yields of maize than the 0 and 20 cm deep drains"
- finca.drenes | cultivo.absorcionNutrientes | + | medido | La absorción de N, P y K fue mayor en parcelas drenadas | pág. 8 | "the uptake of N, P, and K was higher on drained than undrained plots"

## Umbrales

- suelo.humedad | La desnitrificación empieza a 60 % de la capacidad de retención de agua y es fuerte sobre 80 % | pág. 8 | "the critical soil moisture content for denitrification to commence was 60% of the water holding capacity (WHC), but substantial denitrification occurred at > 80% WHC"
- finca.drenes | Drenes de 40 cm de profundidad cada 15 a 20 m como paso previo para sembrar maíz en vertisoles | pág. 9 | "It is recommended that 40 cm deep drains with inter-drain spacing of 15 - 20 metres be provided as prerequisite step in the management of Vertisols for maize production"

## Datos

- pH de los vertisoles de Kenia | de 5,5 a 9,1, con distinto potencial de volatilización | pág. 8 | "Kenya Vertisols have pH ranging between 5.5 and 9.1"
