# Tipografías

La app no pide fuentes a ningún servicio externo: estos archivos se publican junto con el resto del repositorio.

| Familia | Archivo | Origen | Licencia |
|---|---|---|---|
| Inter (variable, 100-900) | `inter-latin-wght-normal.woff2` | paquete npm `@fontsource-variable/inter` 5.3.0 (subconjunto latino, sin modificar) | SIL OFL 1.1, `OFL-Inter.txt` |
| JetBrains Mono (variable, 100-800) | `jetbrains-mono-latin-wght-normal.woff2` | paquete npm `@fontsource-variable/jetbrains-mono` 5.3.0 (subconjunto latino, sin modificar) | SIL OFL 1.1, `OFL-JetBrainsMono.txt` |

Huellas SHA-256 de los archivos tal como salieron del paquete:

```
3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62  inter-latin-wght-normal.woff2
18be452724bfdc236c074ca94a249a7f41a86752c7d04ab258ce9ed5651f6a7e  jetbrains-mono-latin-wght-normal.woff2
```

- `fuentes.css` declara las dos familias con los mismos nombres que usaba `styles.css` (`Inter`, `JetBrains Mono`), así que el resto de los estilos no cambia.
- La licencia OFL pide acompañar las fuentes con su aviso de copyright y el texto de la licencia: por eso los dos `OFL-*.txt` van en esta carpeta. No renombrar ni modificar los archivos `.woff2`.
- Solo se incluye el subconjunto latino (español e inglés). Los símbolos que no trae (Σ, ≤, ₂, →) los dibuja la fuente del sistema. Para añadir otro subconjunto, tomar el archivo del mismo paquete y copiar su bloque `@font-face` con su `unicode-range`.
