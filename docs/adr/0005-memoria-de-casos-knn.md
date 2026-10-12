# ADR-0005: Memoria de casos con k vecinos más cercanos (k-NN)

**Estado:** Aceptado · **Registrado:** 2026-10-12 (después de tomada la decisión) · **Decide:** Diego Guevara

> Nota: este ADR documenta una decisión que ya está en el código y en el README. Las alternativas son las que esos textos permiten reconstruir, no un acta de la discusión original.

## Contexto

La idea central de la app es que cada finca evaluada sea un caso, y que la siguiente finca vea «tu finca se parece a estas 3, esto les funcionó». Hoy hay pocos casos (nueve ejemplos ficticios, más los propios y los compartidos en la nube), y el productor necesita entender por qué se le sugiere algo.

## Decisión

- Comparar fincas con **k vecinos más cercanos** sobre un perfil de rasgos en escala 0-1 (cultivo, riego, pendiente, distancia al agua, proporción de nativas, meses de coincidencia y riesgo por módulo), en el navegador (`src/casos/perfil.js`, `src/casos/memoria.js`).
- La distancia total es el promedio ponderado de las distancias de cada rasgo; un dato faltante **no cuenta como parecido**, solo baja la cobertura.
- k y los pesos están en `CONFIG.casos` y son **criterio propio, por calibrar**.
- Los casos de ejemplo llevan `origen: 'ejemplo'` y se muestran como «Ejemplo».
- Cada tarjeta dice en qué se parece («Se parece en…») y con qué porcentaje de los rasgos se comparó, para que se pueda explicar.

## Alternativas

| Alternativa | Por qué no |
| --- | --- |
| Modelo de aprendizaje automático entrenado | Con pocos casos no es confiable ni explicable; el README lo deja para cuando haya decenas de fincas reales |
| Reglas fijas por tipo de finca | No aprovechan los casos nuevos: la memoria no crecería con el uso |
| Comparar solo por cultivo | Pierde el riesgo, el riego y el entorno, que es lo que hace útil la comparación |

## Consecuencias

- **Más fácil:** funciona con pocos datos, se explica rasgo por rasgo, no necesita entrenamiento ni servidor, y mejora sola al sumarse casos.
- **Más difícil:** los pesos son una opinión, no una medición; con casos ficticios o sesgados las «fincas parecidas» también lo serán; la similitud no demuestra que lo que funcionó en una finca funcione en otra (los gráficos de relaciones entre módulos avisan que asociación no es causa).
- **Cambiaría esta decisión si:** hay decenas de fincas reales registradas (el README prevé entonces un modelo entrenado) o si la calibración con datos muestra que los pesos propios dan vecinos poco útiles.
