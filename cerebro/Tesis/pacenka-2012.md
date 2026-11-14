---
clave: pacenka-2012
tipo: tesis
cita: "Pacenka, S. (2012). Can soil test phosphorus track phosphorus changes for water quality management? Tesis de maestría, Cornell University, Estados Unidos."
texto: cornell-1813-31236
archivo: cornell-1813-31236.pdf
tema: fertilización
cultivo: fincas lecheras (maíz y pasturas)
lugar: cuencas que abastecen de agua a Nueva York, Estados Unidos
aporta: puntaje
ocr: no
revisado_por: 
revisado_fecha: 
---

# Pacenka (2012): fósforo del análisis de suelo y estiércol

Páginas: del archivo PDF. Repositorio: https://hdl.handle.net/1813/31236 (Cornell eCommons). Leída el 2026-11-14 (lote de fertilización y suelo: Cornell, Purdue y Wageningen).

## Variables nuevas

<!-- Variables que esta tesis trae y Trofaxis todavía no tiene: - id | nombre en palabras -->
- suelo.fosforo | Fósforo disponible en el suelo (análisis de suelo)
- fert.abonoOrganico | Estiércol, purín o digestato aplicado como abono
- suelo.humedad | Humedad del suelo

## Relaciones

- fert.abonoOrganico | suelo.fosforo | + | medido | En más de 1200 series de análisis de campos (6 años o más, muestreo cada 3 años), el P Morgan sube con más dosis recomendada de estiércol, más frecuencia de maíz y más aluminio | pág. 3 | "Morgan's P concentration with: corn frequency, higher recommended manure rate, and higher aluminum"
- suelo.humedad | suelo.fosforo | − | medido | En la misma regresión, los suelos más húmedos tienen menos P Morgan | pág. 3 | "and higher aluminum; and a negative effect of soil wetness"

## Umbrales

- suelo.fosforo | Punto de quiebre cerca de 12 kg P/ha (Morgan): los suelos con P bajo tienden a subir y los de P alto a bajar | pág. 3 | "The breakpoint is around 12 kg P/ha"

## Alertas

- El exceso de fósforo de las fincas causó floraciones de algas en las fuentes de agua potable de Nueva York (pág. 3).
