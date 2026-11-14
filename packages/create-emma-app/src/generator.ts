import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Answers {
  projectName: string;
  tailwind: boolean;
};

interface Feature {
  icon: 'routes' | 'state' | 'auto' | 'cli' | 'guard' | 'style';
  accent: 'sky' | 'peach' | 'ink';
  wide: boolean;
  title: string;
  description: string;
  tag: string;
};

const features = (isTailwind: boolean): Feature[] => ([
  {
    icon: 'routes',
    accent: 'sky',
    wide: true,
    title: 'Rutas declarativas',
    description: 'EmmaRoutes sobre React Router 8: rutas anidadas, layouts y EmmaOutlet sin perder nada del router.',
    tag: '<EmmaRoutes />',
  },
  {
    icon: 'state',
    accent: 'peach',
    wide: true,
    title: 'Estado global sin ceremonia',
    description: 'createEmmaStore envuelve Zustand 5 y te entrega un hook listo para usar con selectores, dentro o fuera de un módulo.',
    tag: 'createEmmaStore()',
  },
  {
    icon: 'auto',
    accent: 'ink',
    wide: false,
    title: 'Auto-rutas',
    description: 'Cada módulo registra sus rutas con import.meta.glob. Crear un módulo nunca implica tocar App.tsx.',
    tag: 'import.meta.glob()',
  },
  {
    icon: 'cli',
    accent: 'sky',
    wide: false,
    title: 'CLI generador',
    description: 'Módulos, páginas, componentes y guards completos con un comando. Código listo para editar, no para borrar.',
    tag: 'npx emma generate',
  },
  {
    icon: 'guard',
    accent: 'peach',
    wide: false,
    title: 'Guards y 403/404',
    description: 'RequireAuth protege rutas por sesión y rol. Las páginas de error ya vienen diseñadas con la marca.',
    tag: '<RequireAuth />',
  },
  {
    icon: 'style',
    accent: 'ink',
    wide: false,
    title: isTailwind ? 'Tailwind CSS v4' : 'CSS puro',
    description: isTailwind
      ? 'El generador detecta Tailwind y crea componentes con utilidades, sin archivos CSS sueltos.'
      : 'Sin dependencias de estilo: el generador crea CSS vanilla co-ubicado que siempre compila.',
    tag: isTailwind ? 'tailwindcss' : 'landing.css',
  },
]);

const featureSource = (isTailwind: boolean): string =>
  JSON.stringify(features(isTailwind), null, 2).replace(/\n/g, '\n  ');

const ICON_COMPONENT = `function EmmaIcon({ name }: { name: string }) {
  switch (name) {
    case 'routes':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="5" cy="6" r="2" />
          <circle cx="19" cy="18" r="2" />
          <path d="M7 6h5a4 4 0 0 1 4 4v6" />
        </svg>
      );
    case 'state':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m12 3 8.5 4.25L12 11.5 3.5 7.25 12 3Z" />
          <path d="m3.5 12.25 8.5 4.25 8.5-4.25" />
          <path d="m3.5 16.75 8.5 4.25 8.5-4.25" />
        </svg>
      );
    case 'auto':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13 3 5 14h5.5L11 21l8-11h-5.5L13 3Z" />
        </svg>
      );
    case 'cli':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="m7.5 9.5 3 2.5-3 2.5" />
          <path d="M13 15h4" />
        </svg>
      );
    case 'guard':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3.5 5 6.4v5.1c0 4.2 2.9 7.4 7 8.5 4.1-1.1 7-4.3 7-8.5V6.4l-7-2.9Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3.5c3.2 3.3 6 6.3 6 9.5a6 6 0 0 1-12 0c0-3.2 2.8-6.2 6-9.5Z" />
        </svg>
      );
  }
}`;

const removeStaleJs = (dir: string) => {
  const src = path.join(dir, 'src');
  if (!fs.existsSync(src)) return;

  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        const base = entry.name.slice(0, -3);
        if (
          fs.existsSync(path.join(current, base + '.ts')) ||
          fs.existsSync(path.join(current, base + '.tsx'))
        ) {
          fs.rmSync(full, { force: true });
        }
      }
    }
  };

  walk(src);
};

export const generateProject = (answers: Answers) => {

  const dir = path.resolve(answers.projectName);

  removeStaleJs(dir);

  const folders = [
    'public',
    'src/assets',
    'src/styles',
    'src/modules',
    'src/shared/pages',
    'src/shared/components',
    'src/shared/utils',
    'src/shared/hooks',
    'src/shared/guards',
    'src/shared/stores',
  ];

  for (const f of folders) {
    fs.mkdirSync(path.join(dir, f), { recursive: true });
  };

  const logoSource = path.join(__dirname, '..', 'assets', 'emmaLogo.png');

  if (fs.existsSync(logoSource)) {
    fs.copyFileSync(logoSource, path.join(dir, 'src/assets/emmaLogo.png'));
  };

  const reactLogoSource = path.join(__dirname, '..', 'assets', 'reactLogo.webp');

  if (fs.existsSync(reactLogoSource)) {
    fs.copyFileSync(reactLogoSource, path.join(dir, 'src/assets/reactLogo.webp'));
  };

  const iconSource = path.join(__dirname, '..', 'assets', 'emmaIcon.ico');

  if (fs.existsSync(iconSource)) {
    fs.copyFileSync(iconSource, path.join(dir, 'public/emmaIcon.ico'));
  };

  const emmaCoreDep = '^1.0.0';

  const deps: Record<string, string> = {
    react: '^19.2.7',
    'react-dom': '^19.2.7',
    'react-router': '^8.3.0',
    zustand: '^5.0.0',
    'emma-core': emmaCoreDep,
  };

  const devDeps: Record<string, string> = {
    '@vitejs/plugin-react': '^5.2.0',
    typescript: '^5.7.0',
    vite: '^8.2.0',
    '@types/react': '^19.0.0',
    '@types/react-dom': '^19.0.0',
  };

  if (answers.tailwind) {
    devDeps['tailwindcss'] = '^4.0.0';
    devDeps['@tailwindcss/vite'] = '^4.0.0';
  };

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify(
      {
        name: answers.projectName,
        private: true,
        version: '1.0.0',
        type: 'module',
        author: '',
        engines: {
          node: '>=22.22.0',
        },
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          preview: 'vite preview',
        },
        license: 'ISC',
        dependencies: deps,
        devDependencies: devDeps,
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(dir, '.gitignore'),
    `# Dependencias
node_modules/

# Compilación
dist/
*.tsbuildinfo
*.tgz

# Logs
*.log

# Entorno local
.env
.env.*

# Editor
.vscode/
.idea/

# Sistema
.DS_Store
Thumbs.db
`,
  );

  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        },
        include: ['src'],
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(dir, 'index.html'),
    `
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" type="image/x-icon" href="/emmaIcon.ico" />
          <title>${answers.projectName}</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
      </html>`,
  );

  const tailwindImport = answers.tailwind
    ? `import tailwindcss from "@tailwindcss/vite"`
    : '';

  const tailwindPlugin = answers.tailwind ? 'tailwindcss(),' : '';

  fs.writeFileSync(
    path.join(dir, 'vite.config.ts'),
    `
      import { defineConfig } from "vite";
      import react from "@vitejs/plugin-react";
      ${tailwindImport}

      export default defineConfig({
        plugins: [${tailwindPlugin} react()],        
      });`,
  );

  if (answers.tailwind) {
    fs.writeFileSync(
      path.join(dir, 'src/styles/globals.css'),
      `@import "tailwindcss";

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: #fbfaf7;
  color: #2b425a;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

@keyframes emma-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes emma-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes emma-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
    );
  } else {
    fs.writeFileSync(
      path.join(dir, 'src/styles/globals.css'),
      `
      html {
        scroll-behavior: smooth;
      }

      body {
        margin: 0;
        background: #fbfaf7;
        color: #2b425a;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Inter, system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }`,
    );

    fs.writeFileSync(
      path.join(dir, 'src/styles/landing.css'),
      LANDING_CSS,
    );
  }

  fs.writeFileSync(
    path.join(dir, 'src/main.tsx'),
    `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
  );


  fs.writeFileSync(
    path.join(dir, 'src/vite-env.d.ts'),
    '/// <reference types="vite/client" />',
  );

  const appContent = generateAppContent();

  fs.writeFileSync(path.join(dir, 'src/App.tsx'), appContent);

  writeSharedPages(answers, dir);
};

const NOT_FOUND_PAGE_CSS = `import { EmmaLink } from 'emma-core';
import logoUrl from '../../assets/emmaLogo.png';
import '../../styles/pages.css';

export default function NotFoundPage() {
  const path = window.location.pathname;

  return (
    <div className="error-page">
      <span className="error-brand">
        <img src={logoUrl} alt="" />
        EmmaJS
      </span>

      <main className="error-card">
        <p className="error-badge">
          <span className="error-badge-dot" />
          Error 404 · Ruta no encontrada
        </p>
        <p className="error-code">404</p>
        <h1 className="error-title">Esta página no existe.</h1>
        <p className="error-desc">
          La ruta que buscas no forma parte de la app o cambió de lugar. Revisa la URL o vuelve al
          inicio para seguir navegando.
        </p>
        <p className="error-path">
          <span>GET</span>
          <code>{path}</code>
        </p>
        <div className="error-actions">
          <EmmaLink to="/" className="error-btn error-btn--primary">
            Volver al inicio
          </EmmaLink>
          <button
            type="button"
            className="error-btn error-btn--ghost"
            onClick={() => window.history.back()}
          >
            Volver atrás
          </button>
        </div>
      </main>

      <p className="error-note">EmmaJS · React Router 8</p>
    </div>
  );
}
`;

const FORBIDDEN_PAGE_CSS = `import { EmmaLink } from 'emma-core';
import logoUrl from '../../assets/emmaLogo.png';
import '../../styles/pages.css';

export default function ForbiddenPage() {
  const path = window.location.pathname;

  return (
    <div className="error-page error-page--forbidden">
      <span className="error-brand">
        <img src={logoUrl} alt="" />
        EmmaJS
      </span>

      <main className="error-card">
        <p className="error-badge">
          <span className="error-badge-dot" />
          Error 403 · Acceso restringido
        </p>
        <p className="error-code">403</p>
        <h1 className="error-title">No tienes acceso a esta página.</h1>
        <p className="error-desc">
          Tu sesión no cuenta con el rol necesario para ver este contenido. Si crees que es un
          error, pide acceso a un administrador.
        </p>
        <p className="error-path">
          <span>GET</span>
          <code>{path}</code>
        </p>
        <div className="error-actions">
          <EmmaLink to="/" className="error-btn error-btn--primary">
            Volver al inicio
          </EmmaLink>
          <button
            type="button"
            className="error-btn error-btn--ghost"
            onClick={() => window.history.back()}
          >
            Volver atrás
          </button>
        </div>
      </main>

      <p className="error-note">EmmaJS · RequireAuth</p>
    </div>
  );
}
`;

const PAGES_CSS = `
.error-page {
  --ink: #2b425a;
  --ink-strong: #16283a;
  --muted: rgba(43, 66, 90, 0.66);
  --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(1.5rem, 3vw, 2.25rem);
  min-height: 100vh;
  overflow-x: clip;
  padding: clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 4vw, 2.5rem);
  background: #fbfaf7;
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.error-page *,
.error-page *::before,
.error-page *::after {
  box-sizing: border-box;
}

.error-page ::selection {
  background: rgba(149, 191, 210, 0.45);
}

.error-page::before {
  content: "";
  position: absolute;
  inset: -20vh -10% auto;
  height: 85vh;
  background:
    radial-gradient(44% 50% at 22% 10%, rgba(255, 223, 169, 0.85), transparent 70%),
    radial-gradient(42% 48% at 78% 4%, rgba(149, 191, 210, 0.8), transparent 72%),
    radial-gradient(48% 42% at 50% 26%, rgba(245, 232, 207, 0.85), transparent 80%);
  filter: blur(6px);
  pointer-events: none;
}

.error-page::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(43, 66, 90, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(43, 66, 90, 0.05) 1px, transparent 1px);
  background-size: 72px 72px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 25%, transparent 80%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 25%, transparent 80%);
  pointer-events: none;
}

