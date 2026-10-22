# Build: la copia que se publica

Trofaxis se programa como siempre: módulos ES en `src/`, sin dependencias en tiempo de ejecución, y se ve en local sin compilar nada. Solo al publicar, GitHub Actions arma una copia en `dist/` donde los módulos que la app carga al abrir van juntos en pocos archivos. Decisión de Diego del 2026-10-22 («Los dos»: caché primero en el service worker y build).

## Por qué

Con red lenta, abrir Trofaxis por primera vez pedía unos 80 archivos encadenados: el navegador descubre cada módulo al leer el anterior. Medido el 2026-10-22 en un servidor local HTTP/2 con 3G simulado (562 ms de latencia, 1,44 Mbps), tiempo hasta que se dibuja Inicio, mediana de 3. No son mediciones con usuarios reales.

| | Primera visita | Visitas siguientes |
|---|---|---|
| Sin build, service worker red primero (antes) | 4,0 s | 3,0 s |
| Sin build, service worker caché primero | 4,0 s | 0,2 s |
| Con build y caché primero | 2,8 s | 0,1 s |

Google considera buena una carga de hasta 2,5 s y mala una de más de 4 s (Largest Contentful Paint).

## Qué hace `npm run build` (`scripts/build.mjs`)

1. Copia a `dist/` los archivos del repositorio (`git ls-files`), menos `.github/` y `.gitignore`: lo mismo que GitHub Pages publicaba desde la rama. `src/` sigue publicado porque el panel de administración importa `src/nube/cliente.js`, `src/admin/cerebro.js` y los estilos.
2. Con esbuild (versión fija en `package.json`) arma `dist/app/`:
   - `app/app.js`: lo que `src/app.js` carga al abrir.
   - Una entrada por cada vista que se carga al abrirla, en la misma ruta relativa (`app/ui/riego.js`, `app/riego/xlsx.js`…). El código sigue usando `import(conIntento('./ui/riego.js', intento))`; esbuild deja esa línea igual y, como la ruta relativa coincide, encuentra la entrada empaquetada, también al reintentar con `?r=N`.
   - `app/comun/`: el código que comparten. Así la app y las vistas usan el mismo módulo de estado y configuración, sin copias.
   - Mapas de fuente (`.map`) para depurar en el navegador con el código original.
3. En `dist/index.html` cambia `src/app.js` por `app/app.js` y agrega `modulepreload` de los archivos comunes, para pedirlos junto con `app/app.js`.
4. Genera `dist/sw.js`: la misma lógica que `sw.js`, con un `APP_SHELL` que cambia los módulos de `src/` por los de `app/` y un `CACHE_NAME` calculado con la misma regla que la prueba de `tests/pwa.test.js`.
5. Falla si una vista diferida no se empaquetó o si el app shell apunta a un archivo que no existe.

## Reglas para programar

- Una vista nueva que se cargue al abrirla se importa con `import(conIntento('./ruta.js', intento))` o con un `import('./ruta.js')` literal. El build rechaza cualquier otro `import()` (por ejemplo, con una variable) porque no sabría empaquetarlo; una prueba lo verifica.
- Umbrales, fórmulas y datos no cambian con el build: el código es el mismo, solo viaja en menos archivos.
- La app de Android (Capacitor) sigue copiando `src/` sin build (`android-app/scripts/copiar-web.mjs`); en el teléfono los archivos ya están en el equipo.

## Ver la app en local

- Sin build, como siempre: `npx --yes http-server -p 8000`.
- La copia que se publica: `npm ci`, `npm run build` y `npx --yes http-server dist -p 8001`.

## Publicar

- `.github/workflows/publicar.yml` corre en cada cambio a `main`: instala esbuild, corre `npm test`, arma `dist/` y lo publica en GitHub Pages.
- `.github/workflows/pruebas.yml` también arma `dist/` en cada PR, para ver ahí si un cambio rompe el build.
- Requiere en GitHub: Settings › Pages › Build and deployment › Source: **GitHub Actions**. Mientras siga en «Deploy from a branch», el sitio publica `main` sin build, como antes, y el paso de publicar del workflow falla sin afectar al sitio.

## Volver atrás

En Settings › Pages › Build and deployment, cambiar Source a **Deploy from a branch** (`main`, `/ (root)`). El sitio vuelve a publicar `src/` sin build en la siguiente publicación. Las apps instaladas reciben el aviso «Hay una versión nueva», como en cualquier cambio.
