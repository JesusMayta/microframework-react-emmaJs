# create-emma-app

Generador oficial de proyectos **EmmaJS**. Crea un proyecto React 19 + Vite + TypeScript con arquitectura modular, una landing de presentación con la identidad EmmaJS y las páginas 404/403 listas para usar.

## Uso

Para obtener siempre la última versión del CLI, usa `@latest`:

```bash
npx create-emma-app@latest
```

También funciona con:

```bash
npm create emma-app@latest
```

> **Importante:** `npx create-emma-app` (sin `@latest`) usa la versión cacheada por npm y **no verifica** si hay una más nueva. Añade siempre `@latest`, o limpia el caché con `npm cache clean --force`, para generar apps con la última versión.

O instalando el CLI de forma global:

```bash
npm install -g create-emma-app@latest
create-emma-app
```

Para actualizar una instalación global existente: `npm install -g create-emma-app@latest`. (`npm update -g` puede quedarse con la versión en caché.)

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
- **Landing de presentación** (`src/shared/pages/LandingPage`) rediseñada con hero, bento de características, demo real de estado global y sección del CLI, con los colores de marca (`#ffdfa9`, `#95bfd2`, `#2b425a`). Se genera en dos versiones equivalentes: Tailwind CSS v4 o CSS vanilla.
- **Store de ejemplo** (`src/shared/stores/counterStore`) creado con `createEmmaStore`.
- **Páginas 404 y 403** (`src/shared/pages`) con fondo ambiental, tarjeta glass, el código de error en degradado y acciones de recuperación, en el mismo lenguaje visual que la landing.
- **`App.tsx` solo con enrutamiento**: rutas raíz, auto-rutas de módulos y comodín 404.
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
│   ├── pages/              # LandingPage, NotFoundPage (404), ForbiddenPage (403)
│   ├── stores/             # counterStore (ejemplo con createEmmaStore)
│   └── utils/
└── styles/
    ├── globals.css
    ├── landing.css         # solo sin Tailwind
    └── pages.css           # solo sin Tailwind
```

## Generar código con `emma`

Dentro del proyecto generado, el CLI `emma` (instalado junto con emma-core) te permite generar código. El binario se instala en `node_modules/.bin`, que **no está en el PATH** de tu terminal, así que debes invocarlo con `npx`:

```bash
npx emma generate module shop          # módulo completo con ejemplo
npx emma generate page Producto shop   # página dentro de un módulo
npx emma generate component Header     # componente compartido
npx emma generate guard RequireAuth    # guard de acceso
```

> `npx emma ...` ejecuta el binario local del proyecto. No necesitas instalar nada más.

### ¿Usar `emma` sin `npx`?

Si prefieres escribir directamente `emma generate ...`, instala el CLI de forma global:

```bash
npm install -g emma-core
```

> Nota: la instalación global también instala los `peerDependencies` de emma-core (`react`, `react-dom`, `react-router`, `zustand`) en el entorno global, aunque el CLI no los necesita para generar código. Si no quieres eso, usa `npx emma ...`.

## Documentación

Para la API completa del runtime (rutas, estado global, hooks) y la estructura de módulos, consulta el README de [emma-core](../emma-core/README.md).

## Licencia

ISC
