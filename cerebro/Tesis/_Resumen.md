# Lo que dicen las tesis (generado)

> Generado por `node scripts/cerebro.mjs` a partir de las notas de esta carpeta. No editar: edita la nota de cada tesis.
> Solo entra lo verificado: cada frase está en la página que se indica del PDF. Nada de esto cambia un puntaje por sí solo.

**13 tesis · 75 líneas verificadas · 23 pares de variables · 22 variables candidatas**

## Relaciones entre variables

| De → a | Tesis | Medido: sube / baja / sin efecto | Otras (citado o afirmado) | Vínculo de Trofaxis |
|---|---|---|---|---|
| `cultivo.densidad` (candidata) → `cultivo.rendimiento` (candidata) | [[poquiviqui-1998]], [[t215-1990]] | 2 / 0 / 0 | 0 | ninguno (candidato) |
| `riego.lamina` (candidata) → `cultivo.rendimiento` (candidata) | [[chi-bautista-2011]], [[mejia-reyes-2020]] | 0 / 0 / 1 | 1 | ninguno (candidato) |
| [[riego.sistema|Eficiencia de aplicación del sistema de riego]] → `cultivo.rendimiento` (candidata) | [[molina-2009]], [[vargas-cazar-2019]] | 0 / 0 / 2 | 0 | ninguno (candidato) |
| `clima.alteraciones` (candidata) → [[riesgo.poli|Riesgo de Polinizadores]] | [[kuniyoshi]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| `cultivo.bioestimulanteFoliar` (candidata) → `cultivo.rendimiento` (candidata) | [[vargas-cazar-2019]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| `cultivo.biologicoAlRiego` (candidata) → `cultivo.rendimiento` (candidata) | [[castillo-2007]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| `cultivo.biologicoAlRiego` (candidata) → `cultivo.raices` (candidata) | [[castillo-2007]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| `cultivo.densidad` (candidata) → `plagas.porPlanta` (candidata) | [[poquiviqui-1998]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| `cultivo.distanciamiento` (candidata) → `cultivo.rendimiento` (candidata) | [[chi-bautista-2011]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| [[finca.pendiente|Pendiente del terreno]] → [[riesgo.suelo|Riesgo de Suelo]] | [[godoy-garzon-2015]] | 0 / 0 / 0 | 1 | [[suelo-pendiente]] |
| [[plag.meses|Meses con aplicación de plaguicidas]] → [[riesgo.poli|Riesgo de Polinizadores]] | [[kuniyoshi]] | 0 / 0 / 0 | 1 | [[poli-coincidencia]] |
| [[poli.abundanciaRiesgo|Abundancia de la especie de riesgo (volumen de copa)]] → [[poli.floracionRiesgo|Floración de la especie de riesgo]] | [[osorio]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| [[poli.sinOtrasFlores|Meses sin otras flores disponibles]] → [[riesgo.poli|Riesgo de Polinizadores]] | [[kuniyoshi]] | 0 / 0 / 0 | 1 | [[poli-sin-alternativas]] |
| `riego.ciclosUso` (candidata) → `riego.uniformidad` (candidata) | [[vargas-2008]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| `riego.lamina` (candidata) → `finca.rentabilidad` (candidata) | [[chi-bautista-2011]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| `riego.programacion` (candidata) → `riego.volumenAplicado` (candidata) | [[villarreal-2023]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| [[riego.sistema|Eficiencia de aplicación del sistema de riego]] → `riego.volumenAplicado` (candidata) | [[molina-2009]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| [[riego.sistema|Eficiencia de aplicación del sistema de riego]] → `finca.rentabilidad` (candidata) | [[molina-2009]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| `riego.uniformidad` (candidata) → [[fert.fertirriego|Fertirriego]] | [[vargas-2008]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| `spathodea.floresVisibles` (candidata) → `poli.abejasMuertas` (candidata) | [[kuniyoshi]] | 0 / 0 / 1 | 0 | ninguno (candidato) |
| `spathodea.poda` (candidata) → [[poli.floracionRiesgo|Floración de la especie de riesgo]] | [[osorio]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| `spathodea.sombra` (candidata) → `spathodea.establecimiento` (candidata) | [[osorio]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| `sustrato.exceso` (candidata) → `cultivo.enfermedades` (candidata) | [[flores-2002]] | 0 / 0 / 0 | 1 | ninguno (candidato) |

### Detalle

**cultivo.densidad → cultivo.rendimiento**

- + · medido · Más densidad: más bellotas cosechables por planta y menos pudrición — [[poquiviqui-1998]], pág. 6: «A mayor densidad se obtuvo mayor numero de bellotas cosechables por planta y se redujo la pudricion.»
- + · medido · Densidades bajas: menos producción por área, más rendimiento por planta — [[t215-1990]], pág. 31: «predomino la reduccion de produccion en las bajas densidades de siembra, pero por otro lado estas densidades alcanzaron mayores rendimientos por planta»

**riego.lamina → cultivo.rendimiento**

- 0 · medido · Láminas de 50, 80, 100 y 120 % de la ETc: sin diferencia en producción — [[chi-bautista-2011]], pág. 4: «En el ensayo de cuatro láminas de riego no hubo diferencia significativa (P≤0.05) para variables agronómicas ni de producción.»
- ? · citado · Luz, temperatura y riego son los factores principales del forraje hidropónico — [[mejia-reyes-2020]], pág. 4: «los principales factores que afectan el desarrollo óptimo del FVH que son la iluminación, temperatura y riego.»

**riego.sistema → cultivo.rendimiento**

- 0 · medido · Sin diferencias en ninguna variable de producción entre goteo y codo — [[molina-2009]], pág. 4: «En ninguna de las variables analizadas hubo diferencias (P≤0.05) entre los dos métodos.»
- 0 · medido · La inundación no rindió más que el goteo — [[vargas-cazar-2019]], pág. 3: «sin embargo, el rendimiento no fue estadísticamente superior al riego por goteo.»

**clima.alteraciones → riesgo.poli**

- + · citado · Misma frase: alteraciones climáticas (Goulson et al. 2015, de segunda mano) — [[kuniyoshi]], pág. 40: «los parásitos, las enfermedades y las alteraciones climáticas (Goulson et al., 2015)»

**cultivo.bioestimulanteFoliar → cultivo.rendimiento**

- + · medido · Silicio y VIUSID®agro foliares rindieron más que el control — [[vargas-cazar-2019]], pág. 3: «La aplicación de VIUSID®agro (10,022 kg/ha) y silicio (9,725 kg/ha) resultó en mayor rendimiento que el tratamiento control (8,573 kg/ha).»

**cultivo.biologicoAlRiego → cultivo.rendimiento**

- + · medido · Tres y cuatro aplicaciones de Trichoderma por el goteo dieron mazorcas más largas — [[castillo-2007]], pág. 7: «Los tratamientos con tres y cuatro aplicaciones con TRICHOZAM® se obtuvieron mazorcas de mayor longitud»

**cultivo.biologicoAlRiego → cultivo.raices**

- + · medido · Más dosis de Trichoderma, raíces más pesadas — [[castillo-2007]], pág. 7: «Las raíces de maíz dulce aumentaron de peso con mayores dosis de Trichoderma harzianum.»

**cultivo.densidad → plagas.porPlanta**

- − · medido · Con menos densidad hubo más insectos por planta, pero menos por área — [[poquiviqui-1998]], pág. 6: «A menor densidad de siembra la densidad poblacional de insectos por planta fue mayor, pero por unidad de area esta se redujo.»

**cultivo.distanciamiento → cultivo.rendimiento**

- − · medido · Surcos a 1,8 m: 17 % más toneladas de azúcar por hectárea que a 2,4 m — [[chi-bautista-2011]], pág. 4: «el distanciamiento de 1.8 m mostró un aumento de 17% más en toneladas de azúcar por hectárea comparado con el de 2.4 m»

**finca.pendiente → riesgo.suelo**

- + · afirmado · En ladera la erosión y la degradación del suelo se aceleran (premisa del estudio, no medida) — [[godoy-garzon-2015]], pág. 4: «En relieve accidentado, la producción de cultivos en laderas se ve afectada por la erosión y degradación acelerada de los suelos.»

**plag.meses → riesgo.poli**

- + · citado · La mortalidad de abejas se asocia a plaguicidas, falta de flores, parásitos, enfermedades y clima (cita a Goulson et al. 2015); no lo midió (Discusión) — [[kuniyoshi]], pág. 40: «La mortalidad y disminución de las poblaciones de abejas se han relacionado con la acción conjunta de factores como la pérdida de hábitat y recursos florales, la exposición a plaguicidas, los parásitos, las enfermedades y las alteraciones climáticas»

**poli.abundanciaRiesgo → poli.floracionRiesgo**

- + · afirmado · Espera más floración con más volumen de copa; no lo midió — [[osorio]], pág. 27: «a mayor volumen de copa se esperaría mayor floración.»

**poli.sinOtrasFlores → riesgo.poli**

- + · citado · Misma frase: pérdida de recursos florales (Goulson et al. 2015, de segunda mano) — [[kuniyoshi]], pág. 40: «la pérdida de hábitat y recursos florales, la exposición a plaguicidas, los parásitos, las enfermedades y las alteraciones climáticas»

**riego.ciclosUso → riego.uniformidad**

- − · medido · Queen Gil pierde uniformidad desde el primer ciclo; T-Tape aguanta dos ciclos (recomendación de la tesis) — [[vargas-2008]], pág. 4: «Se recomienda que la marca T-Tape modelo 506-15-340 se use en dos ciclos en campo y la marca Queen Gil se descarte al primer ciclo de uso.»

**riego.lamina → finca.rentabilidad**

- − · medido · La lámina de 50 % dio el mayor beneficio neto (solo 211 mm en las primeras 15 semanas) — [[chi-bautista-2011]], pág. 4: «Los beneficios netos más altos y costos variables totales más bajos se obtuvieron con la lámina de 50%»

**riego.programacion → riego.volumenAplicado**

- − · medido · Programar con sensores de humedad aplicó 188,1 m³/ha menos que la programación teórica — [[villarreal-2023]], pág. 35: «siendo la programación de riego real la que obtuvo un menor volumen de agua, en comparación a lo que teóricamente se debió aplicar.»

**riego.sistema → riego.volumenAplicado**

- − · medido · El goteo (regado según ETc) usó 58,2 % menos agua que el riego por codo — [[molina-2009]], pág. 4: «se logró un ahorro de agua del 58.2% en relación al sistema de riego por codo»

**riego.sistema → finca.rentabilidad**

- + · medido · El goteo sube la rentabilidad 4 % sin cobrar el agua y 7 % cobrándola — [[molina-2009]], pág. 4: «sin cobrar el agua, incrementa la rentabilidad en 4% en relación al sistema de riego por codo y si se cobra el agua, la rentabilidad aumenta 7%.»

**riego.uniformidad → fert.fertirriego**

- + · afirmado · La uniformidad del riego influye en cómo se reparte el fertilizante (lo dice el resumen; no lo midió) — [[vargas-2008]], pág. 4: «La uniformidad de la distribución del agua en el riego influye directamente en el crecimiento de las plantas y en el uso de energía y aplicación de fertilizantes.»

**spathodea.floresVisibles → poli.abejasMuertas**

- + n.s. · medido · Flores visibles en copas cercanas frente a abejas muertas: pendiente 0,077, R² = 0,2147, Spearman positiva débil y no significativa (Resultados, Figura 10) — [[kuniyoshi]], pág. 33: «Esta relación no fue estadísticamente significativa (p > .05), por lo que no se pudo afirmar que el aumento de la abundancia floral estuviera asociado de manera consistente con un mayor número de abejas muertas.»

**spathodea.poda → poli.floracionRiesgo**

- − · afirmado · Recomienda podas o control de rebrotes para reducir las flores; no lo midió — [[osorio]], pág. 35: «manejar los árboles mediante podas o control de rebrotes, lo cual ayudaría a reducir significativamente la cantidad de flores durante la época de floración.»

**spathodea.sombra → spathodea.establecimiento**

- − · citado · Las plántulas no prosperan bajo dosel cerrado (cita a Larrue et al. 2014) — [[osorio]], pág. 23: «La especie se reporta como poco tolerante a la sombra, lo que significa que sus plántulas no logran desarrollarse bajo el dosel cerrado de árboles existentes.»

**sustrato.exceso → cultivo.enfermedades**

- + · afirmado · El agua acumulada en el medio favorece hongos y bacterias que reducen el enraizamiento — [[flores-2002]], pág. 7: «Esto favorece el ataque de enfermedades como hongos y bacterias que reducen su enraizamiento.»

## Umbrales y rangos por variable

> Candidatos para los cortes de las rúbricas. No están programados: los cortes siguen siendo criterio propio hasta que un especialista los valide.

**[[finca.pendiente|Pendiente del terreno]]**

- Clases: 0–3 % plana; 3–7 % ligeramente plana; 7–12 % moderadamente inclinada; 12–25 % inclinada; 25–50 % fuertemente inclinada; 50–75 % escarpada; > 75 % fuertemente escarpada (Bronzoni et al. 1994, adaptado; de segunda mano) — [[godoy-garzon-2015]], pág. 23: «Cuadro 5. Clasificación de la pendiente según el porcentaje de inclinación.»
- Barreras vivas cada 15–30 m con pendiente < 15 %, 10–15 m con 15–30 % y 4–10 m con 30–50 % (Raudes y Sagastume 2011, de segunda mano) — [[godoy-garzon-2015]], pág. 22: «Cuadro 4. Determinación de las obras de conservación de suelos según la pendiente y la distancia de separación entre las obras.»

**`riego.calidadCinta` (candidata)**

- Cinta: bueno Qd < 5 % y CVf < 10 %; medio 5–10 y 10–15; marginal 10–15 y 15–20; pobre > 15 y > 20 (Boswell 1990, de segunda mano) — [[vargas-2008]], pág. 22: «Anexo 5. Clasificación de la calidad de cinta.»

**`riego.uniformidad` (candidata)**

- CU mínimo aceptable: 87 % (Álvarez 2008, comunicación personal; de segunda mano) — [[vargas-2008]], pág. 11: «El valor mínimo aceptable para CU es de 87%»
- UD mínimo aceptable: 79 % (Álvarez 2008, comunicación personal; de segunda mano) — [[vargas-2008]], pág. 14: «valor mínimo aceptable de UD (no menor de 79%)»
- CUC de 90 a 100 %: excelente (Merriam y Keller 1978, de segunda mano) — [[villarreal-2023]], pág. 26: «basándose en los rangos establecido por Merriam y Keller (1978) el cual establece que, valores entre el 90% y 100% son considerados excelentes»

## Fórmulas

- **Lámina de riego al 100 %:** Lámina (100 %) = evaporación diaria acumulada por semana × Kc — [[chi-bautista-2011]], pág. 11
- **Volumen de copa:** V = 4/3 · π · (D/2)² · (H/2); D diámetro promedio de copa, H altura de copa (ecuación 3) — [[osorio]], pág. 16
- **Área basal:** AB = π/4 · D²; D = DAP en metros (ecuación 1) — [[osorio]], pág. 15
- **CO₂ almacenado:** CO₂ = C × 44/12 (ecuación 4) — [[osorio]], pág. 17
- **Coeficiente de uniformidad (CU):** CU = (1 − Σ|Xi − X̄| / (X̄ · n)) × 100; Xi caudal de cada gotero, X̄ promedio, n goteros aforados (transcrita de la ecuación 1) — [[vargas-2008]], pág. 11
- **Uniformidad de distribución (UD):** UD = 100 × Lp25% / X̄; Lp25% promedio del 25 % de goteros con menor caudal (ecuación 2) — [[vargas-2008]], pág. 11
- **Uniformidad de emisión (UE):** UE = 100 × (1 − 1,27 · CVf / √n) × qm / qa (ecuación 3) — [[vargas-2008]], pág. 11
- **Evapotranspiración del cultivo:** ETc = Kc × ETo, con Kc de FAO 56 por etapa (ecuación 6) — [[villarreal-2023]], pág. 22
- **Coeficiente de uniformidad de Christiansen (CUC):** CUC = 100 × (1 − Σ|Xi − X̄| / (X̄ · n)); mínimo 16 goteros, se usaron 48 (ecuación 5) — [[villarreal-2023]], pág. 17

## Variables candidatas

> Aparecen en las tesis pero todavía no son variables de Trofaxis.

- `clima.alteraciones` — [[kuniyoshi]]
- `cultivo.bioestimulanteFoliar` — [[vargas-cazar-2019]]
- `cultivo.biologicoAlRiego` — [[castillo-2007]]
- `cultivo.densidad` — [[poquiviqui-1998]], [[t215-1990]]
- `cultivo.distanciamiento` — [[chi-bautista-2011]]
- `cultivo.enfermedades` — [[flores-2002]]
- `cultivo.raices` — [[castillo-2007]]
- `cultivo.rendimiento` — [[castillo-2007]], [[chi-bautista-2011]], [[mejia-reyes-2020]], [[molina-2009]], [[poquiviqui-1998]], [[t215-1990]], [[vargas-cazar-2019]]
- `finca.rentabilidad` — [[chi-bautista-2011]], [[molina-2009]]
- `plagas.porPlanta` — [[poquiviqui-1998]]
- `poli.abejasMuertas` — [[kuniyoshi]]
- `riego.calidadCinta` — [[vargas-2008]]
- `riego.ciclosUso` — [[vargas-2008]]
- `riego.lamina` — [[chi-bautista-2011]], [[mejia-reyes-2020]]
- `riego.programacion` — [[villarreal-2023]]
- `riego.uniformidad` — [[vargas-2008]], [[villarreal-2023]]
- `riego.volumenAplicado` — [[molina-2009]], [[villarreal-2023]]
- `spathodea.establecimiento` — [[osorio]]
- `spathodea.floresVisibles` — [[kuniyoshi]]
- `spathodea.poda` — [[osorio]]
- `spathodea.sombra` — [[osorio]]
- `sustrato.exceso` — [[flores-2002]]

## Alertas

- [[osorio]]: La densidad de la madera tiene tres rangos distintos en la misma tesis (pág. 7, 30 y 34). Trofaxis no usa este dato; si se usa, preguntar a la autora cuál es el correcto.
- [[t215-1990]]: El nombre del autor no se lee en el escaneo: la cita queda incompleta hasta revisar el PDF a mano.
