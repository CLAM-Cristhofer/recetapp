# 🧁 RecetApp - Recetas de Postres y Piqueos

Aplicación web para descubrir recetas de postres y piqueos dulces o salados.

## Requisitos

- Navegador web (Chrome, Firefox, Edge, Safari)
- Conexión a internet

## Cómo usar

1. Abre el archivo `app.html` en tu navegador
2. Escribe tu nombre y presiona "Comenzar a cocinar"
3. Selecciona una categoría: Postres, Piqueo Dulce o Piqueo Salado
4. Elige los ingredientes que tengas disponibles
5. Ajusta los filtros (tiempo, dificultad, porciones, cocina)
6. Toca "Buscar recetas" y verás las mejores opciones
7. Toca una receta para ver ingredientes, pasos y video

## Funcionalidades

- **Selección por ingredientes**: Elige lo que tienes y la app busca recetas que los usen
- **Filtros avanzados**: Tiempo, dificultad, porciones, estilo de cocina
- **Traducción**: Las recetas se traducen automáticamente al español
- **Favoritos**: Guarda recetas que te gusten para consultarlas después
- **Modo oscuro**: Cambia entre tema claro y oscuro
- **Surprise Me**: Recibe una receta aleatoria

## Estructura de archivos

```
recetapp/
├── app.html              ← Archivo principal (abrir este)
├── README.md             ← Este archivo
├── css/
│   └── styles.css        ← Estilos de la aplicación
└── js/
    ├── api.js            ← Conexión con TheMealDB
    ├── algoritmo.js      ← Motor de recomendación
    ├── auth.js           ← Sistema de usuario
    ├── favoritos.js      ← Guardado de recetas
    └── traduccion.js     ← Traducción EN→ES
```

## Tecnologías

- HTML5, CSS3, JavaScript vanilla
- API: TheMealDB (recetas)
- API: MyMemory (traducción)
- Almacenamiento: localStorage del navegador

## Notas

- No requiere servidor ni instalación
- Los datos se guardan en tu navegador
- Funciona en celular y escritorio
- Requiere internet para cargar recetas
