# GrowMind web: brief para Claude Code

Rehacer la web de GrowMind (repo `rpereyra-gm/GrowMind-web`, publicada en GitHub Pages) con la estructura, los textos y el diseño de esta carpeta. Todos los textos de la web actual se reemplazan. Por ahora solo escritorio; la versión móvil va en una segunda etapa, pero el código no debería impedirla.

## Qué hay en esta carpeta

| Archivo | Qué es |
| --- | --- |
| `contenido/contenido.md` | Fuente de verdad de los textos, el menú, las imágenes y las decisiones abiertas. Exportado del doc "GrowMind web: contenido v1". |
| `maqueta/maqueta-web.dc.html` | Maqueta de la página completa. Está en el formato de un editor de diseño (etiquetas `x-dc`, `sc-for`, `sc-if` y una clase `Component`): usala como referencia de layout, medidas y comportamiento, no como código para copiar. |
| `prototipos/problemas-y-cierre.html` | Prototipo HTML que funciona: la sección Problemas con scroll y el cierre con el pie. |
| `marca/sistema-de-diseno.md` | Reglas de uso de color, tipografía, espaciado, botones e íconos. |
| `marca/tokens.json` | Colores, escala tipográfica, espaciado, radios y grilla. |
| `marca/logo.md` y `marca/logos/` | Logo en SVG (Regular desde 120 px de ancho, Semibold de 70 a 119 px) y la g provisoria para el favicon. |

## Orden de la página

1. Menú
2. Portada
3. Problemas
4. Diagrama "De lo complejo a lo simple"
5. Servicios
6. Cómo trabajamos
7. Trabajo
8. Preguntas
9. Cierre (Contacto)
10. Pie

Los textos de cada sección están en `contenido/contenido.md`; si la maqueta y el doc no coinciden, manda el doc.

## Comportamiento a construir

- **Menú.** Logo a la izquierda, píldora centrada con fondo translúcido y desenfoque detrás (`backdrop-filter`) y el botón secundario "Agendar reunión" a la derecha. Queda fijo arriba. El enlace de la sección visible se marca en petróleo con texto blanco.
- **Problemas.** La sección queda fija mientras se scrollea y las cinco frases pasan una por vuelta de scroll. El movimiento buscado es el de las caras de un cubo que gira en vertical: la arista se acerca, deforma la frase que sale y la que entra, y al alejarse la nueva queda derecha. El prototipo tiene una versión más simple (inclinación y desvanecido): reemplazala por el giro 3D. Con `prefers-reduced-motion`, las frases van una debajo de otra sin animación.
- **Servicios.** La sección queda fija y el listado de servicios aparece tres veces seguidas. El scroll mueve el listado hacia arriba y el servicio que llega al centro de la pantalla queda en foco. Los tonos son tinta en el foco, petróleo 600 en los dos vecinos y petróleo 200 en el resto. Se ve la copia del medio y un poco de las otras dos, que son transparentes hasta que el scroll llega a ellas. Un marcador cuadrado chico va al lado del foco. Al pasar el puntero sobre un servicio aparece una ficha blanca que sigue al puntero, con la línea (Ordenar, Vender o Medir), qué es y qué cambia para vos. La etiqueta de la izquierda queda a la altura del foco. Las copias de arriba y abajo se ocultan a lectores de pantalla. El movimiento tiene que ser continuo y suave, sin saltos entre ítems.
- **Preguntas.** Acordeón con la primera abierta.
- **Cierre y pie.** Igual que el prototipo y la maqueta: frase grande sobre petróleo con tres columnas, y pie en tinta con logo grande, "Trabajemos juntos", "Mapa del sitio", "Volver arriba" y copyright.

## Reglas de marca que más se rompen

- Un solo color, el petróleo #1B5355, en siete tonos. No hay color de acento.
- Un solo botón principal por pantalla.
- `petroleo-600` (#338284) solo en texto de 24 px o más; `petroleo-400` nunca en texto chico.
- Britti Sans para textos cortos y grandes, Inter para textos largos o chicos. Britti Sans todavía no está disponible con acentos: usá Inter como reemplazo y dejá la familia preparada para sumarla.
- Íconos: Tabler Icons en línea de 1,5 px (list-check, shopping-cart, chart-bar, calendar, brand-whatsapp, arrow-up-right, chevron-up, chevron-down).
- El logo se usa desde los SVG, nunca escrito con una fuente.

## Huecos que quedan marcados

Estos datos no existen todavía. Dejalos visibles entre corchetes, sin inventar nada:

- Casos de Trabajo (imágenes, problema y dato real de qué cambió).
- Horario de atención.
- Enlaces de Instagram y LinkedIn.
- Cifras del tablero de la portada.
- Imagen para compartir el link (1200 × 630 px).

Contacto principal: WhatsApp +54 341 275 3301, con el mensaje "Hola GrowMind, quiero agendar una reunión".
