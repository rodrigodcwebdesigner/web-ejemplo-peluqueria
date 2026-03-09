# Peluqueria Demo

Estructura recomendada del proyecto para mantenerlo simple y escalable.

## Árbol de carpetas

```text
peluqueria-demo/
├─ index.html
├─ robots.txt
├─ sitemap.xml
├─ README.md
└─ assets/
   ├─ css/
   │  └─ styles.css
   ├─ js/
   │  └─ main.js
   └─ images/
      └─ brand/
         └─ seo-og.svg
```

## Reglas de organización

- `index.html`: solo estructura y contenido semántico.
- `assets/css/styles.css`: estilos globales del sitio.
- `assets/js/main.js`: interacciones de la demo.
- `assets/images/brand/`: recursos visuales de marca/SEO.
- `robots.txt` y `sitemap.xml`: en raíz para hosting estático.

## Publicación en GitHub Pages

1. Subir esta carpeta tal cual al repositorio.
2. Activar GitHub Pages en la rama principal.
3. Actualizar `sitemap.xml` con el dominio real de publicación.
