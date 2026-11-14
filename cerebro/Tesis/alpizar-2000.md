---
clave: alpizar-2000
tipo: tesis
cita: "Alpízar Vargas, N. F. (2000). Uso de lisímetros para evaluar el movimiento de nitrógeno y potasio en suelos bananeros de Coyoles, Honduras, con potencial de lixiviación. Proyecto especial de Ingeniero Agrónomo, Zamorano, Honduras."
texto: CPA-2000-T005
archivo: CPA-2000-T005.pdf
tema: suelo
cultivo: banano
lugar: Coyoles, Yoro, Honduras (Standard Fruit Company)
aporta: puntaje
ocr: sí
revisado_por: 
revisado_fecha: 
---

# Alpízar (2000): lixiviación de nitrato y potasio con lisímetros en banano

Páginas: del archivo PDF. Documento escaneado (OCR): las frases se escriben limpias y se verifican por parecido.
Repositorio: https://hdl.handle.net/11036/2896. Leída el 2026-11-14 (lote 1 de riego y suelo).

## Variables nuevas

<!-- Variables que esta tesis trae y Trofaxis todavía no tiene: - id | nombre en palabras -->
- fert.frecuencia | Frecuencia o fraccionamiento de la fertilización
- suelo.nutrientesLixiviados | Nitrato y potasio lixiviados bajo la zona de raíces
- riego.drenaje | Agua que drena bajo las raíces (% de lo aplicado)

## Relaciones

- fert.frecuencia | suelo.nutrientesLixiviados | 0 | medido | Fraccionar urea y KCl (semanal o quincenal por fertirriego, cada 28 días o trimestral a mano) no cambió la concentración de nitrato y potasio en el lixiviado | pág. 8 | "Los resultados del estudio con los lisímetros de drenaje mostraron que la concentración en los lixiviados no es diferente significativamente (P<0.05) cuando la fertilización se fracciona."
- riego.drenaje | suelo.nutrientesLixiviados | + | afirmado | El agua que atraviesa el perfil es lo que más arrastra nitrato y potasio (lo dice el resumen; no lo midió por separado) | pág. 8 | "El movimiento del agua a través del perfil del suelo es el factor que causa mayor lixiviación"
- riego.drenaje | suelo.nutrientesLixiviados | + | citado | El regadío facilita que el nitrato llegue al agua subterránea por percolación (Aragón 1997, de segunda mano) | pág. 33 | "el regadío puede facilitar la contaminación de las aguas por nitrato debido a percolación hacia capas más profundas"

## Umbrales

- suelo.nutrientesLixiviados | En banano, el nutriente que baja de 40 cm se considera perdido (afirmado en el resumen) | pág. 8 | "Los nutrientes concentrados a profundidades mayores de 40 cm no son aprovechados por las raíces del banano"
- fert.fertirriego | Inyectar el fertilizante después del 20–25 % del volumen de riego y terminar al 80–90 % (Sagardoy 1992, de segunda mano) | pág. 33 | "El fertilizante no debe ser puesto en el agua desde el comienzo del riego, sino después de haber aplicado el 20-25% del volumen de agua"

## Datos

- Frecuencia con más nitrato en el lixiviado | trimestral, en promedio (sin diferencia estadística con las demás) | pág. 53 | "La frecuencia trimestral resultó en promedio con los valores más altos de concentración de NO3"
- Movilidad de los nutrientes | el nitrato se mueve más que el potasio con el agua del suelo | pág. 53 | "El estudio reconfirmó que el NO3- se mueve más que el K+ con el agua del suelo"
- Retención de potasio | los suelos estudiados retienen bien el K aplicado | pág. 53 | "Los suelos bajo estudio indican tener una buena capacidad para retener el K aplicado."

## Alertas

- Los lisímetros de succión no sacaron solución del suelo: todo sale de los de drenaje, con dos réplicas por tratamiento. La tesis dice que el muestreo de lixiviados no se hizo bien y que hubo efecto residual de aplicaciones anteriores (pág. 51).
- En los lisímetros se regó a mano con regadera, no con el microaspersor de la finca (pág. 40).
