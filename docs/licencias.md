# Licencias de los servicios externos

Revisado el 2026-10-11 contra las páginas oficiales de cada proveedor (enlaces abajo). Lo que no se pudo leer está marcado como **no verificado**. Las condiciones cambian: antes de decidir el modelo de negocio, vuelve a leer la página del proveedor.

**Resumen.** Hoy la app es un proyecto universitario (CADS, Zamorano) y su uso es no comercial. Si se cobra por ella o se ofrece a exportadores como servicio, **tres cosas pasan a necesitar licencia o plan de pago**: el mapa satelital (EOX), el clima (Open-Meteo) y, con alta probabilidad, la base de datos de la nube (Supabase). Además hay una pregunta abierta sobre los datos copiados del PPDB. Esta revisión no cambia ningún comportamiento de la app.

| Servicio | Para qué lo usa la app | Condición hoy | Si se vuelve comercial |
|---|---|---|---|
| EOxCloudless (mapa satelital) | Imagen de fondo del mapa de la finca (`CONFIG.mapa.capa`) | CC BY-NC-SA 4.0: solo uso no comercial, con atribución | Exige licencia comercial de EOX |
| Open-Meteo (clima) | Lluvia, temperatura y ETo de la ubicación (`CONFIG.clima`) | API gratis solo para uso no comercial; los datos son CC BY 4.0 | Exige un plan de pago |
| Supabase (nube) | Casos de la comunidad y finca en la nube (`CONFIG.nube`) | Plan gratis, pensado para proyectos de práctica | El plan Pro cuesta desde 25 USD al mes |
| Tipografías propias (Inter y JetBrains Mono) | Texto e indicadores numéricos; los archivos van en `src/fonts/`, la app ya no pide nada a Google | SIL OFL 1.1 (aviso de derechos en `src/fonts/OFL-*.txt`) | Sin restricción de uso comercial; conservar los avisos |
| Lucide (íconos) | Íconos de la barra lateral | ISC (y MIT para los derivados de Feather) | Permitido; conservar el aviso de derechos |
| PPDB y BPDB (Universidad de Hertfordshire) | Valores de DL50, GUS y otros copiados al catálogo de ingredientes activos | **No verificado** (ver abajo) | Hay que pedir permiso a la universidad |

## 1. EOxCloudless (imagen satelital)

- **Condición actual.** El uso no comercial va bajo la licencia Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. La atribución debe verse donde se muestre la imagen (la app ya la pone en el mapa).
- **Uso comercial.** La página oficial dice que se puede usar con fines comerciales «given that you obtained an EOX Commercial Attribution-RestrictedUse 1.2 License from EOX». Entre los ejemplos que da están los servicios web y los tableros comerciales. La sublicencia o la reventa directa no están permitidas por defecto y exigen acuerdo y pago aparte.
- **Costo.** La página de precios existe (`cloudless.eox.at/pricing`), pero esta revisión no pudo leer los valores. **No verificado.** Se compra en `cloudless.eox.at/checkout` o se pide cotización en `cloudless.eox.at/contact`.
- **Alternativas a evaluar (sin revisar en esta fecha).** Un proveedor de teselas con plan comercial, o generar el mosaico propio a partir de imágenes Sentinel-2 abiertas. Ambas cuestan trabajo o dinero y habría que revisar su licencia antes de elegir.
- **A decidir.** Si el mapa es una función central del producto de pago. Si no lo es, se puede dejar el mapa solo en la versión académica.
- **Fuente.** https://cloudless.eox.at/documentation/license

## 2. Open-Meteo (clima)

- **Datos.** Se ofrecen bajo CC BY 4.0: se pueden compartir y adaptar con atribución y un enlace junto a donde se muestren (la app ya lo pone).
- **API gratis.** Es para uso no comercial. Límites publicados en el plan gratis: 600 llamadas por minuto, 5 000 por hora, 10 000 por día y 300 000 por mes (la página dice que el límite mensual hoy no se aplica).
- **Planes de pago.** API Standard (1 millón de llamadas al mes), Professional (5 millones) y Enterprise (más de 50 millones). Los precios **no figuran en la página consultada**: se ven en el pago o escribiendo a `info@open-meteo.com`.
- **Qué hace la app.** Una consulta por ubicación guardada, con coordenadas redondeadas a ~1 km. El volumen es mínimo; lo que cambia con un producto de pago es la condición de uso, no la cantidad.
- **Alternativa a evaluar.** Usar directamente el reanálisis ERA5 del Servicio de Cambio Climático de Copernicus (la fuente que usa Open-Meteo), con su propia licencia y más trabajo de procesamiento. No revisado en esta fecha.
- **A decidir.** Si el clima automático es parte del servicio de pago (entonces, plan de pago) o si el usuario puede seguir escribiendo los valores a mano.
- **Fuentes.** https://open-meteo.com/en/licence · https://open-meteo.com/en/pricing

