# create-emma-app

Generador oficial de proyectos **EmmaJS**. Crea un proyecto React 19 + Vite + TypeScript con arquitectura modular, una landing de presentación con la identidad EmmaJS y las páginas 404/403 listas para usar.

## Uso

```bash
npx create-emma-app
```

También funciona con:

```bash
npm create emma-app
```

O instalando el CLI de forma global:

```bash
npm install -g create-emma-app
create-emma-app
```

## Preguntas interactivas

| Pregunta                   | Descripción                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------- |
| **Project name**           | Nombre de la carpeta y del proyecto (por defecto `my-emma-app`).                      |
| **¿Usar Tailwind CSS?**    | `s` → proyecto con TailwindCSS v4; `n` → estilos CSS vanilla con la misma apariencia. |
| **¿Ejecutar npm install?** | Instala las dependencias automáticamente al terminar.                                 |

Al finalizar, el CLI te indica los siguientes pasos:

```bash
cd <tu-proyecto>
npm run dev
```

## Comandos del proyecto generado

| Comando           | Descripción                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo (Vite).                   |
| `npm run build`   | Compilación de producción (`tsc && vite build`). |
| `npm run preview` | Previsualización del build de producción.        |

## Qué incluye

- **React 19 + Vite + TypeScript** con configuración lista (tsconfig, vite.config).
- **emma-core**: el runtime del microframework (rutas, estado global y CLI `emma`).
- **react-router** y **zustand** como dependencias del proyecto.
- **Landing de presentación** con el logo de EmmaJS, los colores de marca (`#ffdfa9`, `#95bfd2`, `#2b425a`) y un demo de estado global.
- **Páginas 404 y 403** (`src/shared/pages`) con el mismo estilo de marca.
- **Favicon** propio (`public/emmaIcon.ico`).
- **Estructura modular** lista para usar:

```
src/
├── assets/                 # emmaLogo.png, reactLogo.webp
├── modules/                # módulos autocontenidos
├── shared/
│   ├── components/
│   ├── guards/
│   ├── hooks/
│   ├── pages/              # NotFoundPage (404), ForbiddenPage (403)
│   ├── stores/
│   └── utils/
└── styles/
    ├── globals.css
    ├── landing.css         # solo sin Tailwind
    └── pages.css           # solo sin Tailwind
```

## Generar código con `emma`

Dentro del proyecto generado, el CLI `emma` (instalado junto con emma-core) te permite generar código:

```bash
emma generate module shop          # módulo completo con ejemplo
emma generate page Producto shop   # página dentro de un módulo
emma generate component Header     # componente compartido
emma generate guard RequireAuth    # guard de acceso
```

## Documentación

Para la API completa del runtime (rutas, estado global, hooks) y la estructura de módulos, consulta el README de [emma-core](../emma-core/README.md).

## Licencia

ISC
