---
clave: schoumans-2015
tipo: tesis
cita: "Schoumans, O. F. (2015). Phosphorus leaching from soils: process description, risk assessment and mitigation. Tesis doctoral, Wageningen University, Países Bajos."
texto: wur-342395
archivo: wur-342395.pdf
tema: fertilización
cultivo: tierras agrícolas en general
lugar: Países Bajos
aporta: puntaje
ocr: no
revisado_por: 
revisado_fecha: 
---

# Schoumans (2015): saturación de fosfato del suelo y fósforo que se lava hacia el agua

Páginas: del archivo PDF. Repositorio: https://doi.org/10.18174/342395 (Wageningen University & Research). Leída el 2026-11-14 (lote de fertilización y suelo: Cornell, Purdue y Wageningen).

## Variables nuevas

<!-- Variables que esta tesis trae y Trofaxis todavía no tiene: - id | nombre en palabras -->
- suelo.saturacionFosforo | Grado de saturación de fosfato del suelo (PSD)
- suelo.fosforoLixiviado | Fósforo que se lava del suelo hacia el agua
- fert.dosisP | Dosis de fósforo aplicada

## Relaciones

- suelo.saturacionFosforo | suelo.fosforoLixiviado | + | afirmado | Pasado el grado de saturación crítico, el P del agua subterránea supera el nivel natural a largo plazo (es la base del protocolo neerlandés, no una medición nueva) | pág. 244 | "as a simple index to determine the potential risk of increased P concentrations in groundwater that exceed the background concentration in the long term"
- fert.dosisP | suelo.fosforoLixiviado | + | afirmado | En su modelo SIMPLE, lo que más pesa en las pérdidas de P son los excedentes históricos de P, el nivel freático y la dosis actual de P (modelo, no medición de campo) | pág. 245 | "The most important or sensitive input variables for the assessment of P losses are the historical P surpluses, groundwater table and actual P application rates"

## Umbrales

- suelo.saturacionFosforo | Grado de saturación crítico de 25 % en suelos arenosos no calcáreos | pág. 244 | "The critical PSD of non-calcareous sandy soils was found to be 25%"
- suelo.saturacionFosforo | Crítico por tipo de suelo: turba 5 %, arenoso calcáreo 23 %, arenoso ácido 25 %, arcilla no calcárea 31 % y arcilla calcárea 78 % | pág. 244 | "peat soils (5%), calcareous sandy soils (23%), acid sandy soils (25%), non-calcareous clay soils (31%) and calcareous clay soils (78%)"

## Datos

- Suelos más vulnerables a perder P | arcillas turbosas de tierras bajas (mucho P retenido de forma reversible) y arenosos calcáreos (lo retienen débilmente) | pág. 244 | "both soil types can be considered as vulnerable to P losses"
- Tierra agrícola de Países Bajos sobre el grado crítico | cerca de 43 % | pág. 245 | "In about 43% of the agricultural land in the Netherlands, the critical PSD for the given soil type was exceeded"
- Qué baja las pérdidas a largo plazo | bajar la dosis de P o el P del suelo; las medidas en el cauce o el paisaje ayudan a corto plazo | pág. 246 | "source-oriented measures, such as reducing P application rates or lowering the P content of the soil, are needed to decrease P losses in the long term"

## Alertas

- Los umbrales son de suelos de Países Bajos, y la tesis muestra que el crítico cambia con el tipo de suelo y con su aluminio y hierro extraíbles con oxalato (pág. 244). Usarlos en suelos tropicales sería criterio propio.
