# Trofaxis

**App:** https://trofaxis.github.io

*Antes «BioG.A.P. Biodiversity Manager». Las claves internas (`biogap:` en el navegador, `biogap-finca` y `biogap-mapa` en los archivos) conservan el nombre viejo para no perder datos guardados ni respaldos.*

Prototipo de evaluación de riesgo ambiental de la finca, orientado a exportadores certificados en GLOBALG.A.P. IFA v6. Proyecto de innovación del curso CADS, Zamorano.

Nació del caso *Spathodea campanulata* y las abejas nativas sin aguijón. De ahí se amplió a cinco temas ambientales de la finca.

> **Estado:** prototipo. Las fórmulas y los pesos son ilustrativos y están **por calibrar**. Los datos de la finca demostrativa son ficticios.

## La idea central: cada finca es un caso

Cada finca evaluada y exportada queda como un **caso**: su situación, su riesgo y lo que se hizo para corregirlo. Mientras más casos reales se acumulan, más útil se vuelve la app:

> *"Tu finca se parece a estas 3. Esto es lo que les funcionó."*

Eso es la **memoria de casos**, y es el valor que crece con el uso. Desde la v0.6 funciona (Etapa 1): pestaña **Casos** y panel **Fincas parecidas** en el dashboard. Un competidor puede copiar las fórmulas, pero no los casos acumulados. Por eso el formato de exportación (`.json`) está pensado desde ya como la unidad de datos de ese aprendizaje.

## Qué hace

