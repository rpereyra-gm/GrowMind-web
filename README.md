# GrowMind — sitio web

Sitio estático (HTML/CSS/JS puro, sin backend ni dependencias) que reemplaza la web de Wix. Se aloja gratis en GitHub Pages.

## Estructura

```
index.html        página única con todas las secciones (Home, Servicios, FAQs, Contacto)
assets/style.css  estilos
assets/script.js  menú mobile + año del footer
assets/favicon.svg
CNAME             dominio propio (growmind.com.ar) para GitHub Pages
```

El contacto no usa formulario: el botón "Escribinos por WhatsApp" abre un chat directo al +54 341 275 3301, y también están el mail y el teléfono como enlaces clickeables.

## Cómo ver el sitio en local

```
python3 -m http.server 8000
```

y abrir `http://localhost:8000`.

## Cómo publicarlo gratis en GitHub Pages

1. Mergear esta rama a la rama principal del repo (`main`).
2. En GitHub: **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**, elegir la rama `main` y carpeta `/ (root)`. Guardar.
3. GitHub va a publicar el sitio en `https://<usuario>.github.io/GrowMind-web/` en un par de minutos.
4. Para que se vea en **growmind.com.ar** (dominio propio, ya incluido en el archivo `CNAME`):
   - En el panel DNS de donde compraste el dominio, crear un registro **A** apuntando `@` a las IPs de GitHub Pages:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Y un registro **CNAME** para `www` apuntando a `<usuario>.github.io`.
   - En **Settings → Pages** de GitHub, escribir `growmind.com.ar` en "Custom domain" y tildar "Enforce HTTPS" una vez que el certificado esté listo (puede tardar hasta 24 hs).
5. Recién cuando el dominio nuevo esté funcionando y verificado, cancelar el plan de Wix (así no se corta el sitio mientras se propaga el DNS).

## Editar contenido

Todo el texto está directamente en `index.html`, no hay CMS. Para cambiar un texto, precio o dato de contacto, se edita ese archivo y se hace commit/push; GitHub Pages actualiza el sitio solo.
