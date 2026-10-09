# 🧁 RecetApp - Dessert and Snack Recipes

Web app to discover dessert and sweet or savory snack recipes.

## Requirements

- Web browser (Chrome, Firefox, Edge, Safari)
- Internet connection

## How to use

1. Open `index.html` in your browser (or visit the published link)
2. Type your name and press "Start cooking"
3. Select a category: Desserts, Sweet Snacks or Savory Snacks
4. Pick the ingredients you have available
5. Adjust the filters (time, difficulty, servings, cuisine)
6. Tap "Search recipes" to see the best matches
7. Tap a recipe to see ingredients, steps and video

## Features

- **Bilingual (EN/ES)**: English by default, switch to Spanish with the ES/EN button (top corner). The choice is saved.
- **Ingredient selection**: pick what you have and the app finds recipes that use them
- **Advanced filters**: time, difficulty, servings, cuisine style (16 cuisines)
- **Automatic translation**: in Spanish mode, recipes are translated via API; in English mode the original text is shown
- **Favorites**: save recipes you like in "My Kitchen"
- **Dark mode**: switch between light and dark theme (saved)
- **Surprise Me**: get a random recipe

## File structure

```
recetapp/
├── index.html            ← Main file (open this)
├── README.md             ← This file
├── css/
│   └── styles.css        ← App styles + dark mode + language button
└── js/
    ├── i18n.js           ← English/Spanish dictionary and language logic
    ├── api.js            ← TheMealDB connection (with cache)
    ├── algoritmo.js      ← Recommendation engine
    ├── auth.js           ← User system (localStorage)
    ├── favoritos.js      ← Saved recipes (localStorage)
    └── traduccion.js     ← EN→ES translation (MyMemory API + local fallback)
```

## Technologies

- HTML5, CSS3, vanilla JavaScript
- API: TheMealDB (recipes, ~168 desserts)
- API: MyMemory (translation, free tier)
- Storage: browser localStorage (user, favorites, translations, theme, language)
- Hosting: GitHub Pages (free)

## Notes

- No server or installation required
- Data is stored in your browser (per device)
- Works on mobile and desktop (responsive)
- Internet required to load recipes
- `assets/` folder is empty and optional

---

# 🧁 RecetApp - Recetas de Postres y Piqueos

Aplicación web para descubrir recetas de postres y piqueos dulces o salados.

## Requisitos

- Navegador web (Chrome, Firefox, Edge, Safari)
- Conexión a internet

## Cómo usar

1. Abre el archivo `index.html` en tu navegador (o visita el enlace publicado)
2. Escribe tu nombre y presiona "Comenzar a cocinar"
3. Selecciona una categoría: Postres, Piqueo Dulce o Piqueo Salado
4. Elige los ingredientes que tengas disponibles
5. Ajusta los filtros (tiempo, dificultad, porciones, cocina)
6. Toca "Buscar recetas" y verás las mejores opciones
7. Toca una receta para ver ingredientes, pasos y video

## Funcionalidades

- **Bilingüe (EN/ES)**: inglés por defecto, cambia a español con el botón ES/EN (esquina superior). La elección se guarda.
- **Selección por ingredientes**: elige lo que tienes y la app busca recetas que los usen
- **Filtros avanzados**: tiempo, dificultad, porciones, estilo de cocina (16 cocinas)
- **Traducción automática**: en modo español las recetas se traducen con la API; en modo inglés se muestra el texto original
- **Favoritos**: guarda recetas en "Mi Cocina"
- **Modo oscuro**: cambia entre tema claro y oscuro (se guarda)
- **Surprise Me**: recibe una receta aleatoria

## Estructura de archivos

```
recetapp/
├── index.html            ← Archivo principal (abrir este)
├── README.md             ← Este archivo
├── css/
│   └── styles.css        ← Estilos + modo oscuro + botón de idioma
└── js/
    ├── i18n.js           ← Diccionario inglés/español y lógica de idioma
    ├── api.js            ← Conexión con TheMealDB (con caché)
    ├── algoritmo.js      ← Motor de recomendación
    ├── auth.js           ← Sistema de usuario (localStorage)
    ├── favoritos.js      ← Recetas guardadas (localStorage)
    └── traduccion.js     ← Traducción EN→ES (API MyMemory + respaldo local)
```

## Tecnologías

- HTML5, CSS3, JavaScript vanilla
- API: TheMealDB (recetas, ~168 postres)
- API: MyMemory (traducción, plan gratuito)
- Almacenamiento: localStorage del navegador (usuario, favoritos, traducciones, tema, idioma)
- Hosting: GitHub Pages (gratis)

## Notas

- No requiere servidor ni instalación
- Los datos se guardan en tu navegador (por dispositivo)
- Funciona en celular y escritorio (responsive)
- Requiere internet para cargar recetas
- La carpeta `assets/` está vacía y es opcional
