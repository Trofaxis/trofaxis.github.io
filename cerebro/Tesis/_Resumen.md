# Lo que dicen las tesis (generado)

> Generado por `node scripts/cerebro.mjs` a partir de las notas de esta carpeta. No editar: edita la nota de cada tesis.
> Solo entra lo verificado: cada frase está en la página que se indica del PDF. Nada de esto cambia un puntaje por sí solo.

**23 tesis · 118 líneas verificadas · 33 pares de variables · 33 variables candidatas**

## Relaciones entre variables

| De → a | Tesis | Medido: sube / baja / sin efecto | Otras (citado o afirmado) | Vínculo de Trofaxis |
|---|---|---|---|---|
| Lámina de riego (`riego.lamina`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[benavides-jara-2014]], [[chi-bautista-2011]], [[mejia-reyes-2020]], [[ordonez-ventura-2015]], [[plaza-2004]], [[saltos-2009]] | 2 / 0 / 2 | 2 | ninguno (candidato) |
| Densidad de siembra (`cultivo.densidad`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[benavides-jara-2014]], [[poquiviqui-1998]], [[t215-1990]] | 3 / 0 / 0 | 0 | ninguno (candidato) |
| [[riego.sistema|Eficiencia de aplicación del sistema de riego]] → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[echeverria-2015]], [[molina-2009]], [[vargas-cazar-2019]] | 0 / 0 / 2 | 0 | ninguno (candidato) |
| [[riego.sistema|Eficiencia de aplicación del sistema de riego]] → Volumen de agua aplicado (`riego.volumenAplicado`, candidata) | [[echeverria-2015]], [[molina-2009]] | 0 / 2 / 0 | 0 | ninguno (candidato) |
| Alteraciones del clima (`clima.alteraciones`, candidata) → [[riesgo.poli|Riesgo de Polinizadores]] | [[kuniyoshi]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Silicio o bioestimulante foliar (`cultivo.bioestimulanteFoliar`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[vargas-cazar-2019]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Biológico aplicado por el riego (Trichoderma) (`cultivo.biologicoAlRiego`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[castillo-2007]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Biológico aplicado por el riego (Trichoderma) (`cultivo.biologicoAlRiego`, candidata) → Peso de las raíces (`cultivo.raices`, candidata) | [[castillo-2007]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Densidad de siembra (`cultivo.densidad`, candidata) → Insectos plaga por planta (`plagas.porPlanta`, candidata) | [[poquiviqui-1998]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Distancia entre surcos (`cultivo.distanciamiento`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[chi-bautista-2011]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Frecuencia o fraccionamiento de la fertilización (`fert.frecuencia`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata) | [[alpizar-2000]] | 0 / 0 / 1 | 0 | ninguno (candidato) |
| [[finca.pendiente|Pendiente del terreno]] → [[riesgo.suelo|Riesgo de Suelo]] | [[godoy-garzon-2015]] | 0 / 0 / 0 | 1 | [[suelo-pendiente]] |
| Cobertura de sombra de árboles sobre el cultivo (`finca.sombra`, candidata) → Humedad del suelo (`suelo.humedad`, candidata) | [[cerrato-2022]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| [[plag.meses|Meses con aplicación de plaguicidas]] → [[riesgo.poli|Riesgo de Polinizadores]] | [[kuniyoshi]] | 0 / 0 / 0 | 1 | [[poli-coincidencia]] |
| [[poli.abundanciaRiesgo|Abundancia de la especie de riesgo (volumen de copa)]] → [[poli.floracionRiesgo|Floración de la especie de riesgo]] | [[osorio]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| [[poli.sinOtrasFlores|Meses sin otras flores disponibles]] → [[riesgo.poli|Riesgo de Polinizadores]] | [[kuniyoshi]] | 0 / 0 / 0 | 1 | [[poli-sin-alternativas]] |
| Ciclos de uso de la cinta de goteo (`riego.ciclosUso`, candidata) → Uniformidad del riego (CU, UD o CUC) (`riego.uniformidad`, candidata) | [[vargas-2008]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Agua que drena bajo las raíces (% de lo aplicado) (`riego.drenaje`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata) | [[alpizar-2000]] | 0 / 0 / 0 | 2 | ninguno (candidato) |
| Evapotranspiración del cultivo (ETc) (`riego.etc`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[plaza-2004]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Lámina de riego (`riego.lamina`, candidata) → Humedad del suelo (`suelo.humedad`, candidata) | [[brenes-2004]] | 0 / 0 / 1 | 0 | ninguno (candidato) |
| Lámina de riego (`riego.lamina`, candidata) → Rentabilidad de la finca (`finca.rentabilidad`, candidata) | [[chi-bautista-2011]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Lámina de riego (`riego.lamina`, candidata) → Crecimiento de la planta (altura o largo de raíz) (`cultivo.crecimiento`, candidata) | [[mata-2021]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Programación del riego con sensores de humedad (`riego.programacion`, candidata) → Volumen de agua aplicado (`riego.volumenAplicado`, candidata) | [[villarreal-2023]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| [[riego.sistema|Eficiencia de aplicación del sistema de riego]] → Rentabilidad de la finca (`finca.rentabilidad`, candidata) | [[molina-2009]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Uniformidad del riego (CU, UD o CUC) (`riego.uniformidad`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[ordonez-ventura-2015]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Uniformidad del riego (CU, UD o CUC) (`riego.uniformidad`, candidata) → [[fert.fertirriego|Fertirriego]] | [[vargas-2008]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Flores visibles en copas de Spathodea (`spathodea.floresVisibles`, candidata) → Abejas muertas en las flores (`poli.abejasMuertas`, candidata) | [[kuniyoshi]] | 0 / 0 / 1 | 0 | ninguno (candidato) |
| Poda de Spathodea (`spathodea.poda`, candidata) → [[poli.floracionRiesgo|Floración de la especie de riesgo]] | [[osorio]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Sombra de un dosel cerrado (`spathodea.sombra`, candidata) → Establecimiento de plántulas de Spathodea (`spathodea.establecimiento`, candidata) | [[osorio]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Compactación del suelo (`suelo.compactacion`, candidata) → Absorción de nutrientes por la planta (`cultivo.absorcionNutrientes`, candidata) | [[brenes-2004]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Humedad del suelo (`suelo.humedad`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[brenes-2004]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Uso agrícola intensivo del suelo (monocultivo convencional) (`suelo.usoIntensivo`, candidata) → Capacidad del suelo para retener agua (`suelo.retencionAgua`, candidata) | [[rios-2024]] | 0 / 1 / 1 | 0 | ninguno (candidato) |
| Agua acumulada en el sustrato (`sustrato.exceso`, candidata) → Enfermedades del cultivo (`cultivo.enfermedades`, candidata) | [[flores-2002]] | 0 / 0 / 0 | 1 | ninguno (candidato) |

### Detalle

**Lámina de riego (`riego.lamina`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · medido · Arroz Playitas: inundación intermitente (1 812,5 mm de riego) rindió más que aspersión (928 mm) y secano favorecido (406 mm); todos recibieron además 610,6 mm de lluvia — [[benavides-jara-2014]], pág. 17: «En general los tratamientos con riego por inundación intermitente tuvieron los mejores rendimientos seguidos del riego por aspersión y finalmente secano favorecido.»
- 0 · medido · Láminas de 50, 80, 100 y 120 % de la ETc: sin diferencia en producción — [[chi-bautista-2011]], pág. 4: «En el ensayo de cuatro láminas de riego no hubo diferencia significativa (P≤0.05) para variables agronómicas ni de producción.»
- ? · citado · Luz, temperatura y riego son los factores principales del forraje hidropónico — [[mejia-reyes-2020]], pág. 4: «los principales factores que afectan el desarrollo óptimo del FVH que son la iluminación, temperatura y riego.»
- 0 · medido · Regar al 60 % de la ETc (1,92 m³ por 100 m²) no bajó el rendimiento frente al 100 % (3,19 m³ por 100 m²); cada lámina iba con un lateral distinto — [[ordonez-ventura-2015]], pág. 24: «No se encontraron diferencias significativas (P>0.05) entre los tratamientos. Eolos 60% utilizo un menor volumen de agua»
- 0 · citado · Puerto (2000): láminas de 5 a 11 mm/día no cambiaron la producción de guinea en invernadero — [[plaza-2004]], pág. 10: «Puerto (2000) tampoco encontró diferencia en la producción del guinea aplicando láminas de 5, 7, 9 y 11 mm/día bajo condiciones de invernadero.»
- + · medido · Bajar 15 % la lámina solo bajó el rendimiento en arena (36 100 frente a unos 52 000 kg/ha); con el sustrato con compost no hubo diferencia — [[saltos-2009]], pág. 22: «El tratamiento con lámina reducida y arena presentó el rendimiento más bajo. Los otros tratamientos no mostraron diferencias significativas entre si.»

**Densidad de siembra (`cultivo.densidad`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · medido · 300 lb/ha rindió más en los tres sistemas; la diferencia solo fue significativa en aspersión — [[benavides-jara-2014]], pág. 17: «Se observó que en todos los sistemas de riego se obtuvieron los mejores rendimientos con la densidad de siembra más alta (300 lb/ha) siendo significativa en aspersión»
- + · medido · Más densidad: más bellotas cosechables por planta y menos pudrición — [[poquiviqui-1998]], pág. 6: «A mayor densidad se obtuvo mayor numero de bellotas cosechables por planta y se redujo la pudricion.»
- + · medido · Densidades bajas: menos producción por área, más rendimiento por planta — [[t215-1990]], pág. 31: «predomino la reduccion de produccion en las bajas densidades de siembra, pero por otro lado estas densidades alcanzaron mayores rendimientos por planta»

**[[riego.sistema|Eficiencia de aplicación del sistema de riego]] → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- ? · medido · En arroz rindió más la inundación (12,02 t/ha) que el goteo (7,1) y la aspersión (4,93): el sistema más eficiente no fue el de más rendimiento — [[echeverria-2015]], pág. 15: «Las parcelas a las que se les implementó el sistema de riego por inundación tuvieron un mayor rendimiento con 12.02 t/ha, en comparación con los sistemas de goteo y aspersión con un rendimiento de 7.1 t/ha y 4.93 t/ha, respectivamente»
- 0 · medido · Sin diferencias en ninguna variable de producción entre goteo y codo — [[molina-2009]], pág. 4: «En ninguna de las variables analizadas hubo diferencias (P≤0.05) entre los dos métodos.»
- 0 · medido · La inundación no rindió más que el goteo — [[vargas-cazar-2019]], pág. 3: «sin embargo, el rendimiento no fue estadísticamente superior al riego por goteo.»

**[[riego.sistema|Eficiencia de aplicación del sistema de riego]] → Volumen de agua aplicado (`riego.volumenAplicado`, candidata)**

- − · medido · Goteo usó 9 075 m³/ha: 59 % menos que inundación (22 125) y 31 % menos que aspersión (13 218); un ciclo, sin análisis estadístico del agua — [[echeverria-2015]], pág. 19: «El sistema de goteo fue el que utilizó la menor cantidad de agua durante el ciclo usando un total de 9,075 m³/ha que es un 59% menos de agua utilizada que el sistema de riego por inundación, y un 31% menos que el sistema de riego por aspersión.»
- − · medido · El goteo (regado según ETc) usó 58,2 % menos agua que el riego por codo — [[molina-2009]], pág. 4: «se logró un ahorro de agua del 58.2% en relación al sistema de riego por codo»

**Alteraciones del clima (`clima.alteraciones`, candidata) → [[riesgo.poli|Riesgo de Polinizadores]]**

- + · citado · Misma frase: alteraciones climáticas (Goulson et al. 2015, de segunda mano) — [[kuniyoshi]], pág. 40: «los parásitos, las enfermedades y las alteraciones climáticas (Goulson et al., 2015)»

**Silicio o bioestimulante foliar (`cultivo.bioestimulanteFoliar`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · medido · Silicio y VIUSID®agro foliares rindieron más que el control — [[vargas-cazar-2019]], pág. 3: «La aplicación de VIUSID®agro (10,022 kg/ha) y silicio (9,725 kg/ha) resultó en mayor rendimiento que el tratamiento control (8,573 kg/ha).»

**Biológico aplicado por el riego (Trichoderma) (`cultivo.biologicoAlRiego`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · medido · Tres y cuatro aplicaciones de Trichoderma por el goteo dieron mazorcas más largas — [[castillo-2007]], pág. 7: «Los tratamientos con tres y cuatro aplicaciones con TRICHOZAM® se obtuvieron mazorcas de mayor longitud»

**Biológico aplicado por el riego (Trichoderma) (`cultivo.biologicoAlRiego`, candidata) → Peso de las raíces (`cultivo.raices`, candidata)**

- + · medido · Más dosis de Trichoderma, raíces más pesadas — [[castillo-2007]], pág. 7: «Las raíces de maíz dulce aumentaron de peso con mayores dosis de Trichoderma harzianum.»

**Densidad de siembra (`cultivo.densidad`, candidata) → Insectos plaga por planta (`plagas.porPlanta`, candidata)**

- − · medido · Con menos densidad hubo más insectos por planta, pero menos por área — [[poquiviqui-1998]], pág. 6: «A menor densidad de siembra la densidad poblacional de insectos por planta fue mayor, pero por unidad de area esta se redujo.»

**Distancia entre surcos (`cultivo.distanciamiento`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- − · medido · Surcos a 1,8 m: 17 % más toneladas de azúcar por hectárea que a 2,4 m — [[chi-bautista-2011]], pág. 4: «el distanciamiento de 1.8 m mostró un aumento de 17% más en toneladas de azúcar por hectárea comparado con el de 2.4 m»

**Frecuencia o fraccionamiento de la fertilización (`fert.frecuencia`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- 0 · medido · Fraccionar urea y KCl (semanal o quincenal por fertirriego, cada 28 días o trimestral a mano) no cambió la concentración de nitrato y potasio en el lixiviado — [[alpizar-2000]], pág. 8: «Los resultados del estudio con los lisímetros de drenaje mostraron que la concentración en los lixiviados no es diferente significativamente (P<0.05) cuando la fertilización se fracciona.»

**[[finca.pendiente|Pendiente del terreno]] → [[riesgo.suelo|Riesgo de Suelo]]**

- + · afirmado · En ladera la erosión y la degradación del suelo se aceleran (premisa del estudio, no medida) — [[godoy-garzon-2015]], pág. 4: «En relieve accidentado, la producción de cultivos en laderas se ve afectada por la erosión y degradación acelerada de los suelos.»

**Cobertura de sombra de árboles sobre el cultivo (`finca.sombra`, candidata) → Humedad del suelo (`suelo.humedad`, candidata)**

- + · medido · Sombra mixta al 65 % mantuvo más humedad (56 %) que Inga, mixta al 45 % y plátano (p<0,05), de enero a mayo de 2022 — [[cerrato-2022]], pág. 9: «se encontraron diferencias significativas (p<0.05) en la humedad del suelo, específicamente de la sombra mixta al 65% con respecto a los demás tratamientos»

**[[plag.meses|Meses con aplicación de plaguicidas]] → [[riesgo.poli|Riesgo de Polinizadores]]**

- + · citado · La mortalidad de abejas se asocia a plaguicidas, falta de flores, parásitos, enfermedades y clima (cita a Goulson et al. 2015); no lo midió (Discusión) — [[kuniyoshi]], pág. 40: «La mortalidad y disminución de las poblaciones de abejas se han relacionado con la acción conjunta de factores como la pérdida de hábitat y recursos florales, la exposición a plaguicidas, los parásitos, las enfermedades y las alteraciones climáticas»

**[[poli.abundanciaRiesgo|Abundancia de la especie de riesgo (volumen de copa)]] → [[poli.floracionRiesgo|Floración de la especie de riesgo]]**

- + · afirmado · Espera más floración con más volumen de copa; no lo midió — [[osorio]], pág. 27: «a mayor volumen de copa se esperaría mayor floración.»

**[[poli.sinOtrasFlores|Meses sin otras flores disponibles]] → [[riesgo.poli|Riesgo de Polinizadores]]**

- + · citado · Misma frase: pérdida de recursos florales (Goulson et al. 2015, de segunda mano) — [[kuniyoshi]], pág. 40: «la pérdida de hábitat y recursos florales, la exposición a plaguicidas, los parásitos, las enfermedades y las alteraciones climáticas»

**Ciclos de uso de la cinta de goteo (`riego.ciclosUso`, candidata) → Uniformidad del riego (CU, UD o CUC) (`riego.uniformidad`, candidata)**

- − · medido · Queen Gil pierde uniformidad desde el primer ciclo; T-Tape aguanta dos ciclos (recomendación de la tesis) — [[vargas-2008]], pág. 4: «Se recomienda que la marca T-Tape modelo 506-15-340 se use en dos ciclos en campo y la marca Queen Gil se descarte al primer ciclo de uso.»

**Agua que drena bajo las raíces (% de lo aplicado) (`riego.drenaje`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- + · afirmado · El agua que atraviesa el perfil es lo que más arrastra nitrato y potasio (lo dice el resumen; no lo midió por separado) — [[alpizar-2000]], pág. 8: «El movimiento del agua a través del perfil del suelo es el factor que causa mayor lixiviación»
- + · citado · El regadío facilita que el nitrato llegue al agua subterránea por percolación (Aragón 1997, de segunda mano) — [[alpizar-2000]], pág. 33: «el regadío puede facilitar la contaminación de las aguas por nitrato debido a percolación hacia capas más profundas»

**Evapotranspiración del cultivo (ETc) (`riego.etc`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · medido · Correlación positiva baja (0,338; P<0,05) entre materia seca y ETc en cuatro pastos — [[plaza-2004]], pág. 7: «Se encontró una correlación positiva de 0.338 (P<0.05) entre la producción de MS y la ETc.»

**Lámina de riego (`riego.lamina`, candidata) → Humedad del suelo (`suelo.humedad`, candidata)**

- 0 · medido · La lámina teórica aplicada no se reflejó en la humedad del suelo medida — [[brenes-2004]], pág. 31: «La lámina en teoría aplicada no se relaciona con la humedad del suelo.»

**Lámina de riego (`riego.lamina`, candidata) → Rentabilidad de la finca (`finca.rentabilidad`, candidata)**

- − · medido · La lámina de 50 % dio el mayor beneficio neto (solo 211 mm en las primeras 15 semanas) — [[chi-bautista-2011]], pág. 4: «Los beneficios netos más altos y costos variables totales más bajos se obtuvieron con la lámina de 50%»

**Lámina de riego (`riego.lamina`, candidata) → Crecimiento de la planta (altura o largo de raíz) (`cultivo.crecimiento`, candidata)**

- + · medido · En suelo franco-arenoso, 352 mm dio 83,6 cm de altura frente a 56,8 cm con 288 mm (P<0,05) — [[mata-2021]], pág. 9: «En suelo franco-arenoso la lámina de 352 mm favoreció al cultivo con altura de planta de 83.6 cm vs 56.8 cm con 288 mm»

**Programación del riego con sensores de humedad (`riego.programacion`, candidata) → Volumen de agua aplicado (`riego.volumenAplicado`, candidata)**

- − · medido · Programar con sensores de humedad aplicó 188,1 m³/ha menos que la programación teórica — [[villarreal-2023]], pág. 35: «siendo la programación de riego real la que obtuvo un menor volumen de agua, en comparación a lo que teóricamente se debió aplicar.»

**[[riego.sistema|Eficiencia de aplicación del sistema de riego]] → Rentabilidad de la finca (`finca.rentabilidad`, candidata)**

- + · medido · El goteo sube la rentabilidad 4 % sin cobrar el agua y 7 % cobrándola — [[molina-2009]], pág. 4: «sin cobrar el agua, incrementa la rentabilidad en 4% en relación al sistema de riego por codo y si se cobra el agua, la rentabilidad aumenta 7%.»

**Uniformidad del riego (CU, UD o CUC) (`riego.uniformidad`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · afirmado · En goteo a baja presión, uniformidad baja y caudal variable afectan el rendimiento (lo dice el resumen; no lo midió) — [[ordonez-ventura-2015]], pág. 4: «Los sistemas de riego por goteo de baja presión tienden a presentar coeficientes de uniformidad bajos y variaciones en el caudal que afectan el rendimiento de los cultivos.»

**Uniformidad del riego (CU, UD o CUC) (`riego.uniformidad`, candidata) → [[fert.fertirriego|Fertirriego]]**

- + · afirmado · La uniformidad del riego influye en cómo se reparte el fertilizante (lo dice el resumen; no lo midió) — [[vargas-2008]], pág. 4: «La uniformidad de la distribución del agua en el riego influye directamente en el crecimiento de las plantas y en el uso de energía y aplicación de fertilizantes.»

**Flores visibles en copas de Spathodea (`spathodea.floresVisibles`, candidata) → Abejas muertas en las flores (`poli.abejasMuertas`, candidata)**

- + n.s. · medido · Flores visibles en copas cercanas frente a abejas muertas: pendiente 0,077, R² = 0,2147, Spearman positiva débil y no significativa (Resultados, Figura 10) — [[kuniyoshi]], pág. 33: «Esta relación no fue estadísticamente significativa (p > .05), por lo que no se pudo afirmar que el aumento de la abundancia floral estuviera asociado de manera consistente con un mayor número de abejas muertas.»

**Poda de Spathodea (`spathodea.poda`, candidata) → [[poli.floracionRiesgo|Floración de la especie de riesgo]]**

- − · afirmado · Recomienda podas o control de rebrotes para reducir las flores; no lo midió — [[osorio]], pág. 35: «manejar los árboles mediante podas o control de rebrotes, lo cual ayudaría a reducir significativamente la cantidad de flores durante la época de floración.»

**Sombra de un dosel cerrado (`spathodea.sombra`, candidata) → Establecimiento de plántulas de Spathodea (`spathodea.establecimiento`, candidata)**

- − · citado · Las plántulas no prosperan bajo dosel cerrado (cita a Larrue et al. 2014) — [[osorio]], pág. 23: «La especie se reporta como poco tolerante a la sombra, lo que significa que sus plántulas no logran desarrollarse bajo el dosel cerrado de árboles existentes.»

**Compactación del suelo (`suelo.compactacion`, candidata) → Absorción de nutrientes por la planta (`cultivo.absorcionNutrientes`, candidata)**

- − · afirmado · Los lotes con goteo (arcillosos y compactados) absorbieron peor los nutrientes que los de gravedad y aspersión (textura media a gruesa, sin compactación); es una comparación entre lotes — [[brenes-2004]], pág. 31: «los suelos de riego por gravedad y aspersión de texturas media a gruesas y sin compactación, le proporcionan a la planta una mejor absorción de los nutrimentos en comparación con los suelos arcillosos y compactados del riego con goteo»

**Humedad del suelo (`suelo.humedad`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · medido · Donde el suelo tuvo más humedad (aspersión) hubo mejores promedios en todas las variables; sistema, suelo y manejo van mezclados (ver alertas) — [[brenes-2004]], pág. 31: «La humedad del suelo influye directamente en la disponibilidad de nutrientes, en los tratamientos donde la humedad en el suelo fue mayor obtuvieron mejores promedios en todas las variables medidas.»

**Uso agrícola intensivo del suelo (monocultivo convencional) (`suelo.usoIntensivo`, candidata) → Capacidad del suelo para retener agua (`suelo.retencionAgua`, candidata)**

- − · medido · A saturación (0 kPa) y de 0 a 20 cm, los lotes de agricultura convencional retuvieron menos agua que bosque y agricultura orgánica — [[rios-2024]], pág. 27: «Los sitios bajo agricultura convencional presentaron una menor retención de humedad en comparación con los suelos menos intervenidos»
- 0 · medido · A 33 y 50 kPa el manejo no cambió la retención en ninguna de las dos profundidades — [[rios-2024]], pág. 27: «El manejo del suelo no mostró efectos significativos en la capacidad de retención de agua a tensiones de 33 y 50 kPa en ambas profundidades estudiadas»

**Agua acumulada en el sustrato (`sustrato.exceso`, candidata) → Enfermedades del cultivo (`cultivo.enfermedades`, candidata)**

- + · afirmado · El agua acumulada en el medio favorece hongos y bacterias que reducen el enraizamiento — [[flores-2002]], pág. 7: «Esto favorece el ataque de enfermedades como hongos y bacterias que reducen su enraizamiento.»

## Umbrales y rangos por variable

> Candidatos para los cortes de las rúbricas. No están programados: los cortes siguen siendo criterio propio hasta que un especialista los valide.

**[[fert.fertirriego|Fertirriego]]**

- Inyectar el fertilizante después del 20–25 % del volumen de riego y terminar al 80–90 % (Sagardoy 1992, de segunda mano) — [[alpizar-2000]], pág. 33: «El fertilizante no debe ser puesto en el agua desde el comienzo del riego, sino después de haber aplicado el 20-25% del volumen de agua»

**[[finca.pendiente|Pendiente del terreno]]**

- Clases: 0–3 % plana o casi plana; 3–7 % ligeramente plana; 7–12 % moderadamente inclinada; 12–25 % inclinada; 25–50 % fuertemente inclinada; 50–75 % escarpada; > 75 % fuertemente escarpada (Bronzoni et al. 1994, adaptado; de segunda mano) — [[godoy-garzon-2015]], pág. 23: «Cuadro 5. Clasificación de la pendiente según el porcentaje de inclinación.»
- Barreras vivas cada 15–30 m con pendiente < 15 %, 10–15 m con 15–30 % y 4–10 m con 30–50 % (Raudes y Sagastume 2011, de segunda mano) — [[godoy-garzon-2015]], pág. 22: «Cuadro 4. Determinación de las obras de conservación de suelos según la pendiente y la distancia de separación entre las obras.»

**Calidad de fabricación de la cinta (Qd y CVf) (`riego.calidadCinta`, candidata)**

- Cinta: bueno Qd < 5 % y CVf < 10 %; medio 5–10 y 10–15; marginal 10–15 y 15–20; pobre > 15 y > 20 (Boswell 1990, de segunda mano) — [[vargas-2008]], pág. 22: «Anexo 5. Clasificación de la calidad de cinta.»

**Agua que drena bajo las raíces (% de lo aplicado) (`riego.drenaje`, candidata)**

- Drenaje del sustrato: 20–30 % de lo aplicado con mezclas con compost; en arena no más de 8–10 % (Resh 1997, de segunda mano) — [[saltos-2009]], pág. 9: «En medios muy finos como los que llevan mezclas de compost, debe existir un drenaje de 20 a 30%, para arenas el agua de drenaje no debe superar el 8 a 10% del total aplicado»

**Lámina de riego (`riego.lamina`, candidata)**

- Frijol Amadeus-77 en macrotúnel, hasta 67 días: 320 mm por ciclo en suelos franco y franco-arcilloso — [[mata-2021]], pág. 35: «El desarrollo en general del cultivo de frijol var. Amadeus-77, fue mejor en suelos con texturas francas y franco-arcillosas, bajo el régimen de riego con lámina de 320 mm por ciclo de cultivo.»
- Mismo ensayo: 352 mm por ciclo en suelo franco-arenoso; 288 mm limitó el desarrollo en todas las texturas — [[mata-2021]], pág. 35: «En suelos con textura franco-arenosa es requerida una lámina de 352 mm por ciclo de cultivo»
- Referencia de riego para pastos en la EAP: 4–5 mm por día (práctica de la escuela, según la tesis) — [[plaza-2004]], pág. 10: «en la EAP se utiliza como referencia de riego en los pastos un requerimiento diario de 4 – 5 mm»

**Programación del riego con sensores de humedad (`riego.programacion`, candidata)**

- Regar cuando el tensiómetro pasa de 32 centibares (criterio del ensayo, suelo franco arenoso con pastos) — [[plaza-2004]], pág. 12: «El riego se hizo cada vez que la lectura de los tensiómetros excedía 32 centibares.»

**Uniformidad del riego (CU, UD o CUC) (`riego.uniformidad`, candidata)**

- CU mayor a 88 % (Tarjuelo 1990, de segunda mano) — [[ordonez-ventura-2015]], pág. 16: «Tarjuelo (1990) recomienda coeficiente de uniformidad mayores a 88%.»
- CU mínimo aceptable: 87 % (Álvarez 2008, comunicación personal; de segunda mano) — [[vargas-2008]], pág. 11: «El valor mínimo aceptable para CU es de 87%»
- UD mínimo aceptable: 79 % (Álvarez 2008, comunicación personal; de segunda mano) — [[vargas-2008]], pág. 14: «valor mínimo aceptable de UD (no menor de 79%)»
- CUC de 90 a 100 %: excelente (Merriam y Keller 1978, de segunda mano) — [[villarreal-2023]], pág. 26: «basándose en los rangos establecido por Merriam y Keller (1978) el cual establece que, valores entre el 90% y 100% son considerados excelentes»

**Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- En banano, el nutriente que baja de 40 cm se considera perdido (afirmado en el resumen) — [[alpizar-2000]], pág. 8: «Los nutrientes concentrados a profundidades mayores de 40 cm no son aprovechados por las raíces del banano»

## Fórmulas

- **Eficiencia en uso del agua:** m³ de agua total (riego + lluvia) por kg de grano al 13 % de humedad (ver alertas) — [[benavides-jara-2014]], pág. 12
- **Lámina de riego al 100 %:** Lámina (100 %) = evaporación diaria acumulada por semana × Kc — [[chi-bautista-2011]], pág. 11
- **Volumen de copa:** V = 4/3 · π · (D/2)² · (H/2); D diámetro promedio de copa, H altura de copa (ecuación 3) — [[osorio]], pág. 16
- **Área basal:** AB = π/4 · D²; D = DAP en metros (ecuación 1) — [[osorio]], pág. 15
- **CO₂ almacenado:** CO₂ = C × 44/12 (ecuación 4) — [[osorio]], pág. 17
- **Balance hídrico del lisímetro:** ETc = P + R − D (lluvia + riego − drenaje); el cambio de humedad se toma como cero porque se regaba al pasar de 32 cbar — [[plaza-2004]], pág. 12
- **Coeficiente de cultivo:** Kc = ETc / ETo, con ETo de Penman (Doorenbos y Pruitt 1977) — [[plaza-2004]], pág. 12
- **Coeficiente de uniformidad (CU):** CU = (1 − Σ|Xi − X̄| / (X̄ · n)) × 100; Xi caudal de cada gotero, X̄ promedio, n goteros aforados (transcrita de la ecuación 1) — [[vargas-2008]], pág. 11
- **Uniformidad de distribución (UD):** UD = 100 × Lp25% / X̄; Lp25% promedio del 25 % de goteros con menor caudal (ecuación 2) — [[vargas-2008]], pág. 11
- **Uniformidad de emisión (UE):** UE = 100 × (1 − 1,27 · CVf / √n) × qm / qa (ecuación 3) — [[vargas-2008]], pág. 11
- **Evapotranspiración del cultivo:** ETc = Kc × ETo, con Kc de FAO 56 por etapa (ecuación 6) — [[villarreal-2023]], pág. 22
- **Coeficiente de uniformidad de Christiansen (CUC):** CUC = 100 × (1 − Σ|Xi − X̄| / (X̄ · n)); mínimo 16 goteros, se usaron 48 (ecuación 5) — [[villarreal-2023]], pág. 17

## Variables candidatas

> Aparecen en las tesis pero todavía no son variables de Trofaxis.

- **Alteraciones del clima** (`clima.alteraciones`) — [[kuniyoshi]]
- **Absorción de nutrientes por la planta** (`cultivo.absorcionNutrientes`) — [[brenes-2004]]
- **Silicio o bioestimulante foliar** (`cultivo.bioestimulanteFoliar`) — [[vargas-cazar-2019]]
- **Biológico aplicado por el riego (Trichoderma)** (`cultivo.biologicoAlRiego`) — [[castillo-2007]]
- **Crecimiento de la planta (altura o largo de raíz)** (`cultivo.crecimiento`) — [[mata-2021]]
- **Densidad de siembra** (`cultivo.densidad`) — [[benavides-jara-2014]], [[poquiviqui-1998]], [[t215-1990]]
- **Distancia entre surcos** (`cultivo.distanciamiento`) — [[chi-bautista-2011]]
- **Enfermedades del cultivo** (`cultivo.enfermedades`) — [[flores-2002]]
- **Peso de las raíces** (`cultivo.raices`) — [[castillo-2007]]
- **Rendimiento del cultivo** (`cultivo.rendimiento`) — [[benavides-jara-2014]], [[brenes-2004]], [[castillo-2007]], [[chi-bautista-2011]], [[echeverria-2015]], [[mejia-reyes-2020]], [[molina-2009]], [[ordonez-ventura-2015]], [[plaza-2004]], [[poquiviqui-1998]], [[saltos-2009]], [[t215-1990]], [[vargas-cazar-2019]]
- **Frecuencia o fraccionamiento de la fertilización** (`fert.frecuencia`) — [[alpizar-2000]]
- **Rentabilidad de la finca** (`finca.rentabilidad`) — [[chi-bautista-2011]], [[molina-2009]]
- **Cobertura de sombra de árboles sobre el cultivo** (`finca.sombra`) — [[cerrato-2022]]
- **Insectos plaga por planta** (`plagas.porPlanta`) — [[poquiviqui-1998]]
- **Abejas muertas en las flores** (`poli.abejasMuertas`) — [[kuniyoshi]]
- **Calidad de fabricación de la cinta (Qd y CVf)** (`riego.calidadCinta`) — [[vargas-2008]]
- **Ciclos de uso de la cinta de goteo** (`riego.ciclosUso`) — [[vargas-2008]]
- **Agua que drena bajo las raíces (% de lo aplicado)** (`riego.drenaje`) — [[alpizar-2000]], [[saltos-2009]]
- **Evapotranspiración del cultivo (ETc)** (`riego.etc`) — [[plaza-2004]]
- **Lámina de riego** (`riego.lamina`) — [[benavides-jara-2014]], [[brenes-2004]], [[chi-bautista-2011]], [[mata-2021]], [[mejia-reyes-2020]], [[ordonez-ventura-2015]], [[plaza-2004]], [[saltos-2009]]
- **Programación del riego con sensores de humedad** (`riego.programacion`) — [[plaza-2004]], [[villarreal-2023]]
- **Uniformidad del riego (CU, UD o CUC)** (`riego.uniformidad`) — [[ordonez-ventura-2015]], [[vargas-2008]], [[villarreal-2023]]
- **Volumen de agua aplicado** (`riego.volumenAplicado`) — [[echeverria-2015]], [[molina-2009]], [[villarreal-2023]]
- **Establecimiento de plántulas de Spathodea** (`spathodea.establecimiento`) — [[osorio]]
- **Flores visibles en copas de Spathodea** (`spathodea.floresVisibles`) — [[kuniyoshi]]
- **Poda de Spathodea** (`spathodea.poda`) — [[osorio]]
- **Sombra de un dosel cerrado** (`spathodea.sombra`) — [[osorio]]
- **Compactación del suelo** (`suelo.compactacion`) — [[brenes-2004]]
- **Humedad del suelo** (`suelo.humedad`) — [[brenes-2004]], [[cerrato-2022]]
- **Nitrato y potasio lixiviados bajo la zona de raíces** (`suelo.nutrientesLixiviados`) — [[alpizar-2000]]
- **Capacidad del suelo para retener agua** (`suelo.retencionAgua`) — [[rios-2024]]
- **Uso agrícola intensivo del suelo (monocultivo convencional)** (`suelo.usoIntensivo`) — [[rios-2024]]
- **Agua acumulada en el sustrato** (`sustrato.exceso`) — [[flores-2002]]

## Alertas

- [[alpizar-2000]]: Los lisímetros de succión no sacaron solución del suelo: todo sale de los de drenaje, con dos réplicas por tratamiento. La tesis dice que el muestreo de lixiviados no se hizo bien y que hubo efecto residual de aplicaciones anteriores (pág. 51).
- [[alpizar-2000]]: En los lisímetros se regó a mano con regadera, no con el microaspersor de la finca (pág. 40).
- [[benavides-jara-2014]]: La fórmula dice rendimiento ÷ agua, pero las unidades (m³/kg) son agua ÷ rendimiento (pág. 12).
- [[benavides-jara-2014]]: El sistema de riego y la cantidad de agua van juntos: la relación es de lámina total, no de un sistema aislado.
- [[benavides-jara-2014]]: El resumen nombra una densidad de 200 lb/ha que no se probó (las densidades fueron 220, 260 y 300 lb/ha).
- [[brenes-2004]]: Cada sistema de riego estaba en un lote distinto con su propio suelo. La tesis dice que no se puede atribuir el resultado al sistema de riego, porque también influye el manejo (pág. 31).
- [[brenes-2004]]: El goteo trabajó con lámina deficitaria y con problemas de manejo (pág. 7 y 31).
- [[cerrato-2022]]: El resumen da 56,05 % de humedad y las conclusiones 56,01 % (pág. 9 y 33).
- [[cerrato-2022]]: No dice si la diferencia de productividad entre sombras es significativa. Una finca y una temporada.
- [[echeverria-2015]]: Las cifras en L/kg del Cuadro 2 no salen de dividir agua entre rendimiento: 22 125 m³/ha ÷ 12 000 kg/ha ≈ 1,84 m³/kg (cálculo propio). No usarlas sin revisar el PDF.
- [[echeverria-2015]]: El texto dice que goteo y aspersión no difieren en rendimiento (pág. 15), pero la Figura 6 les pone letras distintas (b y c).
- [[echeverria-2015]]: El resumen en inglés dice 34,1 % menos agua que aspersión; el texto dice 31 % (13 218 → 9 075 m³/ha da 31 %, cálculo propio).
- [[echeverria-2015]]: La conclusión de que Playitas en surcos dio más rendimiento choca con el Cuadro 1, donde variedad y método no son significativos (pág. 15 y 20).
- [[mata-2021]]: No se formaron vainas, probablemente por el calor dentro del macrotúnel en floración (pág. 36): no hay dato de rendimiento.
- [[mata-2021]]: El resumen da el largo de raíz con 288 mm como «111.2 m»; por el contexto la unidad debe ser cm.
- [[ordonez-ventura-2015]]: La lámina (60, 80 y 100 % de la ETc) y la marca del lateral van juntas: no se puede separar el efecto de una y otra. Presión de 2,1 a 3,4 PSI.
- [[osorio]]: La densidad de la madera tiene tres rangos distintos en la misma tesis (pág. 7, 30 y 34). Trofaxis no usa este dato; si se usa, preguntar a la autora cuál es el correcto.
- [[plaza-2004]]: Ensayo corto: tres cortes de 21 días, de mayo a julio de 2004 (pág. 12).
- [[rios-2024]]: Estudio cuasiexperimental: un lote por uso del suelo. La tesis recomienda repetirlo con muestras sin disturbar (pág. 28).
- [[saltos-2009]]: El resumen intercambia L1 y L2 (dice que L2 es la lámina actual). En Materiales y métodos L1 es la testigo y L2 la reducida (pág. 13), que es lo que coincide con las conclusiones.
- [[saltos-2009]]: Resumen y conclusiones se contradicen sobre en qué sustrato el drenaje fue excesivo (pág. 4 y 22): el drenaje medido no se usa como relación.
- [[t215-1990]]: El nombre del autor no se lee en el escaneo: la cita queda incompleta hasta revisar el PDF a mano.
