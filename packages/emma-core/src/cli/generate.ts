import fs from 'fs';
import path from 'path';

const MODULE_STORE_TEMPLATE = (name: string, storeName: string): string =>

  `import { createEmmaStore } from 'emma-core';

interface ${storeName}State {}

export const use${storeName}Store = createEmmaStore<${storeName}State>()(() => ({}));
`;

const AUTH_STORE_TEMPLATE = `import { createEmmaStore } from 'emma-core';

interface User {
  name: string;
  roles: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = createEmmaStore<AuthState>()((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
`;

const GUARD_TEMPLATE = (name: string): string =>

  `import type { ReactNode } from 'react';
import { EmmaNavigate, useEmmaLocation } from 'emma-core';
import { useAuthStore } from '../stores/authStore';

interface ${name}Props {
  children: ReactNode;
  roles?: string[];
  redirectTo?: string;
}

export function ${name}({ children, roles = [], redirectTo = '/login' }: ${name}Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useEmmaLocation();

  if (!isAuthenticated) {
    return <EmmaNavigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (roles.length > 0 && user && !roles.some((role) => user.roles.includes(role))) {
    return <EmmaNavigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
`;

function isTailwindProject(baseDir: string): boolean {

  const globalsPath = path.join(baseDir, 'src/styles/globals.css');

  if (fs.existsSync(globalsPath) && fs.readFileSync(globalsPath, 'utf-8').includes('tailwindcss')) {
    return true;
  };

  const pkgPath = path.join(baseDir, 'package.json');

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['tailwindcss']) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
};

function moduleCardComponent(name: string, tailwind: boolean): string {

  const Name = name.charAt(0).toUpperCase() + name.slice(1);

  if (tailwind) {
    return `import type { ReactNode } from 'react';

interface ${Name}CardProps {
  title: string;
  children: ReactNode;
}

export default function ${Name}Card({ title, children }: ${Name}CardProps) {
  return (
    <div className="rounded-xl border border-[#2b425a]/15 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#2b425a]">{title}</h3>
      <div className="mt-2 text-[#2b425a]/70">{children}</div>
    </div>
  );
}
`;
  }
  return `import type { ReactNode } from 'react';
import './${name}Card.css';

interface ${Name}CardProps {
  title: string;
  children: ReactNode;
}

export default function ${Name}Card({ title, children }: ${Name}CardProps) {
  return (
    <div className="${name}-card">
      <h3>{title}</h3>
      <div className="${name}-card-body">{children}</div>
    </div>
  );
}
`;
}

function moduleCardCss(name: string): string {

  return `.${name}-card {
  border: 1px solid rgba(43, 66, 90, 0.15);
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: #fff;
  box-shadow: 0 1px 2px rgba(43, 66, 90, 0.08);
}

.${name}-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  color: #2b425a;
}

.${name}-card-body {
  color: rgba(43, 66, 90, 0.7);
}
`;
}

export function generateModule(name: string, baseDir = process.cwd()) {

  const dir = path.join(baseDir, 'src/modules', name);

  const folders = [
    'pages',
    'components',
    'hooks',
    'services',
    'routes',
    'store',
  ];

  for (const folder of folders) {
    fs.mkdirSync(path.join(dir, folder), { recursive: true });
  };

  const Name = name.charAt(0).toUpperCase() + name.slice(1);

  const tailwind = isTailwindProject(baseDir);

  fs.writeFileSync(
    path.join(dir, 'routes', 'index.tsx'),
    `import type { EmmaRoute } from 'emma-core';
import ${Name}Page from '../pages/${Name}Page';

const ${name}Routes: EmmaRoute[] = [
  { path: '/${name}', element: <${Name}Page /> },
];

export default ${name}Routes;`,
  );

  fs.writeFileSync(
    path.join(dir, 'pages', `${Name}Page.tsx`),
    `import { use${Name}PageController } from '../hooks/use${Name}PageController';
import ${Name}Card from '../components/${Name}Card';

export default function ${Name}Page() {
  const { title, items, addItem, removeItem } = use${Name}PageController();

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <h1>{title}</h1>
      <${Name}Card title="Example items">
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              {item} <button onClick={() => removeItem(index)}>x</button>
            </li>
          ))}
        </ul>
        <button onClick={addItem}>Add item</button>
      </${Name}Card>
    </div>
  );
}`,
  );

  fs.writeFileSync(
    path.join(dir, 'components', `${Name}Card.tsx`),
    moduleCardComponent(name, tailwind),
  );

  if (!tailwind) {
    fs.writeFileSync(
      path.join(dir, 'components', `${name}Card.css`),
      moduleCardCss(name),
    );
  }

  fs.writeFileSync(
    path.join(dir, 'hooks', `use${Name}PageController.tsx`),
    `import { useState } from 'react';
import { ${name}Service } from '../services/${name}Service';

export function use${Name}PageController() {
  const [title] = useState('${Name} Module');
  const [items, setItems] = useState<string[]>(['Item 1', 'Item 2', 'Item 3']);

  const addItem = () => setItems((prev) => [...prev, 'Item ' + (prev.length + 1)]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const fetchData = async () => {
    try {
      return await ${name}Service.get();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  return { title, items, addItem, removeItem, fetchData };
}`,
  );

  fs.writeFileSync(
    path.join(dir, 'services', `${name}Service.ts`),
    `export const ${name}Service = {
  async get() {
    const res = await fetch('/api/${name}');
    if (!res.ok) throw new Error('Request failed');
    return res.json();
  },
};`,
  );

  fs.writeFileSync(
    path.join(dir, 'store', `${name}Store.ts`),
    MODULE_STORE_TEMPLATE(name, Name),
  );

  console.log(`✅ Module "${name}" created successfully!`);
};

export function generatePage(moduleName: string, pageName: string, baseDir = process.cwd()) {

  const dir = path.join(baseDir, 'src/modules', moduleName, 'pages');

  fs.mkdirSync(dir, { recursive: true });

  const componentName = pageName.charAt(0).toUpperCase() + pageName.slice(1) + 'Page';

  fs.writeFileSync(
    path.join(dir, `${pageName}Page.tsx`),
    `export default function ${componentName}() {
  return <h1>${pageName}</h1>;
}`,
  );

  console.log(`✅ Page "${pageName}" created in module "${moduleName}"`);
};

export function generateComponent(name: string, baseDir = process.cwd()) {

  const dir = path.join(baseDir, 'src/shared/components');

  fs.mkdirSync(dir, { recursive: true });

  const componentName = name.charAt(0).toUpperCase() + name.slice(1);

  fs.writeFileSync(
    path.join(dir, `${name}.tsx`),
    `export default function ${componentName}() {
  return <h1>${name}</h1>;
}`,
  );

  console.log(`✅ Component "${name}" created successfully! 🚀`);
};

export function generateGuard(name: string, baseDir = process.cwd()) {

  const guardsDir = path.join(baseDir, 'src/shared/guards');

  fs.mkdirSync(guardsDir, { recursive: true });

  const storesDir = path.join(baseDir, 'src/shared/stores');

  const authStorePath = path.join(storesDir, 'authStore.ts');

  if (!fs.existsSync(authStorePath)) {
    fs.mkdirSync(storesDir, { recursive: true });
    fs.writeFileSync(authStorePath, AUTH_STORE_TEMPLATE);
    console.log(`✅ Auth store "authStore" created in shared/stores ⚠️`);
  };

  fs.writeFileSync(
    path.join(guardsDir, `${name}.tsx`),
    GUARD_TEMPLATE(name),
  );

  console.log(`✅ Guard "${name}" created successfully!`);
};
