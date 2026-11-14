---
clave: trinh-2007
tipo: tesis
cita: "Trinh Van Mai (2007). Soil erosion and nitrogen leaching in northern Vietnam: experimentation and modelling. Tesis doctoral, Wageningen University, Países Bajos."
texto: wur-26227
archivo: wur-26227.pdf
tema: fertilización
cultivo: arroz, maíz, yuca, hortalizas y flores
lugar: Tam Duong, norte de Vietnam (cuenca del río Rojo)
aporta: puntaje
ocr: no
revisado_por: 
revisado_fecha: 
---

# Trinh (2007): dosis altas, lluvia y lixiviación de N en cultivos tropicales de alto valor

Páginas: del archivo PDF. Repositorio: https://doi.org/10.18174/26227 (Wageningen University & Research). Leída el 2026-11-14 (lote de fertilización y suelo: Cornell, Purdue y Wageningen).

## Variables nuevas

<!-- Variables que esta tesis trae y Trofaxis todavía no tiene: - id | nombre en palabras -->
- fert.dosisN | Dosis de nitrógeno aplicada
- suelo.nutrientesLixiviados | Nitrato y potasio lixiviados bajo la zona de raíces
- suelo.erosion | Suelo perdido por erosión

## Relaciones

- fert.dosisN | suelo.nutrientesLixiviados | + | medido | En las terrazas se midió N alto en capas profundas, señal de lixiviación fuerte, ligado a lluvia o riego altos, poca demanda del cultivo y dosis altas de fertilizante | pág. 180 | "Experimental results showed regular high N concentrations in deeper soil layers, indicative for substantial leaching losses, associated with high rainfall and/or irrigation, low crop demand and high fertilizer doses"
- clima.mesesLluvia | suelo.nutrientesLixiviados | + | medido | Misma frase: la lluvia (o el riego) alta va con la lixiviación de N | pág. 180 | "associated with high rainfall and/or irrigation, low crop demand and high fertilizer doses"
- fert.dosisN | suelo.nutrientesLixiviados | + | afirmado | Con un modelo de balance de N calibrado con sus datos, la lixiviación sube con la dosis: en arroz–arroz–maíz, de 52–60 a 58–154 kg N/ha de dosis baja a alta (simulado) | pág. 180 | "showed increased N leaching with increasing fertilizer doses"
- clima.mesesLluvia | suelo.erosion | + | medido | Las pérdidas altas de 2005 vinieron de una sola lluvia extraordinaria | pág. 180 | "The high values for 2005 were associated with one extraordinary rainfall event"

## Datos

- Lixiviación anual calculada por cultivo | hasta 193 kg N/ha en flores y 115 en hortalizas, frente a unos 50 en arroz | pág. 180 | "annual leaching losses were calculated of up to 193 kg ha-1 in flowers and 115 in vegetables, compared to about 50 in rice"
- Escorrentía y sedimento de la cuenca | 538 y 3324 m3/ha de agua; 163 y 1722 kg/ha de sedimento (2004 y 2005) | pág. 180 | "was 538 and 3324 m3 ha-1 and the associated sediment loss 163 and 1722 kg ha-1"
- Vía principal de pérdida de N en la zona plana | la percolación hacia el agua subterránea | pág. 181 | "Percolation was the main process leading to high N leaching losses to groundwater"

## Alertas

- La erosión fue muy fuerte en cada parcela pero mucho menor a escala de cuenca, porque el sedimento queda atrapado en el camino, sobre todo en los arrozales en terraza (pág. 180).
- Las cifras por cultivo salen de un modelo que la tesis dice que todavía necesita calibración y validación (pág. 181).
