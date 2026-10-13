# Evaluación de GSAP para la web de GrowMind

## Qué es (verificado en gsap.com)

- Librería de animación de JavaScript, versión 3, un producto de Webflow.
- **Es gratis para todos**, y los plugins (ScrollTrigger, SplitText, Flip, ScrollSmoother, Draggable, CustomEase, etc.) están disponibles gratis en npm.
- Instalación: `npm install gsap`. También se puede cargar por CDN con una etiqueta `<script>`; la página de instalación no muestra las URL exactas.
- No encontré en el sitio los tamaños de archivo. De memoria, el núcleo pesa unos 25 a 30 KB comprimido y ScrollTrigger unos 10 a 15 KB. Es un dato sin verificar.

## Qué haría GSAP en cada pieza

| Pieza | Lo que hacemos hoy | Lo que daría GSAP | Ganancia real |
| --- | --- | --- | --- |
| Cubo de Problemas | Posición suavizada propia + giro por línea con `rotateX` | ScrollTrigger con `scrub` y un timeline | Casi nula: el resultado visual sería el mismo; ahorra algunas líneas de código |
| Listado de Servicios | Bucle propio con tres copias, lerp y color continuo | ScrollTrigger con pin y scrub; `quickTo` para que la ficha siga al puntero | Poca: ya está resuelto y funciona fluido |
| Ficha de Servicios | Resorte propio generado como curva `linear()` | Easings elastic/back/CustomEase y timeline de entrada | Poca: el resorte ya existe |
| Acordeón | Altura animada con Web Animations | `height: auto` y Flip | Pequeña: menos código para el mismo efecto |
| Seguinos | CSS con delays y animación | Timeline con stagger y easing elástico | Pequeña |

## Qué podría sumar que hoy no tenemos

- **SplitText:** revelar títulos por palabra o letra (por ejemplo "De lo complejo a lo simple" o "Empecemos por lo simple.").
- **ScrollSmoother:** scroll con inercia en toda la página (cambia mucho la sensación, y puede chocar con el listado y el cubo que hoy se sienten bien).
- **CustomEase / Flip:** curvas a medida y transiciones entre estados de layout.

## Recomendación

**No migrar lo que ya funciona.** Las cuatro piezas están logradas, y el cubo en particular te gusta; reescribirlas con GSAP no mejora lo que se ve y agrega peso y riesgo de regresión en una página estática chica.

Si querés GSAP, que sea para **cosas nuevas**, empezando por un piloto chico, cargado por CDN y midiendo el peso. El mejor candidato es SplitText en los títulos grandes. Si no convence, se quita una sola etiqueta `<script>` y no queda nada.

## Sobre el temor al peso

No es que GSAP sea pesado en sí: con el núcleo más uno o dos plugins serían unas decenas de KB, comparable con las fuentes que ya cargamos. La razón para no sumarla es que hoy no resolvería nada que no esté resuelto.
