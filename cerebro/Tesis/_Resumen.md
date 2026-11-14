# Lo que dicen las tesis (generado)

> Generado por `node scripts/cerebro.mjs` a partir de las notas de esta carpeta. No editar: edita la nota de cada tesis.
> Solo entra lo verificado: cada frase está en la página que se indica del PDF. Nada de esto cambia un puntaje por sí solo.

**40 tesis · 215 líneas verificadas · 79 pares de variables · 59 variables candidatas**

## Relaciones entre variables

| De → a | Tesis | Medido: sube / baja / sin efecto | Otras (citado o afirmado) | Vínculo de Trofaxis |
|---|---|---|---|---|
| Lámina de riego (`riego.lamina`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[benavides-jara-2014]], [[chi-bautista-2011]], [[mejia-reyes-2020]], [[ordonez-ventura-2015]], [[plaza-2004]], [[saltos-2009]] | 2 / 0 / 2 | 2 | ninguno (candidato) |
| Densidad de siembra (`cultivo.densidad`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[benavides-jara-2014]], [[poquiviqui-1998]], [[t215-1990]] | 3 / 0 / 0 | 0 | ninguno (candidato) |
| Dosis de nitrógeno aplicada (`fert.dosisN`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata) | [[sigunga-1997]], [[trinh-2007]], [[zhu-2024]] | 2 / 0 / 0 | 2 | ninguno (candidato) |
| [[riego.sistema|Eficiencia de aplicación del sistema de riego]] → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[echeverria-2015]], [[molina-2009]], [[vargas-cazar-2019]] | 0 / 0 / 2 | 0 | ninguno (candidato) |
| Fertilizante incorporado, inyectado o colocado en banda (frente a dejarlo al voleo en la superficie) (`fert.incorporacion`, candidata) → Amoníaco (NH3) que se volatiliza del fertilizante o del estiércol (`aire.amoniaco`, candidata) | [[huijsmans-2003]], [[sigunga-1997]] | 0 / 3 / 0 | 0 | ninguno (candidato) |
| Fertilizante incorporado, inyectado o colocado en banda (frente a dejarlo al voleo en la superficie) (`fert.incorporacion`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[schroder-1998]], [[van-der-eijk-1997]] | 0 / 0 / 1 | 1 | ninguno (candidato) |
| [[fert.meses|Meses en que se fertiliza]] → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata) | [[schroder-1998]], [[sigunga-1997]] | 2 / 0 / 0 | 0 | ninguno (candidato) |
| [[riego.sistema|Eficiencia de aplicación del sistema de riego]] → Volumen de agua aplicado (`riego.volumenAplicado`, candidata) | [[echeverria-2015]], [[molina-2009]] | 0 / 2 / 0 | 0 | ninguno (candidato) |
| Humedad del suelo (`suelo.humedad`, candidata) → Desnitrificación (nitrato que el suelo convierte en gas) (`suelo.desnitrificacion`, candidata) | [[anderson-2013]], [[sigunga-1997]] | 2 / 0 / 0 | 0 | ninguno (candidato) |
| Alteraciones del clima (`clima.alteraciones`, candidata) → [[riesgo.poli|Riesgo de Polinizadores]] | [[kuniyoshi]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Lluvia acumulada en el período (mm) (`clima.lluvia`, candidata) → Nitrógeno mineral del suelo (nitrato y amonio, por análisis) (`suelo.nitrogenoMineral`, candidata) | [[schroder-1998]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| [[clima.mesesLluvia|Meses de lluvia fuerte]] → Óxido nitroso (N2O) que emite el suelo (`aire.oxidoNitroso`, candidata) | [[molodovskaya-2010]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| [[clima.mesesLluvia|Meses de lluvia fuerte]] → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata) | [[trinh-2007]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| [[clima.mesesLluvia|Meses de lluvia fuerte]] → Suelo perdido por erosión (`suelo.erosion`, candidata) | [[trinh-2007]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| [[clima.mesesLluvia|Meses de lluvia fuerte]] → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata) | [[uwimana-2019]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Silicio o bioestimulante foliar (`cultivo.bioestimulanteFoliar`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[vargas-cazar-2019]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Biológico aplicado por el riego (Trichoderma) (`cultivo.biologicoAlRiego`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[castillo-2007]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Biológico aplicado por el riego (Trichoderma) (`cultivo.biologicoAlRiego`, candidata) → Peso de las raíces (`cultivo.raices`, candidata) | [[castillo-2007]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Densidad de siembra (`cultivo.densidad`, candidata) → Insectos plaga por planta (`plagas.porPlanta`, candidata) | [[poquiviqui-1998]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Distancia entre surcos (`cultivo.distanciamiento`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[chi-bautista-2011]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → Amoníaco (NH3) que se volatiliza del fertilizante o del estiércol (`aire.amoniaco`, candidata) | [[huijsmans-2003]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → Óxido nitroso (N2O) que emite el suelo (`aire.oxidoNitroso`, candidata) | [[molodovskaya-2010]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → Fósforo disponible en el suelo (análisis de suelo) (`suelo.fosforo`, candidata) | [[pacenka-2012]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata) | [[xiao-2016]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata) | [[xiao-2016]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → pH del suelo (`suelo.pH`, candidata) | [[zhu-2024]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Dosis de potasio aplicada (KCl) (`fert.dosisK`, candidata) → Zinc que se desorbe y se lava del suelo (`suelo.zincLixiviado`, candidata) | [[fallas-2022]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Dosis de nitrógeno aplicada (`fert.dosisN`, candidata) → Nitrógeno mineral del suelo (nitrato y amonio, por análisis) (`suelo.nitrogenoMineral`, candidata) | [[schroder-1998]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Dosis de nitrógeno aplicada (`fert.dosisN`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[schroder-1998]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Dosis de nitrógeno aplicada (`fert.dosisN`, candidata) → pH del suelo (`suelo.pH`, candidata) | [[zhu-2024]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Dosis de fósforo aplicada (`fert.dosisP`, candidata) → Boro retenido (adsorbido) por el suelo (`suelo.boroAdsorbido`, candidata) | [[fallas-2022]] | 0 / 0 / 1 | 0 | ninguno (candidato) |
| Dosis de fósforo aplicada (`fert.dosisP`, candidata) → Fósforo que se lava del suelo hacia el agua (`suelo.fosforoLixiviado`, candidata) | [[schoumans-2015]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Dosis de fósforo aplicada (`fert.dosisP`, candidata) → Nitrógeno fijado por las leguminosas (`cultivo.fijacionN`, candidata) | [[vanek-2011]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Frecuencia o fraccionamiento de la fertilización (`fert.frecuencia`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata) | [[alpizar-2000]] | 0 / 0 / 1 | 0 | ninguno (candidato) |
| Frecuencia o fraccionamiento de la fertilización (`fert.frecuencia`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[schroder-1998]] | 0 / 0 / 1 | 0 | ninguno (candidato) |
| Fertilizante incorporado, inyectado o colocado en banda (frente a dejarlo al voleo en la superficie) (`fert.incorporacion`, candidata) → Absorción de nutrientes por la planta (`cultivo.absorcionNutrientes`, candidata) | [[schroder-1998]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| [[fert.meses|Meses en que se fertiliza]] → Óxido nitroso (N2O) que emite el suelo (`aire.oxidoNitroso`, candidata) | [[molodovskaya-2010]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| [[fert.meses|Meses en que se fertiliza]] → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata) | [[uwimana-2019]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| [[finca.distAgua|Distancia al cuerpo de agua]] → Fósforo soluble en el agua subterránea (`agua.fosforoSubterranea`, candidata) | [[flores-lopez-2009]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Drenes abiertos en el campo (`finca.drenes`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[sigunga-1997]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Drenes abiertos en el campo (`finca.drenes`, candidata) → Absorción de nutrientes por la planta (`cultivo.absorcionNutrientes`, candidata) | [[sigunga-1997]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Humedal, pasto o bosque natural en el fondo del valle (`finca.humedalNatural`, candidata) → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata) | [[uwimana-2019]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| [[finca.pendiente|Pendiente del terreno]] → [[riesgo.suelo|Riesgo de Suelo]] | [[godoy-garzon-2015]] | 0 / 0 / 0 | 1 | [[suelo-pendiente]] |
| [[finca.pendiente|Pendiente del terreno]] → Balance de nutrientes del campo (entradas menos salidas) (`suelo.balanceNutrientes`, candidata) | [[vanek-2011]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
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
| Biocarbón (biochar) aplicado al suelo (`suelo.biocarbon`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata) | [[major-2009]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Biocarbón (biochar) aplicado al suelo (`suelo.biocarbon`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[major-2009]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Compactación del suelo (`suelo.compactacion`, candidata) → Absorción de nutrientes por la planta (`cultivo.absorcionNutrientes`, candidata) | [[brenes-2004]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| [[suelo.desnudoMeses|Meses con suelo desnudo]] → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata) | [[schroder-1998]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Suelo perdido por erosión (`suelo.erosion`, candidata) → Balance de nutrientes del campo (entradas menos salidas) (`suelo.balanceNutrientes`, candidata) | [[vanek-2011]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Fósforo disponible en el suelo (análisis de suelo) (`suelo.fosforo`, candidata) → Eficiencia de uso del nitrógeno (NUE) (`cultivo.eficienciaN`, candidata) | [[zhu-2024]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Humedad del suelo (`suelo.humedad`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata) | [[brenes-2004]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Humedad del suelo (`suelo.humedad`, candidata) → Fósforo disponible en el suelo (análisis de suelo) (`suelo.fosforo`, candidata) | [[pacenka-2012]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| Humedad del suelo (`suelo.humedad`, candidata) → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata) | [[xiao-2016]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| pH del suelo (`suelo.pH`, candidata) → Zinc que se desorbe y se lava del suelo (`suelo.zincLixiviado`, candidata) | [[fallas-2022]] | 0 / 1 / 0 | 0 | ninguno (candidato) |
| pH del suelo (`suelo.pH`, candidata) → Amoníaco (NH3) que se volatiliza del fertilizante o del estiércol (`aire.amoniaco`, candidata) | [[sigunga-1997]] | 0 / 0 / 0 | 0 | ninguno (candidato) |
| Capacidad del suelo para retener agua (`suelo.retencionAgua`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata) | [[schroder-1998]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Grado de saturación de fosfato del suelo (PSD) (`suelo.saturacionFosforo`, candidata) → Fósforo que se lava del suelo hacia el agua (`suelo.fosforoLixiviado`, candidata) | [[schoumans-2015]] | 0 / 0 / 0 | 1 | ninguno (candidato) |
| Uso agrícola intensivo del suelo (monocultivo convencional) (`suelo.usoIntensivo`, candidata) → Compactación del suelo (`suelo.compactacion`, candidata) | [[recha-2011]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Uso agrícola intensivo del suelo (monocultivo convencional) (`suelo.usoIntensivo`, candidata) → Lluvia que escurre sobre el suelo (fracción de la lluvia) (`suelo.escorrentia`, candidata) | [[recha-2011]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
| Uso agrícola intensivo del suelo (monocultivo convencional) (`suelo.usoIntensivo`, candidata) → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata) | [[recha-2011]] | 1 / 0 / 0 | 0 | ninguno (candidato) |
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

**Dosis de nitrógeno aplicada (`fert.dosisN`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- + · medido · Más nitrato aplicado, más N recuperado en el flujo preferente; el amonio no tuvo efecto — [[sigunga-1997]], pág. 8: «the amount of N recovered increased with increasing rate of NO3-N application»
- + · medido · En las terrazas se midió N alto en capas profundas, señal de lixiviación fuerte, ligado a lluvia o riego altos, poca demanda del cultivo y dosis altas de fertilizante — [[trinh-2007]], pág. 180: «Experimental results showed regular high N concentrations in deeper soil layers, indicative for substantial leaching losses, associated with high rainfall and/or irrigation, low crop demand and high fertilizer doses»
- + · afirmado · Con un modelo de balance de N calibrado con sus datos, la lixiviación sube con la dosis: en arroz–arroz–maíz, de 52–60 a 58–154 kg N/ha de dosis baja a alta (simulado) — [[trinh-2007]], pág. 180: «showed increased N leaching with increasing fertilizer doses»
- + · afirmado · El exceso de N baja la eficiencia de uso y sube la lixiviación de nitrato, con acidificación si el estiércol o la cal no reponen las bases (premisa de la tesis) — [[zhu-2024]], pág. 170: «Excessive nitrogen (N) fertilizer application in China's croplands has led to low nitrogen use efficiency (NUE), leading to enhanced nitrate leaching which is accompanied by soil acidification»

**[[riego.sistema|Eficiencia de aplicación del sistema de riego]] → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- ? · medido · En arroz rindió más la inundación (12,02 t/ha) que el goteo (7,1) y la aspersión (4,93): el sistema más eficiente no fue el de más rendimiento — [[echeverria-2015]], pág. 15: «Las parcelas a las que se les implementó el sistema de riego por inundación tuvieron un mayor rendimiento con 12.02 t/ha, en comparación con los sistemas de goteo y aspersión con un rendimiento de 7.1 t/ha y 4.93 t/ha, respectivamente»
- 0 · medido · Sin diferencias en ninguna variable de producción entre goteo y codo — [[molina-2009]], pág. 4: «En ninguna de las variables analizadas hubo diferencias (P≤0.05) entre los dos métodos.»
- 0 · medido · La inundación no rindió más que el goteo — [[vargas-cazar-2019]], pág. 3: «sin embargo, el rendimiento no fue estadísticamente superior al riego por goteo.»

**Fertilizante incorporado, inyectado o colocado en banda (frente a dejarlo al voleo en la superficie) (`fert.incorporacion`, candidata) → Amoníaco (NH3) que se volatiliza del fertilizante o del estiércol (`aire.amoniaco`, candidata)**

- − · medido · En pastura, el estiércol esparcido en superficie perdió 77 % del N amoniacal; en bandas angostas 20 % y con inyección superficial 6 % (base de datos de ensayos de campo 1989–1998) — [[huijsmans-2003]], pág. 150: «The mean cumulative volatilization for surface spreading was estimated to be 77% of the total ammoniacal nitrogen (TAN) applied by the manure, 20% for narrow-band application and 6% for shallow injection»
- − · medido · En tierra arable: 68 % en superficie, 17 % incorporado superficialmente y 2 % enterrado a fondo — [[huijsmans-2003]], pág. 151: «On arable land, the mean total volatilization, expressed as % of TAN applied, was 68% for surface spreading, 17% for surface incorporation and 2% for deep placement»
- − · medido · Incorporar el fertilizante en los primeros 0–5 cm bajó de forma significativa las pérdidas de NH3 — [[sigunga-1997]], pág. 8: «Incorporating fertilizer materials within the 0-5 cm soil layer significantly reduced NH3-N losses»

**Fertilizante incorporado, inyectado o colocado en banda (frente a dejarlo al voleo en la superficie) (`fert.incorporacion`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- 0 · medido · La forma de aplicar el N no cambió el rendimiento de materia seca — [[schroder-1998]], pág. 213: «Dry matter (DM) yields of maize were not significantly affected by the application method of N, however»
- + · afirmado · Recomienda colocar el P bajo la semilla al inicio de cada ciclo, solo o con un poco de estiércol de vaca, para aprovechar el P nuevo y el residual — [[van-der-eijk-1997]], pág. 9: «Subseed placement at the start of each growing season is recommended, either placed alone or together with small amounts of cowdung»

**[[fert.meses|Meses en que se fertiliza]] → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- + · medido · Aplicar el purín en otoño (antes del invierno lluvioso, sin cultivo) perdió más N que en primavera; en primavera hubo menos pérdidas y más rendimiento (ocho ensayos) — [[schroder-1998]], pág. 214: «spring-applied slurry without DCD was on average associated with even lower N losses and higher maize DM yields»
- + · medido · En vertisoles el nitrato se pierde por flujo preferente en las grietas, sobre todo si se aplica temprano, cuando las grietas todavía no se han cerrado — [[sigunga-1997]], pág. 8: «bypass flow can be an important avenue of NO3-N loss from Vertisols especially if applied early in the season when the characteristic cracks of Vertisols have not closed»

**[[riego.sistema|Eficiencia de aplicación del sistema de riego]] → Volumen de agua aplicado (`riego.volumenAplicado`, candidata)**

- − · medido · Goteo usó 9 075 m³/ha: 59 % menos que inundación (22 125) y 31 % menos que aspersión (13 218); un ciclo, sin análisis estadístico del agua — [[echeverria-2015]], pág. 19: «El sistema de goteo fue el que utilizó la menor cantidad de agua durante el ciclo usando un total de 9,075 m³/ha que es un 59% menos de agua utilizada que el sistema de riego por inundación, y un 31% menos que el sistema de riego por aspersión.»
- − · medido · El goteo (regado según ETc) usó 58,2 % menos agua que el riego por codo — [[molina-2009]], pág. 4: «se logró un ahorro de agua del 58.2% en relación al sistema de riego por codo»

**Humedad del suelo (`suelo.humedad`, candidata) → Desnitrificación (nitrato que el suelo convierte en gas) (`suelo.desnitrificacion`, candidata)**

- + · medido · La desnitrificación anual sube con el índice topográfico de humedad, es decir, en los suelos que más se saturan (isótopos de 15N en el agua subterránea somera) — [[anderson-2013]], pág. 3: «Annual rates of denitrification showed a strong positive relationship with topographic index»
- + · medido · La tasa de desnitrificación depende sobre todo de la humedad del suelo y del carbono disponible (laboratorio) — [[sigunga-1997]], pág. 8: «Denitrification rate depended primarily on soil moisture content and available C»

**Alteraciones del clima (`clima.alteraciones`, candidata) → [[riesgo.poli|Riesgo de Polinizadores]]**

- + · citado · Misma frase: alteraciones climáticas (Goulson et al. 2015, de segunda mano) — [[kuniyoshi]], pág. 40: «los parásitos, las enfermedades y las alteraciones climáticas (Goulson et al., 2015)»

**Lluvia acumulada en el período (mm) (`clima.lluvia`, candidata) → Nitrógeno mineral del suelo (nitrato y amonio, por análisis) (`suelo.nitrogenoMineral`, candidata)**

- − · medido · Cada 100 mm más de lluvia entre mayo y el muestreo dejaron 25 kg/ha menos de N mineral residual (el N se fue con el agua o lo tomó el cultivo) — [[schroder-1998]], pág. 103: «A 100 mm increase of rainfall reduced residual SMN with 25 kg ha-1»

**[[clima.mesesLluvia|Meses de lluvia fuerte]] → Óxido nitroso (N2O) que emite el suelo (`aire.oxidoNitroso`, candidata)**

- + · medido · Los picos de N2O los disparan la lluvia fuerte y el calor; los mayores llegaron cuando esa lluvia coincidió con la aplicación de estiércol o vino justo después — [[molodovskaya-2010]], pág. 4: «The greatest N2O emissions were observed when flux-triggering weather events coincided with or followed manure application»

**[[clima.mesesLluvia|Meses de lluvia fuerte]] → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- + · medido · Misma frase: la lluvia (o el riego) alta va con la lixiviación de N — [[trinh-2007]], pág. 180: «associated with high rainfall and/or irrigation, low crop demand and high fertilizer doses»

**[[clima.mesesLluvia|Meses de lluvia fuerte]] → Suelo perdido por erosión (`suelo.erosion`, candidata)**

- + · medido · Las pérdidas altas de 2005 vinieron de una sola lluvia extraordinaria — [[trinh-2007]], pág. 180: «The high values for 2005 were associated with one extraordinary rainfall event»

**[[clima.mesesLluvia|Meses de lluvia fuerte]] → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata)**

- + · medido · El 93 % del sedimento, el 60 % del P total y el 67 % del N total que salen en un año salieron en los 115 días con lluvia — [[uwimana-2019]], pág. 10: «with 93%, 60% and 67% of the annual TSS, TP and TN yields, respectively, transported during 115 days with rain»

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

**Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → Amoníaco (NH3) que se volatiliza del fertilizante o del estiércol (`aire.amoniaco`, candidata)**

- + · medido · En tierra arable la tasa de volatilización sube con más N amoniacal en el estiércol, más dosis de estiércol y más temperatura del aire — [[huijsmans-2003]], pág. 151: «The volatilization rate increased with an increase in TAN content of the manure, manure application rate and air temperature»

**Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → Óxido nitroso (N2O) que emite el suelo (`aire.oxidoNitroso`, candidata)**

- + · medido · Las áreas que recibieron más N de estiércol emitieron más N2O (covarianza turbulenta 2006–2009 y cámaras estáticas) — [[molodovskaya-2010]], pág. 3: «areas which received more manure N were stronger N2O emitters»

**Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → Fósforo disponible en el suelo (análisis de suelo) (`suelo.fosforo`, candidata)**

- + · medido · En más de 1200 series de análisis de campos (6 años o más, muestreo cada 3 años), el P Morgan sube con más dosis recomendada de estiércol, más frecuencia de maíz y más aluminio — [[pacenka-2012]], pág. 3: «Morgan's P concentration with: corn frequency, higher recommended manure rate, and higher aluminum»

**Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata)**

- − · medido · El digestato líquido perdió menos fósforo por escorrentía que el fertilizante químico (nueve lluvias simuladas en seis meses) — [[xiao-2016]], pág. 16: «Application of liquid digestate significantly reduced the phosphorus losses for runoff»

**Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- + · medido · En el lixiviado no mejoró al químico y perdió más nitrato — [[xiao-2016]], pág. 66: «did not ameliorate the nutrient losses from leachate. It even caused more losses for NO3-N»

**Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata) → pH del suelo (`suelo.pH`, candidata)**

- + · afirmado · El estiércol trae cationes básicos y bicarbonato que frenan la acidificación del N, pero puede acumular P en suelos con P alto — [[zhu-2024]], pág. 170: «The use of manure, which contains base cations and HCO3-, mitigates the acidifying impact of N fertilizer inputs»

**Dosis de potasio aplicada (KCl) (`fert.dosisK`, candidata) → Zinc que se desorbe y se lava del suelo (`suelo.zincLixiviado`, candidata)**

- + · medido · Las soluciones concentradas de KCl desorbieron y lavaron zinc en columnas sin disturbar de suelo volcánico aluvial — [[fallas-2022]], pág. 149: «adding highly concentrated potassium chloride solutions promotes zinc desorption and leaching from these alluvial volcanic ash soils»

**Dosis de nitrógeno aplicada (`fert.dosisN`, candidata) → Nitrógeno mineral del suelo (nitrato y amonio, por análisis) (`suelo.nitrogenoMineral`, candidata)**

- + · medido · Abonar 100 kg N/ha por debajo del óptimo económico dejó 24 kg N/ha menos de N mineral en 0–60 cm al final del ciclo (25 ensayos en arena) — [[schroder-1998]], pág. 217: «the soil mineral N residue at the end of the growing season (0-60 cm) decreased by 24 kg N ha-1»

**Dosis de nitrógeno aplicada (`fert.dosisN`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · medido · Con esos 100 kg N/ha menos, el rendimiento de materia seca bajó 16 % en promedio — [[schroder-1998]], pág. 217: «The associated reduction in DM yield averaged 16%»

**Dosis de nitrógeno aplicada (`fert.dosisN`, candidata) → pH del suelo (`suelo.pH`, candidata)**

- − · medido · En suelos de secano no calcáreos, la transformación del N del fertilizante fue la causa principal de la acidificación (72 % del ácido producido; balance con datos de 13 ensayos y lixiviación modelada) — [[zhu-2024]], pág. 172: «N transformation was the main driver of soil acidification in non-calcareous upland soils, accounting for 72% of total acid production rate»

**Dosis de fósforo aplicada (`fert.dosisP`, candidata) → Boro retenido (adsorbido) por el suelo (`suelo.boroAdsorbido`, candidata)**

- 0 · medido · Las dosis altas de fosfato que se usan en ese suelo casi no cambian la adsorción de boro a las concentraciones bajas de la zona — [[fallas-2022]], pág. 148: «the high phosphate rates commonly applied to this volcanic soil have minor effects on boron adsorption at the typical low boron concentrations observed in the sampled region»

**Dosis de fósforo aplicada (`fert.dosisP`, candidata) → Fósforo que se lava del suelo hacia el agua (`suelo.fosforoLixiviado`, candidata)**

- + · afirmado · En su modelo SIMPLE, lo que más pesa en las pérdidas de P son los excedentes históricos de P, el nivel freático y la dosis actual de P (modelo, no medición de campo) — [[schoumans-2015]], pág. 245: «The most important or sensitive input variables for the assessment of P losses are the historical P surpluses, groundwater table and actual P application rates»

**Dosis de fósforo aplicada (`fert.dosisP`, candidata) → Nitrógeno fijado por las leguminosas (`cultivo.fijacionN`, candidata)**

- + · medido · Abonar con P subió el N fijado por las leguminosas hasta 67 % con roca fosfórica y 150 % con superfosfato triple, sobre todo en suelos con poca arcilla y poco fósforo de calcio — [[vanek-2011]], pág. 4: «Soil texture and Ca-P levels determined impacts of P fertilization: the largest increases in N fixed were 67% for RP and 150% for TSP in soils with low levels of clay and Ca-P»

**Frecuencia o fraccionamiento de la fertilización (`fert.frecuencia`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- 0 · medido · Fraccionar urea y KCl (semanal o quincenal por fertirriego, cada 28 días o trimestral a mano) no cambió la concentración de nitrato y potasio en el lixiviado — [[alpizar-2000]], pág. 8: «Los resultados del estudio con los lisímetros de drenaje mostraron que la concentración en los lixiviados no es diferente significativamente (P<0.05) cuando la fertilización se fracciona.»

**Frecuencia o fraccionamiento de la fertilización (`fert.frecuencia`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- 0 · medido · Fraccionar el N mineral (40 kg/ha en banda a las 4–6 hojas) subió el rendimiento solo en uno de cuatro ensayos, el de lluvia excesiva — [[schroder-1998]], pág. 214: «Split applications of mineral fertiliser N had a significant positive effect in one experiment where rainfall was excessive but not in the others»

**Fertilizante incorporado, inyectado o colocado en banda (frente a dejarlo al voleo en la superficie) (`fert.incorporacion`, candidata) → Absorción de nutrientes por la planta (`cultivo.absorcionNutrientes`, candidata)**

- + · medido · Colocar el N cerca de la planta subió su recuperación 1,3 a 1,4 veces (Rhizolab de Wageningen) — [[schroder-1998]], pág. 213: «Positioning fertiliser N close to the plant increased the recovery by a factor of 1.3 to 1.4»

**[[fert.meses|Meses en que se fertiliza]] → Óxido nitroso (N2O) que emite el suelo (`aire.oxidoNitroso`, candidata)**

- + · medido · El pico más intenso vino de esparcir estiércol en verano y que luego cayera una lluvia fuerte — [[molodovskaya-2010]], pág. 4: «The most intense single N2O peak event was produced from combination of summer manure spreading and strong rainfall»

**[[fert.meses|Meses en que se fertiliza]] → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata)**

- + · medido · Los picos de N y P en el agua coincidieron con arar, deshierbar y abonar (y con vaciar y dragar los estanques) — [[uwimana-2019]], pág. 11: «with peaks of concentrations associated with the periods of land ploughing, weeding and fertilizer application»

**[[finca.distAgua|Distancia al cuerpo de agua]] → Fósforo soluble en el agua subterránea (`agua.fosforoSubterranea`, candidata)**

- − · medido · El fósforo soluble del agua subterránea sube a medida que baja la distancia al arroyo (37 pozos en una finca de valle aluvial) — [[flores-lopez-2009]], pág. 4: «SRP concentrations increased as the distance to the streams decreased»

**Drenes abiertos en el campo (`finca.drenes`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · medido · Drenes de 40 y 60 cm dieron raíces más profundas y más rendimiento de maíz que drenes de 0 y 20 cm — [[sigunga-1997]], pág. 8: «Drains, 40 and 60 cm deep, led to deeper rooting depth and higher yields of maize than the 0 and 20 cm deep drains»

**Drenes abiertos en el campo (`finca.drenes`, candidata) → Absorción de nutrientes por la planta (`cultivo.absorcionNutrientes`, candidata)**

- + · medido · La absorción de N, P y K fue mayor en parcelas drenadas — [[sigunga-1997]], pág. 8: «the uptake of N, P, and K was higher on drained than undrained plots»

**Humedal, pasto o bosque natural en el fondo del valle (`finca.humedalNatural`, candidata) → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata)**

- − · medido · Los fondos de valle con pasto o bosque, y con estanques, retuvieron nutrientes y sedimento; los cultivados los exportaron — [[uwimana-2019]], pág. 10: «Valley bottoms dominated by grass/forest and ponds/reservoir types were generally associated with positive net yields of nutrients and sediments, while those with agricultural land covers had a net negative yield, resulting in net export»

**[[finca.pendiente|Pendiente del terreno]] → [[riesgo.suelo|Riesgo de Suelo]]**

- + · afirmado · En ladera la erosión y la degradación del suelo se aceleran (premisa del estudio, no medida) — [[godoy-garzon-2015]], pág. 4: «En relieve accidentado, la producción de cultivos en laderas se ve afectada por la erosión y degradación acelerada de los suelos.»

**[[finca.pendiente|Pendiente del terreno]] → Balance de nutrientes del campo (entradas menos salidas) (`suelo.balanceNutrientes`, candidata)**

- − · medido · Los campos cercanos al pueblo, menos empinados y con más estiércol, tuvieron balances más positivos que los lejanos (pendiente y estiércol van juntos, no se separan) — [[vanek-2011]], pág. 3: «Fields near to communities received more manure and were less steep than far fields, resulting in more positive near field balances»

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

**Biocarbón (biochar) aplicado al suelo (`suelo.biocarbon`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- − · medido · Con 20 t/ha de biocarbón, la lixiviación bajo la zona de raíces bajó en dos años: P 17 %, nitrato 8 %, Ca 23 %, Mg 28 % y K 36 % — [[major-2009]], pág. 3: «Leaching below the rooting zone was reduced by 17% for P, 19% for Sr, 8% for NO3-N, 23% for Ca, 28% for Mg, and 36% for K, over two years, with biochar application»

**Biocarbón (biochar) aplicado al suelo (`suelo.biocarbon`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · medido · El maíz rindió 28, 30 y 140 % más en el segundo, tercer y cuarto año después de aplicar el biocarbón — [[major-2009]], pág. 3: «The application of 20 t ha-1 of biochar resulted in maize yield increases of 28, 30 and 140% in the second, third and fourth year after biochar application»

**Compactación del suelo (`suelo.compactacion`, candidata) → Absorción de nutrientes por la planta (`cultivo.absorcionNutrientes`, candidata)**

- − · afirmado · Los lotes con goteo (arcillosos y compactados) absorbieron peor los nutrientes que los de gravedad y aspersión (textura media a gruesa, sin compactación); es una comparación entre lotes — [[brenes-2004]], pág. 31: «los suelos de riego por gravedad y aspersión de texturas media a gruesas y sin compactación, le proporcionan a la planta una mejor absorción de los nutrimentos en comparación con los suelos arcillosos y compactados del riego con goteo»

**[[suelo.desnudoMeses|Meses con suelo desnudo]] → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- + · medido · Dejar el suelo sin cultivo de cobertura en invierno lixivia más N: con centeno o pasto la lixiviación bajó en proporción al N que absorbieron (dosis bajas de N, seis años) — [[schroder-1998]], pág. 215: «At low N input levels, cover crops reduced N leaching in accordance with their N uptake»

**Suelo perdido por erosión (`suelo.erosion`, candidata) → Balance de nutrientes del campo (entradas menos salidas) (`suelo.balanceNutrientes`, candidata)**

- − · medido · La dosis de estiércol, la productividad del pastizal y la erosión fueron lo que más movió el balance de nutrientes de los campos — [[vanek-2011]], pág. 3: «Field nutrient balances showed that manuring rates, rangeland productivity, and soil erosion were dominant drivers of soil nutrient trends»

**Fósforo disponible en el suelo (análisis de suelo) (`suelo.fosforo`, candidata) → Eficiencia de uso del nitrógeno (NUE) (`cultivo.eficienciaN`, candidata)**

- + · medido · Además del pH, más P disponible subió la eficiencia de uso del N — [[zhu-2024]], pág. 171: «In addition to pH, an increase in phosphorus availability increased NUE»

**Humedad del suelo (`suelo.humedad`, candidata) → Rendimiento del cultivo (`cultivo.rendimiento`, candidata)**

- + · medido · Donde el suelo tuvo más humedad (aspersión) hubo mejores promedios en todas las variables; sistema, suelo y manejo van mezclados (ver alertas) — [[brenes-2004]], pág. 31: «La humedad del suelo influye directamente en la disponibilidad de nutrientes, en los tratamientos donde la humedad en el suelo fue mayor obtuvieron mejores promedios en todas las variables medidas.»

**Humedad del suelo (`suelo.humedad`, candidata) → Fósforo disponible en el suelo (análisis de suelo) (`suelo.fosforo`, candidata)**

- − · medido · En la misma regresión, los suelos más húmedos tienen menos P Morgan — [[pacenka-2012]], pág. 3: «and higher aluminum; and a negative effect of soil wetness»

**Humedad del suelo (`suelo.humedad`, candidata) → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata)**

- + · medido · Con el suelo húmedo todos los tratamientos perdieron más agua por escorrentía y lixiviado, y por eso más nutrientes — [[xiao-2016]], pág. 65: «all the treatments had higher losses for runoff and leachate when soil was under wet condition. This consequently caused more nutrient losses from soil trays»

**pH del suelo (`suelo.pH`, candidata) → Zinc que se desorbe y se lava del suelo (`suelo.zincLixiviado`, candidata)**

- − · medido · Con pH más bajo (y más sales en la solución) quedó más zinc disuelto en los dos suelos — [[fallas-2022]], pág. 149: «a lower pH and a higher ionic strength promote increased zinc solution concentrations in both volcanic soils»

**pH del suelo (`suelo.pH`, candidata) → Amoníaco (NH3) que se volatiliza del fertilizante o del estiércol (`aire.amoniaco`, candidata)**

- ? · medido · La volatilización de NH3 depende sobre todo del pH del suelo y del tipo de fertilizante; el resumen no dice la dirección — [[sigunga-1997]], pág. 8: «NH3 volatilization depended primarily on soil pH and fertilizer properties»

**Capacidad del suelo para retener agua (`suelo.retencionAgua`, candidata) → Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- − · afirmado · Los suelos arenosos retienen poca agua, así que el N baja a capas profundas si sobra o se aplica temprano (síntesis del capítulo 9) — [[schroder-1998]], pág. 217: «These soils have a limited capacity to retain water and therefore N may easily be lost to greater depths when it is available or applied too early»

**Grado de saturación de fosfato del suelo (PSD) (`suelo.saturacionFosforo`, candidata) → Fósforo que se lava del suelo hacia el agua (`suelo.fosforoLixiviado`, candidata)**

- + · afirmado · Pasado el grado de saturación crítico, el P del agua subterránea supera el nivel natural a largo plazo (es la base del protocolo neerlandés, no una medición nueva) — [[schoumans-2015]], pág. 244: «as a simple index to determine the potential risk of increased P concentrations in groundwater that exceed the background concentration in the long term»

**Uso agrícola intensivo del suelo (monocultivo convencional) (`suelo.usoIntensivo`, candidata) → Compactación del suelo (`suelo.compactacion`, candidata)**

- + · medido · Con más años de maíz, la densidad aparente de 0–10 cm subió 46 %, y el carbono orgánico y la porosidad bajaron 75 % y 20 % — [[recha-2011]], pág. 3: «at a depth of 0-0.1 m increased by 46%, while soil organic carbon (SOC) concentrations and total porosity decreased by 75% and 20%, respectively»

**Uso agrícola intensivo del suelo (monocultivo convencional) (`suelo.usoIntensivo`, candidata) → Lluvia que escurre sobre el suelo (fracción de la lluvia) (`suelo.escorrentia`, candidata)**

- + · medido · La escorrentía pasó de 0,033 de la lluvia en el bosque a 0,095 con más años de cultivo — [[recha-2011]], pág. 3: «The average runoff ratio was 0.033 in the forest and increased gradually to 0.095 with increasing duration of cultivation»

**Uso agrícola intensivo del suelo (monocultivo convencional) (`suelo.usoIntensivo`, candidata) → Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce (`agua.nutrientesEscorrentia`, candidata)**

- + · medido · Las salidas de carbono y nutrientes al arroyo subieron con los años de cultivo, por el mayor caudal — [[recha-2011]], pág. 3: «Total C and nutrient exports increased with longer cultivation (P<0.05) due to greater»

**Uso agrícola intensivo del suelo (monocultivo convencional) (`suelo.usoIntensivo`, candidata) → Capacidad del suelo para retener agua (`suelo.retencionAgua`, candidata)**

- − · medido · A saturación (0 kPa) y de 0 a 20 cm, los lotes de agricultura convencional retuvieron menos agua que bosque y agricultura orgánica — [[rios-2024]], pág. 27: «Los sitios bajo agricultura convencional presentaron una menor retención de humedad en comparación con los suelos menos intervenidos»
- 0 · medido · A 33 y 50 kPa el manejo no cambió la retención en ninguna de las dos profundidades — [[rios-2024]], pág. 27: «El manejo del suelo no mostró efectos significativos en la capacidad de retención de agua a tensiones de 33 y 50 kPa en ambas profundidades estudiadas»

**Agua acumulada en el sustrato (`sustrato.exceso`, candidata) → Enfermedades del cultivo (`cultivo.enfermedades`, candidata)**

- + · afirmado · El agua acumulada en el medio favorece hongos y bacterias que reducen el enraizamiento — [[flores-2002]], pág. 7: «Esto favorece el ataque de enfermedades como hongos y bacterias que reducen su enraizamiento.»

## Umbrales y rangos por variable

> Candidatos para los cortes de las rúbricas. No están programados: los cortes siguen siendo criterio propio hasta que un especialista los valide.

**Estiércol, purín o digestato aplicado como abono (`fert.abonoOrganico`, candidata)**

- La mayor eficiencia de uso del N se dio con 25 a 30 % del N total en forma orgánica — [[zhu-2024]], pág. 171: «the highest NUE was found when 25 to 30% of the total N input was supplied in organic form»

**Dosis de nitrógeno aplicada (`fert.dosisN`, candidata)**

- Óptimo económico del N disponible (N mineral del suelo en marzo–abril más N del fertilizante): 173 kg N/ha midiendo 0–30 cm y 195 kg N/ha midiendo 0–60 cm (25 ensayos en arena) — [[schroder-1998]], pág. 217: «The values obtained for the economically optimal SUMN in the upper 30 and 60 cm of soil were respectively 173 and 195 kg N ha-1»

**Dosis de fósforo aplicada (`fert.dosisP`, candidata)**

- Para maíz, 20 a 40 kg P/ha por ciclo (45 a 90 kg P2O5/ha), colocado bajo la semilla: un poco más de lo que la planta necesita, y el P del suelo sube poco a poco — [[van-der-eijk-1997]], pág. 9: «P application rates of 20 to 40 kg/ha (in P2O5: 45 to 90 kg/ha) are advised for maize»

**[[fert.fertirriego|Fertirriego]]**

- Inyectar el fertilizante después del 20–25 % del volumen de riego y terminar al 80–90 % (Sagardoy 1992, de segunda mano) — [[alpizar-2000]], pág. 33: «El fertilizante no debe ser puesto en el agua desde el comienzo del riego, sino después de haber aplicado el 20-25% del volumen de agua»

**Drenes abiertos en el campo (`finca.drenes`, candidata)**

- Drenes de 40 cm de profundidad cada 15 a 20 m como paso previo para sembrar maíz en vertisoles — [[sigunga-1997]], pág. 9: «It is recommended that 40 cm deep drains with inter-drain spacing of 15 - 20 metres be provided as prerequisite step in the management of Vertisols for maize production»

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

**Fósforo disponible en el suelo (análisis de suelo) (`suelo.fosforo`, candidata)**

- Punto de quiebre cerca de 12 kg P/ha (Morgan): los suelos con P bajo tienden a subir y los de P alto a bajar — [[pacenka-2012]], pág. 3: «The breakpoint is around 12 kg P/ha»

**Humedad del suelo (`suelo.humedad`, candidata)**

- La desnitrificación empieza a 60 % de la capacidad de retención de agua y es fuerte sobre 80 % — [[sigunga-1997]], pág. 8: «the critical soil moisture content for denitrification to commence was 60% of the water holding capacity (WHC), but substantial denitrification occurred at > 80% WHC»

**Nitrógeno mineral del suelo (nitrato y amonio, por análisis) (`suelo.nitrogenoMineral`, candidata)**

- Con más de 175 kg N/ha en 0–60 cm a las 4–6 hojas, agregar 40 kg N/ha de fertilizante mineral tiene un retorno dudoso — [[schroder-1998]], pág. 215: «the financial return from a 40 kg ha-1 supplementation with mineral fertiliser N, is questionable if there is more than 175 kg N ha-1 in the upper 0.6 m soil layer at the 4-6 leaf stage»

**Nitrato y potasio lixiviados bajo la zona de raíces (`suelo.nutrientesLixiviados`, candidata)**

- En banano, el nutriente que baja de 40 cm se considera perdido (afirmado en el resumen) — [[alpizar-2000]], pág. 8: «Los nutrientes concentrados a profundidades mayores de 40 cm no son aprovechados por las raíces del banano»

**pH del suelo (`suelo.pH`, candidata)**

- El pH fue lo que más controló la eficiencia de uso del N, con un óptimo cerca de 6 — [[zhu-2024]], pág. 171: «soil pH was the most important factor controlling NUE with an optimum pH around 6»

**Grado de saturación de fosfato del suelo (PSD) (`suelo.saturacionFosforo`, candidata)**

- Grado de saturación crítico de 25 % en suelos arenosos no calcáreos — [[schoumans-2015]], pág. 244: «The critical PSD of non-calcareous sandy soils was found to be 25%»
- Crítico por tipo de suelo: turba 5 %, arenoso calcáreo 23 %, arenoso ácido 25 %, arcilla no calcárea 31 % y arcilla calcárea 78 % — [[schoumans-2015]], pág. 244: «peat soils (5%), calcareous sandy soils (23%), acid sandy soils (25%), non-calcareous clay soils (31%) and calcareous clay soils (78%)»

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

- **Fósforo soluble en el agua subterránea** (`agua.fosforoSubterranea`) — [[flores-lopez-2009]]
- **Nitrógeno y fósforo que la escorrentía arrastra hacia el cauce** (`agua.nutrientesEscorrentia`) — [[recha-2011]], [[uwimana-2019]], [[xiao-2016]]
- **Amoníaco (NH3) que se volatiliza del fertilizante o del estiércol** (`aire.amoniaco`) — [[huijsmans-2003]], [[sigunga-1997]]
- **Óxido nitroso (N2O) que emite el suelo** (`aire.oxidoNitroso`) — [[molodovskaya-2010]]
- **Alteraciones del clima** (`clima.alteraciones`) — [[kuniyoshi]]
- **Lluvia acumulada en el período (mm)** (`clima.lluvia`) — [[schroder-1998]]
- **Absorción de nutrientes por la planta** (`cultivo.absorcionNutrientes`) — [[brenes-2004]], [[schroder-1998]], [[sigunga-1997]]
- **Silicio o bioestimulante foliar** (`cultivo.bioestimulanteFoliar`) — [[vargas-cazar-2019]]
- **Biológico aplicado por el riego (Trichoderma)** (`cultivo.biologicoAlRiego`) — [[castillo-2007]]
- **Crecimiento de la planta (altura o largo de raíz)** (`cultivo.crecimiento`) — [[mata-2021]]
- **Densidad de siembra** (`cultivo.densidad`) — [[benavides-jara-2014]], [[poquiviqui-1998]], [[t215-1990]]
- **Distancia entre surcos** (`cultivo.distanciamiento`) — [[chi-bautista-2011]]
- **Eficiencia de uso del nitrógeno (NUE)** (`cultivo.eficienciaN`) — [[zhu-2024]]
- **Enfermedades del cultivo** (`cultivo.enfermedades`) — [[flores-2002]]
- **Nitrógeno fijado por las leguminosas** (`cultivo.fijacionN`) — [[vanek-2011]]
- **Peso de las raíces** (`cultivo.raices`) — [[castillo-2007]]
- **Rendimiento del cultivo** (`cultivo.rendimiento`) — [[benavides-jara-2014]], [[brenes-2004]], [[castillo-2007]], [[chi-bautista-2011]], [[echeverria-2015]], [[major-2009]], [[mejia-reyes-2020]], [[molina-2009]], [[ordonez-ventura-2015]], [[plaza-2004]], [[poquiviqui-1998]], [[saltos-2009]], [[schroder-1998]], [[sigunga-1997]], [[t215-1990]], [[van-der-eijk-1997]], [[vargas-cazar-2019]]
- **Estiércol, purín o digestato aplicado como abono** (`fert.abonoOrganico`) — [[huijsmans-2003]], [[molodovskaya-2010]], [[pacenka-2012]], [[xiao-2016]], [[zhu-2024]]
- **Dosis de potasio aplicada (KCl)** (`fert.dosisK`) — [[fallas-2022]]
- **Dosis de nitrógeno aplicada** (`fert.dosisN`) — [[schroder-1998]], [[sigunga-1997]], [[trinh-2007]], [[zhu-2024]]
- **Dosis de fósforo aplicada** (`fert.dosisP`) — [[fallas-2022]], [[schoumans-2015]], [[van-der-eijk-1997]], [[vanek-2011]]
- **Frecuencia o fraccionamiento de la fertilización** (`fert.frecuencia`) — [[alpizar-2000]], [[schroder-1998]]
- **Fertilizante incorporado, inyectado o colocado en banda (frente a dejarlo al voleo en la superficie)** (`fert.incorporacion`) — [[huijsmans-2003]], [[schroder-1998]], [[sigunga-1997]], [[van-der-eijk-1997]]
- **Drenes abiertos en el campo** (`finca.drenes`) — [[sigunga-1997]]
- **Humedal, pasto o bosque natural en el fondo del valle** (`finca.humedalNatural`) — [[uwimana-2019]]
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
- **Balance de nutrientes del campo (entradas menos salidas)** (`suelo.balanceNutrientes`) — [[vanek-2011]]
- **Biocarbón (biochar) aplicado al suelo** (`suelo.biocarbon`) — [[major-2009]]
- **Boro retenido (adsorbido) por el suelo** (`suelo.boroAdsorbido`) — [[fallas-2022]]
- **Compactación del suelo** (`suelo.compactacion`) — [[brenes-2004]], [[recha-2011]]
- **Desnitrificación (nitrato que el suelo convierte en gas)** (`suelo.desnitrificacion`) — [[anderson-2013]], [[sigunga-1997]]
- **Suelo perdido por erosión** (`suelo.erosion`) — [[trinh-2007]], [[vanek-2011]]
- **Lluvia que escurre sobre el suelo (fracción de la lluvia)** (`suelo.escorrentia`) — [[recha-2011]]
- **Fósforo disponible en el suelo (análisis de suelo)** (`suelo.fosforo`) — [[pacenka-2012]], [[zhu-2024]]
- **Fósforo que se lava del suelo hacia el agua** (`suelo.fosforoLixiviado`) — [[schoumans-2015]]
- **Humedad del suelo** (`suelo.humedad`) — [[anderson-2013]], [[brenes-2004]], [[cerrato-2022]], [[pacenka-2012]], [[sigunga-1997]], [[xiao-2016]]
- **Nitrógeno mineral del suelo (nitrato y amonio, por análisis)** (`suelo.nitrogenoMineral`) — [[schroder-1998]]
- **Nitrato y potasio lixiviados bajo la zona de raíces** (`suelo.nutrientesLixiviados`) — [[alpizar-2000]], [[major-2009]], [[schroder-1998]], [[sigunga-1997]], [[trinh-2007]], [[xiao-2016]], [[zhu-2024]]
- **pH del suelo** (`suelo.pH`) — [[fallas-2022]], [[sigunga-1997]], [[zhu-2024]]
- **Capacidad del suelo para retener agua** (`suelo.retencionAgua`) — [[rios-2024]], [[schroder-1998]]
- **Grado de saturación de fosfato del suelo (PSD)** (`suelo.saturacionFosforo`) — [[schoumans-2015]]
- **Uso agrícola intensivo del suelo (monocultivo convencional)** (`suelo.usoIntensivo`) — [[recha-2011]], [[rios-2024]]
- **Zinc que se desorbe y se lava del suelo** (`suelo.zincLixiviado`) — [[fallas-2022]]
- **Agua acumulada en el sustrato** (`sustrato.exceso`) — [[flores-2002]]

## Alertas

- [[alpizar-2000]]: Los lisímetros de succión no sacaron solución del suelo: todo sale de los de drenaje, con dos réplicas por tratamiento. La tesis dice que el muestreo de lixiviados no se hizo bien y que hubo efecto residual de aplicaciones anteriores (pág. 51).
- [[alpizar-2000]]: En los lisímetros se regó a mano con regadera, no con el microaspersor de la finca (pág. 40).
- [[anderson-2013]]: La franja ribereña elimina nitrato con tasas altas, pero es poca área: una franja junto al cauce no compensa el nitrato que sale del resto de la finca (pág. 4).
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
- [[fallas-2022]]: Son ensayos de laboratorio (adsorción y columnas), no de campo; dicen qué pasa con dosis altas, no cuánto se pierde en una finca (pág. 148–149).
- [[flores-lopez-2009]]: El fósforo del agua subterránea junto al arroyo no se correlacionó con el del arroyo: la cercanía sube el P del agua del suelo, pero eso no dice cuánto llega al cauce (pág. 3–4).
- [[huijsmans-2003]]: El tiempo entre esparcir e incorporar cuenta: un arado de vertedera (más lento) no siempre pierde menos amoníaco que un cultivador, porque tarda más en enterrar el estiércol (pág. 151).
- [[huijsmans-2003]]: Es estiércol líquido en clima templado (Países Bajos); los porcentajes no se pasan tal cual a urea en el trópico.
- [[major-2009]]: En esta arcilla pesada el biocarbón no cambió la hidrología del suelo (pág. 3–4).
- [[major-2009]]: El biocarbón no es una práctica que Trofaxis pregunte hoy; queda como relación de suelo para el futuro.
- [[mata-2021]]: No se formaron vainas, probablemente por el calor dentro del macrotúnel en floración (pág. 36): no hay dato de rendimiento.
- [[mata-2021]]: El resumen da el largo de raíz con 288 mm como «111.2 m»; por el contexto la unidad debe ser cm.
- [[molodovskaya-2010]]: Mide gases, no pérdidas al agua. Sirve para el vínculo de lluvia y fertilización por el lado del aire (pág. 4).
- [[ordonez-ventura-2015]]: La lámina (60, 80 y 100 % de la ETc) y la marca del lateral van juntas: no se puede separar el efecto de una y otra. Presión de 2,1 a 3,4 PSI.
- [[osorio]]: La densidad de la madera tiene tres rangos distintos en la misma tesis (pág. 7, 30 y 34). Trofaxis no usa este dato; si se usa, preguntar a la autora cuál es el correcto.
- [[pacenka-2012]]: El exceso de fósforo de las fincas causó floraciones de algas en las fuentes de agua potable de Nueva York (pág. 3).
- [[plaza-2004]]: Ensayo corto: tres cortes de 21 días, de mayo a julio de 2004 (pág. 12).
- [[recha-2011]]: Es una cronosecuencia de cuatro cuencas (bosque, 5, 10 y 50 años de maíz), no un ensayo con repeticiones: muestra la tendencia de la degradación, no el efecto de una práctica (pág. 3).
- [[rios-2024]]: Estudio cuasiexperimental: un lote por uso del suelo. La tesis recomienda repetirlo con muestras sin disturbar (pág. 28).
- [[saltos-2009]]: El resumen intercambia L1 y L2 (dice que L2 es la lámina actual). En Materiales y métodos L1 es la testigo y L2 la reducida (pág. 13), que es lo que coincide con las conclusiones.
- [[saltos-2009]]: Resumen y conclusiones se contradicen sobre en qué sustrato el drenaje fue excesivo (pág. 4 y 22): el drenaje medido no se usa como relación.
- [[schoumans-2015]]: Los umbrales son de suelos de Países Bajos, y la tesis muestra que el crítico cambia con el tipo de suelo y con su aluminio y hierro extraíbles con oxalato (pág. 244). Usarlos en suelos tropicales sería criterio propio.
- [[schroder-1998]]: Clima templado y suelos arenosos de Países Bajos, con purín de vaca; el fraccionamiento solo ayudó en el ensayo de lluvia excesiva, que es la condición que más se parece a la época lluviosa del trópico.
- [[schroder-1998]]: La banda de purín después de la emergencia, la única forma en que fraccionar el purín subió el rendimiento, no estaba permitida por la ley neerlandesa de entonces (pág. 214).
- [[t215-1990]]: El nombre del autor no se lee en el escaneo: la cita queda incompleta hasta revisar el PDF a mano.
- [[trinh-2007]]: La erosión fue muy fuerte en cada parcela pero mucho menor a escala de cuenca, porque el sedimento queda atrapado en el camino, sobre todo en los arrozales en terraza (pág. 180).
- [[trinh-2007]]: Las cifras por cultivo salen de un modelo que la tesis dice que todavía necesita calibración y validación (pág. 181).
- [[uwimana-2019]]: En caudal bajo todos los usos del suelo retuvieron sedimento y nutrientes, y en caudal alto todos los exportaron (pág. 10–11).
- [[van-der-eijk-1997]]: El P del fertilizante quedó concentrado alrededor de los gránulos (más de 8000 mg/kg de P total) hasta unos 600 días después de aplicarlo: el residuo existe pero pocas raíces llegan a él (pág. 9).
- [[vanek-2011]]: El balance de potasio fue negativo por la cosecha de tubérculos y porque los rastrojos se dan al ganado (pág. 3).
- [[xiao-2016]]: Ensayo de laboratorio con suelo tamizado en bandejas de 1 m y sin cultivo (pág. 28): sirve para comparar fuentes de abono, no para estimar pérdidas de una finca.
- [[xiao-2016]]: Uno de los cuatro digestatos (D3) perdió más amonio y nitrógeno Kjeldahl por escorrentía que el químico (pág. 65).
- [[zhu-2024]]: Los porcentajes del manejo óptimo salen de un cálculo por provincia (capítulo 4, en preparación al publicarse la tesis), no de ensayos (pág. 172).