1. **Cuestionario** de la finca en seis pasos: finca, cultivos (y cultivos aledaños; o, sin cultivos, el propósito de manejo), especies por secciones (plagas sugeridas según el cultivo, polinizadores y fauna, árboles, malezas, cultivos que florecen; nivel de presencia opcional), prácticas, calendarios y certificación. Los plaguicidas ya no se capturan aquí: tienen su pestaña.
2. **Dashboard** con el índice ambiental global, el riesgo (0-100) por módulo, la presión por mes, el cruce de calendarios, un **simulador** ("¿qué pasa si cambio esta práctica?") y un **plan de acción** con casillas.
3. **Plantillas** de registro (mecanización y personalizada; riego y fertilización tienen su pestaña) comparadas con el objetivo de la finca.
4. **Panel GLOBALG.A.P.** con el margen de Minor Musts y las no conformidades abiertas.
5. **Ajustes** para activar o desactivar módulos y mover los umbrales de riesgo. Tema claro, oscuro o del sistema.
6. **Guardar y cargar**: autoguardado en el navegador, exportar o importar la finca como archivo `.json`, y copia privada opcional en la nube.
7. **Memoria de casos (k-NN)**: compara tu finca con los casos guardados por cultivo, riego, pendiente, distancia al agua, especies nativas, meses de coincidencia y riesgo por módulo. Muestra las 3 más parecidas, en qué se parecen, qué hicieron y cómo les fue (no conformidades GLOBALG.A.P. y lámina aplicada/requerida, antes y después). Trae 9 casos de **ejemplo** (ficticios, marcados así en pantalla) y permite guardar tu finca como caso.
8. **Plan de fertilización**: cada aplicación con producto (grado N-P₂O₅-K₂O), dosis en kg/ha o qq/mz, mes y método. Calcula N, P₂O₅ y K₂O frente al objetivo, N por mes frente a la lluvia, efectos en Suelo y Agua; se escribe a mano o se carga una plantilla Excel/CSV.
9. **Riego por goteo**: calculadora y validador. El productor sube su Excel o CSV (o escribe sus datos), la app lee los valores por sus etiquetas, recalcula el diseño y revisa cada dato contra FAO-56. Ver [docs/catalogo-riego.md](docs/catalogo-riego.md).
10. **Mapa satelital de la finca** (debajo del perfil de riesgo): ubicar la finca por coordenadas, tocando el mapa o con el GPS del dispositivo, y dibujar su contorno para calcular el área. Avisa si el punto cae fuera de Honduras o si el área dibujada difiere más de 20 % de la declarada. Imagen EOxCloudless (Sentinel-2, ~10 m): uso no comercial con atribución; un uso comercial necesita licencia de EOX.
11. **Plaguicidas**: cada aplicación con producto, ingrediente activo, dosis y meses. Calcula el peligro para abejas y otros himenópteros polinizadores con el cociente de peligro de la FAO (HQ = g de i.a./ha ÷ DL50 por contacto; umbral 42 o 85), con un margen ×10 si la finca registra abejas sin aguijón. Revisa la etiqueta, las condiciones de aplicación, la eficacia contra la enfermedad (cuadro de fungicidas de la SAG, 132 productos) y la rotación por grupo, y lo cruza con la floración, la cosecha, el riego y la fertilización. Ver [docs/formulas.md](docs/formulas.md#plaguicidas-pestaña-plaguicidas).
12. **Clima por ubicación** (Issue #8): con el punto de la finca, la app descarga de Open-Meteo (ERA5, CC BY 4.0) el clima de los últimos 10 años por mes y llena solos los meses de lluvia fuerte, la altitud, la ETo de riego y el clima del reservorio; también avisa en Plaguicidas con el clima típico de los meses de aplicación. Todo se puede corregir a mano. Ver [docs/formulas.md](docs/formulas.md#clima-por-ubicación-issue-8-crítica-3).
13. **ApiRadar (resolver un problema)**: en el dashboard eliges el problema (hoy, *Spathodea campanulata y las abejas nativas*) y la app cruza los datos que ya cargaste: muestra qué datos usó, por qué sale ese riesgo, qué hacer, cuándo, cuánto baja el riesgo con cada cambio y qué falta. No agrega pesos: reutiliza la rúbrica de Polinizadores. Con el censo de árboles (coordenadas, DAP, copa), el contorno y sitios candidatos (solo en el navegador), clasifica el riesgo de cada árbol, dibuja el mapa de riesgo con los radios de exclusión y dice si cada sitio para colonias o refugios queda cerca, por revisar o lejos. Ver [docs/apiradar.md](docs/apiradar.md).

**Datos y privacidad.** Sin sesión, los datos de la finca se guardan solo en el navegador del usuario. La nube es **opcional**: empieza al iniciar sesión (con Google o con un enlace al correo, sin contraseñas). Política pública: [privacidad/](privacidad/index.html).

- **Tu finca completa** (con nombre y todos sus datos) se guarda **sola** en Supabase mientras la sesión esté abierta, unos segundos después de cada cambio. La finca de ejemplo y una finca vacía nunca se suben. Si al entrar la finca de este navegador y la de la nube son distintas, no se pisa ninguna hasta que elijas. Los botones *Guardar mi finca en la nube* y *Cargar mi finca desde la nube* siguen como respaldo manual. Para que no se suba, cierra la sesión.
- **Quién la ve:** tú (seguridad por filas, RLS) y el administrador de Trofaxis desde su panel aparte, sin el nombre de la finca, sin correo y sin coordenadas; cada consulta del administrador queda registrada. Los textos libres que escribas (por ejemplo, acciones o fuente de agua) sí los ve.
- **Un caso anónimo** se comparte solo si marcas el consentimiento y pulsas *Compartir mi caso anónimo*: perfil por rasgos (0-1), riesgo por módulo, acciones y resultado. Nunca nombre, lugar, especies ni coordenadas. Puedes retirar todos tus casos cuando quieras.
- Los casos compartidos los puede leer cualquiera, sin sesión y sin saber de quién son.
- Sin conexión o sin sesión, la app funciona igual que antes. Detalles y decisiones en [docs/nube.md](docs/nube.md).
- **El clima:** para descargarlo se envían a Open-Meteo las coordenadas redondeadas (~1 km). La finca guarda el clima por mes, no las coordenadas.
- **El mapa satelital:** las coordenadas se guardan aparte, solo en este navegador, y **no** van en el archivo exportado, en la nube ni en la memoria de casos. Tienen su propio respaldo en archivo («Guardar mapa y censo»), aparte del de la finca, porque lleva coordenadas exactas. El navegador sí descarga las imágenes del servicio de EOX según la zona que se mira.
- **Licencias de los servicios externos:** el mapa (EOX) y el clima (Open-Meteo) son gratis solo para uso no comercial, y la nube (Supabase) está en el plan gratis. Qué pasa si la app se cobra, el costo y qué hay que decidir: [docs/licencias.md](docs/licencias.md).

## Cómo verla

- **En línea:** cada cambio a `main` se publica en GitHub Pages con GitHub Actions, que antes junta los módulos en pocos archivos para que abra más rápido con red lenta ([docs/build.md](docs/build.md)).
- **En local:** se necesita un servidor, porque los módulos de JavaScript no cargan con `file://`.
  ```bash
  python3 -m http.server 8000   # luego abrir http://localhost:8000
  ```
- **Pruebas** (Node 20 o superior): `npm test`
- **La copia que se publica:** `npm ci`, `npm run build` y abrir `dist/` con el mismo servidor.

## Estructura

```
index.html              estructura de la página
src/
├─ app.js               punto de entrada: renderizado y eventos
├─ styles.css           tema claro/oscuro y componentes
├─ core/
│  ├─ config.js         ← PERSONALIZACIÓN: módulos activos, umbrales y factores
│  ├─ rubrica.js        puntaje 0/50/100 por cortes y promedio ponderado
│  ├─ engine.js         motor: rúbrica aditiva por módulo
│  ├─ state.js          finca de ejemplo, finca vacía y plantillas
│  ├─ storage.js        exportar/importar JSON con validación y autoguardado
│  └─ utils.js
├─ modules/             un archivo por módulo de riesgo
│  ├─ polinizadores.js  fertilizacion.js  agua.js  suelo.js  troficas.js
│  └─ index.js          registro de módulos
├─ casos/              memoria de casos (Etapa 1 del plan de ML)
│  ├─ perfil.js         rasgos comparables de una finca
│  ├─ memoria.js        similitud, k-NN y resumen del resultado
│  ├─ ejemplos.js       9 casos de ejemplo (ficticios)
│  └─ anonimo.js        caso anonimizado para compartir y validación de lo que baja de la nube
├─ nube/               cliente de Supabase (Auth y REST con fetch, sin dependencias)
├─ mapa/               geo.js (proyección, teselas, área, avisos) y ubicacion.js (guardado aparte)
├─ fert/               plan de fertilización: catálogo, nutrientes, costos y hallazgos
├─ apiradar/           diagnóstico por problema (hoy: Spathodea y abejas), sobre la rúbrica de Polinizadores
├─ plag/               plaguicidas
│  ├─ modelo.js         una aplicación: campos, unidades y validación (los .json viejos se cargan igual)
│  ├─ catalogo.js       53 ingredientes activos con DL50, grupo y GUS de su ficha del PPDB o BPDB
│  ├─ sag.js            cuadro de fungicidas de la SAG: productos, enfermedades y eficacia
│  └─ calculo.js        dosis por hectárea, HQ, avisos con fuente y rotación
├─ riego/              módulo de riego por goteo
│  ├─ referencias.js    valores con fuente (FAO-56, CIMMYT)
│  ├─ calculo.js        fórmulas del diseño agronómico
│  ├─ reglas.js         validación: cada alerta con su porqué y su fuente
│  ├─ xlsx.js, csv.js   lectura de archivos sin dependencias externas
│  └─ extraer.js        de las celdas a los datos, por etiquetas
└─ ui/                  vistas: dashboard, cuestionario, plantillas, riego, fertilización, plaguicidas, casos, ajustes y gráficos
docs/formulas.md        fórmula, supuestos y estado de calibración de cada módulo
docs/catalogo-riego.md  fórmulas, rangos y reglas del módulo de riego
docs/adr/               decisiones de diseño
docs/nube.md            Etapa 2: tablas, políticas, consentimiento y cómo probarla
tests/                  pruebas del motor
```

## Cómo trabajar con varios asistentes

Este repositorio es la **única versión oficial**. Cualquier asistente (Claude en el chat o Claude Code) trabaja sobre el repo, no sobre copias sueltas:

1. Pídele que clone `trofaxis/trofaxis.github.io` y trabaje en una rama nueva (por ejemplo, `mejoras-diseno`).
2. Que suba esa rama y deje las pruebas pasando (`npm test`).
3. Luego se revisa y se une a `main`. GitHub Actions la publica sola en GitHub Pages.

## Cómo agregar un módulo

1. Crea `src/modules/<nombre>.js` con `{ id, nombre, ifa, evaluar(f, ctx, helpers) }`. La función devuelve `{ P, E, V, req, recs, driver, formula }`, con P, E y V entre 0 y 1.
2. Regístralo en `src/modules/index.js`.
3. Agrega su `id` a `modulosActivos` en `src/core/config.js`.
4. Documenta la fórmula en `docs/formulas.md` y agrega una prueba.

## Hoja de ruta

Versión actual: **0.10.0** (`package.json`). El README numera solo los hitos hasta la v0.6; lo posterior no tiene número de versión por hito en el repositorio, así que va sin él.

**Hecho**

- [x] v0.2: código dividido en módulos, configuración central y pruebas de regresión
- [x] v0.3: guardar y cargar fincas (JSON) y ajustes por finca (módulos activos y umbrales)
- [x] v0.4: módulo de riego (calculadora, validador e importador de Excel/CSV), validado con el diseño agronómico del Lab de Riego
- [x] v0.5: diseño mejorado (índice global, simulador, plan de acción, presión por mes, tema oscuro, edición en el cuestionario, respaldo en texto)
- [x] v0.6: **memoria de casos** (razonamiento basado en casos, k-NN, Etapa 1): sugerir acciones a partir de fincas parecidas ya evaluadas
- [x] Memoria de casos en la nube, opcional (Etapa 2, `docs/nube.md`)
- [x] Mapa satelital con contorno y área (Issue #10)
- [x] Pestaña Plaguicidas: peligro para himenópteros por ingrediente activo y dosis, etiqueta, condiciones y cuadro SAG
- [x] Clima por ubicación: Open-Meteo por coordenadas, con respaldo manual (Issue #8)
- [x] Guardar los datos de riego en el navegador (sobreviven a recargar la página)
- [x] Diseño hidráulico y cubicación de reservorio (`src/riego/hidraulica.js`)
- [x] ApiRadar: diagnóstico por problema con los datos de la finca (hoy, *Spathodea* y abejas nativas; `docs/apiradar.md`)
- [x] Relación entre módulos: gráficos de dispersión entre pares de módulos con las fincas de la memoria (`src/casos/relaciones.js`); solo muestra asociación, no cambia ningún puntaje

**Pendiente**

- [ ] Llevar los datos de riego también en el archivo exportado de la finca
- [ ] Más cultivos en `src/riego/referencias.js` (hoy solo maíz)
- [ ] Más problemas en el ApiRadar (hoy solo uno)
- [ ] Perfiles de configuración por cultivo o exportador
- [ ] Calibrar pesos con los datos de las tesis de Zamorano, cuando estén disponibles
- [ ] Modelo de aprendizaje automático entrenado, **solo** cuando haya decenas de fincas reales registradas

> Sobre el aprendizaje automático: con pocos casos, un modelo entrenado no es confiable. Primero va la memoria de casos, que funciona con pocos datos y es explicable.

## Fuentes

El caso de origen se apoya en Osorio (2025), Kuniyoshi (2026) y Tejeda et al. (2025), del proyecto CADS. Las cifras de Osorio y Kuniyoshi están en `src/core/fuentes.js` con su página; Tejeda está con embargo y no se cita. Las secciones de IFA v6 citadas en el panel deben verificarse con el checklist oficial.
