# ADR-0004: Sin build y sin dependencias externas

**Estado:** Aceptado · **Registrado:** 2026-10-12 (después de tomada la decisión) · **Decide:** Diego Guevara

> Nota: este ADR documenta una decisión que ya está en el código. Las alternativas son las que el código y los documentos permiten reconstruir, no un acta de la discusión original.

## Contexto

La app es un prototipo universitario que se publica con GitHub Pages desde `main`. La mantiene una persona con ayuda de asistentes, y debe poder revisarse sin instalar nada. Los datos de los productores pasan por la app, así que la cadena de suministro importa.

## Decisión

- JavaScript con módulos ES que el navegador carga tal cual: sin empaquetador, sin transpilador y **sin paquetes de npm en producción**. `package.json` solo define `npm test` (`node --test`, el ejecutor que trae Node).
- Lo que normalmente se traería de un paquete se escribe aquí: lector de `.xlsx` y `.csv` (`src/riego/`), cliente de Supabase con `fetch` (`src/nube/`), mapa con teselas y proyección propias (`src/mapa/`).
- Las tipografías y los íconos se publican en el repositorio (`src/fonts/`, sprite en `index.html`), no se piden a un servicio externo.
- Los módulos pesados se cargan bajo demanda con `import()` (carga diferida), sin necesitar un empaquetador.
- Umbrales y pesos van en `src/core/config.js`, no dentro de las fórmulas.

## Alternativas

| Alternativa | Por qué no |
| --- | --- |
| SheetJS 0.18.5 para leer Excel | Vulnerabilidades conocidas (CVE-2023-30533, CVE-2024-22363) y las versiones corregidas no están en npm (ver ADR-0001) |
| Empaquetador (Vite, esbuild) y un framework | Añade un paso de build, un árbol de dependencias que auditar y un flujo de publicación más largo, para un tamaño de proyecto que no lo pide |
| Librerías de mapas (Leaflet) y de nube (supabase-js) | Comodidad a cambio de peso y de más superficie de ataque; lo que la app usa de ellas es pequeño |

## Consecuencias

- **Más fácil:** cualquiera ve en el navegador el mismo código que está en el repositorio; no hay dependencias que actualizar ni avisos de seguridad de terceros; publicar es unir a `main`.
- **Más difícil:** hay código propio que mantener y probar (el lector `.xlsx` y el cliente de la nube son los más delicados); no hay minificación, y la cascada de imports de módulos es más lenta que un paquete único (la carga diferida ganó solo ~6,5 %); `modulepreload` sería el siguiente paso.
- **Cambiaría esta decisión si:** el código propio de un área (por ejemplo el lector `.xlsx`) supera lo que una persona puede mantener con seguridad, o el tiempo de carga en conexiones lentas se vuelve un problema real medido en campo.
