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

## NDVI del lote

En la tarjeta del lote, con la sesión iniciada, el botón «Ver NDVI del lote» pide a la función `ndvi` de Supabase
(`supabase/functions/ndvi/handler.js`) el NDVI de los últimos `CONFIG.ndvi.dias` días. La app solo llama cuando la
persona pulsa el botón, porque es lo único que saca el contorno del lote del dispositivo (está en el aviso de privacidad).

- **Fuente**: Statistical API de Copernicus Data Space Ecosystem, Sentinel-2 L2A, píxel de 10 m, un intervalo por día
  ([documentación](https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Statistical.html)). NDVI =
  (B08 − B04) / (B08 + B04) (Rouse et al., 1974).
- **Nubes**: no cuentan los píxeles de las clases SCL de `CONFIG.ndvi.scl` (sin dato, saturado, sombra de nube, nube
  media y alta, cirro, nieve). Una fecha se usa si al menos `CONFIG.ndvi.minValidos` del lote se ve despejado. Las dos
  son criterio propio: la documentación de Copernicus no recomienda un conjunto.
- **Qué muestra**: el NDVI medio de la última fecha despejada, su mínimo y máximo dentro del lote, el cambio respecto a
  la fecha despejada anterior (estable si es menor a `CONFIG.ndvi.cambioMin`, criterio propio) y una línea con todas las
  fechas. No interpreta el valor como bueno o malo ni dice la causa de un cambio: eso depende del cultivo y su etapa.
- **Privacidad**: la función verifica la sesión, reenvía el contorno a Copernicus en UTM y devuelve solo la serie. No
  guarda ni registra el contorno. La app guarda la serie `CONFIG.ndvi.cacheHoras` horas por lote (`biogap:ndvi:v1`).
- **Cuota**: la cuenta gratuita de Copernicus («Copernicus General Users») tiene un límite mensual de solicitudes y de
  unidades de proceso. Por eso hace falta sesión, la caché de 24 h y un tope de 1000 ha por lote.

### Activarlo (una sola vez)

1. Cuenta en https://dataspace.copernicus.eu y cliente OAuth en
   https://shapps.dataspace.copernicus.eu/dashboard/#/account/settings → «OAuth clients» → «Create» (sin marcar SPA).
2. En Supabase → Edge Functions → Secrets: `CDSE_CLIENT_ID` y `CDSE_CLIENT_SECRET`. Nunca en el repositorio.
3. Desplegar desde la carpeta del proyecto Supabase vinculada:

   ```
   supabase functions deploy ndvi
   ```

   `SUPABASE_URL` y `SUPABASE_ANON_KEY` ya vienen en las funciones. Si el cliente OAuth vence, el botón dirá que no se
   pudo entrar a Copernicus: se crea otro y se cambian los dos secretos.

## Lo que no hace todavía

- Riesgo, plagas o recomendaciones por lote: hacen falta registros por lote.
- La imagen del mapa es Sentinel-2 cloudless de un año fijo (ver la atribución del mapa), no la de hoy, y se ve borrosa
  de cerca porque el píxel es de 10 m.
