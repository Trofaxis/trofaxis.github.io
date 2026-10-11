# ADR-0002: Sección de plaguicidas (peligro para himenópteros por ingrediente y dosis)

**Estado:** Aceptado · **Fecha:** 2026-10-07 · **Decide:** Diego Guevara

## Contexto

Hasta ahora el cuestionario pedía cada plaguicida con tres datos: producto, clase (amplio espectro, selectivo o biológico) y meses. Esa lista alimenta cinco partes de la app: Polinizadores (40 de sus 100 puntos), Cadenas tróficas (75 de 100), el calendario del dashboard, el simulador y la memoria de casos.

Dos problemas:

1. **El tema no cabe en una pregunta.** Se relaciona con el riego (lixiviación, aspersión después de aplicar, aplicación por el riego), con la fertilización (mezclas con foliares) y con las especies nativas de cada finca.
2. **La clase se elige a ojo y puede engañar.** El spinosad es de origen biológico: marcado así, la app le daba 0 de riesgo para abejas, y su DL50 por contacto es 0.0036 µg/abeja (de los más tóxicos).

## Flujo del usuario

| | Antes | Después |
| --- | --- | --- |
| Dónde | Paso 4 del cuestionario | Pestaña Plaguicidas; el cuestionario muestra un resumen y un botón |
| Datos | Producto, clase y meses | Producto y meses obligatorios; ingrediente, dosis, agua por hectárea, etiqueta y condiciones, opcionales |
| Riesgo para abejas | Clase elegida a ojo | HQ con la toxicidad del ingrediente y la dosis real; sin esos datos, la clase como antes |
| Fungicidas | Sin ayuda | Se eligen del cuadro SAG y la app llena el formulario y revisa si sirve para la enfermedad |
| Avisos | Ninguno | Cada aviso dice qué pasa, por qué importa y su fuente |

## Opciones consideradas

| Opción | Problema | Decisión |
| --- | --- | --- |
| A. Borrar la pregunta del cuestionario | Polinizadores y Cadenas tróficas quedan sin dato y los .json guardados pierden la información | Descartada |
| B. Mover la pregunta sin cambiar el cálculo | Sigue el error del spinosad: la clase no mide la toxicidad | Descartada |
| C. Pestaña propia con el cociente de peligro (HQ) de la FAO y un catálogo de DL50 del PPDB | Hay que mantener el catálogo; los datos son de *Apis mellifera* | **Elegida** |
| D. Evaluación de riesgo completa (exposición en néctar y polen, efectos crónicos y en larvas) | Pide datos que un productor no tiene | Descartada por ahora |

## Decisión

- La lista `f.plaguicidas` se conserva y gana campos opcionales (`src/plag/modelo.js`). Un .json viejo se carga igual y da los mismos puntajes (prueba en `tests/plaguicidas.test.js`).
- El riesgo se plantea para **himenópteros polinizadores**. Las abejas sin aguijón (*Trigona*, *Plebeia* y otros Meliponini) son casos de cada finca: solo cuentan si la finca las registra en su inventario de especies, y entonces el HQ se multiplica por 10 (derivado de Arena y Sgolastra 2014; no es una norma).
- La DL50 sale de la ficha del PPDB o del BPDB de cada ingrediente, con enlace y fecha (53 ingredientes al cerrar este ADR). Si el ingrediente no está, el usuario escribe la DL50 de la hoja de seguridad.
- Umbrales, factores y condiciones de aplicación van en `src/core/config.js` (bloque `plag`), con su fuente al lado.
- Los vínculos con riego y fertilización son **avisos**, no puntaje: falta una fuente que fije un umbral de lámina para la lixiviación.

## Consecuencias

- **A favor:** el riesgo para polinizadores usa la toxicidad real del producto y la dosis aplicada; el usuario ve el cálculo mientras llena el formulario; los fungicidas del cuadro SAG se registran con un clic; las fincas guardadas no cambian de puntaje.
- **En contra:** el catálogo hay que actualizarlo (las fichas del PPDB cambian); la toxicidad publicada es casi toda de *Apis mellifera*; el factor ×10 es una derivación por validar con un especialista; la "S" de reingreso del cuadro SAG se interpreta como "hasta que seque la aspersión" sin confirmación del SAG (criterio propio).
