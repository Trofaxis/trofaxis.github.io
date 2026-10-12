# ADR-0003: Datos en el navegador y nube opcional

**Estado:** Aceptado · **Registrado:** 2026-10-12 (después de tomada la decisión) · **Decide:** Diego Guevara

> Nota: este ADR documenta una decisión que ya está en el código. Las alternativas son las que el código y los documentos permiten reconstruir, no un acta de la discusión original.

## Contexto

La finca tiene datos sensibles (nombre, ubicación, prácticas, no conformidades). La app se publica como sitio estático en GitHub Pages: no hay servidor propio ni nadie que lo administre. La memoria de casos solo se vuelve útil si hay casos de varias fincas.

## Decisión

- **Por defecto, todo queda en el navegador** (`localStorage`, claves `biogap:*`) y se puede exportar o importar como archivo `.json` (`src/core/storage.js`). La app funciona completa sin conexión ni cuenta.
- **La nube es opcional** y solo se activa con sesión por correo (sin contraseñas): copia privada de la finca y casos anónimos compartidos con consentimiento (Supabase, `src/nube/`, detalle en `docs/nube.md`). Con la URL o la clave de `CONFIG.nube` vacías, no corre nada de eso.
- **Las coordenadas (las del mapa y las de la caché del clima) nunca salen del navegador**: ni en el archivo exportado, ni en la nube, ni en la memoria de casos. La finca sí guarda el clima por mes.
- Lo que protege los datos en la nube está en la base (RLS y restricciones CHECK), no solo en la app.

## Alternativas

| Alternativa | Por qué no |
| --- | --- |
| Servidor propio con cuentas obligatorias | Hay que mantenerlo y asegurarlo; el productor entrega sus datos antes de ver utilidad |
| Solo local, sin nube | Seguro y simple, pero la memoria de casos nunca pasaría de los ejemplos y los casos propios de cada navegador |
| Nube obligatoria | Sin conexión (común en finca) la app no serviría |

## Consecuencias

- **Más fácil:** privacidad por defecto; la app funciona sin conexión; no hay servidor que operar.
- **Más difícil:** los datos de un navegador no pasan a otro sin exportar; borrar los datos del navegador borra la finca (por eso existen el respaldo en archivo y el aviso de guardado). Un script malicioso que corriera en la página leería `localStorage`, incluido el token de sesión (mitigado con la política de seguridad de contenido de `index.html`, issue 61).
- **Cambiaría esta decisión si:** la app se ofrece como servicio a exportadores (Supabase y los demás servicios pasan a necesitar plan de pago, ver `docs/licencias.md`), o si hace falta que varias personas editen la misma finca.
