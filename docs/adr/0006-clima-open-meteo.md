# ADR-0006: Clima por ubicación con Open-Meteo

**Estado:** Aceptado · **Registrado:** 2026-10-12 (después de tomada la decisión) · **Decide:** Diego Guevara

> Nota: este ADR documenta una decisión que ya está en el código (Issue #8, crítica 3). Las alternativas son las que el código y los documentos permiten reconstruir, no un acta de la discusión original.

## Contexto

Varias partes de la app necesitan el clima de la finca por mes: los meses de lluvia fuerte, la altitud, la ETo del riego, el clima del reservorio y los avisos de Plaguicidas. Pedirle al productor que los escriba mes por mes es lento y se llena con datos dudosos. La app no tiene servidor.

## Decisión

- Con el punto de la finca, descargar de **Open-Meteo** (API de clima histórico, reanálisis ERA5 / ERA5-Land de Copernicus, CC BY 4.0) el clima de los últimos años completos y promediarlo por mes (`src/clima/`). La URL y las atribuciones están en `CONFIG.clima`.
- Es el **promedio de 10 años** (criterio propio; la normal de la OMM usa 30) de una celda de ~11 km, **no** una estación en la finca; la app lo avisa y siempre se pueden escribir los valores a mano.
- Hay caché en el navegador por punto y se reutiliza hasta `cacheDias` (180). Sin internet se usa la última descarga; si no hay, el respaldo manual.
- Solo se envían las coordenadas redondeadas (~1 km). La finca guarda el clima por mes, no las coordenadas.
- La política de seguridad de contenido de `index.html` limita las peticiones a este servicio y a Supabase.

## Alternativas

| Alternativa | Por qué no |
| --- | --- |
| Escribir el clima a mano | Lento y propenso a error; queda como respaldo |
| Tabla de normales climáticas incluida en la app | Habría que conseguir, mantener y citar los datos para cada zona; el servicio ya los da por coordenada |
| Estaciones meteorológicas del país | No se evaluó una fuente con cobertura y acceso abierto para este proyecto |

## Consecuencias

- **Más fácil:** el productor obtiene un clima razonable con un clic; la fuente y la licencia están claras y se citan en la app.
- **Más difícil:** depende de un servicio externo gratis solo para uso no comercial (ver `docs/licencias.md`); en montaña una celda de ~11 km puede diferir de la finca; la descarga necesita conexión la primera vez.
- **Cambiaría esta decisión si:** la app se cobra o se ofrece como servicio (hay que pasar al plan comercial o a otra fuente), si el servicio cambia sus condiciones, o si hay estaciones locales con datos abiertos que sean mejores que la celda de reanálisis.
