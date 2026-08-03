import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Answers {
  projectName: string;
  tailwind: boolean;
};

const cliOptions = (isTailwind: boolean = false) => ([
  {
    type: 'Routing',
    description: 'Rutas declarativas con EmmaRoutes y react-router.'
  },
  {
    type: 'Global State',
    description: 'Estado global ligero con zustand via useEmmaStore.'
  },
  {
    type: 'Modular Architecture',
    description: 'Modulos autocontenidos en src/modules.'
  },
  {
    type: isTailwind
      ? 'TailwindCSS'
      : 'Pure CSS',
    description: isTailwind
      ? 'Estilos utilitarios con TailwindCSS v4.'
      : 'Sin dependencias: estilos vanilla que siempre compilan.'
  },
]);

export const generateProject = (answers: Answers) => {

  const dir = path.resolve(answers.projectName);

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

  const localCore = path.join(__dirname, '..', '..', 'emma-core');

  let emmaCoreDep = '^1.0.0';

  if (fs.existsSync(path.join(localCore, 'package.json'))) {
    try {
      const packOutput = execSync('npm pack --silent', {
        cwd: localCore,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const tarballName = packOutput
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .pop();
      if (tarballName) {
        fs.copyFileSync(path.join(localCore, tarballName), path.join(dir, tarballName));
        fs.rmSync(path.join(localCore, tarballName), { force: true });
        emmaCoreDep = `file:./${tarballName}`;
      }
    } catch {
      emmaCoreDep = `file:${path.resolve(localCore).replace(/\\/g, '/')}`;
    }
  }

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
      body {
        margin: 0;
        font-family: sans-serif;
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

  const appContent = generateAppContent(answers);

  fs.writeFileSync(path.join(dir, 'src/App.tsx'), appContent);

  writeSharedPages(answers, dir);
};

const NOT_FOUND_PAGE_CSS = `import { EmmaLink } from 'emma-core';
import logoUrl from '../../assets/emmaLogo.png';
import '../../styles/pages.css';

export default function NotFoundPage() {
  return (
    <div className="emma-page">
      <img src={logoUrl} alt="EmmaJS logo" className="emma-page-logo" />
      <p className="emma-page-code">404</p>
      <h1 className="emma-page-title">Página no encontrada</h1>
      <p className="emma-page-desc">
        La ruta que intentas visitar no existe o fue movida. Verifica la URL o vuelve al inicio.
      </p>
      <EmmaLink to="/" className="emma-page-link">Volver al inicio</EmmaLink>
    </div>
  );
}
`;

const FORBIDDEN_PAGE_CSS = `import { EmmaLink } from 'emma-core';
import logoUrl from '../../assets/emmaLogo.png';
import '../../styles/pages.css';

export default function ForbiddenPage() {
  return (
    <div className="emma-page">
      <img src={logoUrl} alt="EmmaJS logo" className="emma-page-logo" />
      <p className="emma-page-code">403</p>
      <h1 className="emma-page-title">Acceso denegado</h1>
      <p className="emma-page-desc">
        No tienes permisos para ver esta página. Si crees que es un error, contacta al administrador.
      </p>
      <EmmaLink to="/" className="emma-page-link">Volver al inicio</EmmaLink>
    </div>
  );
}
`;
const PAGES_CSS = `
.emma-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  text-align: center;
  font-family: sans-serif;
  background: linear-gradient(to bottom, #ffdfa9, #f5e8cf, #95bfd2);
  color: #2b425a;
}

.emma-page-logo {
  width: 14rem;
  height: 11rem;
  border-radius: 1.5rem;
  filter: drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1));
  animation: emma-float 4s ease-in-out infinite;
}

.emma-page-code {
  margin: 2rem 0 0;
  font-size: 4.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1;
}

.emma-page-title {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.emma-page-desc {
  margin: 0.75rem 0 0;
  max-width: 28rem;
  color: rgba(43, 66, 90, 0.7);
  font-size: 1rem;
  line-height: 1.6;
}

.emma-page-link {
  margin-top: 2rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  background: #2b425a;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s ease;
}

.emma-page-link:hover {
  background: rgba(43, 66, 90, 0.8);
}

@keyframes emma-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
`;
const LANDING_CSS = `
.landing {
  min-height: 100vh;
  background: linear-gradient(to bottom, #ffdfa9, #f5e8cf, #95bfd2);
  color: #2b425a;
}

.landing-main {
  max-width: 64rem;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  text-align: center;
  font-family: sans-serif;
}

.logo-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
}

.landing-logo {
  width: 14rem;
  height: 11rem;
  border-radius: 1.5rem;
  filter: drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1));
  animation: emma-float 4s ease-in-out infinite;
}

.react-logo {
  width: 7rem;
  height: 6rem;
  animation: emma-spin 12s linear infinite;
}

@keyframes emma-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes emma-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.landing h1 {
  margin: 2rem 0 0;
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.025em;
}

@media (min-width: 640px) {
  .landing h1 {
    font-size: 3.75rem;
  }
}

.landing-tagline {
  margin: 0.75rem 0 0;
  color: rgba(43, 66, 90, 0.7);
  font-size: 1.25rem;
}

.landing-desc {
  margin: 1.25rem auto 0;
  max-width: 36rem;
  color: rgba(43, 66, 90, 0.8);
  font-size: 1rem;
  line-height: 1.6;
}

.landing-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.btn-primary {
  background: #2b425a;
  color: #ffffff;
}

.btn-primary:hover {
  background: rgba(43, 66, 90, 0.8);
}

.btn-outline {
  border-color: rgba(43, 66, 90, 0.3);
  color: #2b425a;
  background: rgba(255, 255, 255, 0.5);
}

.btn-outline:hover {
  border-color: rgba(43, 66, 90, 0.5);
  background: #ffffff;
}

.landing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 3.5rem;
  width: 100%;
  max-width: 56rem;
}

@media (min-width: 640px) {
  .landing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .landing-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.card {
  border: 1px solid rgba(43, 66, 90, 0.15);
  border-radius: 0.75rem;
  padding: 1.25rem;
  text-align: left;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(43, 66, 90, 0.08);
  transition: box-shadow 0.15s ease;
}

.card:hover {
  box-shadow: 0 6px 16px rgba(43, 66, 90, 0.15);
}

.card h3 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  color: #2b425a;
}

.card p {
  margin: 0;
  color: rgba(43, 66, 90, 0.6);
  font-size: 0.875rem;
  line-height: 1.5;
}

.landing-demo {
  margin-top: 3rem;
  width: 100%;
  max-width: 42rem;
}

.landing-demo h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.landing-demo p {
  margin: 0.5rem 0 0;
  color: rgba(43, 66, 90, 0.7);
}

.landing-count {
  font-family: monospace;
  font-weight: 600;
}

.counter-row {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.counter-btn {
  border: 1px solid rgba(43, 66, 90, 0.3);
  background: rgba(255, 255, 255, 0.5);
  color: #2b425a;
}

.counter-btn:hover {
  background: #ffffff;
}

.landing-code {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #2b425a;
  color: #ffdfa9;
  font-size: 0.875rem;
  text-align: left;
  overflow-x: auto;
}

.landing-footer {
  margin-top: 3.5rem;
  color: rgba(43, 66, 90, 0.6);
  font-size: 0.875rem;
}
`;

const landingCss = (projectName: string): string => {

  const cardOptions = cliOptions(false);

  const cards = cardOptions.map(
    ({ description, type }) => `          <div className="card">
            <h3>${type}</h3>
            <p>${description}</p>
          </div>`,
  )
    .join("\n");

  return `function LandingPage() {
  const count = useEmmaStore(useCounterStore, (s) => s.count);

  return (
    <div className="landing">
      <main className="landing-main">
        <div className="logo-row">
          <img src={logoUrl} alt="EmmaJS logo" className="landing-logo" />
          <img src={reactLogoUrl} alt="React logo" className="react-logo" />
        </div>
        <h1>Created with Emma</h1>
        <p className="landing-tagline">${projectName}</p>
        <p className="landing-desc">
          Microframework de arquitectura modular para React: rutas declarativas, estado global y modulos autocontenidos.
        </p>
        <div className="landing-actions">
          <a className="btn btn-primary" href="https://reactrouter.com" target="_blank" rel="noreferrer">
            Documentacion
          </a>
          <a className="btn btn-outline" href="/login">
            Empezar
          </a>
        </div>

        <div className="landing-grid">
${cards}
        </div>

        <section className="landing-demo">
          <h2>Estado global en accion</h2>
          <p>Count: <span className="landing-count">{count}</span></p>
          <div className="counter-row">
            <button className="btn counter-btn" onClick={() => useCounterStore.setState((s) => ({ count: s.count + 1 }))}>
              +1
            </button>
            <button className="btn counter-btn" onClick={() => useCounterStore.setState({ count: 0 })}>
              Reset
            </button>
          </div>
          <pre className="landing-code">
            <code>{"$ emma generate module <name>\\n$ emma generate page <Page> <module>\\n$ emma generate component <Name>\\n$ emma generate guard <Name>"}</code>
          </pre>
        </section>

        <p className="landing-footer">EmmaJS v1 &mdash; Modular architecture for React</p>
      </main>
    </div>
  );
}`
};

const NOT_FOUND_PAGE_TAILWIND = `import { EmmaLink } from 'emma-core';
import logoUrl from '../../assets/emmaLogo.png';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-[#ffdfa9] via-[#f5e8cf] to-[#95bfd2] px-6 text-center text-[#2b425a]">
      <img
        src={logoUrl}
        alt="EmmaJS logo"
        className="h-44 w-56 animate-[emma-float_4s_ease-in-out_infinite] rounded-3xl drop-shadow-lg"
      />
      <p className="mt-8 text-7xl font-extrabold tracking-tight">404</p>
      <h1 className="mt-2 text-2xl font-bold">Página no encontrada</h1>
      <p className="mt-3 max-w-md text-[#2b425a]/70">
        La ruta que intentas visitar no existe o fue movida. Verifica la URL o vuelve al inicio.
      </p>
      <EmmaLink
        to="/"
        className="mt-8 rounded-lg bg-[#2b425a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2b425a]/80"
      >
        Volver al inicio
      </EmmaLink>
    </div>
  );
}
`;

const FORBIDDEN_PAGE_TAILWIND = `import { EmmaLink } from 'emma-core';
import logoUrl from '../../assets/emmaLogo.png';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-[#ffdfa9] via-[#f5e8cf] to-[#95bfd2] px-6 text-center text-[#2b425a]">
      <img
        src={logoUrl}
        alt="EmmaJS logo"
        className="h-44 w-56 animate-[emma-float_4s_ease-in-out_infinite] rounded-3xl drop-shadow-lg"
      />
      <p className="mt-8 text-7xl font-extrabold tracking-tight">403</p>
      <h1 className="mt-2 text-2xl font-bold">Acceso denegado</h1>
      <p className="mt-3 max-w-md text-[#2b425a]/70">
        No tienes permisos para ver esta página. Si crees que es un error, contacta al administrador.
      </p>
      <EmmaLink
        to="/"
        className="mt-8 rounded-lg bg-[#2b425a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2b425a]/80"
      >
        Volver al inicio
      </EmmaLink>
    </div>
  );
}
`;

const landingTailwind = (projectName: string): string => {

  const cardOptions = cliOptions(true);

  const cards = cardOptions.map(
    ({ description, type }) => `          <div className="rounded-xl border border-[#2b425a]/15 bg-white p-5 text-left shadow-sm transition hover:shadow-md">
            <h3 className="font-semibold text-[#2b425a]">${type}</h3>
            <p className="mt-1 text-sm text-[#2b425a]/60">${description}</p>
          </div>`,
  )
    .join('\n');

  return `function LandingPage() {
  const count = useEmmaStore(useCounterStore, (s) => s.count);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#ffdfa9] via-[#f5e8cf] to-[#95bfd2] text-[#2b425a]">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex items-center justify-center gap-10">
          <img src={logoUrl} alt="EmmaJS logo" className="h-44 w-56 animate-[emma-float_4s_ease-in-out_infinite] rounded-3xl drop-shadow-lg" />
          <img src={reactLogoUrl} alt="React logo" className="h-24 w-28 animate-[emma-spin_12s_linear_infinite]" />
        </div>
        <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-6xl">Created with Emma</h1>
        <p className="mt-3 text-xl text-[#2b425a]/70">${projectName}</p>
        <p className="mt-5 max-w-xl text-[#2b425a]/80">
          Microframework de arquitectura modular para React: rutas declarativas, estado global y modulos autocontenidos.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="https://reactrouter.com" target="_blank" rel="noreferrer" className="rounded-lg bg-[#2b425a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2b425a]/80">
            Documentacion
          </a>
          <a href="/login" className="rounded-lg border border-[#2b425a]/30 bg-white/50 px-5 py-2.5 text-sm font-medium text-[#2b425a] transition hover:bg-white">
            Empezar
          </a>
        </div>

        <div className="mt-14 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
${cards}
        </div>

        <div className="mt-12 w-full max-w-2xl">
          <h2 className="text-2xl font-bold">Estado global en accion</h2>
          <p className="mt-2 text-[#2b425a]/70">
            Count: <span className="font-mono font-semibold text-[#2b425a]">{count}</span>
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => useCounterStore.setState((s) => ({ count: s.count + 1 }))}
              className="rounded-lg bg-[#2b425a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2b425a]/80"
            >
              +1
            </button>
            <button
              onClick={() => useCounterStore.setState({ count: 0 })}
              className="rounded-lg border border-[#2b425a]/30 bg-white/50 px-5 py-2.5 text-sm font-medium text-[#2b425a] transition hover:bg-white"
            >
              Reset
            </button>
          </div>
          <pre className="mt-6 overflow-x-auto rounded-xl bg-[#2b425a] p-4 text-left text-sm text-[#ffdfa9]">
            <code>{"$ emma generate module <name>\\n$ emma generate page <Page> <module>\\n$ emma generate component <Name>\\n$ emma generate guard <Name>"}</code>
          </pre>
        </div>

        <p className="mt-14 text-sm text-[#2b425a]/60">EmmaJS v1 &mdash; Modular architecture for React</p>
      </main>
    </div>
  );
}`
};

export const writeSharedPages = (answers: Answers, dir: string) => {

  fs.mkdirSync(path.join(dir, 'src/shared/pages'), { recursive: true });

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

export const generateAppContent = (answers: Answers): string => {

  const projectName = answers.projectName;

  const landing = answers.tailwind
    ? landingTailwind(projectName)
    : landingCss(projectName);

  const cssImport = answers.tailwind
    ? `import logoUrl from './assets/emmaLogo.png';
import reactLogoUrl from './assets/reactLogo.webp';`
    : `import logoUrl from './assets/emmaLogo.png';
import reactLogoUrl from './assets/reactLogo.webp';
import './styles/landing.css';`;

  return `${cssImport}
import { EmmaRouter, EmmaRoutes, createEmmaStore, useEmmaStore } from 'emma-core';
import type { EmmaRoute } from 'emma-core';
import NotFoundPage from './shared/pages/NotFoundPage';
import ForbiddenPage from './shared/pages/ForbiddenPage';

const routeModules = import.meta.glob("/src/modules/**/routes/index.{ts,tsx}", {
  eager: true,
  import: "default",
});

const autoRoutes = Object.values(routeModules).flat() as EmmaRoute[];

interface CounterState {
  count: number;
};

const useCounterStore = createEmmaStore<CounterState>()((set) => ({
  count: 0,
}));

${landing}

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




