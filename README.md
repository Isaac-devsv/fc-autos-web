# FC Autos — sitio web

## Ver el sitio
Clic derecho en `index.html` → **Open with Live Server**.
Las páginas quedan en:

- `/` Inicio
- `/categorias/`
- `/como-funciona/`
- `/nosotros/`
- `/preguntas/`

## Dónde cambiar cada cosa
- **WhatsApp, correo y redes:** `js/contacto.js`
- **Textos de cada página:** el `index.html` de su carpeta
- **Colores y estilos:** `css/estilos.css` y `tailwind.config.js`
- **Fotos de la marca:** `assets/img/fotos/` (versión grande y `-sm` para celular)
- **Pantalla de carga (tacómetro 0–120 km/h):** `css/cargador.css` y `js/cargador.js`. El tiempo mínimo se cambia en `DURACION_MINIMA`.

## Estilos
El sitio usa Tailwind. Si agregas clases nuevas, compila el CSS:

```
npm install
npm run css
```

`css/sitio.css` es el archivo generado; no lo edites a mano.
