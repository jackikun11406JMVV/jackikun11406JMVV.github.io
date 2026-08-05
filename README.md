# Web oficial de Juan Manuel Vela Vacas

Sitio estático multilingüe (español, inglés y francés) publicado con GitHub Pages:
[jackikun11406jmvv.github.io](https://jackikun11406jmvv.github.io/).

## Comprobación antes de publicar

```bash
python3 scripts/check_site.py
node --check index.js
node --check animations.js
```

El verificador comprueba las 15 páginas publicables, enlaces y recursos locales,
idiomas, canonical, hreflang, robots, sitemap, imágenes, datos estructurados y
enlaces de compra. GitHub Actions ejecuta estas pruebas en cada subida.

Para revisar la web en local:

```bash
python3 -m http.server 8000
```

Después, abre `http://localhost:8000/`.

## Archivos que no deben eliminarse

- `.nojekyll`, para servir la web estática sin transformaciones de Jekyll.
- `googlea2bd5ce5aa4a9e4c.html`, para mantener la verificación de Google.
- `robots.txt` y `sitemap.xml`, para rastreo e indexación.
- `jara.html` y `perez.html`, que conservan enlaces antiguos mediante redirecciones.
- `.github/workflows/quality-checks.yml`, que evita publicar una versión rota.
