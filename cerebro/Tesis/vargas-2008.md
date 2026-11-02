---
clave: vargas-2008
tipo: tesis
cita: "Vargas Loyo, A. J. (2008). Evaluación de la uniformidad de distribución del agua de seis cintas de goteo en condiciones de El Zamorano. Proyecto de graduación, Escuela Agrícola Panamericana, Zamorano, Honduras."
texto: CPA-2008-T073
archivo: CPA-2008-T073.pdf
tema: riego
cultivo: ninguno (laboratorio)
lugar: Zamorano, Honduras
aporta: puntaje
ocr: no
revisado_por: 
revisado_fecha: 
---

# Vargas (2008): uniformidad de seis cintas de goteo

Páginas: del archivo PDF (la portada es la pág. 1). Leída el 2026-11-02 con el piloto de lectura de tesis.

## Variables nuevas

<!-- Variables que esta tesis trae y Trofaxis todavía no tiene: - id | nombre en palabras -->
- riego.uniformidad | Uniformidad del riego (CU, UD o CUC)
- riego.ciclosUso | Ciclos de uso de la cinta de goteo
- riego.calidadCinta | Calidad de fabricación de la cinta (Qd y CVf)

## Relaciones

- riego.uniformidad | fert.fertirriego | + | afirmado | La uniformidad del riego influye en cómo se reparte el fertilizante (lo dice el resumen; no lo midió) | pág. 4 | "La uniformidad de la distribución del agua en el riego influye directamente en el crecimiento de las plantas y en el uso de energía y aplicación de fertilizantes."
- riego.ciclosUso | riego.uniformidad | − | medido | Queen Gil pierde uniformidad desde el primer ciclo; T-Tape aguanta dos ciclos (recomendación de la tesis) | pág. 4 | "Se recomienda que la marca T-Tape modelo 506-15-340 se use en dos ciclos en campo y la marca Queen Gil se descarte al primer ciclo de uso."

## Umbrales

- riego.uniformidad | CU mínimo aceptable: 87 % (Álvarez 2008, comunicación personal; de segunda mano) | pág. 11 | "El valor mínimo aceptable para CU es de 87%"
- riego.uniformidad | UD mínimo aceptable: 79 % (Álvarez 2008, comunicación personal; de segunda mano) | pág. 14 | "valor mínimo aceptable de UD (no menor de 79%)"
- riego.calidadCinta | Cinta: bueno Qd < 5 % y CVf < 10 %; medio 5–10 y 10–15; marginal 10–15 y 15–20; pobre > 15 y > 20 (Boswell 1990, de segunda mano) | pág. 22 | "Anexo 5. Clasificación de la calidad de cinta."

## Fórmulas

- Coeficiente de uniformidad (CU) | CU = (1 − Σ|Xi − X̄| / (X̄ · n)) × 100; Xi caudal de cada gotero, X̄ promedio, n goteros aforados (transcrita de la ecuación 1) | pág. 11 | "CU = Coeficiente de uniformidad, en %."
- Uniformidad de distribución (UD) | UD = 100 × Lp25% / X̄; Lp25% promedio del 25 % de goteros con menor caudal (ecuación 2) | pág. 11 | "UD = Uniformidad de la distribución, en %."
- Uniformidad de emisión (UE) | UE = 100 × (1 − 1,27 · CVf / √n) × qm / qa (ecuación 3) | pág. 11 | "UE = Uniformidad en la emisión, en %."

## Datos

- Mayor CU de las cintas nuevas | Aqua Traxx, 98,30 % | pág. 4 | "siendo Aqua Traxx la que obtuvo el mayor CU, 98.30%"
- Mayor UD de las cintas nuevas | Aqua Traxx, 97,66 % (no difiere de T-Tape, 96,80 %) | pág. 4 | "El mayor UD obtenido fue por Aqua Traxx con 97.66% que no difiere de la cinta T-Tape con un UD de 96.80%."
