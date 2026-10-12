GrowMind ayuda a emprendedores y PYMEs a ordenar lo digital para vender mejor, de forma simple y eficiente. Es una marca agencia: el nombre va al frente y las personas quedan en segundo plano. Escribí el nombre como **GrowMind** en los textos y usá el logo "growmind", en minúsculas, en las piezas.

Su frase principal es **"De lo complejo a lo simple"**, para portadas, la web y contenido. Su descriptor es **"Sistemas simples para negocios que crecen"**, para la bio de Instagram y LinkedIn y debajo del logo. Sus dos valores son **ayudar** y **ser eficiente**.

## Cómo usar este sistema

- **Pintá siempre con tokens**, nunca con colores sueltos. El único color de la marca es el petróleo (`petroleo-800`) y su escala; no hay color de acento.
- **La jerarquía se logra con contraste y tamaño, no con color.** El botón principal es `action` con `on-action`; es lo de mayor contraste de la vista, y hay uno solo por pantalla o pieza.
- **Texto principal:** `ink` sobre `surface`. Texto chico sobre claro: `ink-secondary` o `ink`. No uses `petroleo-600` en texto chico (llega a 4,2 a 1) ni `petroleo-400` sobre petróleo (3,4 a 1).
- **Tipografía:** Britti Sans cuando es corto y grande (`titulo`, `cifra`, `bajada`) e Inter cuando es largo o chico (`parrafo`, `tabla`, `boton`, `etiqueta`, `ejes`). Britti Sans no está cargada en este sistema: se ve con Inter hasta que se suban los archivos completos a `fonts/`.
- **Espaciado:** todo sale de la escala de 4 px (`space-1` a `space-24`). Los botones y campos miden al menos `control-h`.
- **Formas:** `radius-md` en botones y campos, `radius-lg` en tarjetas, `radius-xl` en imágenes y paneles.
- **Estados:** usá `ok`, `warn`, `error` e `info` solo para comunicar un estado, siempre con ícono y texto.
- **Logo:** copiá los archivos del grupo Logos; no lo redibujes ni lo escribas con texto. Las reglas están en la sección Logo.

## Contenido

GrowMind habla **cercano, calmo y directo**, con voseo. Es la misma voz en todos los canales: más cálida en redes, más ordenada en propuestas y reportes.

- **Cercano:** hablá como un socio, no como un proveedor. Ejemplo real: "Si tu tienda te pide más tiempo del que te devuelve, lo ordenamos."
- **Calmo:** sin urgencia artificial ni promesas exageradas. Ejemplo: "Vamos de a un proceso por vez."
- **Directo:** frases cortas, una idea por frase. Ejemplo: "Primero ordenamos tus datos. Después automatizamos."
- Hablá de "nosotros" cuando es la marca y de "vos" para el cliente.
- Explicá en simple: si hay un término técnico, decí qué es en una línea. Decí qué cambia para el cliente, no qué herramienta usamos.
- Escribí en sentence case. Evitá los signos de exclamación en exceso y las promesas de resultados que no se puedan medir.
- Los botones llevan un verbo: "Hablemos", "Agendar reunión", "Ver propuesta".

## Fundamentos visuales

**Color.** Un solo color, el petróleo verdoso `petroleo-800` (#1B5355), en siete tonos. Los fondos claros usan `surface` (`petroleo-50`) y las tarjetas `surface-card`. Los fondos oscuros usan el tema Petróleo, donde `surface` pasa a petroleo-800 y el texto a `ink`.

**Tipografía.** Los títulos van en Britti Sans Semibold (`titulo`, 50 px) y las cifras destacadas en `cifra` (54 px). Los párrafos van en Inter Regular (`parrafo`, 18 px) y las tablas con números tabulares (`tabla`, 15 px). Las etiquetas van en 14 px y los textos de gráficos en 12 px como mínimo.

**Espaciado y grilla.** Entre un ícono y su texto, `space-2`. Padding de tarjetas, `space-6`. Entre secciones de una página, `space-16` en móvil y `space-24` en escritorio. La web usa 12 columnas con contenido de hasta `container-max`, `gutter` entre columnas y márgenes de `margin-mobile` y `margin-desktop`. Las piezas de Instagram miden `ig-width` por `ig-height` con un margen seguro de `ig-safe`, y los PDF en A4 usan márgenes de `a4-margin`.

**Fondos y bordes.** Fondos claros con mucho aire. Sin sombras fuertes ni degradados. Las tarjetas llevan un borde fino de `petroleo-100`.

**Imágenes.** El contenido mezcla fotos reales de trabajo y resultados, gráficos o formas abstractas y mockups de pantallas y dashboards. Para que parezcan de una misma marca, todas comparten un tratamiento: esquinas de `radius-xl`, fondos y velos en tonos de la escala petróleo y ningún color ajeno. Los mockups de dashboards van sobre `surface` o sobre petróleo, con tarjetas de `radius-lg`. Sobre fotos, el logo necesita un velo petróleo que asegure un contraste de 4,5 a 1.

**Gráficos.** Un color de énfasis (`chart-emphasis`) y el resto atenuado (`chart-muted`), con el valor escrito sobre cada barra. Hasta tres series (`chart-emphasis`, `chart-2`, `chart-muted`). Líneas guía en `chart-grid`. Las variaciones positivas y negativas usan `ok-fill` y `error-fill`.

**Estados.** Cada estado tiene texto, fondo y relleno (`ok-text`, `ok-bg`, `ok-fill`, y lo mismo para `warn`, `error` e `info`). El contraste entre texto y fondo es de 5,6 a 1 o más.

## Iconografía

Usá los íconos del grupo Iconos, de Tabler Icons (licencia MIT), en su versión de línea: trazo fino de 1,5 px sobre una grilla de 24 px, con terminaciones y uniones redondeadas y sin relleno. Los íconos toman el color del texto que acompañan: petróleo sobre claro y blanco sobre oscuro. Solo cambian de color en los estados. Los tamaños son 16 px junto a texto chico, 20 px en botones y listas, y 24 px en tarjetas y encabezados. Ejemplos de uso: ordenar (`list-check`), vender (`shopping-cart`), medir (`chart-bar`), agendar (`calendar`), email (`mail`) y WhatsApp (`brand-whatsapp`).
