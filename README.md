# EmmaJS

**Microframework de arquitectura modular para React.** EmmaJS agrupa el enrutamiento declarativo (sobre react-router), el estado global (sobre zustand) y un generador de código, todo bajo una API propia con la marca `Emma` / `useEmma*`.

EmmaJS organiza tu aplicación en **módulos autocontenidos**: cada módulo tiene sus páginas, componentes, hooks, servicios, rutas y store. Las rutas se registran automáticamente (`import.meta.glob`) y el CLI genera el código de ejemplo listo para usar.

**Publicado en npm:** [`emma-core`](https://www.npmjs.com/package/emma-core) y [`create-emma-app`](https://www.npmjs.com/package/create-emma-app).

## Repositorio

Este es un monorepo (npm workspaces) con dos paquetes:

| Paquete | Descripción |
|---|---|
| [`emma-core`](./packages/emma-core) | Runtime del microframework (rutas, estado, hooks) + CLI `emma generate`. |
| [`create-emma-app`](./packages/create-emma-app) | Generador de proyectos: crea una app React + Vite con arquitectura modular. |

Cada paquete tiene su propio README con documentación detallada.

## Requisitos

- Node.js >= 22.22.0
- React >= 19.2.7, react-router ^8.3.0, zustand ^5.0.0

## Inicio rápido

```bash
# 1. Crea un proyecto (usa @latest para evitar la versión cacheada por npm)
npx create-emma-app@latest

# 2. Entra y arranca el servidor de desarrollo
cd <tu-proyecto>
npm run dev

# 3. Genera un módulo con el CLI
npx emma generate module shop
```

La app generada queda lista para escalar: `App.tsx` solo define las rutas (raíz, auto-rutas de módulos y 404), la landing vive en `src/shared/pages/LandingPage.tsx` y el estado de ejemplo en `src/shared/stores/counterStore.ts`.

## Desarrollo local (monorepo)

```bash
npm install          # instala los workspaces
npm run build        # compila los dos paquetes
npm run lint         # ejecuta ESLint
```

## Arquitectura

```
src/
├── modules/                    # módulos autocontenidos
│   └── <modulo>/
│       ├── pages/              # páginas del módulo
│       ├── components/         # componentes del módulo
│       ├── hooks/              # lógica reutilizable (controllers)
│       ├── services/           # llamadas a APIs externas
│       ├── routes/             # index.ts se auto-registra
│       └── store/              # estado global del módulo
└── shared/                     # código compartido
    ├── components/
    ├── pages/                  # LandingPage, NotFoundPage (404), ForbiddenPage (403)
    ├── guards/                 # p. ej. RequireAuth (protege rutas y layouts)
    ├── hooks/
    ├── stores/                 # p. ej. counterStore, authStore
    └── utils/
```

`EmmaRoutes` soporta **rutas anidadas** (`children` e `index`): envuelve una vez una ruta padre con un guard o layout y todos los hijos heredan la protección, renderizando el contenido con `EmmaOutlet`.

## CLI

```bash
npx emma generate module <nombre>            # módulo completo con ejemplo
npx emma generate page <Pagina> <modulo>     # página dentro de un módulo
npx emma generate component <Nombre>         # componente compartido
npx emma generate guard <Nombre>             # guard de acceso + authStore
```

## Licencia

ISC
