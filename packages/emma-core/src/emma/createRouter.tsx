import type { ReactNode } from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    NavLink,
    Navigate,
} from 'react-router';
import type {
    LinkProps,
    NavLinkProps,
    NavigateProps
} from 'react-router';
import type { EmmaRoute } from './types.js';

export function EmmaRouter({ children }: { children?: ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
};

export function EmmaRoutes({ routes }: { routes: EmmaRoute[] }) {
    return (
        <Routes>
            {routes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
            ))}
        </Routes>
    );
};

export function EmmaLink(props: LinkProps) {
    return <Link {...props} />;
};

export function EmmaNavLink(props: NavLinkProps) {
    return <NavLink {...props} />;
};

export function EmmaNavigate(props: NavigateProps) {
    return <Navigate {...props} />;
};