## 3. Supabase (nube y casos de la comunidad)

- **Hoy.** Proyecto `biogap` en el plan gratis, región us-east-1 (`docs/nube.md`).
- **Plan gratis.** 500 MB de base de datos por proyecto, 50 000 usuarios activos al mes, 5 GB de salida de datos y 2 proyectos activos. **Los proyectos gratis se pausan tras 1 semana sin actividad**: con la app sin uso, los casos de la comunidad y la finca en la nube dejarían de responder hasta reactivar el proyecto.
- **Plan Pro.** Desde 25 USD al mes, descrito por Supabase como el plan «for production applications». La página no dice con palabras explícitas si el plan gratis puede usarse en producción comercial; lo presenta para proyectos de práctica. **Los términos de servicio no se revisaron.**
- **A decidir.** Si la nube es parte del producto. Si lo es, pasar a Pro (o a otra base) antes de tener clientes reales, y revisar los términos de servicio.
- **Fuente.** https://supabase.com/pricing

## 4. Tipografías (Inter y JetBrains Mono)

- **Hoy.** Desde la mejora de fuentes propias (issue 51, fuentes de Google bloquean la primera pantalla), los archivos `.woff2` van dentro del repositorio, en `src/fonts/`, y `index.html` los carga desde ahí. La app **ya no hace ninguna petición a Google Fonts** por las tipografías.
- **Licencia.** Las dos familias son SIL Open Font License 1.1. La licencia pide acompañar las fuentes con su aviso de copyright y el texto de la licencia: por eso `src/fonts/OFL-Inter.txt` y `src/fonts/OFL-JetBrainsMono.txt` viajan con los archivos. `src/fonts/README.md` indica el origen exacto (paquetes npm `@fontsource-variable/inter` y `@fontsource-variable/jetbrains-mono`, versión 5.3.0, subconjunto latino sin modificar) y las huellas SHA-256 de cada archivo.
- **Qué cuidar.** No renombrar ni modificar los `.woff2` (lo pide `src/fonts/README.md`) y mantener los dos `OFL-*.txt` junto a ellos. Los símbolos que el subconjunto latino no trae (Σ, ≤, ₂, →) los dibuja la fuente del sistema.
- **A decidir.** Nada.
- **Alcance de esta sección.** Se actualizó el 2026-10-11 con lo que hay en el repositorio (`src/fonts/README.md` y los `OFL-*.txt`). No se volvió a leer la página de ningún proveedor.

## 5. Lucide (íconos)

- **Licencia.** ISC; los íconos derivados de Feather son MIT. Ambas piden conservar el aviso de derechos de autor en las copias. El permiso es para «any purpose with or without fee».
- **A decidir.** Nada, salvo mantener el aviso (`index.html` ya cita la licencia).
- **Fuente.** https://lucide.dev/license

## 6. PPDB y BPDB (Universidad de Hertfordshire)

- **Qué usa la app.** El catálogo de ingredientes activos copia valores de sus fichas (DL50 por contacto, GUS y otros), con enlace y fecha de consulta (`src/plag/catalogo.js`).
- **Qué se pudo leer.** La página principal dice que el contenido del sitio no puede copiarse, reproducirse ni descargarse sin permiso, salvo lo que permitan la ley de derechos de autor o las condiciones de uso, y que las copias fuera de línea de la base para aplicaciones de terceros están disponibles «under licence». No se pudo leer el documento de condiciones de uso. **No verificado si copiar valores sueltos con cita está permitido, ni si lo está para un producto de pago.**
- **A decidir.** Escribir a la universidad para preguntar por el uso comercial de los valores ya copiados, o reemplazarlos por valores de la hoja de seguridad o de la etiqueta de cada producto. Hasta tener respuesta, el catálogo se mantiene como proyecto académico, con cita.
- **Fuente.** https://sitem.herts.ac.uk/aeru/ppdb/

## Otras citas de la app (no son servicios)

La FAO, el cuadro de la SAG de Honduras, Pesticide Stewardship y los artículos con DOI se citan como fuente de fórmulas, umbrales y valores. Esta revisión no revisó si alguna de esas publicaciones restringe copiar valores a un producto comercial. Si el producto se vuelve comercial, conviene repasar cada una.

## Qué hay que decidir, en orden

1. ¿La app va a cobrarse o a ofrecerse como servicio a exportadores? Todo lo anterior depende de esa respuesta.
2. Si sí: cotizar EOX y Open-Meteo, pasar Supabase a Pro y escribir a la Universidad de Hertfordshire.

Las fuentes ya no están en la lista: se alojan en el repositorio desde la mejora de fuentes propias (sección 4).