/* Marca */

.error-brand {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--ink-strong);
  font-size: 0.95rem;
  font-weight: 620;
  letter-spacing: -0.01em;
  animation: emma-rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.error-brand img {
  width: 26px;
  height: 22px;
  border-radius: 7px;
  object-fit: cover;
}

/* Tarjeta */

.error-card {
  position: relative;
  width: 100%;
  max-width: 560px;
  padding: clamp(2rem, 5vw, 3.25rem) clamp(1.5rem, 4vw, 2.75rem);
  border: 1px solid rgba(43, 66, 90, 0.11);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow:
    0 40px 80px -48px rgba(22, 40, 58, 0.5),
    0 1px 2px rgba(22, 40, 58, 0.05);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  backdrop-filter: blur(18px) saturate(140%);
  text-align: center;
  animation: emma-rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.06s both;
}

.error-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.35rem;
  padding: 0.32rem 0.8rem 0.32rem 0.6rem;
  border: 1px solid rgba(43, 66, 90, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 550;
  letter-spacing: 0.01em;
}

.error-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7ba7bd;
  box-shadow: 0 0 0 3px rgba(123, 167, 189, 0.18);
}

.error-code {
  margin: 0;
  background: linear-gradient(120deg, #46688a 0%, #7ba7bd 55%, #b6d4e0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: clamp(4.5rem, 15vw, 7rem);
  font-weight: 750;
  line-height: 0.9;
  letter-spacing: -0.055em;
  font-variant-numeric: tabular-nums;
}

.error-title {
  margin: 1.15rem 0 0;
  color: var(--ink-strong);
  font-size: clamp(1.4rem, 3vw, 1.75rem);
  font-weight: 640;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.error-desc {
  max-width: 26rem;
  margin: 0.8rem auto 0;
  color: var(--muted);
  font-size: 0.97rem;
  line-height: 1.65;
}

.error-path {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
  margin: 1.35rem 0 0;
  padding: 0.35rem 0.75rem;
  border: 1px solid rgba(43, 66, 90, 0.1);
  border-radius: 999px;
  background: rgba(43, 66, 90, 0.04);
  color: rgba(43, 66, 90, 0.6);
  font-family: var(--mono);
  font-size: 0.75rem;
}

.error-path span {
  color: #7ba7bd;
  font-weight: 700;
}

.error-path code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1.9rem;
}

.error-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.7rem 1.35rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 550;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.error-btn:active {
  transform: scale(0.98);
}

.error-btn--primary {
  color: #fff;
  background: linear-gradient(180deg, #35506b, #22374c);
  box-shadow:
    0 10px 24px -12px rgba(22, 40, 58, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.error-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow:
    0 16px 34px -14px rgba(22, 40, 58, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.error-btn--ghost {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(43, 66, 90, 0.16);
  box-shadow: 0 1px 2px rgba(22, 40, 58, 0.06);
}

.error-btn--ghost:hover {
  transform: translateY(-1px);
  background: #fff;
  border-color: rgba(43, 66, 90, 0.28);
}

.error-note {
  position: relative;
  margin: 0;
  color: rgba(43, 66, 90, 0.42);
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  animation: emma-rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.12s both;
}

/* 403 */

.error-page--forbidden .error-badge-dot {
  background: #d9a45b;
  box-shadow: 0 0 0 3px rgba(217, 164, 91, 0.18);
}

.error-page--forbidden .error-code {
  background: linear-gradient(120deg, #9a7333 0%, #c99a52 50%, #ffd9a1 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.error-page--forbidden .error-path span {
  color: #c99a52;
}

@keyframes emma-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 480px) {
  .error-card {
    border-radius: 24px;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .error-page *,
  .error-page *::before,
  .error-page *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

const LANDING_CSS = `
.landing {
  --ink: #2b425a;
  --ink-strong: #16283a;
  --muted: rgba(43, 66, 90, 0.66);
  --line: rgba(43, 66, 90, 0.12);
  --paper: #fbfaf7;
  --sky: #95bfd2;
  --radius: 22px;
  --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  --shadow-sm: 0 1px 2px rgba(22, 40, 58, 0.06);
  --shadow-md: 0 24px 60px -32px rgba(22, 40, 58, 0.45);
  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  background: var(--paper);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.landing ::selection {
  background: rgba(149, 191, 210, 0.45);
}

.landing::before {
  content: "";
  position: absolute;
  inset: -20vh -10% auto;
  height: 90vh;
  background:
    radial-gradient(46% 52% at 18% 8%, rgba(255, 223, 169, 0.9), transparent 70%),
    radial-gradient(42% 48% at 82% 0%, rgba(149, 191, 210, 0.85), transparent 72%),
    radial-gradient(50% 40% at 50% 30%, rgba(245, 232, 207, 0.9), transparent 80%);
  filter: blur(6px);
  pointer-events: none;
  z-index: 0;
}

.landing::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(43, 66, 90, 0.055) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(43, 66, 90, 0.055) 1px, transparent 1px);
  background-size: 76px 76px;
  -webkit-mask-image: radial-gradient(ellipse 80% 55% at 50% 0%, #000 35%, transparent 78%);
  mask-image: radial-gradient(ellipse 80% 55% at 50% 0%, #000 35%, transparent 78%);
  pointer-events: none;
  z-index: 0;
}

/* Nav */

.emma-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.7rem clamp(1rem, 4vw, 2.5rem);
  background: rgba(251, 250, 247, 0.72);
  border-bottom: 1px solid rgba(43, 66, 90, 0.08);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

.emma-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--ink-strong);
  font-size: 1.0625rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  text-decoration: none;
}

.emma-brand img {
  width: 30px;
  height: 26px;
  border-radius: 8px;
  object-fit: cover;
}

.emma-nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-left: auto;
}

.emma-nav-links a {
  color: var(--muted);
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.18s ease;
}

.emma-nav-links a:hover {
  color: var(--ink-strong);
}

/* Botones */

.emma-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 550;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.emma-btn:active {
  transform: scale(0.98);
}

.emma-btn--primary {
  color: #fff;
  background: linear-gradient(180deg, #35506b, #22374c);
  box-shadow: 0 10px 24px -12px rgba(22, 40, 58, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.emma-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 34px -14px rgba(22, 40, 58, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.emma-btn--ghost {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.65);
  border-color: rgba(43, 66, 90, 0.16);
  box-shadow: var(--shadow-sm);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.emma-btn--ghost:hover {
  transform: translateY(-1px);
  background: #fff;
  border-color: rgba(43, 66, 90, 0.28);
}

.emma-btn--sm {
  padding: 0.5rem 0.95rem;
  font-size: 0.85rem;
}

/* Hero */

.hero {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 4.5rem);
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(3.5rem, 9vw, 7rem) clamp(1.25rem, 4vw, 2.5rem) clamp(2.5rem, 6vw, 4rem);
}

.hero-copy > * {
  animation: emma-rise 0.85s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

.hero-copy > *:nth-child(2) { animation-delay: 0.06s; }
.hero-copy > *:nth-child(3) { animation-delay: 0.12s; }
.hero-copy > *:nth-child(4) { animation-delay: 0.18s; }
.hero-copy > *:nth-child(5) { animation-delay: 0.24s; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.35rem;
  padding: 0.35rem 0.8rem 0.35rem 0.55rem;
  border: 1px solid rgba(43, 66, 90, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 520;
  letter-spacing: 0.01em;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.hero-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4c9a6a;
  box-shadow: 0 0 0 3px rgba(76, 154, 106, 0.16);
}

.hero-title {
  margin: 0;
  color: var(--ink-strong);
  font-size: clamp(2.6rem, 6.2vw, 4.5rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.038em;
}

.hero-title-soft {
  background: linear-gradient(100deg, #46688a 0%, #7ba7bd 55%, #b6d4e0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-sub {
  margin: 1.5rem 0 0;
  max-width: 33rem;
  color: var(--muted);
  font-size: clamp(1.02rem, 1.6vw, 1.14rem);
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.install-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  max-width: 100%;
  margin-top: 1.35rem;
  padding: 0.45rem 0.5rem 0.45rem 0.9rem;
  border: 1px solid rgba(43, 66, 90, 0.13);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: var(--shadow-sm);
  font-family: var(--mono);
  font-size: 0.82rem;
  color: var(--ink);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.install-prompt {
  color: #7ba7bd;
  font-weight: 700;
}

.install-pill code {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.install-copy {
  flex: none;
  padding: 0.3rem 0.65rem;
  border: 1px solid rgba(43, 66, 90, 0.14);
  border-radius: 999px;
  background: #fff;
  color: var(--muted);
  font-family: inherit;
  font-size: 0.72rem;
  cursor: pointer;
  transition: color 0.18s ease, border-color 0.18s ease;
}

.install-copy:hover {
  color: var(--ink);
  border-color: rgba(43, 66, 90, 0.3);
}

/* Ventana de archivos */

.hero-visual {
  position: relative;
  animation: emma-rise 0.95s cubic-bezier(0.2, 0.7, 0.2, 1) 0.18s both;
}

.window {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(43, 66, 90, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 40px 80px -40px rgba(22, 40, 58, 0.45), 0 2px 6px rgba(22, 40, 58, 0.06);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
}

.window-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid rgba(43, 66, 90, 0.09);
  background: rgba(255, 255, 255, 0.6);
}

.window-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(43, 66, 90, 0.16);
}

.window-dot:nth-child(1) { background: #ffd08a; }
.window-dot:nth-child(2) { background: #e9dcc2; }
.window-dot:nth-child(3) { background: #a9cddd; }

.window-title {
  margin-left: 0.45rem;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.76rem;
}

.tree {
  margin: 0;
  padding: 0.9rem 0.6rem 1.1rem;
  list-style: none;
  font-family: var(--mono);
  font-size: 0.82rem;
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.34rem 0.7rem 0.34rem 0;
  border-radius: 8px;
  color: var(--ink);
}

.tree-row--active {
  background: rgba(149, 191, 210, 0.22);
  box-shadow: inset 0 0 0 1px rgba(149, 191, 210, 0.5);
}

.tree-mark {
  flex: none;
  width: 7px;
  height: 7px;
  border: 1.5px solid rgba(43, 66, 90, 0.25);
  border-radius: 2px;
}

.tree-mark--dir {
  border: 0;
  border-radius: 2px;
  background: #a9cddd;
}

.tree-badge {
  margin-left: auto;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: rgba(76, 154, 106, 0.14);
  color: #3d7d57;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 0.62rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.float-chip {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid rgba(43, 66, 90, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 18px 30px -18px rgba(22, 40, 58, 0.5);
  color: var(--ink);
  font-size: 0.76rem;
  font-weight: 540;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  animation: emma-float 7s ease-in-out infinite;
}

.float-chip--one {
  top: -18px;
  right: -10px;
}

.float-chip--two {
  bottom: -16px;
  left: -14px;
  animation-delay: -3.5s;
}

.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4c9a6a;
  box-shadow: 0 0 0 3px rgba(76, 154, 106, 0.16);
}

/* Stack */

.stack {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 4vw, 2.5rem) clamp(2.5rem, 5vw, 4rem);
}

.stack-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.6rem 1rem;
  padding: 1.1rem 1.25rem;
  border-top: 1px solid rgba(43, 66, 90, 0.1);
  border-bottom: 1px solid rgba(43, 66, 90, 0.1);
}

.stack-label {
  color: rgba(43, 66, 90, 0.45);
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.stack-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 500;
}

.stack-item img {
  width: 16px;
  height: 16px;
  animation: emma-spin 18s linear infinite;
}

.stack-sep {
  color: rgba(43, 66, 90, 0.22);
}

/* Secciones */

.section {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(3rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 2.5rem);
  scroll-margin-top: 80px;
}

.section-head {
  max-width: 40rem;
  margin-bottom: clamp(1.75rem, 4vw, 2.75rem);
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: #7ba7bd;
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  color: var(--ink-strong);
  font-size: clamp(1.9rem, 3.6vw, 2.75rem);
  font-weight: 680;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.section-sub {
  margin: 0.9rem 0 0;
  color: var(--muted);
  font-size: 1.02rem;
  line-height: 1.65;
}

/* Bento */

.bento {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1rem;
}

.bento-item {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  grid-column: span 2;
  padding: clamp(1.25rem, 2.4vw, 1.75rem);
  border: 1px solid rgba(43, 66, 90, 0.11);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: var(--shadow-sm);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.bento-item:hover {
  transform: translateY(-3px);
  border-color: rgba(43, 66, 90, 0.18);
  box-shadow: var(--shadow-md);
}

.bento-item--wide {
  grid-column: span 3;
}

.bento-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin-bottom: 0.35rem;
  border-radius: 12px;
  background: rgba(149, 191, 210, 0.2);
  color: #3f6d86;
}

.bento-icon[data-accent="peach"] {
  background: rgba(255, 223, 169, 0.45);
  color: #9a7333;
}

.bento-icon[data-accent="ink"] {
  background: rgba(43, 66, 90, 0.08);
  color: #46688a;
}

.bento-icon svg {
  width: 20px;
  height: 20px;
}

.bento-item h3 {
  margin: 0;
  color: var(--ink-strong);
  font-size: 1.05rem;
  font-weight: 620;
  letter-spacing: -0.01em;
}

.bento-item--wide h3 {
  font-size: 1.2rem;
}

.bento-item p {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.6;
}

.bento-tag {
  align-self: flex-start;
  margin-top: auto;
  padding: 0.25rem 0.6rem;
  border: 1px solid rgba(43, 66, 90, 0.1);
  border-radius: 999px;
  background: rgba(43, 66, 90, 0.04);
  color: rgba(43, 66, 90, 0.6);
  font-family: var(--mono);
  font-size: 0.7rem;
}

/* Estado global */

.demo-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 1.25rem;
  align-items: stretch;
}

.demo-card {
  display: flex;
  flex-direction: column;
  padding: clamp(1.5rem, 3vw, 2.25rem);
  border: 1px solid rgba(43, 66, 90, 0.11);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: var(--shadow-sm);
}

.demo-label {
  margin: 0;
  color: #7ba7bd;
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.demo-count {
  margin: 0.5rem 0 0;
  color: var(--ink-strong);
  font-size: clamp(3.25rem, 8vw, 4.75rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.04em;
}

.demo-hint {
  margin: 0.35rem 0 0;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.82rem;
}

.demo-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: auto;
  padding-top: 1.75rem;
}

.code-card {
  overflow: hidden;
  padding: clamp(1.35rem, 2.6vw, 1.85rem);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius);
  background: linear-gradient(180deg, #16283a, #101d2b);
  box-shadow: 0 30px 60px -36px rgba(22, 40, 58, 0.9);
  color: #d7e3ec;
}

.code-card-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  color: rgba(215, 227, 236, 0.5);
  font-family: var(--mono);
  font-size: 0.76rem;
}

.code-card-head span:last-child {
  margin-left: 0.45rem;
}

.code-plain {
  margin: 0;
  overflow-x: auto;
  color: #cfe0ea;
  font-family: var(--mono);
  font-size: 0.8rem;
  line-height: 1.75;
}

/* CLI */

.cli-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  align-items: center;
  gap: clamp(1.5rem, 4vw, 3rem);
  overflow: hidden;
  padding: clamp(1.75rem, 4vw, 3rem);
  border-radius: 28px;
  background: linear-gradient(150deg, #16283a 0%, #1d3549 60%, #24455c 100%);
  box-shadow: 0 40px 80px -40px rgba(22, 40, 58, 0.8);
  color: #e6eef4;
}

.cli-panel::before {
  content: "";
  position: absolute;
  right: -10%;
  bottom: -40%;
  width: 60%;
  height: 80%;
  background: radial-gradient(closest-side, rgba(149, 191, 210, 0.35), transparent);
  pointer-events: none;
}

.cli-copy {
  position: relative;
}

.eyebrow--light {
  color: #a9cddd;
}

.section-title--light {
  color: #f4f8fb;
}

.section-sub--light {
  color: rgba(230, 238, 244, 0.66);
}

.cli-list {
  display: grid;
  gap: 0.55rem;
  margin: 1.6rem 0 0;
  padding: 0;
  list-style: none;
}

.cli-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.88rem;
  color: rgba(230, 238, 244, 0.7);
}

.cli-list code {
  flex: none;
  min-width: 6.5rem;
  padding: 0.2rem 0.55rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #ffd9a1;
  font-family: var(--mono);
  font-size: 0.75rem;
  text-align: center;
}

.terminal {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(8, 16, 24, 0.72);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.terminal-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.terminal-title {
  margin-left: 0.45rem;
  color: rgba(230, 238, 244, 0.45);
  font-family: var(--mono);
  font-size: 0.72rem;
}

.terminal-body {
  margin: 0;
  padding: 1rem 1.1rem 1.15rem;
  color: #cfe0ea;
  font-family: var(--mono);
  font-size: 0.82rem;
  line-height: 1.9;
}

.term-line {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

.term-prompt {
  margin-right: 0.5rem;
  color: #ffd9a1;
}

/* CTA */

.cta {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 4vw, 2.5rem) clamp(3rem, 7vw, 5rem);
  scroll-margin-top: 80px;
}

.cta-card {
  position: relative;
  overflow: hidden;
  padding: clamp(2.75rem, 6vw, 4.5rem) clamp(1.25rem, 4vw, 2.5rem);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  background: linear-gradient(150deg, #16283a 0%, #1d3549 58%, #24455c 100%);
  box-shadow:
    0 40px 80px -40px rgba(22, 40, 58, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #e6eef4;
  text-align: center;
}

.cta-card::before {
  content: "";
  position: absolute;
  top: -65%;
  left: -8%;
  width: 65%;
  height: 130%;
  background: radial-gradient(closest-side, rgba(255, 223, 169, 0.3), transparent);
  pointer-events: none;
}

.cta-card::after {
  content: "";
  position: absolute;
  right: -10%;
  bottom: -55%;
  width: 70%;
  height: 120%;
  background: radial-gradient(closest-side, rgba(149, 191, 210, 0.34), transparent);
  pointer-events: none;
}

.cta-card > * {
  position: relative;
  z-index: 1;
}

.cta-card .cta-eyebrow {
  margin: 0 0 0.9rem;
  color: #ffd9a1;
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.cta-card h2 {
  margin: 0;
  color: #f4f8fb;
  font-size: clamp(2rem, 4.4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.035em;
}

.cta-card p {
  max-width: 32rem;
  margin: 0.85rem auto 0;
  color: rgba(230, 238, 244, 0.66);
  font-size: 1.02rem;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

.install-pill--dark {
  margin-top: 0;
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(8, 16, 24, 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 18px 36px -22px rgba(0, 0, 0, 0.9);
  color: #e6eef4;
}

.install-pill--dark .install-prompt {
  color: #ffd9a1;
}

.install-pill--dark .install-copy {
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(230, 238, 244, 0.75);
}

.install-pill--dark .install-copy:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.cta-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.45rem;
  margin: 1.6rem 0 0;
  padding: 0;
  list-style: none;
}

.cta-meta li {
  padding: 0.22rem 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(230, 238, 244, 0.6);
  font-family: var(--mono);
  font-size: 0.7rem;
}


/* Footer */

.emma-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(43, 66, 90, 0.1);
}

.emma-footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.75rem clamp(1.25rem, 4vw, 2.5rem);
}

.emma-footer p {
  margin: 0;
  color: rgba(43, 66, 90, 0.5);
  font-size: 0.82rem;
}

.emma-footer-links {
  display: flex;
  gap: 1.25rem;
}

.emma-footer-links a {
  color: rgba(43, 66, 90, 0.6);
  font-size: 0.82rem;
  text-decoration: none;
  transition: color 0.18s ease;
}

.emma-footer-links a:hover {
  color: var(--ink-strong);
}

/* Animaciones */

@keyframes emma-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes emma-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes emma-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */

@media (max-width: 980px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
    padding-top: clamp(2.75rem, 8vw, 4rem);
  }

  .hero-visual {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
  }

  .demo-grid,
  .cli-panel {
    grid-template-columns: minmax(0, 1fr);
  }

  .emma-nav-links {
    display: none;
  }
}

@media (max-width: 900px) {
  .bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bento-item,
  .bento-item--wide {
    grid-column: auto;
  }
}

@media (max-width: 620px) {
  .bento {
    grid-template-columns: minmax(0, 1fr);
  }

  .float-chip--two {
    display: none;
  }

  .float-chip--one {
    top: -12px;
    right: 4px;
  }

  .stack-sep {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing *,
  .landing *::before,
  .landing *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

const landingCss = (projectName: string): string => {

  return `import { useState } from 'react';
import logoUrl from '../../assets/emmaLogo.png';
import reactLogoUrl from '../../assets/reactLogo.webp';
import '../../styles/landing.css';
import { useCounterStore } from '../stores/counterStore';

const INSTALL = 'npx create-emma-app@latest';

const FEATURES = ${featureSource(false)};

const TREE: Array<{ depth: number; label: string; dir: boolean; badge?: string }> = [
  { depth: 0, label: 'src/', dir: true },
  { depth: 1, label: 'modules/', dir: true },
  { depth: 2, label: 'shop/', dir: true },
  { depth: 3, label: 'pages/ShopPage.tsx', dir: false },
  { depth: 3, label: 'routes/index.tsx', dir: false, badge: 'auto' },
  { depth: 3, label: 'store/shopStore.ts', dir: false },
  { depth: 1, label: 'shared/', dir: true },
  { depth: 2, label: 'guards/RequireAuth.tsx', dir: false },
];

const COMMANDS = [
  'npx create-emma-app@latest',
  'npx emma generate module shop',
  'npx emma generate guard RequireAuth',
  'npm run dev',
];

${ICON_COMPONENT}

export default function LandingPage() {
  const count = useCounterStore((s) => s.count);
  const [copied, setCopied] = useState(false);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="landing">
      <header className="emma-nav">
        <a className="emma-brand" href="#top">
          <img src={logoUrl} alt="" />
          EmmaJS
        </a>
        <nav className="emma-nav-links" aria-label="Principal">
          <a href="#arquitectura">Arquitectura</a>
          <a href="#estado">Estado</a>
          <a href="#cli">CLI</a>
        </nav>
        <a className="emma-btn emma-btn--primary emma-btn--sm" href="#inicio-rapido">Empezar</a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-badge">
              <span className="hero-badge-dot" />
              EmmaJS v1 · ${projectName}
            </p>
            <h1 className="hero-title">
              Arquitectura modular
              <br />
              <span className="hero-title-soft">para React.</span>
            </h1>
            <p className="hero-sub">
              Rutas, estado global y generadores de código en un solo lugar. Organiza tu app en
              módulos autocontenidos y escala sin fricción.
            </p>
            <div className="hero-actions">
              <a className="emma-btn emma-btn--primary" href="#inicio-rapido">Empezar ahora</a>
              <a
                className="emma-btn emma-btn--ghost"
                href="https://www.npmjs.com/package/emma-core"
                target="_blank"
                rel="noreferrer"
              >
                Ver en npm
              </a>
            </div>
            <div className="install-pill">
              <span className="install-prompt">$</span>
              <code>{INSTALL}</code>
              <button type="button" className="install-copy" onClick={copyInstall}>
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="window">
              <div className="window-bar">
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="window-title">src/</span>
              </div>
              <ul className="tree">
                {TREE.map((row) => (
                  <li
                    key={row.label}
                    className={row.badge ? 'tree-row tree-row--active' : 'tree-row'}
                    style={{ paddingLeft: 14 + row.depth * 18 }}
                  >
                    <span className={row.dir ? 'tree-mark tree-mark--dir' : 'tree-mark'} />
                    <span>{row.label}</span>
                    {row.badge ? <span className="tree-badge">{row.badge}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="float-chip float-chip--one">
              <span className="chip-dot" />
              Módulo listo
            </div>
            <div className="float-chip float-chip--two">0 rutas a mano</div>
          </div>
        </section>

        <section className="stack" aria-label="Stack">
          <div className="stack-inner">
            <span className="stack-label">Construido sobre</span>
            <span className="stack-item">
              <img src={reactLogoUrl} alt="" />
              React 19
            </span>
            <span className="stack-sep">·</span>
            <span className="stack-item">React Router 8</span>
            <span className="stack-sep">·</span>
            <span className="stack-item">Zustand 5</span>
            <span className="stack-sep">·</span>
            <span className="stack-item">Vite 8</span>
            <span className="stack-sep">·</span>
            <span className="stack-item">TypeScript 5</span>
          </div>
        </section>

        <section className="section" id="arquitectura">
          <div className="section-head">
            <p className="eyebrow">Arquitectura</p>
            <h2 className="section-title">Todo lo que una app necesita, en su lugar.</h2>
            <p className="section-sub">
              EmmaJS no esconde React: lo ordena. Módulos autocontenidos, convenciones claras y
              cero configuración inicial.
            </p>
          </div>
          <div className="bento">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className={feature.wide ? 'bento-item bento-item--wide' : 'bento-item'}
              >
                <span className="bento-icon" data-accent={feature.accent}>
                  <EmmaIcon name={feature.icon} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="bento-tag">{feature.tag}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="estado">
          <div className="section-head">
            <p className="eyebrow">Estado global</p>
            <h2 className="section-title">Un store, todos tus componentes.</h2>
            <p className="section-sub">
              El contador de abajo es real: vive en shared/stores/counterStore y se comparte en
              toda la app.
            </p>
          </div>
          <div className="demo-grid">
            <div className="demo-card">
              <p className="demo-label">counterStore</p>
              <p className="demo-count">{count}</p>
              <p className="demo-hint">{'useCounterStore((s) => s.count)'}</p>
              <div className="demo-actions">
                <button
                  type="button"
                  className="emma-btn emma-btn--primary"
                  onClick={() => useCounterStore.setState((s) => ({ count: s.count + 1 }))}
                >
                  +1
                </button>
                <button
                  type="button"
                  className="emma-btn emma-btn--ghost"
                  onClick={() => useCounterStore.setState({ count: 0 })}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="code-card">
              <div className="code-card-head">
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="window-dot" />
                <span>counterStore.ts</span>
              </div>
              <pre className="code-plain">
                {'import { createEmmaStore } from \\'emma-core\\';\\n\\nexport const useCounterStore = createEmmaStore<CounterState>()((set) => ({\\n  count: 0,\\n}));'}
              </pre>
            </div>
          </div>
        </section>

        <section className="section" id="cli">
          <div className="cli-panel">
            <div className="cli-copy">
              <p className="eyebrow eyebrow--light">CLI</p>
              <h2 className="section-title section-title--light">Del comando a la arquitectura.</h2>
              <p className="section-sub section-sub--light">
                Genera módulos completos —páginas, componentes, hooks, servicios, rutas y store— y
                sigue escribiendo tu lógica.
              </p>
              <ul className="cli-list">
                <li><code>module</code><span>Módulo completo con ejemplo</span></li>
                <li><code>page</code><span>Página dentro de un módulo</span></li>
                <li><code>component</code><span>Componente compartido</span></li>
                <li><code>guard</code><span>Protección por sesión y rol</span></li>
              </ul>
            </div>
            <div className="terminal">
              <div className="terminal-bar">
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="window-dot" />
                <span className="terminal-title">emma</span>
              </div>
              <pre className="terminal-body">
                {COMMANDS.map((command) => (
                  <span className="term-line" key={command}>
                    <span className="term-prompt">$</span> {command}
                  </span>
                ))}
              </pre>
            </div>
          </div>
        </section>

        <section className="cta" id="inicio-rapido">
          <div className="cta-card">
            <p className="cta-eyebrow">Instalación</p>
            <h2>Empieza en segundos.</h2>
            <p>
              Un comando crea tu app con React 19, Vite y la arquitectura EmmaJS lista para
              escalar.
            </p>
            <div className="cta-actions">
              <div className="install-pill install-pill--dark">
                <span className="install-prompt">$</span>
                <code>{INSTALL}</code>
                <button type="button" className="install-copy" onClick={copyInstall}>
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
            <ul className="cta-meta">
              <li>Node 22+</li>
              <li>React 19</li>
              <li>React Router 8</li>
              <li>Zustand 5</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="emma-footer">
        <div className="emma-footer-inner">
          <p>EmmaJS v1 — Arquitectura modular para React</p>
          <nav className="emma-footer-links" aria-label="Paquetes">
            <a href="https://www.npmjs.com/package/emma-core" target="_blank" rel="noreferrer">emma-core</a>
            <a href="https://www.npmjs.com/package/create-emma-app" target="_blank" rel="noreferrer">create-emma-app</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}`;
};

const NOT_FOUND_PAGE_TAILWIND = `import { EmmaLink } from 'emma-core';
import logoUrl from '../../assets/emmaLogo.png';

const PRIMARY =
  'inline-flex items-center justify-center rounded-full bg-linear-to-b from-[#35506b] to-[#22374c] px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(22,40,58,0.7)] transition duration-200 hover:-translate-y-px hover:shadow-[0_16px_34px_-14px_rgba(22,40,58,0.75)] active:scale-[0.98]';
const GHOST =
  'inline-flex items-center justify-center rounded-full border border-[#2b425a]/15 bg-white/70 px-5 py-2.5 text-sm font-medium text-[#2b425a] shadow-sm transition duration-200 hover:-translate-y-px hover:border-[#2b425a]/30 hover:bg-white active:scale-[0.98]';

export default function NotFoundPage() {
  const path = window.location.pathname;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-7 overflow-x-clip bg-[#fbfaf7] px-5 py-14 text-[#2b425a] antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-[85vh] blur-[6px]"
        style={{
          background:
            'radial-gradient(44% 50% at 22% 10%, rgba(255,223,169,0.85), transparent 70%), radial-gradient(42% 48% at 78% 4%, rgba(149,191,210,0.8), transparent 72%), radial-gradient(48% 42% at 50% 26%, rgba(245,232,207,0.85), transparent 80%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(43,66,90,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(43,66,90,0.05) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 25%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 25%, transparent 80%)',
        }}
      />

      <span className="relative inline-flex animate-[emma-rise_0.6s_cubic-bezier(0.2,0.7,0.2,1)_both] items-center gap-2 text-[15px] font-semibold tracking-tight text-[#16283a]">
        <img src={logoUrl} alt="" className="h-[22px] w-[26px] rounded-[7px] object-cover" />
        EmmaJS
      </span>

      <main className="relative w-full max-w-[560px] animate-[emma-rise_0.7s_cubic-bezier(0.2,0.7,0.2,1)_0.06s_both] rounded-[30px] border border-[#2b425a]/10 bg-white/75 px-6 py-10 text-center shadow-[0_40px_80px_-48px_rgba(22,40,58,0.5),0_1px_2px_rgba(22,40,58,0.05)] backdrop-blur-xl backdrop-saturate-150 sm:rounded-[30px] sm:px-11 sm:py-[3.25rem]">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2b425a]/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#2b425a]/65">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7ba7bd] shadow-[0_0_0_3px_rgba(123,167,189,0.18)]" />
          Error 404 · Ruta no encontrada
        </p>
        <p className="m-0 bg-linear-to-r from-[#46688a] via-[#7ba7bd] to-[#b6d4e0] bg-clip-text text-[clamp(4.5rem,15vw,7rem)] font-bold leading-[0.9] tracking-[-0.055em] text-transparent tabular-nums">
          404
        </p>
        <h1 className="mt-4 text-[clamp(1.4rem,3vw,1.75rem)] font-semibold leading-tight tracking-[-0.02em] text-[#16283a]">
          Esta página no existe.
        </h1>
        <p className="mx-auto mt-3 max-w-[26rem] text-[15px] leading-relaxed text-[#2b425a]/65">
          La ruta que buscas no forma parte de la app o cambió de lugar. Revisa la URL o vuelve al
          inicio para seguir navegando.
        </p>
        <p className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[#2b425a]/10 bg-[#2b425a]/5 px-3 py-1.5 font-mono text-xs text-[#2b425a]/60">
          <span className="font-bold text-[#7ba7bd]">GET</span>
          <code className="truncate">{path}</code>
        </p>
        <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row sm:flex-wrap">
          <EmmaLink to="/" className={PRIMARY}>
            Volver al inicio
          </EmmaLink>
          <button type="button" className={GHOST} onClick={() => window.history.back()}>
            Volver atrás
          </button>
        </div>
      </main>

      <p className="relative m-0 animate-[emma-rise_0.7s_cubic-bezier(0.2,0.7,0.2,1)_0.12s_both] text-xs text-[#2b425a]/40">
        EmmaJS · React Router 8
      </p>
    </div>
  );
}
`;

const FORBIDDEN_PAGE_TAILWIND = `import { EmmaLink } from 'emma-core';
import logoUrl from '../../assets/emmaLogo.png';

const PRIMARY =
  'inline-flex items-center justify-center rounded-full bg-linear-to-b from-[#35506b] to-[#22374c] px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(22,40,58,0.7)] transition duration-200 hover:-translate-y-px hover:shadow-[0_16px_34px_-14px_rgba(22,40,58,0.75)] active:scale-[0.98]';
const GHOST =
  'inline-flex items-center justify-center rounded-full border border-[#2b425a]/15 bg-white/70 px-5 py-2.5 text-sm font-medium text-[#2b425a] shadow-sm transition duration-200 hover:-translate-y-px hover:border-[#2b425a]/30 hover:bg-white active:scale-[0.98]';

export default function ForbiddenPage() {
  const path = window.location.pathname;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-7 overflow-x-clip bg-[#fbfaf7] px-5 py-14 text-[#2b425a] antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-[85vh] blur-[6px]"
        style={{
          background:
            'radial-gradient(44% 50% at 22% 10%, rgba(255,223,169,0.85), transparent 70%), radial-gradient(42% 48% at 78% 4%, rgba(149,191,210,0.8), transparent 72%), radial-gradient(48% 42% at 50% 26%, rgba(245,232,207,0.85), transparent 80%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(43,66,90,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(43,66,90,0.05) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 25%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 25%, transparent 80%)',
        }}
      />

      <span className="relative inline-flex animate-[emma-rise_0.6s_cubic-bezier(0.2,0.7,0.2,1)_both] items-center gap-2 text-[15px] font-semibold tracking-tight text-[#16283a]">
        <img src={logoUrl} alt="" className="h-[22px] w-[26px] rounded-[7px] object-cover" />
        EmmaJS
      </span>

      <main className="relative w-full max-w-[560px] animate-[emma-rise_0.7s_cubic-bezier(0.2,0.7,0.2,1)_0.06s_both] rounded-[30px] border border-[#2b425a]/10 bg-white/75 px-6 py-10 text-center shadow-[0_40px_80px_-48px_rgba(22,40,58,0.5),0_1px_2px_rgba(22,40,58,0.05)] backdrop-blur-xl backdrop-saturate-150 sm:rounded-[30px] sm:px-11 sm:py-[3.25rem]">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2b425a]/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#2b425a]/65">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d9a45b] shadow-[0_0_0_3px_rgba(217,164,91,0.18)]" />
          Error 403 · Acceso restringido
        </p>
        <p className="m-0 bg-linear-to-r from-[#9a7333] via-[#c99a52] to-[#ffd9a1] bg-clip-text text-[clamp(4.5rem,15vw,7rem)] font-bold leading-[0.9] tracking-[-0.055em] text-transparent tabular-nums">
          403
        </p>
        <h1 className="mt-4 text-[clamp(1.4rem,3vw,1.75rem)] font-semibold leading-tight tracking-[-0.02em] text-[#16283a]">
          No tienes acceso a esta página.
        </h1>
        <p className="mx-auto mt-3 max-w-[26rem] text-[15px] leading-relaxed text-[#2b425a]/65">
          Tu sesión no cuenta con el rol necesario para ver este contenido. Si crees que es un
          error, pide acceso a un administrador.
        </p>
        <p className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[#2b425a]/10 bg-[#2b425a]/5 px-3 py-1.5 font-mono text-xs text-[#2b425a]/60">
          <span className="font-bold text-[#c99a52]">GET</span>
          <code className="truncate">{path}</code>
        </p>
        <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row sm:flex-wrap">
          <EmmaLink to="/" className={PRIMARY}>
            Volver al inicio
          </EmmaLink>
          <button type="button" className={GHOST} onClick={() => window.history.back()}>
            Volver atrás
          </button>
        </div>
      </main>

      <p className="relative m-0 animate-[emma-rise_0.7s_cubic-bezier(0.2,0.7,0.2,1)_0.12s_both] text-xs text-[#2b425a]/40">
        EmmaJS · RequireAuth
      </p>
    </div>
  );
}
`;

const landingTailwind = (projectName: string): string => {

  return `import { useState } from 'react';
import logoUrl from '../../assets/emmaLogo.png';
import reactLogoUrl from '../../assets/reactLogo.webp';
import { useCounterStore } from '../stores/counterStore';

const INSTALL = 'npx create-emma-app@latest';

type Feature = {
  icon: string;
  accent: 'sky' | 'peach' | 'ink';
  wide: boolean;
  title: string;
  description: string;
  tag: string;
};

const FEATURES: Feature[] = ${featureSource(true)};

const TREE: Array<{ depth: number; label: string; dir: boolean; badge?: string }> = [
  { depth: 0, label: 'src/', dir: true },
  { depth: 1, label: 'modules/', dir: true },
  { depth: 2, label: 'shop/', dir: true },
  { depth: 3, label: 'pages/ShopPage.tsx', dir: false },
  { depth: 3, label: 'routes/index.tsx', dir: false, badge: 'auto' },
  { depth: 3, label: 'store/shopStore.ts', dir: false },
  { depth: 1, label: 'shared/', dir: true },
  { depth: 2, label: 'guards/RequireAuth.tsx', dir: false },
];

const COMMANDS = [
  'npx create-emma-app@latest',
  'npx emma generate module shop',
  'npx emma generate guard RequireAuth',
  'npm run dev',
];

const ACCENT: Record<Feature['accent'], string> = {
  sky: 'bg-[#95bfd2]/20 text-[#3f6d86]',
  peach: 'bg-[#ffdfa9]/45 text-[#9a7333]',
  ink: 'bg-[#2b425a]/10 text-[#46688a]',
};

const BTN_PRIMARY = 'inline-flex items-center justify-center rounded-full bg-linear-to-b from-[#35506b] to-[#22374c] px-5 py-2.5 text-[15px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(22,40,58,0.7)] transition duration-200 hover:-translate-y-px hover:shadow-[0_16px_34px_-14px_rgba(22,40,58,0.75)] active:scale-[0.98]';
const BTN_GHOST = 'inline-flex items-center justify-center rounded-full border border-[#2b425a]/15 bg-white/65 px-5 py-2.5 text-[15px] font-medium text-[#2b425a] shadow-sm backdrop-blur-md transition duration-200 hover:-translate-y-px hover:border-[#2b425a]/30 hover:bg-white active:scale-[0.98]';
const BTN_SM = 'inline-flex items-center justify-center rounded-full bg-linear-to-b from-[#35506b] to-[#22374c] px-4 py-2 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(22,40,58,0.7)] transition duration-200 hover:-translate-y-px active:scale-[0.98]';

${ICON_COMPONENT}

export default function LandingPage() {
  const count = useCounterStore((s) => s.count);
  const [copied, setCopied] = useState(false);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#fbfaf7] text-[#2b425a] antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-48 h-[80vh] blur-[6px]"
        style={{
          background:
            'radial-gradient(46% 52% at 18% 8%, rgba(255,223,169,0.9), transparent 70%), radial-gradient(42% 48% at 82% 0%, rgba(149,191,210,0.85), transparent 72%), radial-gradient(50% 40% at 50% 30%, rgba(245,232,207,0.9), transparent 80%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(43,66,90,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(43,66,90,0.055) 1px, transparent 1px)',
          backgroundSize: '76px 76px',
          maskImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, #000 35%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 55% at 50% 0%, #000 35%, transparent 78%)',
        }}
      />

      <header className="sticky top-0 z-20 flex items-center justify-between gap-6 border-b border-[#2b425a]/10 bg-[#fbfaf7]/70 px-5 py-3 backdrop-blur-xl backdrop-saturate-150 sm:px-8">
        <a href="#top" className="inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-[#16283a]">
          <img src={logoUrl} alt="" className="h-7 w-8 rounded-lg object-cover" />
          EmmaJS
        </a>
        <nav aria-label="Principal" className="ml-auto hidden items-center gap-6 md:flex">
          <a href="#arquitectura" className="text-sm text-[#2b425a]/65 transition-colors hover:text-[#16283a]">Arquitectura</a>
          <a href="#estado" className="text-sm text-[#2b425a]/65 transition-colors hover:text-[#16283a]">Estado</a>
          <a href="#cli" className="text-sm text-[#2b425a]/65 transition-colors hover:text-[#16283a]">CLI</a>
        </nav>
        <a href="#inicio-rapido" className={BTN_SM}>Empezar</a>
      </header>

      <main id="top" className="relative">
        <section className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-28">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2b425a]/15 bg-white/60 px-3 py-1.5 text-xs text-[#2b425a]/65 backdrop-blur-md">
              <span className="h-[7px] w-[7px] rounded-full bg-[#4c9a6a] shadow-[0_0_0_3px_rgba(76,154,106,0.16)]" />
              EmmaJS v1 · ${projectName}
            </p>
            <h1 className="m-0 text-[clamp(2.6rem,6.2vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.038em] text-[#16283a]">
              Arquitectura modular
              <br />
              <span className="bg-linear-to-r from-[#46688a] via-[#7ba7bd] to-[#b6d4e0] bg-clip-text text-transparent">
                para React.
              </span>
            </h1>
            <p className="mt-6 max-w-[33rem] text-[17px] leading-relaxed text-[#2b425a]/65">
              Rutas, estado global y generadores de código en un solo lugar. Organiza tu app en
              módulos autocontenidos y escala sin fricción.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#inicio-rapido" className={BTN_PRIMARY}>Empezar ahora</a>
              <a
                href="https://www.npmjs.com/package/emma-core"
                target="_blank"
                rel="noreferrer"
                className={BTN_GHOST}
              >
                Ver en npm
              </a>
            </div>
            <div className="mt-6 inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#2b425a]/15 bg-white/60 py-1.5 pl-3.5 pr-2 font-mono text-[13px] text-[#2b425a] shadow-sm backdrop-blur-md">
              <span className="font-bold text-[#7ba7bd]">$</span>
              <code className="min-w-0 truncate">{INSTALL}</code>
              <button
                type="button"
                onClick={copyInstall}
                className="flex-none rounded-full border border-[#2b425a]/15 bg-white px-2.5 py-1 text-[11px] text-[#2b425a]/65 transition hover:border-[#2b425a]/30 hover:text-[#2b425a]"
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-[520px] justify-self-center">
            <div className="relative overflow-hidden rounded-[18px] border border-[#2b425a]/15 bg-white/75 shadow-[0_40px_80px_-40px_rgba(22,40,58,0.45),0_2px_6px_rgba(22,40,58,0.06)] backdrop-blur-xl">
              <div className="flex items-center gap-1.5 border-b border-[#2b425a]/10 bg-white/60 px-3.5 py-2.5">
                <span className="h-[9px] w-[9px] rounded-full bg-[#ffd08a]" />
                <span className="h-[9px] w-[9px] rounded-full bg-[#e9dcc2]" />
                <span className="h-[9px] w-[9px] rounded-full bg-[#a9cddd]" />
                <span className="ml-2 font-mono text-[12px] text-[#2b425a]/65">src/</span>
              </div>
              <ul className="m-0 list-none p-2.5 font-mono text-[13px]">
                {TREE.map((row) => (
                  <li
                    key={row.label}
                    className={
                      row.badge
                        ? 'flex items-center gap-2.5 rounded-lg bg-[#95bfd2]/25 py-1.5 pr-2.5 ring-1 ring-inset ring-[#95bfd2]/50'
                        : 'flex items-center gap-2.5 rounded-lg py-1.5 pr-2.5'
                    }
                    style={{ paddingLeft: 10 + row.depth * 18 }}
                  >
                    <span
                      className={
                        row.dir
                          ? 'h-[7px] w-[7px] flex-none rounded-[2px] bg-[#a9cddd]'
                          : 'h-[7px] w-[7px] flex-none rounded-[2px] border-[1.5px] border-[#2b425a]/25'
                      }
                    />
                    <span>{row.label}</span>
                    {row.badge ? (
                      <span className="ml-auto rounded-full bg-[#4c9a6a]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#3d7d57]">
                        {row.badge}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -right-2 -top-4 inline-flex animate-[emma-float_7s_ease-in-out_infinite] items-center gap-1.5 rounded-full border border-[#2b425a]/10 bg-white/85 px-3 py-2 text-xs font-medium shadow-[0_18px_30px_-18px_rgba(22,40,58,0.5)] backdrop-blur-md">
              <span className="h-[7px] w-[7px] rounded-full bg-[#4c9a6a] shadow-[0_0_0_3px_rgba(76,154,106,0.16)]" />
              Módulo listo
            </div>
            <div className="absolute -bottom-4 -left-3 hidden animate-[emma-float_7s_ease-in-out_infinite] items-center gap-1.5 rounded-full border border-[#2b425a]/10 bg-white/85 px-3 py-2 text-xs font-medium shadow-[0_18px_30px_-18px_rgba(22,40,58,0.5)] backdrop-blur-md [animation-delay:-3.5s] sm:inline-flex">
              0 rutas a mano
            </div>
          </div>
        </section>

        <section aria-label="Stack" className="mx-auto max-w-[1180px] px-5 pb-12 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-y border-[#2b425a]/10 px-5 py-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2b425a]/45">
              Construido sobre
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-[#2b425a]/65">
              <img src={reactLogoUrl} alt="" className="h-4 w-4 animate-[emma-spin_18s_linear_infinite]" />
              React 19
            </span>
            <span className="text-[#2b425a]/20">·</span>
            <span className="text-sm text-[#2b425a]/65">React Router 8</span>
            <span className="text-[#2b425a]/20">·</span>
            <span className="text-sm text-[#2b425a]/65">Zustand 5</span>
            <span className="text-[#2b425a]/20">·</span>
            <span className="text-sm text-[#2b425a]/65">Vite 8</span>
            <span className="text-[#2b425a]/20">·</span>
            <span className="text-sm text-[#2b425a]/65">TypeScript 5</span>
          </div>
        </section>

        <section id="arquitectura" className="relative mx-auto max-w-[1180px] scroll-mt-20 px-5 py-14 sm:px-8 lg:py-20">
          <div className="mb-10 max-w-[40rem]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#7ba7bd]">Arquitectura</p>
            <h2 className="m-0 text-[clamp(1.9rem,3.6vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[#16283a]">
              Todo lo que una app necesita, en su lugar.
            </h2>
            <p className="mt-3.5 text-[17px] leading-relaxed text-[#2b425a]/65">
              EmmaJS no esconde React: lo ordena. Módulos autocontenidos, convenciones claras y
              cero configuración inicial.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className={
                  'flex flex-col gap-2 rounded-[22px] border border-[#2b425a]/10 bg-white/70 p-6 shadow-sm backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-[#2b425a]/20 hover:shadow-[0_24px_60px_-32px_rgba(22,40,58,0.45)] ' +
                  (feature.wide ? 'sm:col-span-2 lg:col-span-3' : 'lg:col-span-2')
                }
              >
                <span className={'mb-1 inline-flex h-[38px] w-[38px] items-center justify-center rounded-xl ' + ACCENT[feature.accent]}>
                  <EmmaIcon name={feature.icon} />
                </span>
                <h3 className="m-0 text-[17px] font-semibold tracking-tight text-[#16283a]">
                  {feature.title}
                </h3>
                <p className="m-0 text-sm leading-relaxed text-[#2b425a]/65">{feature.description}</p>
                <span className="mt-auto self-start rounded-full border border-[#2b425a]/10 bg-[#2b425a]/5 px-2.5 py-1 font-mono text-[11px] text-[#2b425a]/60">
                  {feature.tag}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section id="estado" className="relative mx-auto max-w-[1180px] scroll-mt-20 px-5 py-14 sm:px-8 lg:py-20">
          <div className="mb-10 max-w-[40rem]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#7ba7bd]">Estado global</p>
            <h2 className="m-0 text-[clamp(1.9rem,3.6vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[#16283a]">
              Un store, todos tus componentes.
            </h2>
            <p className="mt-3.5 text-[17px] leading-relaxed text-[#2b425a]/65">
              El contador de abajo es real: vive en shared/stores/counterStore y se comparte en
              toda la app.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="flex flex-col rounded-[22px] border border-[#2b425a]/10 bg-white/80 p-6 shadow-sm sm:p-8">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#7ba7bd]">counterStore</p>
              <p className="mb-0 mt-2 text-[clamp(3.25rem,8vw,4.75rem)] font-bold leading-none tracking-[-0.04em] tabular-nums text-[#16283a]">
                {count}
              </p>
              <p className="mb-0 mt-1.5 font-mono text-[13px] text-[#2b425a]/65">{'useCounterStore((s) => s.count)'}</p>
              <div className="mt-auto flex gap-2.5 pt-7">
                <button
                  type="button"
                  className={BTN_PRIMARY}
                  onClick={() => useCounterStore.setState((s) => ({ count: s.count + 1 }))}
                >
                  +1
                </button>
                <button
                  type="button"
                  className={BTN_GHOST}
                  onClick={() => useCounterStore.setState({ count: 0 })}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="overflow-hidden rounded-[22px] border border-white/10 bg-linear-to-b from-[#16283a] to-[#101d2b] p-6 text-[#d7e3ec] shadow-[0_30px_60px_-36px_rgba(22,40,58,0.9)] sm:p-8">
              <div className="mb-4 flex items-center gap-1.5 font-mono text-[12px] text-[#d7e3ec]/50">
                <span className="h-[9px] w-[9px] rounded-full bg-[#ffd08a]" />
                <span className="h-[9px] w-[9px] rounded-full bg-[#e9dcc2]" />
                <span className="h-[9px] w-[9px] rounded-full bg-[#a9cddd]" />
                <span className="ml-2">counterStore.ts</span>
              </div>
              <pre className="m-0 overflow-x-auto font-mono text-[13px] leading-relaxed text-[#cfe0ea]">
                {'import { createEmmaStore } from \\'emma-core\\';\\n\\nexport const useCounterStore = createEmmaStore<CounterState>()((set) => ({\\n  count: 0,\\n}));'}
              </pre>
            </div>
          </div>
        </section>

        <section id="cli" className="relative mx-auto max-w-[1180px] scroll-mt-20 px-5 py-14 sm:px-8 lg:py-20">
          <div className="relative grid gap-10 overflow-hidden rounded-[28px] bg-linear-to-br from-[#16283a] via-[#1d3549] to-[#24455c] p-7 text-[#e6eef4] shadow-[0_40px_80px_-40px_rgba(22,40,58,0.8)] lg:grid-cols-2 lg:items-center lg:p-12">
            <div className="relative">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#a9cddd]">CLI</p>
              <h2 className="m-0 text-[clamp(1.9rem,3.6vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em] text-[#f4f8fb]">
                Del comando a la arquitectura.
              </h2>
              <p className="mt-3.5 text-[17px] leading-relaxed text-[#e6eef4]/65">
                Genera módulos completos —páginas, componentes, hooks, servicios, rutas y store— y
                sigue escribiendo tu lógica.
              </p>
              <ul className="mt-6 grid list-none gap-2 p-0">
                <li className="flex items-center gap-3 text-sm text-[#e6eef4]/70">
                  <code className="min-w-[6.5rem] rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-center font-mono text-xs text-[#ffd9a1]">module</code>
                  Módulo completo con ejemplo
                </li>
                <li className="flex items-center gap-3 text-sm text-[#e6eef4]/70">
                  <code className="min-w-[6.5rem] rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-center font-mono text-xs text-[#ffd9a1]">page</code>
                  Página dentro de un módulo
                </li>
                <li className="flex items-center gap-3 text-sm text-[#e6eef4]/70">
                  <code className="min-w-[6.5rem] rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-center font-mono text-xs text-[#ffd9a1]">component</code>
                  Componente compartido
                </li>
                <li className="flex items-center gap-3 text-sm text-[#e6eef4]/70">
                  <code className="min-w-[6.5rem] rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-center font-mono text-xs text-[#ffd9a1]">guard</code>
                  Protección por sesión y rol
                </li>
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#081018]/70 backdrop-blur-md">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-3.5 py-2.5">
                <span className="h-[9px] w-[9px] rounded-full bg-[#ffd08a]" />
                <span className="h-[9px] w-[9px] rounded-full bg-[#e9dcc2]" />
                <span className="h-[9px] w-[9px] rounded-full bg-[#a9cddd]" />
                <span className="ml-2 font-mono text-[12px] text-[#e6eef4]/45">emma</span>
              </div>
              <pre className="m-0 overflow-x-auto p-5 font-mono text-[13px] leading-loose text-[#cfe0ea]">
                {COMMANDS.map((command) => (
                  <span className="block whitespace-nowrap" key={command}>
                    <span className="mr-2 text-[#ffd9a1]">$</span>
                    {command}
                  </span>
                ))}
              </pre>
            </div>
          </div>
        </section>

        <section id="inicio-rapido" className="relative mx-auto max-w-[1180px] scroll-mt-20 px-5 pb-14 sm:px-8 lg:pb-20">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-linear-to-br from-[#16283a] via-[#1d3549] to-[#24455c] px-6 py-12 text-center text-[#e6eef4] shadow-[0_40px_80px_-40px_rgba(22,40,58,0.8)] sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-1/2 h-[130%] w-[65%]"
              style={{
                background: 'radial-gradient(closest-side, rgba(255,223,169,0.3), transparent)',
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-1/2 -right-20 h-[120%] w-[70%]"
              style={{
                background: 'radial-gradient(closest-side, rgba(149,191,210,0.34), transparent)',
              }}
            />
            <p className="relative m-0 mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#ffd9a1]">
              Instalación
            </p>
            <h2 className="relative m-0 text-[clamp(2rem,4.4vw,3rem)] font-bold tracking-[-0.035em] text-[#f4f8fb]">
              Empieza en segundos.
            </h2>
            <p className="relative mx-auto mt-3.5 max-w-[32rem] text-[17px] leading-relaxed text-[#e6eef4]/65">
              Un comando crea tu app con React 19, Vite y la arquitectura EmmaJS lista para
              escalar.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/15 bg-[#081018]/55 py-1.5 pl-3.5 pr-2 font-mono text-[13px] text-[#e6eef4] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_36px_-22px_rgba(0,0,0,0.9)] backdrop-blur-md">
                <span className="font-bold text-[#ffd9a1]">$</span>
                <code className="min-w-0 truncate">{INSTALL}</code>
                <button
                  type="button"
                  onClick={copyInstall}
                  className="flex-none rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-[#e6eef4]/75 transition hover:border-white/30 hover:bg-white/15 hover:text-white"
                >
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
            <ul className="relative m-0 mt-6 flex list-none flex-wrap justify-center gap-2 p-0">
              <li className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-[#e6eef4]/60">
                Node 22+
              </li>
              <li className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-[#e6eef4]/60">
                React 19
              </li>
              <li className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-[#e6eef4]/60">
                React Router 8
              </li>
              <li className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-[#e6eef4]/60">
                Zustand 5
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-[#2b425a]/10">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-7 sm:px-8">
          <p className="m-0 text-[13px] text-[#2b425a]/50">
            EmmaJS v1 — Arquitectura modular para React
          </p>
          <nav aria-label="Paquetes" className="flex gap-5">
            <a
              href="https://www.npmjs.com/package/emma-core"
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-[#2b425a]/60 transition-colors hover:text-[#16283a]"
            >
              emma-core
            </a>
            <a
              href="https://www.npmjs.com/package/create-emma-app"
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-[#2b425a]/60 transition-colors hover:text-[#16283a]"
            >
              create-emma-app
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}`;
};

const COUNTER_STORE = `import { createEmmaStore } from 'emma-core';

interface CounterState {
  count: number;
};

export const useCounterStore = createEmmaStore<CounterState>()((set) => ({
  count: 0,
}));
`;

export const writeSharedPages = (answers: Answers, dir: string) => {

  fs.mkdirSync(path.join(dir, 'src/shared/pages'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src/shared/stores'), { recursive: true });

  fs.writeFileSync(
    path.join(dir, 'src/shared/stores/counterStore.ts'),
    COUNTER_STORE,
  );

  fs.writeFileSync(
    path.join(dir, 'src/shared/pages/LandingPage.tsx'),
    answers.tailwind
      ? landingTailwind(answers.projectName)
      : landingCss(answers.projectName),
  );

  if (answers.tailwind) {
    fs.writeFileSync(
      path.join(dir, 'src/shared/pages/NotFoundPage.tsx'),
      NOT_FOUND_PAGE_TAILWIND,
    );
    fs.writeFileSync(
      path.join(dir, 'src/shared/pages/ForbiddenPage.tsx'),
      FORBIDDEN_PAGE_TAILWIND,
    );
  } else {
    fs.writeFileSync(path.join(dir, 'src/styles/pages.css'), PAGES_CSS);
    fs.writeFileSync(
      path.join(dir, 'src/shared/pages/NotFoundPage.tsx'),
      NOT_FOUND_PAGE_CSS,
    );
    fs.writeFileSync(
      path.join(dir, 'src/shared/pages/ForbiddenPage.tsx'),
      FORBIDDEN_PAGE_CSS,
    );
  }
};

export const generateAppContent = (): string => {

  return `import { EmmaRouter, EmmaRoutes } from 'emma-core';
import type { EmmaRoute } from 'emma-core';
import LandingPage from './shared/pages/LandingPage';
import NotFoundPage from './shared/pages/NotFoundPage';
import ForbiddenPage from './shared/pages/ForbiddenPage';

const routeModules = import.meta.glob("/src/modules/**/routes/index.{ts,tsx}", {
  eager: true,
  import: "default",
});

const autoRoutes = Object.values(routeModules).flat() as EmmaRoute[];

export default function App() {
  const routes: EmmaRoute[] = [
    { path: "/", element: <LandingPage /> },
    { path: "/forbidden", element: <ForbiddenPage /> },
    ...autoRoutes,
    { path: "*", element: <NotFoundPage /> },
  ];

  return (
    <EmmaRouter>
      <EmmaRoutes routes={routes} />
    </EmmaRouter>
  );
}`
};




