# Lotes (Mi finca › Lotes)

Vista para dibujar los lotes de la finca sobre la imagen satelital y ver, por lote, lo que la app ya sabe. Fase A del
plan de la vista por lote (2026-11-14). Código: `src/mapa/lotes.js` (cálculos puros), `src/clima/ahora.js` (clima de
ahora), `src/ui/lotes.js` (tarjetas), `src/ui/mapa.js` (`panelLotesMapa`) y `src/ui/vista-lotes.js`.

## Qué muestra

- **Lotes**: polígonos con nombre y cultivo. Se guardan con el mapa en este navegador (`biogap:mapa:v1`), van en el
  respaldo del mapa y no se suben a la nube ni van en el archivo de la finca. Máximo `CONFIG.mapa.maxLotes` (criterio propio).
- **Clima de ahora**: pronóstico de Open-Meteo (`CONFIG.clima.urlAhora`) en el centro del lote elegido, o en la
  ubicación de la finca. Coordenadas redondeadas a 2 decimales (~1 km), igual que el clima histórico. Se guarda
  `CONFIG.clima.ahoraVigenciaMin` minutos; sin conexión se muestra el último con un aviso. Es un modelo por coordenada,
  no una estación en el lote, y la tarjeta lo dice.
- **Tarjeta del lote**: área dibujada, cultivo, siembra y cosecha del mes si el cultivo coincide con uno del
  cuestionario, y aparte las aplicaciones y la fertilización del mes, que se registran por finca.
- **Riesgo**: el índice de la finca (el mismo número de Inicio). Trofaxis no calcula riesgo por lote: para eso hará falta
  registrar las actividades de cada lote. La tarjeta lo dice.

## Lo que no hace todavía

- NDVI o vigor del cultivo por lote: siguiente fase, con Sentinel-2 por Copernicus Data Space. Necesita una cuenta,
  una función en Supabase y actualizar el aviso de privacidad, porque el polígono tendría que salir del teléfono.
- La imagen satelital es Sentinel-2 cloudless de un año fijo (ver la atribución del mapa), no la de hoy.
