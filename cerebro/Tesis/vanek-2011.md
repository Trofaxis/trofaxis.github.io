---
clave: vanek-2011
tipo: tesis
cita: "Vanek, S. J. (2011). Legume-phosphorus synergies in mountain agroecosystems: field nutrient balances, soil fertility gradients, and effects on legume attributes and nutrient cycling in the Bolivian Andes. Tesis doctoral, Cornell University, Estados Unidos."
texto: cornell-1813-33615
archivo: cornell-1813-33615.pdf
tema: suelo
cultivo: papa, cereales y leguminosas con ganado
lugar: Andes de Bolivia (pequeños productores de montaña)
aporta: conocimiento
ocr: no
revisado_por: 
revisado_fecha: 
---

# Vanek (2011): erosión, pendiente y balance de nutrientes en ladera

Páginas: del archivo PDF. Repositorio: https://hdl.handle.net/1813/33615 (Cornell eCommons). Leída el 2026-11-14 (lote de fertilización y suelo: Cornell, Purdue y Wageningen).

## Variables nuevas

<!-- Variables que esta tesis trae y Trofaxis todavía no tiene: - id | nombre en palabras -->
- suelo.erosion | Suelo perdido por erosión
- suelo.balanceNutrientes | Balance de nutrientes del campo (entradas menos salidas)
- fert.dosisP | Dosis de fósforo aplicada
- cultivo.fijacionN | Nitrógeno fijado por las leguminosas

## Relaciones

- suelo.erosion | suelo.balanceNutrientes | − | medido | La dosis de estiércol, la productividad del pastizal y la erosión fueron lo que más movió el balance de nutrientes de los campos | pág. 3 | "Field nutrient balances showed that manuring rates, rangeland productivity, and soil erosion were dominant drivers of soil nutrient trends"
- finca.pendiente | suelo.balanceNutrientes | − | medido | Los campos cercanos al pueblo, menos empinados y con más estiércol, tuvieron balances más positivos que los lejanos (pendiente y estiércol van juntos, no se separan) | pág. 3 | "Fields near to communities received more manure and were less steep than far fields, resulting in more positive near field balances"
- fert.dosisP | cultivo.fijacionN | + | medido | Abonar con P subió el N fijado por las leguminosas hasta 67 % con roca fosfórica y 150 % con superfosfato triple, sobre todo en suelos con poca arcilla y poco fósforo de calcio | pág. 4 | "Soil texture and Ca-P levels determined impacts of P fertilization: the largest increases in N fixed were 67% for RP and 150% for TSP in soils with low levels of clay and Ca-P"

## Alertas

- El balance de potasio fue negativo por la cosecha de tubérculos y porque los rastrojos se dan al ganado (pág. 3).
