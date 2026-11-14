---
clave: schroder-1998
tipo: tesis
cita: "Schröder, J. J. (1998). Towards improved nitrogen management in silage maize production on sandy soils. Tesis doctoral, Wageningen Agricultural University, Países Bajos."
texto: wur-210937
archivo: wur-210937.pdf
tema: fertilización
cultivo: maíz para ensilaje
lugar: Países Bajos (suelos arenosos)
aporta: puntaje
ocr: sí
revisado_por: 
revisado_fecha: 
---

# Schröder (1998): dosis, época, fraccionamiento y cultivos de cobertura en maíz

Páginas: del archivo PDF. Documento escaneado (OCR): las frases se escriben limpias y se verifican por parecido.
Repositorio: https://doi.org/10.18174/210937 (Wageningen University & Research). Leída el 2026-11-14 (lote de fertilización y suelo: Cornell, Purdue y Wageningen).

## Variables nuevas

<!-- Variables que esta tesis trae y Trofaxis todavía no tiene: - id | nombre en palabras -->
- fert.dosisN | Dosis de nitrógeno aplicada
- suelo.nitrogenoMineral | Nitrógeno mineral del suelo (nitrato y amonio, por análisis)
- clima.lluvia | Lluvia acumulada en el período (mm)
- fert.frecuencia | Frecuencia o fraccionamiento de la fertilización
- cultivo.rendimiento | Rendimiento del cultivo
- cultivo.absorcionNutrientes | Absorción de nutrientes por la planta
- suelo.nutrientesLixiviados | Nitrato y potasio lixiviados bajo la zona de raíces
- suelo.retencionAgua | Capacidad del suelo para retener agua

## Relaciones

- fert.frecuencia | cultivo.rendimiento | 0 | medido | Fraccionar el N mineral (40 kg/ha en banda a las 4–6 hojas) subió el rendimiento solo en uno de cuatro ensayos, el de lluvia excesiva | pág. 214 | "Split applications of mineral fertiliser N had a significant positive effect in one experiment where rainfall was excessive but not in the others"
- fert.meses | suelo.nutrientesLixiviados | + | medido | Aplicar el purín en otoño (antes del invierno lluvioso, sin cultivo) perdió más N que en primavera; en primavera hubo menos pérdidas y más rendimiento (ocho ensayos) | pág. 214 | "spring-applied slurry without DCD was on average associated with even lower N losses and higher maize DM yields"
- suelo.desnudoMeses | suelo.nutrientesLixiviados | + | medido | Dejar el suelo sin cultivo de cobertura en invierno lixivia más N: con centeno o pasto la lixiviación bajó en proporción al N que absorbieron (dosis bajas de N, seis años) | pág. 215 | "At low N input levels, cover crops reduced N leaching in accordance with their N uptake"
- fert.incorporacion | cultivo.absorcionNutrientes | + | medido | Colocar el N cerca de la planta subió su recuperación 1,3 a 1,4 veces (Rhizolab de Wageningen) | pág. 213 | "Positioning fertiliser N close to the plant increased the recovery by a factor of 1.3 to 1.4"
- fert.incorporacion | cultivo.rendimiento | 0 | medido | La forma de aplicar el N no cambió el rendimiento de materia seca | pág. 213 | "Dry matter (DM) yields of maize were not significantly affected by the application method of N, however"
- fert.dosisN | suelo.nitrogenoMineral | + | medido | Abonar 100 kg N/ha por debajo del óptimo económico dejó 24 kg N/ha menos de N mineral en 0–60 cm al final del ciclo (25 ensayos en arena) | pág. 217 | "the soil mineral N residue at the end of the growing season (0-60 cm) decreased by 24 kg N ha-1"
- fert.dosisN | cultivo.rendimiento | + | medido | Con esos 100 kg N/ha menos, el rendimiento de materia seca bajó 16 % en promedio | pág. 217 | "The associated reduction in DM yield averaged 16%"
- clima.lluvia | suelo.nitrogenoMineral | − | medido | Cada 100 mm más de lluvia entre mayo y el muestreo dejaron 25 kg/ha menos de N mineral residual (el N se fue con el agua o lo tomó el cultivo) | pág. 103 | "A 100 mm increase of rainfall reduced residual SMN with 25 kg ha-1"
- suelo.retencionAgua | suelo.nutrientesLixiviados | − | afirmado | Los suelos arenosos retienen poca agua, así que el N baja a capas profundas si sobra o se aplica temprano (síntesis del capítulo 9) | pág. 217 | "These soils have a limited capacity to retain water and therefore N may easily be lost to greater depths when it is available or applied too early"

## Umbrales

- fert.dosisN | Óptimo económico del N disponible (N mineral del suelo en marzo–abril más N del fertilizante): 173 kg N/ha midiendo 0–30 cm y 195 kg N/ha midiendo 0–60 cm (25 ensayos en arena) | pág. 217 | "The values obtained for the economically optimal SUMN in the upper 30 and 60 cm of soil were respectively 173 and 195 kg N ha-1"
- suelo.nitrogenoMineral | Con más de 175 kg N/ha en 0–60 cm a las 4–6 hojas, agregar 40 kg N/ha de fertilizante mineral tiene un retorno dudoso | pág. 215 | "the financial return from a 40 kg ha-1 supplementation with mineral fertiliser N, is questionable if there is more than 175 kg N ha-1 in the upper 0.6 m soil layer at the 4-6 leaf stage"

## Datos

- Recomendación sobre fraccionar | no hay evidencia suficiente para recomendarlo de rutina | pág. 215 | "results provide insufficient evidence to justify recommending farmers to split applications"
- N absorbido por los cultivos de cobertura | 40 kg N/ha en promedio en la parte aérea | pág. 215 | "rye and grass cover crops were able to absorb on average 40 kg N ha-1 in the aboveground plant parts"
- Conclusión sobre la dosis | bajar el N por debajo del óptimo económico reduce el riesgo de pérdidas con poco efecto en el rendimiento | pág. 217 | "adjusting the N input to a level below the economically optimal rate can reduce the risks for N losses to the environment associated with conventional maize production, with a limited effect on silage yields"
- Nitrato en el agua subterránea | siguió sobre el límite de la UE para agua potable aun aplicando en primavera y con la dosis ajustada | pág. 214 | "Postponing slurry applications to spring and adjusting N inputs to crop requirements were insufficient to keep the nitrate concentration in groundwater below the EC threshold for drinking water"

## Alertas

- Clima templado y suelos arenosos de Países Bajos, con purín de vaca; el fraccionamiento solo ayudó en el ensayo de lluvia excesiva, que es la condición que más se parece a la época lluviosa del trópico.
- La banda de purín después de la emergencia, la única forma en que fraccionar el purín subió el rendimiento, no estaba permitida por la ley neerlandesa de entonces (pág. 214).
