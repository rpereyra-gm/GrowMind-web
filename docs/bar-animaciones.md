# Bar: animaciones (referencia anime.js v4, animejs.com)

Mecanismos tomados de la home y la documentación de anime.js. Cada uno se puede comprobar mirando la animación o un filmstrip de cuadros.

1. **El scroll manda y es reversible.** En las animaciones ligadas al scroll (`autoplay: onScroll({ sync: true })`) el estado es una función exacta de la posición: al subir, todo vuelve por el mismo camino, sin saltos ni estados que dependan de qué pasó antes.
2. **Escalonado (stagger) en lugar de todo a la vez.** Cuando varios elementos cambian, cada uno arranca con un retraso corto y creciente (decenas de ms) o con una variación de valor (por ejemplo escala de 1,1 a 0,75). Nunca se mueve un grupo entero en bloque.
3. **Easing con carácter, no lineal ni el "ease" por defecto.** Se usan curvas `inOutExpo`, `inOutQuad` o `inOut(3)`: arranque y frenado marcados, con el tramo del medio rápido. Un movimiento nunca arranca ni frena en seco.
4. **Resortes en lo que se suelta o se cambia.** Lo que termina un gesto (soltar, cambiar de elemento) vuelve con un resorte (`createSpring`, rigidez ~120): pasa levemente de largo y se asienta, no se detiene en un tween plano.
5. **Secuencias con un solo hilo (timeline).** Las piezas relacionadas se encadenan con posiciones relativas (`'<'`, `'-='`): una empieza mientras la anterior termina, de modo que se lee como un único gesto en vez de varios independientes.
6. **Solo se animan transformaciones y opacidad.** Los movimientos usan `x`, `y`, `scale`, `rotate` y `opacity` (transformaciones CSS individuales); nada anima tamaño de caja ni posición con `top/left`.
7. **El estado actual siempre está a la vista.** La página muestra un indicador del progreso (la regla con marcas abajo a la derecha de la home): quien mira sabe en qué punto de la animación está.
8. **Menos es más en peso:** ~25 KB para toda la librería y se importa por módulos. Cualquier mejora que pidamos debe poder hacerse sin sumar más que eso.

**Fuente:** páginas animejs.com y animejs.com/documentation leídas y una captura de la home (escena 3D ligada al scroll con regla de progreso). Los puntos 3 a 5 vienen de los ejemplos de código de la home; no pude ver el movimiento en vivo, solo cuadros.
