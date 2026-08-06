# emma-core

Núcleo de **EmmaJS**: un microframework de arquitectura modular para React. Agrupa el enrutamiento declarativo (sobre react-router), el estado global (sobre zustand) y el CLI `emma`, todo bajo una API propia con la marca `Emma` / `useEmma*`.

## Características

- **Rutas declarativas**: componentes `EmmaRouter`, `EmmaRoutes`, `EmmaLink`, `EmmaNavLink` y `EmmaNavigate` sobre react-router.
- **Estado global ligero**: `createEmmaStore` sobre zustand.
- **Arquitectura modular**: módulos autocontenidos en `src/modules`, cada uno con sus páginas, componentes, hooks, servicios, rutas y store.
- **CLI generador**: `emma generate module|page|component|guard`.
- **Auto-rutas**: las rutas de `src/modules/**/routes/index.{ts,tsx}` se registran automáticamente con `import.meta.glob`.

## Instalación

`emma-core` es un paquete de solo runtime. React, react-router y zustand son dependencias pares (`peerDependencies`) que debes instalar en tu proyecto:

```bash
npm install emma-core react react-dom react-router zustand
```

**Requisitos**

| Dependencia | Versión |
|---|---|
| Node.js | >= 22.22.0 |
| React | >= 19.2.7 |
| react-router | ^8.3.0 |
| zustand | ^5.0.0 |

## Uso rápido

### 1. Definir rutas

```tsx
// src/App.tsx
import { EmmaRouter, EmmaRoutes } from 'emma-core';
import type { EmmaRoute } from 'emma-core';
import HomePage from './pages/HomePage';
import NotFoundPage from './shared/pages/NotFoundPage';

const routes: EmmaRoute[] = [
  { path: '/', element: <HomePage /> },
  { path: '*', element: <NotFoundPage /> },
];

export default function App() {
  return (
    <EmmaRouter>
      <EmmaRoutes routes={routes} />
    </EmmaRouter>
  );
}
```

### 2. Navegación

```tsx
import { EmmaLink, EmmaNavLink, useEmmaNavigate } from 'emma-core';

export function Nav() {
  const navigate = useEmmaNavigate();

  return (
    <nav>
      <EmmaLink to="/">Inicio</EmmaLink>
      <EmmaNavLink to="/shop" end>Tienda</EmmaNavLink>
      <button onClick={() => navigate('/login')}>Entrar</button>
    </nav>
  );
}
```

### 3. Estado global

```tsx
import { createEmmaStore } from 'emma-core';

interface CounterState {
  count: number;
  increment: () => void;
}

const useCounterStore = createEmmaStore<CounterState>()((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

export function Counter() {
  const count = useCounterStore((s) => s.count);
  return (
    <button onClick={() => useCounterStore.getState().increment()}>{count}</button>
  );
}
```

### 4. Información de la ruta actual

```tsx
import { useEmmaRoute, useEmmaNavLink, useEmmaParams } from 'emma-core';

export function ProductoPage() {
  const route = useEmmaRoute();            // { pathname, params, query }
  const { isActive } = useEmmaNavLink('/shop', { end: true });
  const params = useEmmaParams();          // parámetros dinámicos de la URL

  return <p>{route.pathname} — {params.id}</p>;
}
```

### 5. Rutas anidadas y layouts protegidos

`EmmaRoutes` soporta `children` e `index` (como `RouteObject`). Envuelve **una vez** una ruta padre con un guard/layout y todos los hijos heredan la protección:

```tsx
// src/App.tsx
import { EmmaRouter, EmmaRoutes, EmmaOutlet } from 'emma-core';
import type { EmmaRoute } from 'emma-core';
import RequireAuth from './shared/guards/RequireAuth';
import AdminLayout from './modules/admin/components/AdminLayout';

const routes: EmmaRoute[] = [
  { path: '/', element: <HomePage /> },
  {
    path: '/admin',
    element: (
      <RequireAuth roles={['admin']}>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'reports', element: <AdminReports /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];

export default function App() {
  return (
    <EmmaRouter>
      <EmmaRoutes routes={routes} />
    </EmmaRouter>
  );
}
```

El layout debe renderizar `<EmmaOutlet />` en el punto donde se inserta el hijo de la ruta actual:

```tsx
// AdminLayout.tsx
import { EmmaOutlet } from 'emma-core';

export default function AdminLayout() {
  return (
    <div>
      <nav>...</nav>
      <main>
        <EmmaOutlet />
      </main>
    </div>
  );
}
```

Así no repites el guard por cada ruta: `/admin`, `/admin/users` y `/admin/reports` quedan protegidas con una sola declaración.

## API

### Componentes

| Componente | Descripción |
|---|---|
| `EmmaRouter` | Proveedor de enrutamiento (`BrowserRouter`). |
| `EmmaRoutes` | Renderiza un arreglo de `EmmaRoute[]`, con soporte de rutas anidadas. |
| `EmmaLink` | Enlace declarativo (`Link`). |
| `EmmaNavLink` | Enlace con estado activo (`NavLink`). |
| `EmmaNavigate` | Redirección declarativa (`Navigate`). |
| `EmmaOutlet` | Renderiza el hijo de la ruta actual (para rutas anidadas / layouts). |

### Hooks

| Hook | Descripción |
|---|---|
| `useEmmaRoute` | Devuelve `{ pathname, params, query }` de la ruta actual. |
| `useEmmaNavLink(to, { end })` | Devuelve `{ isActive }` para enlaces. |
| `useEmmaNavigate` | Navegación imperativa. |
| `useEmmaParams` | Parámetros dinámicos de la URL. |
| `useEmmaSearchParams` | Parámetros de la query string. |
| `useEmmaLocation` | Objeto `location` de la ruta actual. |
| `useEmmaRoutes` | Configuración de rutas. |

### Estado global

| Función | Descripción |
|---|---|
| `createEmmaStore` | Crea un store de zustand; devuelve un hook que se usa directamente con un selector: `useMiStore((s) => s.campo)`. |

### Tipos

| Tipo | Descripción |
|---|---|
| `EmmaRoute` | `RouteObject` de react-router. |

## CLI

El binario `emma` se instala en `node_modules/.bin` (no está en el PATH de la terminal). Invícalo con `npx` dentro de tu proyecto:

```bash
npx emma generate module <nombre>        # módulo completo con ejemplo
npx emma generate page <Pagina> <modulo> # página dentro de un módulo
npx emma generate component <Nombre>     # componente compartido (src/shared/components)
npx emma generate guard <Nombre>         # guard de acceso + authStore
```

Si prefieres escribir `emma ...` directamente, instálalo de forma global (`npm install -g emma-core`). Ten en cuenta que la instalación global también instala los `peerDependencies` (`react`, `react-dom`, `react-router`, `zustand`).

### Estructura que genera `emma generate module`

```
src/modules/<nombre>/
├── pages/<Nombre>Page.tsx               # página de ejemplo
├── components/<Nombre>Card.tsx          # componente de ejemplo (Tailwind o CSS)
├── components/<nombre>Card.css          # solo si el proyecto no usa Tailwind
├── hooks/use<Nombre>PageController.tsx  # hook controlador (useState + servicio)
├── services/<nombre>Service.ts          # llamadas a APIs externas
├── routes/index.tsx                     # rutas del módulo (auto-registradas)
└── store/<nombre>Store.ts               # store de zustand
```

Los componentes de ejemplo se generan con **Tailwind CSS** si el proyecto lo detecta (`tailwindcss` en `globals.css` o `package.json`); si no, se generan con CSS vanilla en un archivo `.css` co-ubicado.

### Guards

`emma generate guard RequireAuth` crea `src/shared/guards/RequireAuth.tsx` y, si no existe, `src/shared/stores/authStore.ts`. Sirve para proteger rutas según sesión y roles:

```tsx
import RequireAuth from '../shared/guards/RequireAuth';

const routes: EmmaRoute[] = [
  {
    path: '/admin',
    element: (
      <RequireAuth roles={['admin']}>
        <AdminPage />
      </RequireAuth>
    ),
  },
];
```

Comportamiento:
- Sin sesión activa → redirige a `/login`.
- Con sesión pero sin el rol requerido → redirige a `/forbidden`.
- Autorizado → renderiza el contenido.

## Arquitectura del proyecto

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
    ├── pages/                  # NotFoundPage (404), ForbiddenPage (403)
    ├── guards/
    ├── hooks/
    ├── stores/
    └── utils/
```

Las rutas de los módulos (`import.meta.glob`) se combinan con las rutas definidas en `App.tsx`, donde el catch-all `path: "*"` muestra la página 404.

## Licencia

ISC
